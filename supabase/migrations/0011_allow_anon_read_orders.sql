-- Allow anonymous users to read orders and order items so the tracking page loads
CREATE POLICY "Allow anon read orders" ON public.orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read order_items" ON public.order_items FOR SELECT TO anon USING (true);

-- Also allow them to insert just in case any client-side inserts happen
CREATE POLICY "Allow anon insert orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert order_items" ON public.order_items FOR INSERT TO anon WITH CHECK (true);
