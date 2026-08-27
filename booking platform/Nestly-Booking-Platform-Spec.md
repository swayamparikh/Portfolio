# Nestly — AI-Enhanced Stay Booking Platform
### Product & Engineering Spec (for Claude Code build)

**Idea & Concept by:** Swayam Parikh
**Project type:** Full-stack portfolio project (Airbnb-style marketplace)
**Purpose of this document:** Hand this entire file to Claude Code as the build brief. It contains the concept, architecture, guest/host/admin dashboard specs, database schema, API design, booking/payment logic, AI differentiators, UI theme, and step-by-step build order.

---

## 1. Product Overview

**Project Name:** Nestly
**Tagline:** *"Book stays, not stress."*
**Category:** Two-sided marketplace / Booking platform (Airbnb-style)
**Purpose:** A full marketplace where **hosts** list properties/rooms and **guests** search, book, and pay for stays — with real-time availability, reviews, messaging, and an admin layer to run the platform as a business. Built as a genuinely deep portfolio piece that proves you can build complex, stateful, multi-role systems — not just CRUD apps.

**Why this is a strong portfolio project:**
- Airbnb-class platforms are the gold standard "prove you can build anything" project because they force you to solve genuinely hard problems: real-time availability calendars, double-booking prevention, multi-role auth (guest/host/admin), search with geo + filters, payment splits (guest pays, host gets paid minus commission), and reviews with two-way trust systems.
- Adding an AI layer (Section 6) gives it a 2026-relevant differentiator most "Airbnb clone" tutorials don't have — this is what makes it stand out instead of looking like a copy-paste clone project.
- This same codebase is directly **reusable as a real product** (see your earlier "narrow vertical" options — VenueBook, ClinicSlot, FleetBook) if you want to resell a white-labeled version later.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | Guest-facing site + Host dashboard + Admin dashboard (route groups) |
| Styling | Tailwind CSS | Custom warm, premium travel theme (Section 5) |
| Backend | Node.js + Express (or Next.js API routes for simplicity) | REST API |
| Database | PostgreSQL + PostGIS extension | PostGIS enables real geo-search ("stays near me") |
| Auth | NextAuth.js or Clerk | Multi-role: Guest / Host / Admin, social login (Google) |
| Search | PostgreSQL full-text + PostGIS geo queries (or Algolia/Meilisearch free tier for faster fuzzy search) | Location, date-range, price, amenities filtering |
| Availability Engine | Custom — date-range overlap logic in Postgres, row-level locking to prevent double-booking | The hardest/most important part to get right |
| Payments | **Stripe Connect** (Express accounts) | Enables guest-pays → platform-takes-commission → host-gets-payout flow, the real Airbnb payment model |
| Image Uploads | `Cloudinary` or `Uploadthing` (free tiers) | Property photos, host verification docs |
| Maps | Mapbox or Google Maps (free tier) | Listing location display, map search view |
| Messaging | Simple in-app chat (Postgres-backed) or `Socket.io` for real-time guest↔host messaging | |
| AI Layer | **Groq API** (free tier) | Smart pricing suggestions, AI trip planner, review summarization (Section 6) |
| Notifications | Email (Resend/SendGrid free tier) for booking confirmations, reminders | |
| Hosting | Backend → Render/Railway, Frontend → Vercel, DB → Supabase/Neon (both support PostGIS) | |

---

## 3. User Roles

1. **Guest** — browses, searches, books stays, messages hosts, leaves reviews
2. **Host** — lists properties, manages calendar/pricing, accepts/declines bookings, messages guests, views payouts
3. **Admin** — approves new listings, manages disputes, views platform-wide analytics/revenue, manages commission rates, moderates reviews/users

---

## 4. Core Features (MVP Scope)

### 4.1 Guest-Facing
- Search homepage: location input, date range picker, guest count → results grid
- Filters: price range, property type, amenities, instant-book only, rating
- Map view + list view toggle
- Listing detail page: photo gallery, description, amenities, host profile, availability calendar, price breakdown, reviews
- Booking flow: select dates → price calculation (nights × rate + cleaning fee + service fee) → payment (Stripe) → confirmation
- Guest dashboard: upcoming/past trips, messages, saved/wishlist listings, leave a review after checkout
- In-app messaging with host (pre-booking questions + post-booking coordination)

### 4.2 Host-Facing
- Host onboarding: property listing wizard (photos, description, amenities, pricing, house rules)
- Availability calendar management (block dates, set custom pricing per date/season)
- Booking requests inbox: accept/decline (if not instant-book), view guest details
- Earnings dashboard: upcoming payouts, transaction history, Stripe Connect payout status
- Listing performance: views, booking rate, average rating
- Messaging with guests

