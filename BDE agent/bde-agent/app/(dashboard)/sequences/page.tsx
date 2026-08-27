import { db } from "@/lib/db";
import { sequences } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { SequenceEditor } from "./sequence-editor";

// Section 13 view 5 — Sequence manager: view/edit templates by service line.
export default async function SequencesPage() {
  const allSequences = await db.select().from(sequences).orderBy(asc(sequences.serviceLine), asc(sequences.stepNumber));

  const byServiceLine = new Map<string, typeof allSequences>();
  for (const seq of allSequences) {
    const list = byServiceLine.get(seq.serviceLine) ?? [];
    list.push(seq);
    byServiceLine.set(seq.serviceLine, list);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold">Sequences</h1>
      <p className="mb-6 text-sm opacity-60">
        Section 5 templates. {"{service}"}/{"{observation}"}/{"{case_study}"}/{"{metric}"} are filled in per
        lead by lib/integrations/llm.ts at send time.
      </p>

      {Array.from(byServiceLine.entries()).map(([serviceLine, steps]) => (
        <div key={serviceLine} className="mb-8">
          <h2 className="mb-2 text-sm font-semibold">
            {SERVICE_CATALOG.find((s) => s.key === serviceLine)?.label ?? serviceLine}
          </h2>
          <div className="space-y-3">
            {steps.map((step) => (
              <SequenceEditor key={step.id} sequence={step} />
            ))}
          </div>
        </div>
      ))}

      {allSequences.length === 0 && (
        <p className="text-sm opacity-50">No sequence templates yet — run `npm run db:seed` to load the Section 5 defaults.</p>
      )}
    </div>
  );
}
