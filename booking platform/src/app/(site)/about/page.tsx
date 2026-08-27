import { ContentPage } from "@/components/layout/ContentPage";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <ContentPage
      title="About Nestly"
      subtitle="Idea & concept by Swayam Parikh."
    >
      <p>
        Nestly is an Airbnb-style stay marketplace built to demonstrate a genuinely
        complex, multi-role, stateful system — not just another CRUD app. Guests search
        and book real-time-available stays, hosts manage listings and pricing, and admins
        run the platform as a business.
      </p>
      <h2>What makes it different</h2>
      <p>
        A database-level exclusion constraint prevents double-booking under concurrent
        requests, Stripe Connect splits every payment between guest, platform, and host,
        and an AI layer (trip planning, smart pricing, review summarization) sits on top
        of the core marketplace — the kind of thing most clone tutorials skip.
      </p>
      <h2>Tech stack</h2>
      <p>
        Next.js (App Router) + TypeScript, PostgreSQL with PostGIS for geo-search,
        Prisma, NextAuth, Stripe Connect, and Groq for the AI layer.
      </p>
    </ContentPage>
  );
}