### 4.3 Admin
- Listing approval queue (review new listings before they go live)
- User management (guests + hosts, suspend/ban capability)
- Platform-wide analytics: total bookings, GMV (gross merchandise value), commission revenue, active listings
- Dispute/refund management
- Commission rate configuration (e.g. 10% platform fee)
- Review moderation (flag/remove inappropriate reviews)

### 4.4 Reviews & Trust
- Two-way reviews (guest reviews host/property, host reviews guest) — released simultaneously after both submit or after a time window, like Airbnb's real system, to prevent retaliatory reviews
- Verified booking badge (only guests who actually booked can review)
- Host response to reviews

---

## 5. UI/UX Theme — "Bright Premium Light" (client-converting light UI)

**Direction:** The goal of this theme is conversion, not just aesthetics — light, airy, trustworthy, high-end travel-brand feel that makes a first-time visitor feel safe handing over payment details. Light UIs consistently outperform dark UIs for consumer booking/e-commerce products because they read as clean, transparent, and premium — exactly the trust signals a marketplace needs. Every design choice below is picked to *reduce friction and build trust*, not just look nice.

- **Base:** Pure, bright white `#FFFFFF` primary background, with a very light neutral gray `#F7F8FA` used for section separation (search bar area, footer) — creates gentle visual rhythm without ever feeling heavy or dark.
- **Primary accent (Vivid Coral-Pink gradient):** `#FF5A5F → #FF385C` — used for every primary CTA ("Reserve," "Book now," "Search"), wishlist heart icons, and price highlights. A gradient (not flat color) on buttons specifically — subtle diagonal gradient + soft glow shadow (`box-shadow: 0 8px 20px rgba(255,56,92,0.25)`) makes CTAs feel premium and clickable, proven to lift conversion vs. flat buttons.
- **Secondary accent (Ocean Blue):** `#0071C2`-adjacent tone, e.g. `#1A73E8` — used for links, secondary actions, host-dashboard highlights, map pins, trust badges ("Verified Host," "Superhost")** — blue reads as trustworthy/institutional, a deliberate pairing with the warmer coral for emotional-vs-rational balance.
- **Success/Trust green:** `#00A699` (Airbnb-adjacent teal-green) — used sparingly for "Instant Book," verified checkmarks, positive review scores — signals safety without shouting.
- **Text:** Near-black `#1A1A1A` for headings (not pure black — softer, more premium), medium gray `#717171` for secondary text/metadata (dates, reviews count) — this exact contrast pairing is what makes Airbnb-style listing cards scannable at a glance.
- **Cards:** Pure white with **very soft, large-radius shadows** (`0 6px 16px rgba(0,0,0,0.08)`), rounded corners (12–16px), subtle scale-up + shadow-deepen on hover (`transform: scale(1.02)`) — this hover "lift" is what makes a light UI feel alive and responsive instead of flat/static.
- **Typography:** `Poppins` or `Sora` (semi-bold, rounded, friendly) for headings and price display, `Inter` for body copy — large, confident type sizes for prices and CTAs specifically, since price clarity is a major trust/conversion factor in booking UX.
- **Photography-first design:** Large, full-bleed, high-quality property photos are the actual visual centerpiece of the entire product — every layout decision (card size, whitespace, grid gaps) should maximize photo prominence; UI chrome (borders, dividers, icons) stays minimal, thin-line, and gets out of the way.
- **Trust micro-details that directly drive bookings:** star ratings + review count always visible near price, "Verified Host"/ID-check badges, cancellation policy shown clearly before checkout, secure-payment icons (Stripe badge) near the Pay button — none of this is decorative, it's conversion infrastructure.
- **Admin Dashboard variant:** Keep it light too, but shift to a cooler, more "operational" light palette — white/`#F7F8FA` base with the Ocean Blue as primary accent instead of coral (coral reserved only for alerts/critical actions) — visually signals "control room" while staying consistent with the brand's light identity.
- **Motion:** Smooth image carousel transitions on listing cards (swipe/arrow), calendar date-range selection with a soft coral highlight sweep, animated price breakdown on the booking page (numbers count up), skeleton-shimmer loading states (light gray pulse, not dark) while search results load, gentle fade-in-up stagger animation as listing cards enter the viewport on scroll — this last one especially makes the search results page feel premium and alive rather than a static grid dump.

---

## 6. AI Layer (2026-relevant differentiator)

Airbnb clones are extremely common in portfolios — this is what separates yours from a tutorial copy.

