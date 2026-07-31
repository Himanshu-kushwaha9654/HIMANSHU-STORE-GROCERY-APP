-- Allow anonymous users to update orders (for the mock Admin Dashboard)
CREATE POLICY "Allow anon update orders" ON public.orders FOR UPDATE TO anon USING (true) WITH CHECK (true);
