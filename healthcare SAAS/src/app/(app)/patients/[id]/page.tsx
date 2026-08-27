import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { hepPlans, insuranceReports, outcomeMeasures, patients, visits } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { buildHep, draftReport, sendHep } from "../../actions";
import { ProgressChart, type Series } from "@/components/progress-chart";
import { NoteReviewer } from "@/components/note-reviewer";
import { ReportReviewer } from "@/components/report-reviewer";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ visit?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { visit: focusVisit } = await searchParams;

  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, id), eq(patients.clinicId, user.clinicId)))
    .limit(1);
  if (!patient) notFound();

  const history = await db
    .select()
    .from(visits)
    .where(eq(visits.patientId, id))
    .orderBy(desc(visits.visitDate));

  const measures = await db
    .select()
    .from(outcomeMeasures)
    .where(eq(outcomeMeasures.patientId, id))
    .orderBy(asc(outcomeMeasures.recordedAt));

  const plans = await db
    .select()
    .from(hepPlans)
    .where(eq(hepPlans.patientId, id))
    .orderBy(desc(hepPlans.createdAt));

  const reports = await db
    .select()
    .from(insuranceReports)
    .where(eq(insuranceReports.patientId, id))
    .orderBy(desc(insuranceReports.createdAt));

  // Group outcome measures into chart series.
  const grouped = new Map<string, Series>();
  for (const m of measures) {
    const key = m.label || m.measureType;
    if (!grouped.has(key)) {
      grouped.set(key, { label: key, unit: m.unit ?? "", points: [] });
    }
    grouped.get(key)!.points.push({
      date: m.recordedAt.toISOString().slice(0, 10),
      value: m.value,
    });
  }
  const series = [...grouped.values()];

  const latest = history[0];
  const focused = focusVisit ? history.find((v) => v.id === focusVisit) ?? latest : latest;
  const used = history.length;
  const pct = Math.min(100, (used / patient.sessionsAuthorized) * 100);
  const nearCap = used >= patient.sessionsAuthorized - 2;
  const latestPlan = plans[0];
  const latestReport = reports[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <Reveal>
        <div>
          <Link href="/patients" className="text-sm text-muted transition hover:text-ink">
            ← Patients
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tight text-cyan-300">
                {patient.caseReference}
              </h1>
              <p className="mt-2 text-lg">{patient.diagnosisSummary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {patient.bodyRegion && <span className="chip">{patient.bodyRegion}</span>}
                {patient.insurer && <span className="chip">{patient.insurer}</span>}
                <span className="chip">De-identified record</span>
              </div>
            </div>
            <Link href={`/visits/new?patient=${patient.id}`} className="btn-primary">
              Log a visit
            </Link>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex justify-between text-xs text-muted">
              <span>
                Session <span className="font-semibold text-ink">{used}</span> of{" "}
                {patient.sessionsAuthorized} authorized
              </span>
              {nearCap && <span className="text-amber-300">Re-authorization due</span>}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                style={{ width: `${pct}%` }}
                className={`h-full rounded-full ${
                  pct > 82
                    ? "bg-gradient-to-r from-amber-400 to-rose-400"
                    : "bg-gradient-to-r from-cyan-400 to-indigo-400"
                }`}
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Trend */}
      <Reveal delay={60}>
        <ProgressChart series={series} />
      </Reveal>

      {/* Note review */}
      <Reveal delay={100}>
        <section id="note" className="glass p-7">
          <h2 className="mb-5 text-lg font-semibold">Latest session note</h2>
          {focused ? (
            <NoteReviewer
              visitId={focused.id}
              patientId={patient.id}
              draft={focused.aiGeneratedNote ?? ""}
              finalNote={focused.finalNote}
              reviewed={focused.reviewed}
            />
          ) : (
            <p className="text-muted">
              No visits logged yet.{" "}
              <Link href={`/visits/new?patient=${patient.id}`} className="text-cyan-300">
                Log the first one
              </Link>
              .
            </p>
          )}
        </section>
      </Reveal>

      {/* HEP */}
      <Reveal delay={140}>
        <section id="hep" className="glass p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Home exercise program</h2>
            {latest && (
              <form action={buildHep}>
                <input type="hidden" name="patientId" value={patient.id} />
                <input type="hidden" name="visitId" value={latest.id} />
                <button className="btn-ghost text-xs">
                  {latestPlan ? "Regenerate from latest visit" : "Generate from latest visit"}
                </button>
              </form>
            )}
          </div>

          {!latestPlan ? (
            <p className="text-sm text-muted">
              No program yet. Generate one from the most recent session — it progresses what
              the patient tolerated in clinic today.
            </p>
          ) : (
            <div className="space-y-5">
              {latestPlan.summary && (
                <p className="rounded-lg border border-white/8 bg-void/40 p-4 text-sm leading-relaxed">
                  {latestPlan.summary}
                </p>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                {latestPlan.exercises.map((ex, i) => (
                  <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-semibold">{ex.name}</h4>
                      <span className="shrink-0 font-mono text-xs text-cyan-300">
                        {ex.sets}×{ex.reps}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-widest text-muted">
                      {ex.frequency}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink/85">{ex.instructions}</p>
                    {ex.cues && (
                      <p className="mt-2 text-xs italic text-muted">{ex.cues}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-5">
                {latestPlan.sentAt ? (
                  <span className="chip text-emerald-300">
                    Sent by {latestPlan.sentChannel} on{" "}
                    {new Date(latestPlan.sentAt).toLocaleDateString()}
                  </span>
                ) : (
                  <>
                    <form action={sendHep} className="flex items-center gap-2">
                      <input type="hidden" name="planId" value={latestPlan.id} />
                      <input type="hidden" name="patientId" value={patient.id} />
                      <select name="channel" className="field w-auto py-2 text-xs">
                        <option value="sms" className="bg-panel">SMS</option>
                        <option value="email" className="bg-panel">Email</option>
                      </select>
                      <button className="btn-primary text-xs">Review & send</button>
                    </form>
                    <p className="text-xs text-muted">
                      Sending is a deliberate click — nothing goes out on its own.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </Reveal>

      {/* Insurance report */}
      <Reveal delay={180}>
        <section id="report" className="glass p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Insurance progress report</h2>
              {nearCap && (
                <p className="mt-1 text-xs text-amber-300">
                  {used} of {patient.sessionsAuthorized} sessions used — draft this now.
                </p>
              )}
            </div>
            <form action={draftReport}>
              <input type="hidden" name="patientId" value={patient.id} />
              <button className="btn-ghost text-xs" disabled={history.length === 0}>
                {latestReport ? "Draft a new report" : "Draft re-authorization report"}
              </button>
            </form>
          </div>

          {!latestReport ? (
            <p className="text-sm text-muted">
              {history.length === 0
                ? "Log at least one visit before drafting a report."
                : "Drafted from the accumulated outcome data across every logged visit."}
            </p>
          ) : (
            <ReportReviewer
              reportId={latestReport.id}
              patientId={patient.id}
              draft={latestReport.aiGeneratedReport ?? ""}
              finalReport={latestReport.finalReport}
              submittedAt={latestReport.submittedAt}
            />
          )}
        </section>
      </Reveal>

      {/* Visit history */}
      <Reveal delay={220}>
        <section className="glass p-7">
          <h2 className="mb-5 text-lg font-semibold">Visit history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted">Nothing logged yet.</p>
          ) : (
            <ol className="relative space-y-5 border-l border-white/10 pl-6">
              {history.map((v, i) => (
                <li key={v.id} className="relative">
                  <span
                    className={`absolute -left-[30px] top-1.5 h-3 w-3 rounded-full border-2 border-void ${
                      v.reviewed ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                    aria-hidden
                  />
                  <Link
                    href={`/patients/${patient.id}?visit=${v.id}#note`}
                    className="block rounded-lg border border-white/8 bg-white/3 p-4 transition hover:border-cyan-400/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-semibold">
                        Session {history.length - i} ·{" "}
                        {v.visitDate.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-3 text-xs text-muted">
                        {v.painScore !== null && <span>Pain {v.painScore}/10</span>}
                        {Object.entries(v.romMeasurements).map(([k, val]) => (
                          <span key={k}>
                            {k} {val}°
                          </span>
                        ))}
                        <span className={v.reviewed ? "text-emerald-300" : "text-amber-300"}>
                          {v.reviewed ? "reviewed" : "draft"}
                        </span>
                      </span>
                    </div>
                    {v.exercisesDone.length > 0 && (
                      <p className="mt-2 truncate text-xs text-muted">
                        {v.exercisesDone.map((e) => e.name).join(" · ")}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </Reveal>
    </div>
  );
}
