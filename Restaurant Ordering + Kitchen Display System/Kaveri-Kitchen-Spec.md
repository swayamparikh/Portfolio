# Kaveri Kitchen — Smart Order & Kitchen Display System
### Product & Engineering Spec (for Claude Code build)

**Idea & Concept by:** Swayam Parikh
**Project type:** Full-stack, real-time, multi-user portfolio project
**Demo Restaurant Theme:** A modern South Indian restaurant — "Kaveri Kitchen" (fictional brand created for this demo, serving tiffins, meals, and traditional South Indian cuisine)
**Purpose of this document:** Hand this entire file to Claude Code as the build brief. It contains the concept, real-time architecture, multi-role screens (Customer, Waiter, Kitchen, Cashier/Admin), database schema, API design, South Indian restaurant UI theme, and step-by-step build order.

---

## 1. Product Overview

**Project Name:** Kaveri Kitchen — Order & Kitchen Display System (KDS)
**Tagline:** *"From table to tawa, tracked live."*
**Category:** Restaurant Tech / Real-Time Operations Platform
**Purpose:** A real operational restaurant system — not a static menu website. Customers order via QR code at their table (or a waiter takes the order on a tablet), the order instantly appears on a live **Kitchen Display Screen** where kitchen staff update its status in real time (Received → Preparing → Ready → Served), and the cashier/admin sees live order status, billing, and daily sales — all synced across every screen simultaneously.

**Why this is a strong portfolio project (beyond your "Coffee shop site"):**
- This is a genuine **multi-user, real-time system** — four different roles (Customer, Waiter, Kitchen, Cashier/Admin) all interacting with the *same live order* simultaneously. This is a fundamentally harder engineering problem than a typical CRUD menu site, and it's exactly the kind of thing international technical interviewers probe for.
- Demonstrates WebSocket/real-time architecture, state machines (order status flow), multi-device UI design (tablet-optimized kitchen screen vs. mobile customer menu vs. desktop admin dashboard), and operational thinking — proof you can build tools businesses actually run on, not just display.
- The South Indian restaurant theme gives it a distinctive, memorable visual identity for your portfolio instead of looking like a generic restaurant template.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend (Customer menu + ordering) | Next.js (App Router) + TypeScript | Mobile-first, opened via QR code scan at the table |
| Frontend (Kitchen Display Screen) | Next.js — separate route, tablet/large-screen optimized | Runs on a kitchen tablet/monitor, always-on live view |
| Frontend (Waiter + Cashier/Admin dashboard) | Next.js — role-gated routes | Tablet or desktop use |
| Real-Time Sync | **Socket.io** | The core of the whole system — every order status change broadcasts instantly to all connected screens (kitchen, waiter, customer "your order status" view) |
| Backend | Node.js + Express + Socket.io server | REST API + WebSocket server |
| Database | PostgreSQL | Orders, menu, tables, staff, sales |
| Auth | Simple PIN-based login for staff (Waiter/Kitchen/Cashier roles), no auth needed for customer QR ordering | Fast staff login matters in a real restaurant — no typing long passwords mid-shift |
| Payments | Razorpay (India-first, supports UPI — the dominant payment method for this context) or Stripe for an international-facing version | Bill settlement at the table or counter |
| QR Code Generation | `qrcode` npm package — generates a unique QR per table linking to that table's ordering session | |
| Notifications | Optional: SMS/WhatsApp order-ready alert to customer's phone via a free-tier API | Nice-to-have polish feature |
| Hosting | Backend → Render/Railway (needs to support persistent WebSocket connections), Frontend → Vercel | |

---

## 3. User Roles & Devices

| Role | Device | What they do |
|---|---|---|
| **Customer** | Own phone (scans QR at table) | Browses menu, places order, tracks live status ("Your dosa is being prepared 🔥"), calls waiter, views/pays bill |
| **Waiter** | Tablet | Takes orders for customers who prefer assistance, views table status at a glance, marks orders as served, handles "call waiter" requests |
| **Kitchen Staff** | Large tablet/monitor mounted in kitchen | Sees live incoming order tickets, updates status per item/order (Preparing → Ready), sees urgency-highlighted tickets for orders taking too long |
| **Cashier/Admin** | Desktop or tablet at counter | Generates final bill, processes payment, views daily sales dashboard, manages menu/pricing, views table occupancy |

