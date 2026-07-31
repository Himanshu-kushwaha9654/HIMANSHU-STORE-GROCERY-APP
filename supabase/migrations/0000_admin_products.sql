-- Phase 3 Admin Products Schema

-- Drop existing if any (be careful in production)
-- DROP TABLE IF EXISTS public.product_variants CASCADE;
-- DROP TABLE IF EXISTS public.product_images CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;

-- ENUMS
CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'inactive', 'hidden', 'out_of_stock');
CREATE TYPE public.product_visibility AS ENUM ('visible', 'hidden');

-- PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    
    category_id TEXT NOT NULL,
    subcategory_id TEXT,
    brand_id TEXT,
    
    -- Base Pricing & Inventory (Can be overridden by variants)
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    compare_at_price NUMERIC(10,2),
    cost_price NUMERIC(10,2),
    discount_percentage INTEGER DEFAULT 0,
    gst_percentage INTEGER DEFAULT 0,
    
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    max_stock INTEGER,
    
    weight TEXT,
    unit TEXT,
    dimensions TEXT,
    
    -- Properties
    is_organic BOOLEAN DEFAULT false,
    is_veg BOOLEAN DEFAULT true,
    country_of_origin TEXT DEFAULT 'India',
    shelf_life TEXT,
    ingredients TEXT,
    storage_instructions TEXT,
    
    -- Meta & Settings
    status public.product_status DEFAULT 'draft',
    visibility public.product_visibility DEFAULT 'visible',
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    tags TEXT[],
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    
    -- Metrics
    rating NUMERIC(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0
);

-- PRODUCT IMAGES TABLE
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PRODUCT VARIANTS TABLE
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "500g", "1L"
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    price NUMERIC(10,2) NOT NULL,
    compare_at_price NUMERIC(10,2),
    stock_qty INTEGER NOT NULL DEFAULT 0,
    weight TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_variants
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS POLICIES (Assuming basic setup where authenticated users can read, but only admins can write)
-- Note: Replace 'authenticated' condition with actual Admin role check if you use Custom Claims or an 'admin' table.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Allow admin full access to products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to images" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to variants" ON public.product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INDEXES FOR ILIKE SEARCH QUERIES
-- Enable the pg_trgm extension if not already enabled (required for GIN trgm indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes on frequently searched fields for optimized 'ilike' searches
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sku_trgm ON public.products USING gin (sku gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_barcode_trgm ON public.products USING gin (barcode gin_trgm_ops);

