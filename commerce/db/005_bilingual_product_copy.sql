-- PatCh.BaGs bilingual product descriptions.
-- Apply to the commerce PostgreSQL database after 003_product_cms.sql.
-- Safe for existing stores: keeps all current English copy and only adds an optional Arabic field.
ALTER TABLE products
 ADD COLUMN IF NOT EXISTS description_ar text NOT NULL DEFAULT '';
