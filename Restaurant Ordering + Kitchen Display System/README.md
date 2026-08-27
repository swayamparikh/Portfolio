# Kaveri Kitchen — Order & Kitchen Display System

**Idea & Concept by Swayam Parikh**

*"From table to tawa, tracked live."*

A real-time, multi-role restaurant operations system — built to prove I can handle live,
synchronized, multi-user systems, not just static websites. Four roles (Customer, Waiter,
Kitchen, Cashier/Admin) all interact with the *same live order* simultaneously, with every
status change broadcast instantly across every connected screen via Socket.io.

Full product spec: [Kaveri-Kitchen-Spec.md](Kaveri-Kitchen-Spec.md)

## Architecture

- **`web/`** — Next.js (App Router, TypeScript, Tailwind v4) serving all four role-based
  frontends: customer ordering (`/table/[qrToken]`), Kitchen Display (`/kitchen`), Waiter
  dashboard (`/waiter`), Cashier/Admin (`/admin`).
- **`backend/`** — Node.js + Express + Socket.io REST/WebSocket server, plain ESM JavaScript.
- **`tools/`** — a self-contained, portable MySQL 9.7 server (zip distribution, not a system
  install) so the whole stack runs locally with zero global dependencies.

Real-time order state machine:
```
PLACED → CONFIRMED → PREPARING → READY → SERVED → BILLED → CLOSED
```
Every transition emits a Socket.io event consumed by the customer's tracking screen, the
Kitchen Display, the Waiter dashboard, and the Admin table map simultaneously.

## Running it locally

### 1. Start MySQL (portable, project-local — no system install)

```bash
cd tools
./mysql-9.7.1-winx64/bin/mysqld.exe --datadir="$(pwd)/data" --basedir="$(pwd)/mysql-9.7.1-winx64" --port=3306 --bind-address=127.0.0.1
```

Root password is `kaveri_dev_pw` (set on first setup). Database: `kaveri_kitchen`.

### 2. Backend

```bash
cd backend
npm install
npm run init-db   # applies schema.sql (safe to re-run)
npm run seed       # seeds Kaveri Kitchen menu, 10 tables, staff PINs (safe to re-run)
npm run dev        # http://localhost:4000
```

### 3. Frontend

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

Open `http://localhost:3000` for the demo hub linking to all four screens.

## Demo staff PINs

| Role    | PIN(s)     |
|---------|------------|
| Waiter  | 1111, 1112 |
| Kitchen | 2222, 2223 |
| Cashier | 3333       |
| Admin   | 9999       |

Customer ordering needs no login — scan a table's QR code (generate/view them from
**Admin → Tables & QR**) or open `/table/<qr_code_token>` directly.

## What to show off in a demo recording

Record multiple screens side by side — customer phone, kitchen tablet, waiter tablet — and
place an order that flows through all of them live:

1. Customer places an order on `/table/<token>`.
2. It appears **instantly** on the Kitchen Display (`/kitchen`), color-coded by urgency.
3. Kitchen staff advances the order (Confirm → Start Preparing → Mark Ready).
4. The customer's tracking screen and the Waiter's table grid update **simultaneously**,
   with no refresh.
5. Waiter marks it served → Admin/Cashier generates the bill and takes payment
   (`/admin` → Billing), table flips back to empty in real time everywhere.

This synchronized multi-screen moment is the technical core of the project — the same
kind of live, multi-user architecture real restaurants (and real interviewers) care about.

## Tech stack

Next.js · TypeScript · Tailwind CSS v4 · Socket.io · Node.js/Express · MySQL · JWT (staff
PIN auth) · `qrcode` (table QR generation)
