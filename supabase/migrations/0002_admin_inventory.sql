-- Phase 5 Admin Inventory Schema

-- ENUMS
DO $$ BEGIN
    CREATE TYPE public.inventory_status AS ENUM ('healthy', 'low_stock', 'out_of_stock', 'incoming');
    CREATE TYPE public.warehouse_type AS ENUM ('main', 'godown', 'cold_storage');
    CREATE TYPE public.inventory_reason AS ENUM ('sold', 'added', 'damaged', 'expired', 'returned', 'lost', 'manual_adjustment', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- WAREHOUSES TABLE
CREATE TABLE IF NOT EXISTS public.warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type public.warehouse_type DEFAULT 'main'
);

-- SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT
);

-- INVENTORY ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    
    buying_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    expiry_date DATE,
    
    status public.inventory_status DEFAULT 'healthy',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE (product_id, warehouse_id) -- A product can have one inventory record per warehouse
);

-- INVENTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id TEXT PRIMARY KEY,
    inventory_id TEXT REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    difference INTEGER NOT NULL,
    
    reason public.inventory_reason NOT NULL,
    notes TEXT,
    admin_name TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can view or modify inventory
CREATE POLICY "Allow authenticated full access to warehouses" ON public.warehouses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to suppliers" ON public.suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to inventory_items" ON public.inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to inventory_logs" ON public.inventory_logs FOR ALL USING (auth.role() = 'authenticated');

-- INDICES
CREATE INDEX idx_inventory_product ON public.inventory_items(product_id);
CREATE INDEX idx_inventory_status ON public.inventory_items(status);
CREATE INDEX idx_inventory_logs_inventory_id ON public.inventory_logs(inventory_id);
CREATE INDEX idx_inventory_logs_created_at ON public.inventory_logs(created_at DESC);

-- TRIGGER for updated_at
CREATE TRIGGER update_inventory_modtime
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
