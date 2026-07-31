-- Phase 5: Advanced Server-Side Checkout RPC

-- Ensure previous version of function is dropped to avoid signature conflicts
DROP FUNCTION IF EXISTS public.place_order(UUID, TEXT, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, public.payment_method, public.payment_status, TEXT, JSONB);

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_order_value NUMERIC(10,2) DEFAULT 0,
    max_discount NUMERIC(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a default demo coupon for testing
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_discount)
VALUES ('SAVE20', 'percentage', 20, 500, 200)
ON CONFLICT (code) DO NOTHING;

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- null for admin
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. The New Advanced RPC
CREATE OR REPLACE FUNCTION public.place_order(
    p_customer_id UUID,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_delivery_address JSONB,
    p_payment_method public.payment_method,
    p_notes TEXT,
    p_coupon_code TEXT,
    p_items JSONB -- [{ product_id, quantity }]
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_invoice_number TEXT;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_current_stock INTEGER;
    v_price NUMERIC;
    v_product_name TEXT;
    v_sku TEXT;
    v_subtotal NUMERIC := 0;
    v_discount NUMERIC := 0;
    v_gst NUMERIC := 0;
    v_delivery_charge NUMERIC := 0;
    v_total_amount NUMERIC := 0;
    v_coupon_record RECORD;
    v_payment_status public.payment_status;
    v_inventory_id TEXT;
BEGIN
    -- 1. Generate Invoice Number
    v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    
    -- 2. Determine Payment Status
    IF p_payment_method = 'cod' THEN
        v_payment_status := 'pending';
    ELSE
        v_payment_status := 'success';
    END IF;

    -- 3. Calculate Subtotal & Lock Stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;
        
        -- Get current stock and price with FOR UPDATE to lock the row safely
        SELECT stock_qty, price, name, sku INTO v_current_stock, v_price, v_product_name, v_sku
        FROM public.products 
        WHERE id = v_product_id 
        FOR UPDATE;
        
        IF v_current_stock IS NULL THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;
        
        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for % (Available: %, Requested: %)', 
                v_product_name, v_current_stock, v_quantity;
        END IF;
        
        -- Decrement stock in storefront table
        UPDATE public.products 
        SET stock_qty = stock_qty - v_quantity
        WHERE id = v_product_id;
        
        -- Save Stock Movement in Warehouse Inventory Logs
        SELECT id INTO v_inventory_id FROM public.inventory_items WHERE product_id = v_product_id LIMIT 1;
        IF v_inventory_id IS NOT NULL THEN
            INSERT INTO public.inventory_logs (
                id,
                inventory_id,
                previous_quantity,
                new_quantity,
                difference,
                reason,
                admin_name
            ) VALUES (
                'log_' || extract(epoch from now())::text || '_' || floor(random() * 10000)::text,
                v_inventory_id,
                v_current_stock,
                v_current_stock - v_quantity,
                -v_quantity,
                'order_fulfillment',
                'System'
            );
        END IF;
        
        -- Add to subtotal
        v_subtotal := v_subtotal + (v_price * v_quantity);
    END LOOP;
    
    -- 4. Apply Coupon
    IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
        SELECT * INTO v_coupon_record FROM public.coupons 
        WHERE code = p_coupon_code AND is_active = true;
        
        IF v_coupon_record IS NOT NULL THEN
            IF v_subtotal >= v_coupon_record.min_order_value THEN
                IF v_coupon_record.discount_type = 'percentage' THEN
                    v_discount := (v_subtotal * v_coupon_record.discount_value) / 100;
                    IF v_coupon_record.max_discount IS NOT NULL AND v_discount > v_coupon_record.max_discount THEN
                        v_discount := v_coupon_record.max_discount;
                    END IF;
                ELSE
                    v_discount := v_coupon_record.discount_value;
                END IF;
            END IF;
        END IF;
    END IF;
    
    -- Prevent negative totals
    IF v_discount > v_subtotal THEN
        v_discount := v_subtotal;
    END IF;
    
    -- 5. Calculate GST (5% of discounted subtotal)
    v_gst := ((v_subtotal - v_discount) * 0.05);
    
    -- 6. Calculate Delivery Charge
    IF (v_subtotal - v_discount) >= 500 THEN
        v_delivery_charge := 0;
    ELSE
        v_delivery_charge := 50;
    END IF;
    
    -- 7. Total Amount
    v_total_amount := (v_subtotal - v_discount) + v_gst + v_delivery_charge;

    -- 8. Insert Order
    INSERT INTO public.orders (
        invoice_number,
        customer_id,
        customer_name,
        customer_phone,
        delivery_address,
        total_amount,
        subtotal,
        discount,
        gst,
        delivery_charge,
        payment_method,
        payment_status,
        order_status,
        notes
    ) VALUES (
        v_invoice_number,
        p_customer_id,
        p_customer_name,
        p_customer_phone,
        p_delivery_address,
        v_total_amount,
        v_subtotal,
        v_discount,
        v_gst,
        v_delivery_charge,
        p_payment_method,
        v_payment_status,
        'pending',
        p_notes
    ) RETURNING id INTO v_order_id;
    
    -- 9. Insert Order Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;
        
        -- Get details again without lock (since we already reduced stock, it's safe)
        SELECT price, name, sku INTO v_price, v_product_name, v_sku
        FROM public.products 
        WHERE id = v_product_id;
        
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            sku,
            quantity,
            unit_price,
            discount
        ) VALUES (
            v_order_id,
            v_product_id,
            v_product_name,
            v_sku,
            v_quantity,
            v_price,
            0 
        );
    END LOOP;
    
    -- 10. Insert Order Log
    INSERT INTO public.order_logs (
        order_id,
        status_from,
        status_to,
        changed_by,
        notes
    ) VALUES (
        v_order_id,
        NULL,
        'pending',
        'System',
        'Order placed'
    );
    
    -- 11. Create Notification for Admin
    INSERT INTO public.notifications (
        title,
        message
    ) VALUES (
        'New Order Received',
        'Order ' || v_invoice_number || ' placed by ' || p_customer_name || ' for ₹' || v_total_amount
    );
    
    RETURN v_order_id;
    
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.place_order TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_order TO anon;

-- CRITICAL: Refresh Supabase PostgREST schema cache to ensure the new RPC signature is immediately available!
NOTIFY pgrst, 'reload schema';
