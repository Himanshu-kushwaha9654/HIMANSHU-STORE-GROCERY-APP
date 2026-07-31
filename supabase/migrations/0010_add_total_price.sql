ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2);
NOTIFY pgrst, 'reload schema';