1. **AI Trip Planner** — guest describes their trip in natural language ("relaxing weekend near the mountains, budget $150/night, need wifi for work") → AI parses intent and pre-fills/ranks search results matching that description, not just literal filters
2. **AI Smart Pricing Assistant (for hosts)** — analyzes similar listings' pricing, seasonality, and local demand signals → suggests optimal nightly pricing per date range, shown as a recommended-price overlay on the host's calendar
3. **AI Review Summarizer** — condenses dozens of reviews into a short, honest summary on the listing page ("Guests love the location and cleanliness; a few mentioned noise from the street at night") — genuinely useful, not just a gimmick
4. **AI Listing Description Generator (for hosts)** — host uploads photos + fills a short form → AI drafts a compelling listing description + suggests amenity tags automatically
5. **AI Host Response Assistant** — drafts polite, on-brand responses to guest messages/reviews for the host to approve/edit

---

## 7. Database Schema (PostgreSQL + PostGIS)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'guest', -- 'guest' | 'host' | 'admin'
  profile_photo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT, -- 'entire_place' | 'private_room' | 'shared_room'
  address TEXT,
  location GEOGRAPHY(Point, 4326), -- PostGIS lat/lng for geo search
  base_price_per_night NUMERIC NOT NULL,
  cleaning_fee NUMERIC DEFAULT 0,
  max_guests INT,
  bedrooms INT,
  beds INT,
  bathrooms INT,
  amenities TEXT[], -- ['wifi', 'kitchen', 'parking', 'pool', ...]
  instant_book BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'suspended'
  ai_generated_description BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_blocked BOOLEAN DEFAULT false,      -- host manually blocked
  custom_price NUMERIC,                   -- overrides base price for this date
  ai_suggested_price NUMERIC,
  UNIQUE(listing_id, date)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES users(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT,
  total_price NUMERIC NOT NULL,
  platform_commission NUMERIC NOT NULL,
  host_payout NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled' | 'completed'
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- prevents double booking at the DB level
  CONSTRAINT no_overlapping_bookings
    EXCLUDE USING gist (
      listing_id WITH =,
      daterange(check_in, check_out) WITH &&
    ) WHERE (status IN ('pending', 'confirmed'))
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  reviewee_type TEXT, -- 'listing' | 'guest'
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  ai_summary_included BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  content TEXT,
  ai_drafted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ
);
```

**Critical design note for Claude Code:** the `no_overlapping_bookings` EXCLUDE constraint using `daterange` + PostGIS-style GIST indexing is what prevents double-booking at the database level — this is the single most important correctness guarantee in the whole platform and should be tested explicitly with concurrent booking attempts.

---

## 8. API Design (Core Endpoints)

```
# Auth
POST   /api/auth/signup
POST   /api/auth/login

# Listings (public)
GET    /api/listings/search           → ?location=&checkIn=&checkOut=&guests=&priceMin=&priceMax=&amenities=
GET    /api/listings/:id
GET    /api/listings/:id/availability → calendar data for date range

# Listings (host)
POST   /api/host/listings             → create new listing
PUT    /api/host/listings/:id
POST   /api/host/listings/:id/photos
PUT    /api/host/listings/:id/availability   → block dates / set custom pricing
GET    /api/host/listings/:id/ai-price-suggestion

# Bookings
POST   /api/bookings                  → create booking (checks availability, creates Stripe PaymentIntent)
POST   /api/bookings/:id/confirm      → Stripe webhook confirms payment → booking status = confirmed
GET    /api/guest/bookings
GET    /api/host/bookings
POST   /api/bookings/:id/cancel

# Reviews
POST   /api/bookings/:id/review
GET    /api/listings/:id/reviews
GET    /api/listings/:id/ai-review-summary

# Messaging
GET    /api/messages/:bookingId
POST   /api/messages/:bookingId
POST   /api/messages/:bookingId/ai-draft-response

# Payments (Stripe Connect)
POST   /api/host/stripe/onboard       → creates Stripe Express account for host
GET    /api/host/payouts

