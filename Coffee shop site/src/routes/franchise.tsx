import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import beans from "@/assets/beans.jpg";
import burlap from "@/assets/burlap.jpg";
import pourover from "@/assets/pourover.jpg";
import { Parallax, Reveal } from "@/components/parallax";

export const Route = createFileRoute("/franchise")({
  head: () => ({
    meta: [
      { title: "Franchise Opportunities — Ethos Roast" },
      { name: "description", content: "Partner with India's growing artisan coffee brand. Investment, ROI, training, and end-to-end supply support." },
      { property: "og:title", content: "Franchise with Ethos Roast" },
      { property: "og:description", content: "Investment, ROI, and end-to-end partnership support." },
    ],
  }),
  component: FranchisePage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  city: z.string().trim().min(2, "City is required").max(80),
  budget: z.string().min(1, "Select a budget"),
  contact: z.string().trim().min(10, "Enter a valid phone or email").max(120),
  message: z.string().trim().max(500).optional(),
});

const journey = [
  { kicker: "Step 01", title: "Inquiry", body: "Share your city, budget, and vision. Our partnerships team responds within 48 hours." },
  { kicker: "Step 02", title: "Discovery", body: "A deep-dive call to align values, market feasibility, and outlet format." },
  { kicker: "Step 03", title: "Site & Design", body: "We help scout, evaluate, and craft an outlet tailored to the neighborhood." },
  { kicker: "Step 04", title: "Launch", body: "Training, brand kit, supply chain hookup, and a hands-on opening week." },
  { kicker: "Step 05", title: "Grow", body: "Ongoing operations, marketing, and roast-development support for life." },
];

const investmentTiers = [
  { name: "Kiosk", area: "150–250 sq ft", inv: "₹18–25 L", roi: "12–15 mo" },
  { name: "Express Café", area: "400–600 sq ft", inv: "₹35–50 L", roi: "16–20 mo" },
  { name: "Flagship", area: "1000–1500 sq ft", inv: "₹75 L–1.2 Cr", roi: "20–28 mo" },
];

