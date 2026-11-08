-- PatCh.BaGs bilingual product descriptions and badges.
-- Apply to the commerce PostgreSQL database after 003_product_cms.sql.
-- Safe for existing stores: keeps all current English copy and adds optional Arabic product-copy fields.
ALTER TABLE products
 ADD COLUMN IF NOT EXISTS description_ar text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS badge_ar text NOT NULL DEFAULT '';
