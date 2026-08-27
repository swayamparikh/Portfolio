import { ContentPage } from "@/components/layout/ContentPage";

export const metadata = { title: "Trust & safety" };

export default function TrustAndSafetyPage() {
  return (
    <ContentPage title="Trust & safety">
      <h2>Verified hosts</h2>
      <p>
        Hosts complete an identity verification step and every new listing goes through
        an admin approval queue before it appears in search.
      </p>
      <h2>Two-way reviews</h2>
      <p>
        Guests and hosts both review each other after a completed stay. Reviews are only
        released once both sides have submitted (or after a time window), which prevents
        retaliatory reviews. Only guests with a verified booking can leave one.
      </p>
      <h2>No double-booking, guaranteed</h2>
      <p>
        Bookings are protected by a database-level exclusion constraint — two guests can
        never be confirmed for the same listing on overlapping dates, even under
        concurrent requests.
      </p>
    </ContentPage>
  );
}