function FranchisePage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  return (
    <div className="pt-12 pb-32">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Parallax speed={0.2} className="absolute inset-0 opacity-20">
          <img src={beans} alt="" className="w-full h-full object-cover" />
        </Parallax>
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
          <Reveal>
            <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-6 block">Partner with us</span>
            <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[0.95] mb-6 text-balance max-w-[20ch] mx-auto">
              Build a <span className="italic">cafe</span> with soul.
            </h1>
            <p className="max-w-[56ch] mx-auto text-mocha/70 text-lg mb-10">
              A proven artisan coffee model with three outlet formats, end-to-end support, and a brand customers fall in love with.
            </p>
            <a href="#apply" className="inline-block bg-honey text-cream px-8 py-4 rounded-sm text-sm font-medium hover:brightness-110 transition-all">
              Apply for Franchise
            </a>
          </Reveal>
        </div>
      </section>

      {/* WHY PARTNER */}
      <section className="py-24 bg-paper">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">Why partner with Ethos.</h2>
            <p className="text-mocha/70">A model that respects the craft and rewards the operator.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-px bg-mocha/10 border border-mocha/10">
            {[
              { t: "Roastery-Backed Supply", b: "Direct from our roastery, every week, never older than 14 days." },
              { t: "Hands-on Training", b: "Three weeks of barista, ops, and customer experience training." },
              { t: "Brand & Marketing", b: "National brand presence with hyperlocal campaign support." },
              { t: "Outlet Design", b: "Architect-led interiors aligned with local context and footfall." },
              { t: "Tech Stack", b: "POS, inventory, and CX tooling built for specialty coffee operators." },
              { t: "Community", b: "Quarterly partner summits and a peer network of operators." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 80} className="bg-cream p-8">
                <h3 className="text-xl mb-3 font-medium">{c.t}</h3>
                <p className="text-sm text-mocha/70">{c.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTMENT */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-16">
            <span className="text-honey text-xs tracking-[0.2em] uppercase mb-4 block">Formats & Investment</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium">Three ways to begin.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {investmentTiers.map((t, i) => (
              <Reveal key={t.name} delay={i * 120} className="card-tilt border border-mocha/10 p-8 bg-cream">
                <div className="font-mono text-[10px] text-honey uppercase tracking-widest mb-6">Format 0{i + 1}</div>
                <h3 className="font-serif text-3xl mb-6 font-medium">{t.name}</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-mocha/10 pb-2"><dt className="text-mocha/60">Area</dt><dd>{t.area}</dd></div>
                  <div className="flex justify-between border-b border-mocha/10 pb-2"><dt className="text-mocha/60">Investment</dt><dd>{t.inv}</dd></div>
                  <div className="flex justify-between border-b border-mocha/10 pb-2"><dt className="text-mocha/60">Avg. ROI</dt><dd>{t.roi}</dd></div>
                </dl>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY parallax */}
      <section className="py-32 bg-mocha text-cream relative overflow-hidden">
        <Parallax speed={0.3} className="absolute inset-0 opacity-10">
          <img src={burlap} alt="" className="w-full h-full object-cover" />
        </Parallax>
        <div className="relative max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <span className="text-honey text-xs tracking-[0.2em] uppercase mb-4 block">Farm → Cup → You</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium">The partnership journey.</h2>
          </Reveal>
          <ol className="space-y-12">
            {journey.map((j, i) => (
              <Reveal key={j.title} delay={i * 80} className="grid md:grid-cols-[120px_1fr] gap-6 md:gap-12 items-start border-b border-cream/10 pb-12 last:border-0">
                <div className="font-mono text-[10px] uppercase tracking-widest text-honey">{j.kicker}</div>
                <div>
                  <h3 className="font-serif text-3xl mb-3 font-medium">{j.title}</h3>
                  <p className="text-cream/70">{j.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* APPLY FORM */}
      <section id="apply" className="py-32">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <Reveal>
            <img src={pourover} alt="" className="w-full aspect-[4/5] object-cover rounded-sm" loading="lazy" />
          </Reveal>
          <Reveal delay={150}>
            <span className="text-honey text-xs tracking-[0.2em] uppercase mb-4 block">Apply</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">Start the conversation.</h2>
            <p className="text-mocha/70 mb-8">Share a few details — we'll respond within 48 hours.</p>
            {submitted ? (
              <div className="bg-paper border border-honey/30 p-8 rounded-sm">
                <h3 className="font-serif text-2xl mb-2">Thank you.</h3>
                <p className="text-mocha/70 text-sm">Your inquiry is in. Our partnerships team will reach out shortly.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <Field label="Full Name" name="name" error={errors.name} />
                <Field label="City" name="city" error={errors.city} />
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mocha/60 mb-2">Investment Budget</label>
                  <select name="budget" defaultValue="" className="w-full bg-paper border border-mocha/15 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-honey">
                    <option value="" disabled>Select a range</option>
                    <option value="18-25">₹18–25 L · Kiosk</option>
                    <option value="35-50">₹35–50 L · Express</option>
                    <option value="75-120">₹75 L–1.2 Cr · Flagship</option>
                  </select>
                  {errors.budget && <p className="text-xs text-red-700 mt-1">{errors.budget}</p>}
                </div>
                <Field label="Phone or Email" name="contact" error={errors.contact} />
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mocha/60 mb-2">Tell us more (optional)</label>
                  <textarea name="message" rows={4} maxLength={500} className="w-full bg-paper border border-mocha/15 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-honey" />
                </div>
                <button className="w-full bg-mocha text-cream py-4 rounded-sm text-sm font-medium hover:bg-roast transition-colors">
                  Submit Inquiry
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Field({ label, name, error }: { label: string; name: string; error?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs uppercase tracking-widest text-mocha/60 mb-2">{label}</label>
      <input id={name} name={name} type="text" maxLength={120} className="w-full bg-paper border border-mocha/15 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-honey" />
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}
