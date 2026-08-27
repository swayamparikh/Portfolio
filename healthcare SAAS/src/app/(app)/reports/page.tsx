import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { insuranceReports, patients } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await requireUser();

  const rows = await db
    .select({
      id: insuranceReports.id,
      patientId: insuranceReports.patientId,
      caseReference: patients.caseReference,
      diagnosisSummary: patients.diagnosisSummary,
      insurer: patients.insurer,
      sessionsUsed: insuranceReports.sessionsUsed,
      sessionsAuthorized: insuranceReports.sessionsAuthorized,
      submittedAt: insuranceReports.submittedAt,
      createdAt: insuranceReports.createdAt,
      edited: sql<boolean>`${insuranceReports.finalReport} is not null`,
    })
    .from(insuranceReports)
    .innerJoin(patients, eq(patients.id, insuranceReports.patientId))
    .where(eq(patients.clinicId, user.clinicId))
    .orderBy(desc(insuranceReports.createdAt));

  const pending = rows.filter((r) => !r.submittedAt);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Reveal>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insurance reports</h1>
          <p className="mt-1.5 text-muted">
            Every re-authorization draft across the clinic. Nothing here has been transmitted
            anywhere — submission is your click, in your payer portal.
          </p>
        </div>
      </Reveal>

      {pending.length > 0 && (
        <Reveal delay={60}>
          <div className="glass border-fuchsia-400/25 p-5">
            <span className="chip text-fuchsia-300">
              {pending.length} report{pending.length === 1 ? "" : "s"} awaiting submission
            </span>
          </div>
        </Reveal>
      )}

      <Reveal delay={100}>
        {rows.length === 0 ? (
          <div className="glass p-12 text-center text-muted">
            No reports drafted yet. Open a patient nearing their session cap and draft one
            from their accumulated outcome data.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/patients/${r.patientId}#report`}
                className="glass glass-hover flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-cyan-300">
                      {r.caseReference}
                    </span>
                    <span
                      className={`chip text-[10px] ${
                        r.submittedAt ? "text-emerald-300" : "text-fuchsia-300"
                      }`}
                    >
                      {r.submittedAt ? "Submitted" : r.edited ? "Reviewed" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">{r.diagnosisSummary}</p>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted">
                  <span>{r.insurer ?? "No insurer set"}</span>
                  <span>
                    {r.sessionsUsed}/{r.sessionsAuthorized} sessions
                  </span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
