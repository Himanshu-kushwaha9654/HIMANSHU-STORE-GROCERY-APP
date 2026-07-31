-- Phase 4: Place Order RPC for Real-Time Order Management

CREATE OR REPLACE FUNCTION public.place_order(
    p_customer_id UUID,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_delivery_address JSONB,
    p_total_amount NUMERIC,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_gst NUMERIC,
    p_delivery_charge NUMERIC,
    p_payment_method public.payment_method,
    p_payment_status public.payment_status,
    p_notes TEXT,
    p_items JSONB -- Array of items: [{ product_id, product_name, sku, quantity, unit_price, discount }]
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_invoice_number TEXT;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_current_stock INTEGER;
BEGIN
    -- 1. Generate Invoice Number (e.g., INV-YYYYMMDD-XXXX)
    v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    
    -- 2. Verify and Update Stock for each item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;
        
        -- Get current stock with FOR UPDATE to lock the row and prevent race conditions
        SELECT stock_qty INTO v_current_stock 
        FROM public.products 
        WHERE id = v_product_id 
        FOR UPDATE;
        
        IF v_current_stock IS NULL THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;
        
        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product % (Available: %, Requested: %)', 
                (v_item->>'product_name'), v_current_stock, v_quantity;
        END IF;
        
        -- Decrement stock
        UPDATE public.products 
        SET stock_qty = stock_qty - v_quantity
        WHERE id = v_product_id;
    END LOOP;

    -- 3. Insert into Orders table
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
        p_total_amount,
        p_subtotal,
        p_discount,
        p_gst,
        p_delivery_charge,
        p_payment_method,
        p_payment_status,
        'pending',
        p_notes
    ) RETURNING id INTO v_order_id;
    
    -- 4. Insert into Order Items table
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
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
            (v_item->>'product_id')::UUID,
            v_item->>'product_name',
            v_item->>'sku',
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::NUMERIC,
            (v_item->>'discount')::NUMERIC
        );
    END LOOP;
    
    -- 5. Insert Initial Order Log
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
    
    -- 6. Return the generated Order ID
    RETURN v_order_id;
    
END;
$$ LANGUAGE plpgsql;

-- Grant execution to authenticated (and maybe anon if you want guest checkout)
GRANT EXECUTE ON FUNCTION public.place_order TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_order TO anon;
