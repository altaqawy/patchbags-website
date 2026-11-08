-- Run in the customer's own Supabase project SQL editor, not in GitHub Pages.
-- This table stores only product IDs and quantities: NO payment, PII or prices.
-- Owner's separate Next.js/PostgreSQL database is not connected to this table.
CREATE TABLE IF NOT EXISTS public.customer_cart_items (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 product_id text NOT NULL CHECK (product_id ~ '^[A-Z0-9-]{3,32}$'),
 quantity smallint NOT NULL CHECK (quantity BETWEEN 1 AND 20),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,product_id)
);
CREATE INDEX IF NOT EXISTS customer_cart_by_user ON public.customer_cart_items(user_id,updated_at DESC);
ALTER TABLE public.customer_cart_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_cart_items FROM anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.customer_cart_items TO authenticated;
DROP POLICY IF EXISTS own_cart_read ON public.customer_cart_items;
DROP POLICY IF EXISTS own_cart_add ON public.customer_cart_items;
DROP POLICY IF EXISTS own_cart_change ON public.customer_cart_items;
DROP POLICY IF EXISTS own_cart_delete ON public.customer_cart_items;
CREATE POLICY own_cart_read ON public.customer_cart_items FOR SELECT TO authenticated
 USING(user_id=(SELECT auth.uid()));
CREATE POLICY own_cart_add ON public.customer_cart_items FOR INSERT TO authenticated
 WITH CHECK(user_id=(SELECT auth.uid()));
CREATE POLICY own_cart_change ON public.customer_cart_items FOR UPDATE TO authenticated
 USING(user_id=(SELECT auth.uid())) WITH CHECK(user_id=(SELECT auth.uid()));
CREATE POLICY own_cart_delete ON public.customer_cart_items FOR DELETE TO authenticated
 USING(user_id=(SELECT auth.uid()));
