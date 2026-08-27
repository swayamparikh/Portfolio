import { ContentPage } from "@/components/layout/ContentPage";

export const metadata = { title: "Cancellation policy" };

export default function CancellationPolicyPage() {
  return (
    <ContentPage title="Cancellation policy">
      <p>
        Cancel more than 7 days before check-in and receive a full refund. Cancel within
        7 days of check-in and receive a 50% refund of the total price. Cleaning and
        service fees follow the same schedule.
      </p>
      <p>
        Refunds are calculated server-side at the moment you cancel, based on the exact
        number of days remaining until check-in.
      </p>
    </ContentPage>
  );
}
