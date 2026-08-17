-- categories: hierarchical product categories
create table if not exists categories (
  id bigint primary key generated always as identity,
  name text not null,
  slug text not null unique,
  parent_id bigint references categories(id),
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table categories enable row level security;
create policy "Categories are public" on categories for select using (true);
create policy "Admin can manage categories" on categories for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- seed default categories
insert into categories (name, slug, sort_order) values
  ('Bridal Sets', 'bridal-sets', 1),
  ('Necklaces', 'necklaces', 2),
  ('Earrings', 'earrings', 3),
  ('Pendants', 'pendants', 4),
  ('Oxidise jewelry', 'oxidise-jewelry', 5),
  ('American Diamond (AD) / CZ', 'american-diamond-cz', 6),
  ('Polki Jewelry', 'polki-jewelry', 7),
  ('Kundan Jewelry', 'kundan-jewelry', 8),
  ('Meenakari Jewelry', 'meenakari-jewelry', 9)
on conflict (slug) do nothing;

-- product_images: multiple images per product
create table if not exists product_images (
  id bigint primary key generated always as identity,
  product_id bigint not null references products(id) on delete cascade,
  url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table product_images enable row level security;
create policy "Product images are public" on product_images for select using (true);
create policy "Admin can manage product_images" on product_images for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- product_variants: size/color variants
create table if not exists product_variants (
  id bigint primary key generated always as identity,
  product_id bigint not null references products(id) on delete cascade,
  label text not null,
  price_modifier integer default 0,
  stock integer default 0,
  created_at timestamptz default now()
);
alter table product_variants enable row level security;
create policy "Product variants are public" on product_variants for select using (true);
create policy "Admin can manage product_variants" on product_variants for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- order_timeline: status history per order
create table if not exists order_timeline (
  id bigint primary key generated always as identity,
  order_id bigint not null references user_orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz default now()
);
alter table order_timeline enable row level security;
create policy "Users can view own order timeline" on order_timeline for select using (
  exists (select 1 from user_orders where user_orders.id = order_timeline.order_id and user_orders.user_id = auth.uid())
);
create policy "Admin can manage order_timeline" on order_timeline for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- site_settings: key-value store for site configuration
create table if not exists site_settings (
  id bigint primary key generated always as identity,
  key text not null unique,
  value text,
  created_at timestamptz default now()
);
alter table site_settings enable row level security;
create policy "Site settings are public" on site_settings for select using (true);
create policy "Admin can manage site_settings" on site_settings for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- hero_slides: homepage carousel
create table if not exists hero_slides (
  id bigint primary key generated always as identity,
  title text,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table hero_slides enable row level security;
create policy "Hero slides are public" on hero_slides for select using (true);
create policy "Admin can manage hero_slides" on hero_slides for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- shipping_methods
create table if not exists shipping_methods (
  id bigint primary key generated always as identity,
  name text not null,
  price integer not null default 0,
  estimated_days text,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table shipping_methods enable row level security;
create policy "Shipping methods are public" on shipping_methods for select using (true);
create policy "Admin can manage shipping_methods" on shipping_methods for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- add coupon usage tracking columns
alter table coupons add column if not exists discount_type text default 'flat';
alter table coupons add column if not exists min_order_amount integer default 0;
alter table coupons add column if not exists usage_count integer default 0;
alter table coupons add column if not exists usage_limit integer;
alter table coupons add column if not exists expires_at timestamptz;

-- add SEO fields to products
alter table products add column if not exists meta_title text;
alter table products add column if not exists meta_description text;
alter table products add column if not exists slug text;
alter table products add column if not exists is_featured boolean default false;
alter table products add column if not exists updated_at timestamptz default now();

-- add name/email/phone to user_orders for guest-friendly tracking
alter table user_orders add column if not exists tracking_number text;
alter table user_orders add column if not exists notes text;
alter table user_orders add column if not exists updated_at timestamptz default now();
