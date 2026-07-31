CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- usually references auth.users(id), leaving open for mock users
    type TEXT NOT NULL, -- Home, Work, Other
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    coordinates JSONB, -- [lat, lng]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type TEXT NOT NULL, -- UPI, Card, Wallet, NetBanking
    provider TEXT NOT NULL,
    details TEXT NOT NULL,
    icon_url TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY, -- using string ID to match 'paneer-butter-masala' format
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    calories TEXT NOT NULL,
    protein TEXT NOT NULL,
    servings TEXT NOT NULL,
    rating TEXT NOT NULL,
    img TEXT NOT NULL,
    description TEXT NOT NULL,
    nutrition JSONB NOT NULL,
    ingredients_list JSONB NOT NULL,
    steps JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_timestamp_customer_addresses ON public.customer_addresses;
CREATE TRIGGER set_timestamp_customer_addresses
BEFORE UPDATE ON public.customer_addresses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_saved_payments ON public.saved_payments;
CREATE TRIGGER set_timestamp_saved_payments
BEFORE UPDATE ON public.saved_payments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_recipes ON public.recipes;
CREATE TRIGGER set_timestamp_recipes
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_banners ON public.banners;
CREATE TRIGGER set_timestamp_banners
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Policies for public read
DROP POLICY IF EXISTS "Allow public read access to recipes" ON public.recipes;
CREATE POLICY "Allow public read access to recipes" ON public.recipes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to banners" ON public.banners;
CREATE POLICY "Allow public read access to banners" ON public.banners FOR SELECT USING (true);

-- Policies for admin write
DROP POLICY IF EXISTS "Allow admin full access to recipes" ON public.recipes;
CREATE POLICY "Allow admin full access to recipes" ON public.recipes FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin full access to banners" ON public.banners;
CREATE POLICY "Allow admin full access to banners" ON public.banners FOR ALL USING (auth.role() = 'authenticated');

-- Policies for user access (addresses and payments)
-- Note: We use a simplified user policy here because user_id might not strictly tie to auth.uid() in development
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.customer_addresses;
CREATE POLICY "Users can manage their own addresses" ON public.customer_addresses 
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon'); -- Allowing anon for demo purposes, you should restrict this in prod

DROP POLICY IF EXISTS "Users can manage their own payments" ON public.saved_payments;
CREATE POLICY "Users can manage their own payments" ON public.saved_payments 
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

NOTIFY pgrst, 'reload schema';
