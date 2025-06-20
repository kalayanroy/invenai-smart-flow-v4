
-- Drop the existing foreign key constraint
ALTER TABLE public.sales_returns DROP CONSTRAINT IF EXISTS sales_returns_original_sale_id_fkey;

-- Make original_sale_id nullable since voucher returns won't have a sale ID
ALTER TABLE public.sales_returns ALTER COLUMN original_sale_id DROP NOT NULL;

-- Add a new foreign key constraint that only applies when original_sale_id is not null
ALTER TABLE public.sales_returns 
ADD CONSTRAINT sales_returns_original_sale_id_fkey 
FOREIGN KEY (original_sale_id) 
REFERENCES public.sales(id) 
DEFERRABLE INITIALLY DEFERRED;

-- Add new columns for voucher sales support
ALTER TABLE public.sales_returns ADD COLUMN IF NOT EXISTS original_voucher_id text;
ALTER TABLE public.sales_returns ADD COLUMN IF NOT EXISTS original_voucher_item_id text;
ALTER TABLE public.sales_returns ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'regular_sale';
