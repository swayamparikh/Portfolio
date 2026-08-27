import Link from "next/link";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { patients, visits, insuranceReports } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();

  const roster = await db
    .select({
      id: patients.id,
      caseReference: patients.caseReference,
      diagnosisSummary: patients.diagnosisSummary,
      sessionsAuthorized: patients.sessionsAuthorized,
      insurer: patients.insurer,
      visitCount: sql<number>`(select count(*) from visits where visits.patient_id = ${patients.id})`,
      lastVisit: sql<string | null>`(select max(visit_date) from visits where visits.patient_id = ${patients.id})`,
      lastPain: sql<
        number | null
      >`(select pain_score from visits where visits.patient_id = ${patients.id} order by visit_date desc limit 1)`,
    })
    .from(patients)
    .where(and(eq(patients.clinicId, user.clinicId), eq(patients.active, true)))
    .orderBy(desc(patients.createdAt));

  const [{ value: totalVisits }] = await db
    .select({ value: count() })
    .from(visits)
    .innerJoin(patients, eq(patients.id, visits.patientId))
    .where(eq(patients.clinicId, user.clinicId));

  const [{ value: unreviewed }] = await db
    .select({ value: count() })
    .from(visits)
    .innerJoin(patients, eq(patients.id, visits.patientId))
    .where(and(eq(patients.clinicId, user.clinicId), eq(visits.reviewed, false)));

  const [{ value: pendingReports }] = await db
    .select({ value: count() })
    .from(insuranceReports)
    .innerJoin(patients, eq(patients.id, insuranceReports.patientId))
    .where(and(eq(patients.clinicId, user.clinicId), sql`${insuranceReports.submittedAt} is null`));

  const needsReauth = roster.filter(
    (p) => Number(p.visitCount) >= p.sessionsAuthorized - 2 && Number(p.visitCount) > 0,
  );

  const stats = [
    { label: "Active patients", value: roster.length, accent: "text-cyan-300" },
    { label: "Visits logged", value: totalVisits, accent: "text-indigo-300" },
    { label: "Notes awaiting review", value: unreviewed, accent: "text-amber-300" },
    { label: "Reports not submitted", value: pendingReports, accent: "text-fuchsia-300" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Good to see you, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1.5 text-muted">{user.clinicName}</p>
          </div>
          <Link href="/visits/new" className="btn-primary">
            Log a visit <span aria-hidden>→</span>
          </Link>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass glass-hover p-5">
              <div className={`text-3xl font-bold ${s.accent}`}>{s.value}</div>
              <div className="mt-1.5 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {needsReauth.length > 0 && (
        <Reveal delay={140}>
          <div className="glass border-amber-400/25 p-6">
            <div className="chip mb-3 text-amber-300">Approaching session cap</div>
            <p className="text-sm text-muted">
              These patients are within two visits of their authorization limit. Draft the
              progress report now rather than after the cap is hit.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {needsReauth.map((p) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}#report`}
                  className="chip transition hover:border-amber-300/60 hover:text-amber-200"
                >
                  {p.caseReference} · {Number(p.visitCount)}/{p.sessionsAuthorized}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={200}>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Caseload</h2>
            <Link href="/patients/new" className="btn-ghost text-xs">Add patient</Link>
          </div>

          {roster.length === 0 ? (
            <div className="glass p-12 text-center">
              <p className="text-muted">
                No patients yet. Add a de-identified case to log your first visit.
              </p>
              <Link href="/patients/new" className="btn-primary mt-6">Add first patient</Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roster.map((p) => {
                const used = Number(p.visitCount);
                const pct = Math.min(100, (used / p.sessionsAuthorized) * 100);
                return (
                  <Link key={p.id} href={`/patients/${p.id}`} className="glass glass-hover block p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold text-cyan-300">
                          {p.caseReference}
                        </div>
                        <div className="mt-1 truncate text-sm text-muted">
                          {p.diagnosisSummary}
                        </div>
                      </div>
                      {p.lastPain !== null && (
                        <div className="shrink-0 text-right">
                          <div className="text-xl font-bold">{p.lastPain}</div>
                          <div className="text-[10px] uppercase tracking-widest text-muted">
                            pain
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <div className="mb-1.5 flex justify-between text-[11px] text-muted">
                        <span>{used} of {p.sessionsAuthorized} sessions</span>
                        <span>
                          {p.lastVisit
                            ? new Date(p.lastVisit).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : "no visits"}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all ${
                            pct > 82
                              ? "bg-gradient-to-r from-amber-400 to-rose-400"
                              : "bg-gradient-to-r from-cyan-400 to-indigo-400"
                          }`}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
