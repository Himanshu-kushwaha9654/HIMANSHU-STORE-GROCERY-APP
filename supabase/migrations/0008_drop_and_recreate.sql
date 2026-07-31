-- 1. Drop ALL existing versions of place_order to fix the PGRST203 overload error!
DROP FUNCTION IF EXISTS public.place_order(text, text, text, jsonb, public.payment_method, text, text, jsonb);
DROP FUNCTION IF EXISTS public.place_order(text, text, text, jsonb, text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.place_order(uuid, text, text, jsonb, public.payment_method, text, text, jsonb);
DROP FUNCTION IF EXISTS public.place_order(uuid, text, text, jsonb, text, text, text, jsonb);

-- 2. Drop foreign key constraint on order_items if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_product_id_fkey'
  ) THEN
    ALTER TABLE public.order_items DROP CONSTRAINT order_items_product_id_fkey;
  END IF;
END $$;

-- 3. Alter order_items product_id to TEXT
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;

-- 4. Recreate the ONLY place_order function we need (using TEXT for payment method to avoid PostgREST cast issues)
CREATE OR REPLACE FUNCTION public.place_order(
    p_customer_id TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_delivery_address JSONB,
    p_payment_method TEXT, -- Changed to TEXT here!
    p_notes TEXT,
    p_coupon_code TEXT,
    p_items JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_subtotal NUMERIC := 0;
    v_item JSONB;
    v_product_id TEXT;
    v_quantity INTEGER;
    v_price NUMERIC;
    v_product_name TEXT;
    v_sku TEXT;
    v_current_stock INTEGER;
    v_customer_id_uuid UUID := NULL;
    v_discount NUMERIC := 0;
    v_delivery_charge NUMERIC := 0;
    v_gst NUMERIC := 0;
    v_total NUMERIC := 0;
BEGIN
    IF p_customer_id IS NOT NULL AND p_customer_id <> '' THEN 
        BEGIN
            v_customer_id_uuid := p_customer_id::UUID; 
        EXCEPTION WHEN OTHERS THEN
            v_customer_id_uuid := NULL;
        END;
    END IF;

    v_order_id := gen_random_uuid();

    -- Note: We cast p_payment_method to public.payment_method here when inserting!
    INSERT INTO public.orders (
        id, invoice_number, customer_id, customer_name, customer_phone, delivery_address,
        payment_method, notes, coupon_code, order_status, payment_status,
        subtotal, discount, delivery_charge, gst, total_amount
    ) VALUES (
        v_order_id, 'INV-' || floor(random() * 900000 + 100000)::TEXT,
        v_customer_id_uuid, p_customer_name, p_customer_phone, p_delivery_address,
        p_payment_method::public.payment_method, p_notes, p_coupon_code, 'pending', 'pending',
        0, 0, 0, 0, 0
    );

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::TEXT;
        v_quantity := (v_item->>'quantity')::INTEGER;
        
        BEGIN
            SELECT stock_qty, price, name, sku INTO v_current_stock, v_price, v_product_name, v_sku
            FROM public.products WHERE id::TEXT = v_product_id FOR UPDATE;
        EXCEPTION WHEN OTHERS THEN
            v_current_stock := NULL;
        END;
        
        IF v_current_stock IS NULL THEN 
            v_price := COALESCE((v_item->>'price')::NUMERIC, 0);
            v_product_name := COALESCE(v_item->>'name', 'Unknown Product');
            v_sku := NULL;
        ELSE
            IF v_current_stock < v_quantity THEN RAISE EXCEPTION 'Insufficient stock for %', v_product_name; END IF;
            UPDATE public.products SET stock_qty = stock_qty - v_quantity WHERE id::TEXT = v_product_id;
        END IF;

        v_subtotal := v_subtotal + (v_price * v_quantity);

        INSERT INTO public.order_items (
            order_id, product_id, product_name, sku, quantity, unit_price, total_price
        ) VALUES (
            v_order_id, v_product_id, v_product_name, v_sku, v_quantity, v_price, v_price * v_quantity
        );
    END LOOP;

    IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN v_discount := v_subtotal * 0.15; END IF;
    IF v_subtotal >= 500 THEN v_delivery_charge := 0; ELSE v_delivery_charge := 49; END IF;
    v_gst := v_subtotal * 0.05; 
    v_total := v_subtotal + v_delivery_charge + v_gst - v_discount;
    IF v_total < 0 THEN v_total := 0; END IF;

    UPDATE public.orders SET subtotal = v_subtotal, discount = v_discount, delivery_charge = v_delivery_charge, gst = v_gst, total_amount = v_total WHERE id = v_order_id;
    RETURN v_order_id;
END;
$$;

NOTIFY pgrst, 'reload schema';
