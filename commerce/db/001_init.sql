-- Run in an owner-controlled PostgreSQL instance before enabling APIs.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS admin_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE,
 password_hash text NOT NULL, role text NOT NULL CHECK(role IN ('owner','super_admin','staff')),
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS admin_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE, csrf_token_hash text NOT NULL, expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS auth_attempts (
 ip_hash text NOT NULL, attempt_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS auth_attempts_time_idx ON auth_attempts(attempt_at);
CREATE TABLE IF NOT EXISTS customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, full_name text,
 phone text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS products (
 id text PRIMARY KEY, title text NOT NULL, description text DEFAULT '',
 price_minor bigint NOT NULL DEFAULT 0 CHECK(price_minor>=0), currency text NOT NULL DEFAULT 'EGP',
 active boolean NOT NULL DEFAULT false, stock integer NOT NULL DEFAULT 0 CHECK(stock>=0),
 image_url text, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS payment_methods (
 method text PRIMARY KEY CHECK(method IN ('paymob','cod','bank','wallet')),
 enabled boolean NOT NULL DEFAULT false, instructions text DEFAULT '', receiving_account text DEFAULT '',
 verified boolean NOT NULL DEFAULT false, updated_at timestamptz DEFAULT now());
INSERT INTO payment_methods(method) VALUES('paymob'),('cod'),('bank'),('wallet') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS gateway_configs (
 environment text PRIMARY KEY CHECK(environment IN ('test','live')),
 secret_cipher text, public_key text, hmac_cipher text,
 integration_ids integer[] NOT NULL DEFAULT '{}',
 credential_status text NOT NULL DEFAULT 'not_configured',
 webhook_verified boolean NOT NULL DEFAULT false, live_activated boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO gateway_configs(environment) VALUES('test'),('live') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid REFERENCES customers(id),
 customer_name text NOT NULL, email text NOT NULL, phone text NOT NULL,
 city text NOT NULL, address text NOT NULL, notes text,
 shipping_minor bigint NOT NULL DEFAULT 0, subtotal_minor bigint NOT NULL CHECK(subtotal_minor>=0),
 total_minor bigint NOT NULL CHECK(total_minor>=0), currency text NOT NULL DEFAULT 'EGP',
 method text NOT NULL CHECK(method IN ('paymob','cod','bank','wallet')),
 status text NOT NULL DEFAULT 'pending_confirmation',
 payment_status text NOT NULL DEFAULT 'unpaid', manual_reference text,
 client_request_id text NOT NULL UNIQUE, tracking_token_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS order_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id text NOT NULL REFERENCES products(id), title_snapshot text NOT NULL,
 quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 20), unit_minor bigint NOT NULL,
 total_minor bigint NOT NULL);
CREATE TABLE IF NOT EXISTS payment_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id),
 environment text NOT NULL CHECK(environment IN ('test','live')),
 provider_order_id text UNIQUE, intention_id text UNIQUE, special_reference text UNIQUE,
 client_secret_hash text, status text NOT NULL DEFAULT 'pending',
 amount_minor bigint NOT NULL, currency text NOT NULL DEFAULT 'EGP',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS payment_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider_transaction_id text NOT NULL,
 payment_attempt_id uuid NOT NULL REFERENCES payment_attempts(id),
 event_type text NOT NULL, result text NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(provider_transaction_id,event_type,result));
CREATE TABLE IF NOT EXISTS audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES admin_users(id),
 action text NOT NULL, target text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}',
 occurred_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_payment_idx ON orders(payment_status,method);
CREATE INDEX IF NOT EXISTS attempts_order_idx ON payment_attempts(order_id);
CREATE TABLE IF NOT EXISTS store_settings (
 id integer PRIMARY KEY DEFAULT 1 CHECK(id=1),
 shipping_minor bigint CHECK(shipping_minor>=0),
 tax_basis_points integer NOT NULL DEFAULT 0 CHECK(tax_basis_points BETWEEN 0 AND 10000),
 updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO store_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS api_attempts (
 ip_hash text NOT NULL, attempt_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS api_attempts_time_idx ON api_attempts(attempt_at);
