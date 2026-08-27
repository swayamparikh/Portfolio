import { ContentPage } from "@/components/layout/ContentPage";

export const metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <ContentPage title="How Nestly works">
      <h2>For guests</h2>
      <p>
        Search by location and dates, filter by price, amenities, and Instant Book, then
        reserve a stay. Pricing is calculated as nightly rate × nights, plus a cleaning
        fee and service fee — shown in full before you pay.
      </p>
      <h2>For hosts</h2>
      <p>
        List a property, set a base nightly price (or accept an AI-suggested price per
        date), and manage availability from a calendar. Bookings can be Instant Book or
        require your approval.
      </p>
      <h2>Payments</h2>
      <p>
        Guest payments route through Stripe Connect. The platform takes a commission
        (configurable by admins) and transfers the remainder to the host.
      </p>
    </ContentPage>
  );
}
