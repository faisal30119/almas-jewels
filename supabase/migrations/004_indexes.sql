-- Speed up order queries (most common admin queries)
create index if not exists idx_user_orders_created_at   on user_orders (created_at desc);
create index if not exists idx_user_orders_status        on user_orders (status);
create index if not exists idx_user_orders_user_id       on user_orders (user_id);
create index if not exists idx_user_orders_order_id      on user_orders (order_id);

-- Speed up product queries
create index if not exists idx_products_stock            on products (stock);
create index if not exists idx_products_created_at       on products (created_at desc);
create index if not exists idx_products_name             on products using gin(to_tsvector('english', name));

-- Speed up customer queries
create index if not exists idx_user_profiles_email       on user_profiles (email);
create index if not exists idx_user_profiles_uid         on user_profiles (uid);
create index if not exists idx_user_profiles_created_at  on user_profiles (created_at desc);

-- Speed up order timeline
create index if not exists idx_order_timeline_order_id   on order_timeline (order_id);

-- Speed up coupons lookup
create index if not exists idx_coupons_code              on coupons (code);
