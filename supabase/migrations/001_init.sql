-- user_profiles: stores wishlist, display name
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  wishlist text[] default '{}',
  created_at timestamptz default now()
);
alter table user_profiles enable row level security;
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = uid);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = uid);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = uid);

-- products: managed via admin
create table if not exists products (
  id bigint primary key generated always as identity,
  name text not null,
  price integer not null,
  stock integer not null default 10,
  image text,
  category text,
  stone_color text,
  plating text,
  description text,
  inclusions text[] default '{}',
  created_at timestamptz default now()
);
alter table products enable row level security;
create policy "Products are public" on products for select using (true);
create policy "Admin can manage products" on products for all using (auth.jwt()->>'email' = any(string_to_array(current_setting('app.admin_emails', true), ',')));

-- user_orders: client-side order records
create table if not exists user_orders (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id),
  order_id text,
  amount integer not null,
  items jsonb default '[]',
  status text default 'Processing',
  shipping_details jsonb,
  payment_method text,
  error text,
  created_at timestamptz default now()
);
alter table user_orders enable row level security;
create policy "Users can view own orders" on user_orders for select using (auth.uid() = user_id);
create policy "Users can insert orders" on user_orders for insert with check (auth.uid() = user_id);
create policy "Users can update own orders" on user_orders for update using (auth.uid() = user_id);

-- coupons
create table if not exists coupons (
  id bigint primary key generated always as identity,
  code text not null unique,
  discount_amount integer not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table coupons enable row level security;
create policy "Coupons readable by all" on coupons for select using (true);
