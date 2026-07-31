-- Phase 6: Fix RPC Signature for PostgREST

-- Drop the old functions
DROP FUNCTION IF EXISTS public.place_order(UUID, TEXT, TEXT, JSONB, public.payment_method, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.place_order(UUID, TEXT, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, public.payment_method, public.payment_status, TEXT, JSONB);

-- Recreate with TEXT for tricky types (UUID and ENUMs) to ensure Supabase's API (PostgREST) can match the signature
CREATE OR REPLACE FUNCTION public.place_order(
    p_customer_id TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_delivery_address JSONB,
    p_payment_method TEXT,
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
    
    -- Casted variables
    v_customer_id_uuid UUID := NULL;
    v_payment_method_enum public.payment_method;
BEGIN
    -- 0. Cast Inputs
    IF p_customer_id IS NOT NULL AND p_customer_id <> '' THEN
        v_customer_id_uuid := p_customer_id::UUID;
    END IF;
    v_payment_method_enum := p_payment_method::public.payment_method;

    -- 1. Generate Invoice Number
    v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    
    -- 2. Determine Payment Status
    IF v_payment_method_enum = 'cod' THEN
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
        v_customer_id_uuid,
        p_customer_name,
        p_customer_phone,
        p_delivery_address,
        v_total_amount,
        v_subtotal,
        v_discount,
        v_gst,
        v_delivery_charge,
        v_payment_method_enum,
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

NOTIFY pgrst, 'reload schema';
