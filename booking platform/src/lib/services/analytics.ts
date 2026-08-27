import { prisma } from "@/lib/prisma";

export async function getPlatformAnalytics() {
  const revenueStates = ["confirmed", "completed"] as const;

  const [gmv, activeListings, totalBookings, pendingListings, userCount] = await Promise.all([
    prisma.booking.aggregate({
      where: { status: { in: [...revenueStates] } },
      _sum: { totalPrice: true, platformCommission: true },
    }),
    prisma.listing.count({ where: { status: "approved" } }),
    prisma.booking.count({ where: { status: { in: [...revenueStates] } } }),
    prisma.listing.count({ where: { status: "pending" } }),
    prisma.user.count(),
  ]);

  return {
    gmv: Number(gmv._sum.totalPrice ?? 0),
    commissionRevenue: Number(gmv._sum.platformCommission ?? 0),
    activeListings,
    totalBookings,
    pendingListings,
    userCount,
  };
}
