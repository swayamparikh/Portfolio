# NexPense AI — Smart Expense Tracker
### Product & Engineering Spec (for Claude Code build)

> Hand this entire file to Claude Code as the build brief. It contains the app concept, tech stack, architecture, screen-by-screen UI spec, data models, AI integration plan, and Expo/EAS build instructions.

---

## 1. App Overview

**App Name:** NexPense AI
**Tagline:** *"Your money, decoded."*
**Category:** Personal Finance / Expense Tracker
**Platform:** Android (via Expo, built as APK using EAS Build)
**Purpose:** A portfolio-grade mobile app that lets users log expenses/income, get AI-generated financial insights, spending predictions, and budget suggestions — all wrapped in a dark, futuristic, neon-glass UI.

**Why it stands out for a portfolio:**
- Combines mobile dev (React Native/Expo) + AI integration (LLM API) + clean product thinking + strong visual design.
- Demonstrates local storage/state management, charting, API integration, and polished UX — the full stack of a real shippable app.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React Native + Expo (SDK 51+) | Managed workflow |
| Language | TypeScript | Strict mode |
| Navigation | `expo-router` (file-based routing) | Tabs + stack |
| State Management | Zustand | Lightweight, no boilerplate |
| Local Storage | `expo-sqlite` (or `AsyncStorage` for MVP simplicity) | All expense data stored locally, offline-first |
| Charts | `react-native-gifted-charts` or `victory-native` | Animated, dark-theme friendly |
| Styling | `nativewind` (Tailwind for RN) or StyleSheet + custom theme tokens | Must support glassmorphism/neon glow |
| Icons | `lucide-react-native` or `@expo/vector-icons` | Thin-line futuristic icons |
| Animations | `react-native-reanimated` + `moti` | Smooth transitions, glow pulses |
| AI Integration | Free-tier LLM API (see Section 6) | Called via `fetch`, key stored in `.env` via `expo-constants` |
| Fonts | `Space Grotesk` (headings) + `Inter` (body) via `expo-font` / `@expo-google-fonts` | Futuristic, clean |
| Build | Expo Application Services (EAS Build) | Output: installable `.apk` |
| Notifications (optional) | `expo-notifications` | Daily reminder to log expenses |

---

## 3. Core Features (MVP Scope)

1. **Onboarding** — 3 quick swipeable intro screens explaining the app, then a "Get Started" screen (name + currency + monthly budget setup, no auth needed — local-only app).
2. **Dashboard (Home)** — Total balance, monthly spend vs budget ring, quick "Add Expense" FAB, AI insight card of the day, recent transactions list.
3. **Add/Edit Transaction** — Amount, category (icon grid), note, date, type (expense/income), optional receipt photo (`expo-image-picker`).
4. **Transactions List** — Filterable/searchable list grouped by date, swipe-to-delete.
5. **Analytics Screen** — Pie chart (spend by category), bar chart (last 7 days / monthly trend), category breakdown list with percentages.
6. **AI Insights Screen** — On-demand button "Analyze My Spending" → sends recent transaction summary to LLM API → returns: spending pattern summary, 3 actionable saving tips, anomaly detection (e.g. "You spent 40% more on Food this week"), and a friendly financial "mood" score.
7. **AI Chat Assistant (bonus)** — Simple chat UI where the user can ask natural-language questions like "How much did I spend on food this month?" and the app answers using local data + LLM formatting.
8. **Budget Goals** — Set per-category monthly budget limits, progress bars, over-budget alerts (neon red glow).
9. **Settings** — Currency, theme accent color picker, export data (CSV/JSON), clear all data, about/portfolio credit screen.

**Stretch goals (mention as future work, not required for MVP):**
- Recurring transactions
- Multi-account support
- Cloud sync (Supabase/Firebase)
- Widget support

---

## 4. UI/UX Design Direction — "Dark Futuristic"

