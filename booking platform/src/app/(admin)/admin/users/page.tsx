import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Users" };

async function toggleSuspend(id: string, suspended: boolean) {
  "use server";
  const session = await auth();
  if (session?.user.role !== "admin") return;
  await prisma.user.update({ where: { id }, data: { suspended } });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Users</h1>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-white text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-text-heading">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-text-body">{u.email}</td>
                <td className="px-4 py-3 capitalize text-text-body">{u.role}</td>
                <td className="px-4 py-3">
                  <Badge tone={u.suspended ? "coral" : "trust"}>
                    {u.suspended ? "Suspended" : "Active"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.role !== "admin" && (
                    <form action={toggleSuspend.bind(null, u.id, !u.suspended)}>
                      <Button size="sm" variant={u.suspended ? "secondary" : "outline"} type="submit">
                        {u.suspended ? "Reinstate" : "Suspend"}
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
