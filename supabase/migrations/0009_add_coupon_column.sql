ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
NOTIFY pgrst, 'reload schema';
