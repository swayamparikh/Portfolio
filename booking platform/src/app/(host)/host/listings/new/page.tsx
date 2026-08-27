import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListingForm } from "@/components/host/ListingForm";

export const metadata = { title: "Create a listing" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/listings/new");
  if (session.user.role === "guest") redirect("/become-a-host");

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-text-heading">List your space</h1>
      <p className="mt-1 text-sm text-text-muted">
        New listings go live after a quick admin review (Section 4.3 of the spec).
      </p>
      <ListingForm />
    </div>
  );
}