### 4.1 Visual Identity
- **Theme:** Deep space dark mode with neon glass accents — think cyberpunk fintech HUD, not flat Material dark mode.
- **Base background:** `#05060A` to `#0B0D14` (near-black, slight blue tint), often layered with a subtle radial gradient glow behind key elements.
- **Surface cards:** Semi-transparent glassmorphism — `rgba(255,255,255,0.04)` background, `backdrop-filter`-style blur (use `expo-blur`'s `BlurView`), 1px border in `rgba(255,255,255,0.08)`, soft outer glow on active/important cards.
- **Accent colors (neon):**
  - Primary: Electric violet `#8B5CF6` → Cyan `#22D3EE` gradient (used for primary buttons, active states, balance ring)
  - Success/Income: Neon green `#39FF88`
  - Danger/Overspend: Neon red/pink `#FF3B6B`
  - Warning: Amber `#FFB020`
- **Typography:**
  - Headings: `Space Grotesk` (Bold/SemiBold) — slightly wide letter spacing for a "console/HUD" feel
  - Body/numbers: `Inter` — numbers use tabular figures for alignment
  - Large balance figures should have a subtle gradient text or glow effect
- **Iconography:** Thin 1.5px stroke line icons, glowing on active state, floating in soft rounded-square glass containers.
- **Motion:**
  - Cards fade+slide in on screen load (staggered)
  - FAB pulses subtly with glow
  - Category budget rings animate fill on load
  - Micro-haptics (`expo-haptics`) on button taps and success actions
- **Shape language:** Large rounded corners (20–28px radius), soft shadows/glows instead of hard borders, plenty of negative space — not cluttered.
- **Charts:** Dark canvas, neon gradient fills, glowing data points, animated draw-in.

### 4.2 Reference mood
Imagine: Robinhood's dark mode × a sci-fi HUD × Linear.app's polish. Minimal chrome, big glowing numbers, glassmorphic cards floating on a near-black canvas with faint grid/particle texture in the background (very subtle, low opacity, non-distracting).

### 4.3 Navigation Structure
Bottom tab bar (floating glass pill, not full-width bar):
- Home | Analytics | **[+ Add — center FAB]** | AI Insights | Settings

---

## 5. Screen-by-Screen Spec

### 5.1 Onboarding (3 slides + setup)
- Slide 1: App logo animation + "Track smarter, not harder."
- Slide 2: "AI that understands your money" — illustration of chat bubble/brain icon
- Slide 3: "100% offline & private" — lock/shield icon
- Setup screen: Name input, currency picker (dropdown, default INR/USD based on locale), monthly budget input → "Enter NexPense" button with glow animation

### 5.2 Home / Dashboard
- Top: Greeting ("Good evening, {name}") + settings icon
- Hero card: Circular progress ring showing **Total Spent / Monthly Budget**, glowing gradient stroke, center shows remaining balance in large gradient text
- Row of 2 small stat cards: "Income this month" (green) / "Expenses this month" (red)
- AI Insight teaser card: glassmorphic card with sparkle icon, one-line AI tip, "View more →"
- "Recent Transactions" list (last 5) with category icon, name, amount (colored red/green), date
- Floating center FAB: large glowing "+" button, opens Add Transaction modal (bottom sheet)

### 5.3 Add/Edit Transaction (Bottom Sheet Modal)
- Toggle: Expense / Income (pill switch, glows respective color)
- Large amount input, currency symbol prefixed, big glowing digits
- Category grid (icon + label, selected state = glow border)
- Note input (optional)
- Date picker (defaults to today)
- Optional: attach photo receipt
- "Save Transaction" button (gradient, full width, haptic feedback + success animation on save)

### 5.4 Transactions List
- Search bar (glass input) + filter chip row (All / Income / Expense / Category)
- Grouped by date ("Today", "Yesterday", "Jul 15", etc.)
- Swipe left to reveal delete (neon red)
- Tap to edit

### 5.5 Analytics
- Segmented control: Weekly / Monthly / Yearly
- Donut/pie chart — spend by category, neon gradient slices, tap slice to highlight
- Horizontal bar chart — spending trend over time
- List below: category name, icon, amount, % of total, mini progress bar

### 5.6 AI Insights
- Header: "AI Financial Analyst" with animated sparkle/orb icon
- Big CTA button: "Analyze My Spending" (loading state = pulsing glow while API call runs)
- Result cards (appear after analysis):
  - **Summary card** — plain-language overview of spending behavior
  - **3 Tip cards** — actionable saving suggestions, swipeable carousel
  - **Anomaly card** (if applicable) — highlighted in amber/red, e.g. "Unusual spike in Shopping category"
  - **Financial Mood Score** — a 0-100 gauge with a friendly label (e.g. "On Track 🟢", "Overspending ⚠️")
- (Bonus) Chat input at bottom: "Ask NexPense AI anything..." → opens chat screen

### 5.7 AI Chat (bonus)
- Simple chat bubble UI, user bubbles glass-white, AI bubbles gradient-bordered
- Suggested prompt chips at top: "How much did I spend on food?", "Am I saving enough?", "Compare this month vs last"

### 5.8 Budget Goals
- List of categories with editable monthly limit
- Progress bar per category (green → amber → red as it fills/overflows)
- "Add Budget Goal" button

### 5.9 Settings
- Profile name edit
- Currency selector
- Accent color picker (violet/cyan default, offer 2–3 alt neon themes: pink/orange, green/blue)
- Export data (CSV/JSON via `expo-file-system` + `expo-sharing`)
- Clear all data (confirmation modal)
- About section — "Built by [Your Name] · Portfolio Project" + GitHub/LinkedIn link
- App version

---

## 6. AI Integration Plan

**Goal:** Use a **free-tier LLM API key** for all AI features. Recommended: Google **Gemini API (free tier)** or Groq (free, very fast, generous limits) — Claude Code should scaffold this to be provider-agnostic via a single `services/ai.ts` file so the key/provider can be swapped easily.

### Implementation notes for Claude Code:
- Store API key in `.env` as `EXPO_PUBLIC_AI_API_KEY` (never hardcode). Note: since this is client-side/Expo, the key is technically exposed in the built APK — acceptable for a portfolio/demo project, but add a comment flagging this as a known limitation with a suggestion to proxy through a backend for production.
- Create `services/ai.ts` with functions:
  - `getSpendingInsights(transactions: Transaction[], budget: number): Promise<AIInsightResponse>`
  - `askFinanceQuestion(question: string, transactions: Transaction[]): Promise<string>`
- Build a compact JSON summary of the user's transactions (aggregated by category/date, NOT the full raw list if it's large) before sending to the API, to keep prompts small and free-tier-friendly.
- Prompt engineering: instruct the model to always respond in strict JSON (for insights) so the UI can render structured cards, e.g.:
```json
{
  "summary": "string",
  "tips": ["string", "string", "string"],
  "anomaly": "string or null",
  "moodScore": 0-100,
  "moodLabel": "string"
}
```
- Handle API errors gracefully with a friendly fallback message and retry button.
- Add a loading skeleton/shimmer (glass shimmer effect) while waiting on AI responses.
- Cache the last AI insight locally so it's instantly available on next app open (with a "Refresh Analysis" button).