# Admin
GET    /api/admin/listings/pending
PUT    /api/admin/listings/:id/approve
GET    /api/admin/analytics
GET    /api/admin/users
PUT    /api/admin/users/:id/suspend
PUT    /api/admin/settings/commission-rate
```

---

## 9. Booking & Payment Flow (Important Logic)

1. Guest selects check-in/check-out dates on a listing → frontend calls `/api/listings/:id/availability` to confirm no conflicts and calculate total price
2. Guest confirms booking → backend creates a `bookings` row with status `pending`, calculates `platform_commission` (e.g. 10%) and `host_payout` (90%)
3. Backend creates a **Stripe PaymentIntent** for the full guest-facing total, using **Stripe Connect** so funds route through the platform account
4. On successful payment (Stripe webhook) → booking status → `confirmed`, availability dates marked blocked, confirmation emails sent to guest + host
5. After checkout date passes → booking status → `completed`, triggers review-eligibility for both guest and host
6. Host payout is transferred via Stripe Connect transfer (minus commission) — either immediately on booking confirmation or on a payout schedule (configurable, matches real Airbnb-style "payout 24h after check-in" patterns)
7. Cancellations follow a configurable policy (e.g. full refund if >7 days before check-in, partial after) — store policy per listing, enforce refund calculation server-side

---

## 10. Suggested Folder Structure

```
nestly/
├── app/                              # Next.js app (guest + host + admin route groups)
│   ├── (guest)/
│   │   ├── search/
│   │   ├── listing/[id]/
│   │   ├── trips/
│   │   └── messages/
│   ├── (host)/
│   │   ├── host/dashboard/
│   │   ├── host/listings/
│   │   ├── host/calendar/
│   │   └── host/earnings/
│   ├── (admin)/
│   │   ├── admin/listings/
│   │   ├── admin/users/
│   │   └── admin/analytics/
│   └── api/                          # or separate backend, see below
│
├── components/
│   ├── ui/                           # ListingCard, DateRangePicker, PriceBreakdown, etc.
│   ├── search/
│   ├── booking/
│   └── dashboard/
│
├── backend/                          # if separate Express service
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── availability.ts       # overlap-checking logic
│   │   │   ├── pricing.ts
│   │   │   ├── payments.ts           # Stripe Connect
│   │   │   ├── ai.ts                 # Groq: trip planner, pricing, summaries
│   │   │   └── search.ts             # geo + filter queries
│   │   ├── db/
│   │   │   └── schema.sql
│   │   └── index.ts
│   └── package.json
│
├── theme/
│   ├── colors.ts                     # coral/teal tokens + admin variant
│   └── typography.ts
│
└── README.md
```

---

## 11. Build Order (Recommended for Claude Code)

**Stage 1 — Foundation**
1. Scaffold Next.js app + backend, set up Postgres with PostGIS extension
2. Build `users` auth with role-based access (guest/host/admin)

**Stage 2 — Listings**
3. Build host listing creation flow (form + photo upload)
4. Build listing detail page (public view)
5. Build search + filters (start with basic filters, add geo-search once PostGIS is wired)

**Stage 3 — Availability & Booking (the hard part — get this right first)**
6. Build the `availability` table + calendar UI (host side: block dates, set pricing)
7. Build the booking flow with the `no_overlapping_bookings` DB constraint — **write concurrent-booking tests here** to prove double-booking is actually prevented
8. Integrate Stripe Connect: host onboarding + guest payment + commission split

**Stage 4 — Guest & Host Dashboards**
9. Guest dashboard: trips, wishlist, messages
10. Host dashboard: bookings inbox, earnings, listing performance

**Stage 5 — Reviews & Messaging**
11. Two-way review system with release logic
12. In-app messaging (simple polling or Socket.io for real-time)

**Stage 6 — Admin**
13. Listing approval queue, user management, analytics dashboard, commission settings

**Stage 7 — AI Layer (the differentiator — do this once core flow works)**
14. AI Trip Planner (natural language → search params)
15. AI Smart Pricing suggestions on host calendar
16. AI Review Summarizer on listing pages
17. AI Listing Description Generator + AI Message Draft Assistant

**Stage 8 — Polish**
18. Map view integration, responsive polish, loading states, empty states, email notifications

---

## 12. Portfolio Presentation Notes
- README should open with **"Idea & Concept by Swayam Parikh"**, and frame this clearly as "an Airbnb-style marketplace built to demonstrate complex multi-role systems, real-time availability logic, and payment splitting — with an AI layer most clone tutorials skip."
- Explicitly call out the double-booking-prevention constraint and Stripe Connect payment-split logic in your write-up — these are the two things that separate a genuine engineering demo from a UI-only clone, and technical reviewers will specifically look for exactly this kind of correctness handling.
- Strong demo flow: search a location → view listing with AI review summary → book with real payment flow (Stripe test mode) → switch to host view, see the booking + AI price suggestion → switch to admin view, see platform analytics. Showing all three roles in one flow is what makes this look like a "real platform," not a portfolio toy.
- Deploy a live demo with seeded sample listings (don't make reviewers create their own data to see it work) — this is the single biggest thing that makes booking-platform portfolio projects land well.

---

*End of spec — ready to hand to Claude Code.*
