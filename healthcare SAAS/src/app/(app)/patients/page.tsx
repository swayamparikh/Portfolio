import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const user = await requireUser();

  const rows = await db
    .select({
      id: patients.id,
      caseReference: patients.caseReference,
      diagnosisSummary: patients.diagnosisSummary,
      bodyRegion: patients.bodyRegion,
      insurer: patients.insurer,
      sessionsAuthorized: patients.sessionsAuthorized,
      createdAt: patients.createdAt,
      visitCount: sql<number>`(select count(*) from visits where visits.patient_id = ${patients.id})`,
    })
    .from(patients)
    .where(eq(patients.clinicId, user.clinicId))
    .orderBy(desc(patients.createdAt));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="mt-1.5 text-muted">
              De-identified case records. No names, no PHI — case references only until a
              BAA is in place.
            </p>
          </div>
          <Link href="/patients/new" className="btn-primary">Add patient</Link>
        </div>
      </Reveal>

      <Reveal delay={80}>
        {rows.length === 0 ? (
          <div className="glass p-12 text-center text-muted">
            Nothing here yet — add your first case reference.
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="hidden grid-cols-12 gap-4 border-b border-white/5 px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted md:grid">
              <div className="col-span-2">Case</div>
              <div className="col-span-4">Working diagnosis</div>
              <div className="col-span-2">Region</div>
              <div className="col-span-2">Insurer</div>
              <div className="col-span-2 text-right">Sessions</div>
            </div>
            {rows.map((p) => (
              <Link
                key={p.id}
                href={`/patients/${p.id}`}
                className="grid grid-cols-1 gap-2 border-b border-white/5 px-6 py-4 transition last:border-0 hover:bg-cyan-400/5 md:grid-cols-12 md:gap-4"
              >
                <div className="col-span-2 font-mono text-sm font-semibold text-cyan-300">
                  {p.caseReference}
                </div>
                <div className="col-span-4 text-sm">{p.diagnosisSummary}</div>
                <div className="col-span-2 text-sm text-muted">{p.bodyRegion ?? "—"}</div>
                <div className="col-span-2 text-sm text-muted">{p.insurer ?? "—"}</div>
                <div className="col-span-2 text-sm text-muted md:text-right">
                  {Number(p.visitCount)} / {p.sessionsAuthorized}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