---

## 7. Data Models (TypeScript)

```typescript
type TransactionType = 'expense' | 'income';

interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string; // e.g. 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'
  note?: string;
  date: string; // ISO string
  receiptUri?: string;
  createdAt: string;
}

interface BudgetGoal {
  category: string;
  monthlyLimit: number;
}

interface UserProfile {
  name: string;
  currency: string; // e.g. 'USD', 'INR'
  monthlyBudget: number;
  accentTheme: 'violetCyan' | 'pinkOrange' | 'greenBlue';
  onboarded: boolean;
}

interface AIInsightResponse {
  summary: string;
  tips: string[];
  anomaly: string | null;
  moodScore: number;
  moodLabel: string;
  generatedAt: string;
}
```

---

## 8. Suggested Folder Structure

```
nexpense-ai/
├── app/                        # expo-router screens
│   ├── (onboarding)/
│   ├── (tabs)/
│   │   ├── index.tsx           # Home
│   │   ├── analytics.tsx
│   │   ├── ai-insights.tsx
│   │   └── settings.tsx
│   ├── add-transaction.tsx     # modal
│   ├── transactions.tsx
│   ├── chat.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                     # GlassCard, GradientButton, GlowRing, etc.
│   ├── charts/
│   └── transactions/
├── services/
│   ├── ai.ts
│   └── storage.ts              # SQLite/AsyncStorage helpers
├── store/
│   └── useStore.ts             # Zustand store
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   └── ThemeProvider.tsx
├── types/
│   └── index.ts
├── assets/
│   ├── fonts/
│   └── icons/
├── .env
├── app.json
├── eas.json
└── package.json
```

---

## 9. Build & Deployment (Expo EAS → APK)

Instructions for Claude Code to include/automate:

1. Initialize project: `npx create-expo-app nexpense-ai -t expo-template-blank-typescript`
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure: `eas build:configure`
5. In `eas.json`, add a `preview` profile that outputs an APK:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```
6. Set `app.json` — app name: `NexPense AI`, slug: `nexpense-ai`, icon, splash screen (dark background matching theme, glowing logo), android package: `com.yourname.nexpenseai`
7. Build: `eas build -p android --profile preview`
8. Download resulting `.apk` from the Expo dashboard link once build completes.
9. Add AI API key as an EAS secret rather than committing `.env`: `eas secret:create --scope project --name EXPO_PUBLIC_AI_API_KEY --value <your_key>`

---

## 10. Build Order (Recommended for Claude Code)

1. Scaffold project + install dependencies + set up folder structure
2. Build theme system (colors, typography, GlassCard/GradientButton primitives) first — everything else depends on this
3. Build local storage layer (Zustand + AsyncStorage/SQLite) + data models
4. Build onboarding flow
5. Build Home dashboard (with mock data first)
6. Build Add/Edit Transaction flow
7. Build Transactions list
8. Build Analytics screen with charts
9. Integrate AI service + build AI Insights screen
10. Build Budget Goals + Settings
11. Polish: animations, haptics, empty states, error states
12. Configure EAS + produce APK build

---

## 11. Portfolio Presentation Notes
- Add a clean `README.md` with screenshots, tech stack badges, and a "Why I built this" section.
- Include a short GIF/video demo link.
- Mention the AI integration prominently — it's the differentiator vs. generic expense trackers.
- Consider deploying a simple landing page (or just a polished README) showcasing the dark futuristic UI screenshots.

---

*End of spec — ready to hand to Claude Code.*
