ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS contact_method TEXT,
ADD COLUMN IF NOT EXISTS customer_note TEXT;
