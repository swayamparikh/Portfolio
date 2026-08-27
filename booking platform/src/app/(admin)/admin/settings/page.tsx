import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCommissionRate } from "@/lib/services/pricing";
import { CommissionRateForm } from "@/components/admin/CommissionRateForm";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/");

  const commissionRate = await getCommissionRate();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Platform settings</h1>
      <CommissionRateForm initialRate={commissionRate} />
    </div>
  );
}
