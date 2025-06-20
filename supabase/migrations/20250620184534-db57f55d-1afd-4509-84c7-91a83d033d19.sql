
-- Add RLS policies for units table
CREATE POLICY "Allow all operations on units" ON public.units FOR ALL USING (true) WITH CHECK (true);

-- Add RLS policies for categories table  
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
