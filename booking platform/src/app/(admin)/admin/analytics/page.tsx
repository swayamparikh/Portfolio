import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPlatformAnalytics } from "@/lib/services/analytics";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/");

  const analytics = await getPlatformAnalytics();

  const stats = [
    { label: "Gross merchandise value", value: formatPrice(analytics.gmv) },
    { label: "Commission revenue", value: formatPrice(analytics.commissionRevenue) },
    { label: "Active listings", value: analytics.activeListings },
    { label: "Total bookings", value: analytics.totalBookings },
    { label: "Pending listing approvals", value: analytics.pendingListings },
    { label: "Registered users", value: analytics.userCount },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Platform analytics</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-text-heading">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
