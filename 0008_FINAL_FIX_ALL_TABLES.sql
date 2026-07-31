-- THE ULTIMATE FIX SCRIPT
-- This script safely creates ALL tables that failed in previous steps, 
-- fixes the missing trigger function, and force-reloads the cache.

-- 1. Fix the missing trigger function
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure ENUMS exist
DO $$ BEGIN
    CREATE TYPE public.inventory_status AS ENUM ('healthy', 'low_stock', 'out_of_stock', 'incoming');
    CREATE TYPE public.warehouse_type AS ENUM ('main', 'godown', 'cold_storage');
    CREATE TYPE public.inventory_reason AS ENUM ('sold', 'added', 'damaged', 'expired', 'returned', 'lost', 'manual_adjustment', 'transfer');
    CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'packing', 'packed', 'out_for_delivery', 'delivered', 'cancelled');
    CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'refund');
    CREATE TYPE public.payment_method AS ENUM ('cod', 'upi', 'card', 'wallet');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. INVENTORY TABLES
CREATE TABLE IF NOT EXISTS public.warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type public.warehouse_type DEFAULT 'main'
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    product_id UUID, -- ignoring fkey strictness for simplicity if product table is missing
    warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    buying_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    expiry_date DATE,
    status public.inventory_status DEFAULT 'healthy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop and recreate the trigger safely
DROP TRIGGER IF EXISTS update_inventory_modtime ON public.inventory_items;
CREATE TRIGGER update_inventory_modtime
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

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

-- 4. ORDERS TABLES
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT,
    vehicle_number TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id UUID,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address JSONB NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    gst NUMERIC(10,2) DEFAULT 0,
    delivery_charge NUMERIC(10,2) DEFAULT 0,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_reference TEXT,
    order_status TEXT DEFAULT 'pending',
    expected_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_otp TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