---

## 4. Core Features (MVP Scope)

### 4.1 Customer Ordering (QR-based)
- Scan table QR code → opens that table's live menu (no app download, no login)
- Menu organized by South Indian categories: **Tiffins** (idli, dosa varieties, vada, upma), **Meals/Thali**, **Curries & Sides**, **Rice & Biryani**, **Beverages** (filter coffee, buttermilk, fresh juice), **Desserts**
- Item detail: photo, description, spice-level indicator, veg/non-veg marker (standard red/green dot convention), price
- Cart + place order → order confirmation with estimated wait time
- **Live order tracking screen**: real-time status updates as the kitchen progresses (Received → Preparing → Ready → Served) — this is the "wow" feature for a customer-facing demo
- "Call Waiter" button (pings the waiter's tablet instantly)
- Add more items to an already-placed order (common real restaurant behavior)
- View running bill total at any time

### 4.2 Kitchen Display Screen (KDS) — the centerpiece feature
- Live ticket feed: new orders appear instantly (no refresh) as cards/tickets, grouped by table
- Each ticket shows: table number, items + quantities + special instructions (e.g. "extra spicy," "no onion"), time since order placed
- **Color-coded urgency**: green (just placed) → amber (approaching target prep time) → red (overdue) — critical for real kitchen usability, not just a visual gimmick
- Tap/swipe to update status per item or whole order: Received → Preparing → Ready
- Sound/visual alert on new order arrival
- "Ready" orders move to a separate "awaiting pickup" column, clearing the active queue visually

### 4.3 Waiter Dashboard
- Table map/grid view: see all tables at a glance — color-coded by status (empty, occupied-ordering, food-preparing, ready-to-serve, needs-bill)
- Manually take an order on behalf of a customer (for walk-ins or those who prefer not to use their phone)
- "Ready" order alerts → mark as delivered to table
- Respond to "Call Waiter" requests
- Split-bill assistance view

### 4.4 Cashier/Admin
- Generate and print/share final bill per table (itemized, with tax breakdown)
- Process payment (cash marked manually, or Razorpay/UPI integration for digital payment)
- **Daily sales dashboard**: total orders, revenue, best-selling items, average prep time, table turnover rate
- Menu management: add/edit/remove items, mark items "sold out" (instantly hides from customer menu in real time — important operational feature)
- Table/QR code management (generate/reprint table QR codes)
- Staff management (add waiter/kitchen PINs)

### 4.5 Real-Time Order State Machine
```
PLACED → CONFIRMED (kitchen acknowledges) → PREPARING → READY → SERVED → BILLED → CLOSED
```
Every transition broadcasts via Socket.io to: the customer's tracking screen, the waiter dashboard, and the admin's live table map — all three update instantly and simultaneously. This synchronized multi-screen behavior is the single most important thing to get right and the strongest thing to show off in a demo video.

---

## 5. Database Schema (PostgreSQL)

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Kaveri Kitchen',
  address TEXT,
  currency TEXT DEFAULT 'INR',
  tax_rate NUMERIC DEFAULT 5.0
);

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  qr_code_token TEXT UNIQUE NOT NULL, -- used in the QR-scanned URL
  status TEXT DEFAULT 'empty' -- 'empty' | 'occupied' | 'needs_bill'
);

CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Tiffins' | 'Meals' | 'Curries' | 'Rice & Biryani' | 'Beverages' | 'Desserts'
  sort_order INT DEFAULT 0
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. 'Masala Dosa', 'Mysore Bonda', 'Ghee Roast'
  description TEXT,
  price NUMERIC NOT NULL,
  is_veg BOOLEAN DEFAULT true,
  spice_level INT DEFAULT 1, -- 1-3
  image_url TEXT,
  avg_prep_time_minutes INT DEFAULT 10,
  is_available BOOLEAN DEFAULT true -- toggled off when "sold out"
);

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'waiter' | 'kitchen' | 'cashier' | 'admin'
  pin TEXT NOT NULL -- hashed PIN for fast login
);

