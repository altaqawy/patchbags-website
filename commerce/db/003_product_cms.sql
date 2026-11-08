-- PatCh.BaGs product CMS expansion (PostgreSQL; run after 001_init.sql and 002_seed_catalog.sql)
-- Product records, categories, original media and sale pricing are owner-managed.
CREATE TABLE IF NOT EXISTS categories (
 slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,49}$'),
 name_ar text NOT NULL CHECK (char_length(name_ar) BETWEEN 2 AND 70),
 name_en text NOT NULL CHECK (char_length(name_en) BETWEEN 2 AND 70),
 active boolean NOT NULL DEFAULT true,
 position integer NOT NULL DEFAULT 100,
 created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO categories (slug,name_ar,name_en,position) VALUES
 ('bags','الشنط','Bags',10),
 ('accessories','الإكسسوارات','Accessories',20),
 ('personalized','المنتجات المخصصة','Personalized',30)
ON CONFLICT(slug) DO NOTHING;
ALTER TABLE products
 ADD COLUMN IF NOT EXISTS category_slug text REFERENCES categories(slug),
 ADD COLUMN IF NOT EXISTS title_ar text,
 ADD COLUMN IF NOT EXISTS compare_at_minor bigint CHECK(compare_at_minor IS NULL OR compare_at_minor > 0),
 ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb,
 ADD COLUMN IF NOT EXISTS badge text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 100,
 ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
UPDATE products SET category_slug=CASE
 WHEN id IN('PB-08','PB-09','PB-11','PB-12') THEN 'accessories'
 WHEN id='PB-10' THEN 'personalized'
 ELSE 'bags' END
WHERE category_slug IS NULL;
ALTER TABLE products ADD CONSTRAINT product_discount_compare_ck CHECK (
 compare_at_minor IS NULL OR compare_at_minor > price_minor
);
ALTER TABLE products ADD CONSTRAINT product_media_list_ck CHECK (
 jsonb_typeof(media) = 'array' AND jsonb_array_length(media) <= 12
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_slug,active);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured,position);
CREATE SEQUENCE IF NOT EXISTS product_sku_seq START WITH 100;
-- Never overwrite verified payment/order amounts during a catalog migration.
