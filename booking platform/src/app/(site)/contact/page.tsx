import { ContentPage } from "@/components/layout/ContentPage";

export const metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <ContentPage title="Contact us">
      <p>
        For support, reach us at{" "}
        <a href="mailto:support@nestly.example.com" className="font-medium text-ocean">
          support@nestly.example.com
        </a>
        . For anything booking-specific, the in-app messaging thread on your trip is the
        fastest way to reach your host directly.
      </p>
    </ContentPage>
  );
}