CREATE TABLE orders (
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

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  special_instructions TEXT, -- 'extra spicy', 'no onion', etc.
  item_status TEXT DEFAULT 'received', -- 'received' | 'preparing' | 'ready' | 'served'
  unit_price NUMERIC NOT NULL
);

CREATE TABLE waiter_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  status TEXT DEFAULT 'pending', -- 'pending' | 'acknowledged'
  requested_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_sales_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  date DATE NOT NULL,
  total_orders INT,
  total_revenue NUMERIC,
  avg_prep_time_minutes NUMERIC,
  top_items JSONB
);
```

---

## 6. API & Real-Time Event Design

### REST Endpoints
```
# Customer (public, table-scoped via QR token)
GET    /api/table/:qrToken/menu             → menu for that restaurant
POST   /api/table/:qrToken/order             → place an order
GET    /api/table/:qrToken/order/:orderId    → live order status
POST   /api/table/:qrToken/call-waiter

# Staff Auth
POST   /api/staff/login                      → PIN-based login

# Kitchen
GET    /api/kitchen/orders/active            → all active tickets
PUT    /api/kitchen/orders/:id/status        → update order/item status

# Waiter
GET    /api/waiter/tables                    → table status grid
PUT    /api/waiter/orders/:id/served
GET    /api/waiter/calls                     → pending waiter calls
PUT    /api/waiter/calls/:id/acknowledge

# Cashier/Admin
POST   /api/orders/:id/bill                  → generate final bill
POST   /api/orders/:id/pay                   → process payment
GET    /api/admin/menu
PUT    /api/admin/menu/:id                   → edit item / toggle availability
GET    /api/admin/sales/daily
GET    /api/admin/tables/qr/:tableId         → regenerate/fetch QR code
```

### Socket.io Events (the real-time core)
```
# Emitted by server, listened to by relevant screens
order:new              → Kitchen Display, Waiter dashboard
order:status_changed    → Customer tracking screen, Waiter dashboard, Admin table map
item:status_changed     → Kitchen Display (per-item granularity)
table:waiter_called     → Waiter dashboard
table:status_changed    → Admin table map, Waiter dashboard
menu:item_availability_changed → Customer menu (instant "sold out" reflection)
```

---

## 7. UI/UX Theme — "Modern South Indian Warmth"

**Direction:** Rooted in authentic South Indian visual culture — banana leaf greens, turmeric golds, terracotta — but rendered in a clean, modern, high-contrast interface (not a cluttered "traditional restaurant website" look). Different screens get tailored variants since they serve very different purposes (customer-facing warmth vs. kitchen-facing high-visibility utility).

- **Base (Customer-facing):** Warm cream `#FFF8ED` background — evokes banana leaf/traditional plating without literally using a leaf texture everywhere
- **Primary accent (Terracotta):** `#C1440E` — used for CTAs ("Add to Cart," "Place Order"), category highlights, price tags
- **Secondary accent (Banana Leaf Green):** `#4F7942` — used for veg indicators, success states, "Ready" status badges
- **Tertiary accent (Turmeric Gold):** `#E4A62F` — used for "Preparing" status, highlights, spice-level indicators
- **Veg/Non-veg indicators:** Standard green square (veg) / red-brown square (non-veg) dot markers next to every item name — an authentic, instantly recognizable Indian restaurant convention
- **Typography:** `Poppins` or `Rubik` (rounded, warm, friendly) for headings, `Inter` for body — avoid anything that reads as sterile/corporate; this should feel hospitable
- **Customer menu cards:** Large food photography, rounded corners (16px), soft warm shadow, spice-level shown as small chili icons (1–3)

### Kitchen Display Screen — distinct high-visibility variant
- **Base:** Near-black `#111111` background — kitchens are bright, steamy, chaotic environments; a dark high-contrast UI is far more legible than a light theme under those conditions (this is a deliberate, functional design decision, not just aesthetic)
- **Ticket cards:** Bold white text, large touch targets (kitchen staff have wet/gloved hands — no tiny buttons), color-coded left border per urgency (green/amber/red as described in 4.2)
- **Typography:** Bold, large, monospace-adjacent for item names/quantities — maximum scannability at a glance from a few feet away, like a real KDS in commercial kitchens

