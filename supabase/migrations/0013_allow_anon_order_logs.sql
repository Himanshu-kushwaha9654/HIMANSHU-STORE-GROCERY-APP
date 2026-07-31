-- Allow anonymous users to view and insert order logs for the mock Admin Dashboard
CREATE POLICY "Allow anon read logs" ON public.order_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert logs" ON public.order_logs FOR INSERT TO anon WITH CHECK (true);
