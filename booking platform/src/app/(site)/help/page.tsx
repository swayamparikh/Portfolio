import Link from "next/link";
import { ContentPage } from "@/components/layout/ContentPage";

export const metadata = { title: "Help center" };

const faqs = [
  {
    q: "How do I cancel a booking?",
    a: "Go to Your trips, find the booking, and select Cancel. Refund amount depends on how close it is to check-in — see our cancellation policy.",
  },
  {
    q: "When does my host get paid?",
    a: "Payouts route through Stripe Connect once a booking is confirmed, minus the platform commission.",
  },
  {
    q: "Can I message a host before booking?",
    a: "Yes — open a listing and use the messaging thread to ask questions before you reserve.",
  },
];

export default function HelpPage() {
  return (
    <ContentPage title="Help center">
      <div className="not-prose space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <h2 className="font-heading font-semibold text-text-heading">{f.q}</h2>
            <p className="mt-1 text-sm text-text-body">{f.a}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm">
        Read the full{" "}
        <Link href="/help/cancellation" className="font-medium text-ocean">
          cancellation policy
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-medium text-ocean">
          contact us
        </Link>
        .
      </p>
    </ContentPage>
  );
}
