-- Kaveri Kitchen — PostgreSQL schema (Neon)
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Kaveri Kitchen',
  address TEXT,
  currency TEXT DEFAULT 'INR',
  tax_rate NUMERIC DEFAULT 5.0
);

CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  qr_code_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'empty' -- 'empty' | 'occupied' | 'needs_bill'
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  is_veg BOOLEAN DEFAULT true,
  spice_level INT DEFAULT 1,
  image_url TEXT,
  avg_prep_time_minutes INT DEFAULT 10,
  is_available BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'waiter' | 'kitchen' | 'cashier' | 'admin'
  pin TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  status TEXT DEFAULT 'placed', -- 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'billed' | 'closed'
  placed_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  total_amount NUMERIC,
  tax_amount NUMERIC,
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid' | 'paid'
  payment_method TEXT -- 'cash' | 'upi' | 'card'
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  special_instructions TEXT,
  item_status TEXT DEFAULT 'received', -- 'received' | 'preparing' | 'ready' | 'served'
  unit_price NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS waiter_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  status TEXT DEFAULT 'pending', -- 'pending' | 'acknowledged'
  requested_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_sales_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  date DATE NOT NULL,
  total_orders INT,
  total_revenue NUMERIC,
  avg_prep_time_minutes NUMERIC,
  top_items JSONB
);
