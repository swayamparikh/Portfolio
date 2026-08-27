import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { NoteDemo } from "@/components/note-demo";
import { Reveal } from "@/components/reveal";

const FEATURES = [
  {
    tag: "01",
    title: "Session notes in seconds",
    body: "Type or dictate a few fragments between patients. PhysioFlow returns a formatted SOAP note that already references the last visit's ROM and pain scores — because it read them.",
    accent: "from-cyan-400/20 to-transparent",
  },
  {
    tag: "02",
    title: "Home programs that get done",
    body: "Generate a personalised HEP from today's session, send it by text or email, and see who actually logged their reps before they walk back through the door.",
    accent: "from-indigo-400/20 to-transparent",
  },
  {
    tag: "03",
    title: "Progress you can show",
    body: "Pain, range of motion and strength plotted across the whole episode of care. One glance tells you whether this plan is working — and gives the patient a reason to keep going.",
    accent: "from-fuchsia-400/20 to-transparent",
  },
  {
    tag: "04",
    title: "Re-auth reports, pre-written",
    body: "When a patient nears their session cap, the report is already drafted from the accumulated outcome data. You review, adjust the ask, and submit.",
    accent: "from-emerald-400/20 to-transparent",
  },
];

const STATS = [
  { value: "2 hrs", label: "typical after-hours charting per physio, per day" },
  { value: "10-15", label: "patients seen daily in a busy outpatient clinic" },
  { value: "100%", label: "of AI drafts reviewed by a clinician before saving" },
];

export default async function Landing() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-void/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#how" className="transition hover:text-ink">How it works</a>
            <a href="#features" className="transition hover:text-ink">Features</a>
            <a href="#trust" className="transition hover:text-ink">Compliance</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn-primary">Open dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm text-muted transition hover:text-ink sm:block">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-primary">Start free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-32">
        <Reveal>
          <div className="chip mb-7 text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            Built with physiotherapists, not for them
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Your notes are written
            <br />
            <span className="gradient-text">before you finish the handover.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">
            PhysioFlow AI turns each session into a structured SOAP note, tracks
            exercise progress across every visit, and drafts the insurance progress
            reports that keep your patients authorized. You review. You edit. Nothing
            saves or sends without you.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href={user ? "/dashboard" : "/signup"} className="btn-primary text-base">
              {user ? "Open dashboard" : "Draft your first note"}
              <span aria-hidden>→</span>
            </Link>
            <Link href="#how" className="btn-ghost text-base">See it work</Link>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-20 grid gap-6 sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="glass p-6">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="mt-2 text-sm leading-snug text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Live demo */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <div className="chip mb-4 text-indigo-300">The 20-second note</div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Fragments in. <span className="gradient-text">Clinical note out.</span>
            </h2>
            <p className="mt-4 text-muted">
              This is the actual input a physio types between patients — and the
              structure PhysioFlow returns, with the prior visit already referenced.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <NoteDemo />
        </Reveal>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="mb-12 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Four things that compound into one workflow
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.tag} delay={i * 90}>
              <div className="glass glass-hover relative h-full overflow-hidden p-8">
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${f.accent} blur-2xl`}
                />
                <div className="font-mono text-xs tracking-widest text-cyan-400">{f.tag}</div>
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={400}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted">
            Today&apos;s note feeds tomorrow&apos;s home program and next month&apos;s
            re-authorization report. Three disconnected chores become one loop.
          </p>
        </Reveal>
      </section>

      {/* Compliance */}
      <section id="trust" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="beam glass overflow-hidden p-10 md:p-14">
            <div className="chip mb-5 text-emerald-300">Human in the loop, always</div>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Nothing auto-submits. Anywhere.
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {[
                {
                  h: "Phase 1 — Validation",
                  p: "De-identified case references only. Test note quality on dummy patients before a single real record is touched.",
                },
                {
                  h: "Phase 2 — Pilot",
                  p: "BAA signed with the clinic, HIPAA-eligible hosting, encryption in transit and at rest, audit logging, minimal retention.",
                },
                {
                  h: "Phase 3 — Scale",
                  p: "Formal SOC 2 once multiple clinics are paying — not before product-market fit.",
                },
              ].map((c) => (
                <div key={c.h}>
                  <div className="text-sm font-semibold text-cyan-300">{c.h}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="glass ring-glow p-12 text-center md:p-20">
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Get your <span className="gradient-text">evenings</span> back.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              Set up a clinic in under a minute, log one visit, and see whether the
              draft is good enough to just review and save.
            </p>
            <div className="mt-9 flex justify-center">
              <Link href={user ? "/dashboard" : "/signup"} className="btn-primary text-base">
                {user ? "Open dashboard" : "Create your clinic"}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted md:flex-row">
          <Logo small />
          <p>Clinical drafts require review by a licensed physiotherapist.</p>
        </div>
      </footer>
    </div>
  );
}