### Waiter/Admin Dashboard
- Lighter, more "operational" variant — white/cream base with terracotta accents, table-grid view uses color-coded table cards (green=empty, amber=occupied, red=needs attention) for instant visual scanning

- **Motion:** New kitchen tickets slide in with a subtle attention-grabbing animation + sound cue, status changes animate smoothly (not jarring) across all connected screens simultaneously — the synchronized real-time motion across devices is itself the most impressive thing to show in a demo recording, so it's worth polishing specifically for that moment.

---

## 8. Suggested Folder Structure

```
kaveri-kitchen/
├── web/                            # Next.js — all role-based frontends
│   ├── app/
│   │   ├── table/[qrToken]/        # customer ordering + live tracking
│   │   ├── kitchen/                # KDS screen
│   │   ├── waiter/                 # waiter dashboard
│   │   └── admin/                  # cashier/admin dashboard
│   ├── components/
│   │   ├── menu/
│   │   ├── kitchen-ticket/
│   │   └── table-grid/
│   └── lib/
│       └── socket-client.ts
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── sockets/
│   │   │   └── orderEvents.ts      # Socket.io event handlers
│   │   ├── services/
│   │   │   ├── orders.ts
│   │   │   ├── billing.ts
│   │   │   └── qr.ts
│   │   ├── db/
│   │   │   └── schema.sql
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

---

## 9. Build Order (Recommended for Claude Code)

**Stage 1 — Foundation**
1. Scaffold backend (Express + Socket.io) + Next.js frontend + Postgres schema
2. Seed demo data: Kaveri Kitchen menu (real South Indian dishes across all categories), 8–10 demo tables with QR tokens

**Stage 2 — Customer Ordering**
3. Build QR-token-scoped menu page (mobile-first)
4. Build cart + place-order flow
5. Build live order-tracking screen (Socket.io client listening for status updates)

**Stage 3 — Kitchen Display (the centerpiece — prioritize this)**
6. Build KDS ticket feed with Socket.io real-time updates
7. Build status update interactions (tap to progress status)
8. Build urgency color-coding based on elapsed time
9. **Test the full loop**: place an order on the customer screen → confirm it appears instantly on KDS → update status on KDS → confirm the customer tracking screen updates instantly. This end-to-end real-time loop is the core proof-of-concept and should be rock solid before moving on.

**Stage 4 — Waiter Dashboard**
10. Table grid view with live status
11. Manual order-taking flow
12. Waiter call handling

**Stage 5 — Cashier/Admin**
13. Bill generation + payment processing (Razorpay/UPI integration)
14. Menu management (including live "sold out" toggle reflecting instantly on customer menu)
15. Daily sales dashboard

**Stage 6 — Polish**
16. QR code generation/printing for tables
17. Sound/visual alerts on KDS
18. Responsive polish across all four screen types
19. Demo data variety (realistic South Indian menu photography, multiple simultaneous demo orders for a convincing live demo)

---

## 10. Portfolio Presentation Notes
- README should open with **"Idea & Concept by Swayam Parikh"**, framed as: *"A real-time, multi-role restaurant operations system — built to prove I can handle live, synchronized, multi-user systems, not just static websites."*
- The single most important thing for this portfolio piece: **record a demo video showing multiple screens side by side** (customer phone, kitchen tablet, waiter tablet) with an order flowing through all of them in real time. This synchronized-multi-screen moment is what makes this project's technical depth immediately obvious, even to a non-technical viewer.
- Explicitly mention the Socket.io real-time architecture and the order state machine in your write-up — these are the specific technical signals that distinguish this from "another restaurant menu site."
- Since it's themed around a real, authentic South Indian restaurant concept (Kaveri Kitchen), this project also doubles as a genuinely pitchable product to real South Indian restaurants/tiffin centers looking to modernize — worth mentioning as a real business opportunity in your case study, same as your other projects.

---

*End of spec — ready to hand to Claude Code.*
