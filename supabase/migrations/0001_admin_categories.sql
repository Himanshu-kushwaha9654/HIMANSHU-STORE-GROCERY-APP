-- Phase 4 Admin Categories Schema

-- Drop existing if any
-- DROP TABLE IF EXISTS public.categories CASCADE;

-- ENUMS
DO $$ BEGIN
    CREATE TYPE public.category_status AS ENUM ('draft', 'active', 'hidden');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Hierarchy
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    -- Media & Display
    icon TEXT,
    image TEXT,
    banner_image TEXT,
    theme_color TEXT DEFAULT '#10b981',
    
    -- Settings
    status public.category_status DEFAULT 'active',
    show_on_homepage BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    max_products INTEGER DEFAULT 10,
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT
);

-- RLS POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active categories" 
ON public.categories FOR SELECT 
USING (status = 'active');

CREATE POLICY "Allow authenticated full access to categories" 
ON public.categories FOR ALL 
USING (auth.role() = 'authenticated');

-- INDICES
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_status_homepage ON public.categories(status, show_on_homepage);

-- TRIGGER for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_modtime
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
