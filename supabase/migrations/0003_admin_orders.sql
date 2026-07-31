-- Phase 4 Admin Orders Schema

-- ENUMS
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'packing', 'packed', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'refund');
CREATE TYPE public.payment_method AS ENUM ('cod', 'upi', 'card', 'wallet');

-- DELIVERY PARTNERS TABLE
CREATE TABLE public.delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT,
    vehicle_number TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDERS TABLE
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    
    -- Customer Info
    customer_id UUID, -- Optional if guest checkout is allowed, or reference to auth.users
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address JSONB NOT NULL, -- structured address (street, city, state, zip, lat, lng)
    
    -- Amounts
    total_amount NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    gst NUMERIC(10,2) DEFAULT 0,
    delivery_charge NUMERIC(10,2) DEFAULT 0,
    
    -- Payment & Status
    payment_method public.payment_method NOT NULL,
    payment_status public.payment_status DEFAULT 'pending',
    payment_reference TEXT, -- e.g. UPI Reference ID
    order_status public.order_status DEFAULT 'pending',
    
    -- Delivery & Timings
    delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
    expected_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_otp TEXT,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL, -- references products table ideally
    product_name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ORDER LOGS TABLE
CREATE TABLE public.order_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status_from TEXT,
    status_to TEXT NOT NULL,
    changed_by TEXT NOT NULL, -- Admin Name or System
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRIGGERS FOR UPDATED_AT
CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS POLICIES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

-- Assuming admin access is checked in application logic (Service Role) or authenticated check
CREATE POLICY "Allow admin full access to orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access to order_items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access to order_logs" ON public.order_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access to delivery_partners" ON public.delivery_partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ENABLE REALTIME ON ORDERS
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- INDEXES FOR FAST SEARCH
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_orders_customer_phone ON public.orders (customer_phone);
CREATE INDEX idx_orders_customer_name_trgm ON public.orders USING gin (customer_name gin_trgm_ops);
CREATE INDEX idx_orders_invoice_number_trgm ON public.orders USING gin (invoice_number gin_trgm_ops);
CREATE INDEX idx_orders_status ON public.orders (order_status);
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);
