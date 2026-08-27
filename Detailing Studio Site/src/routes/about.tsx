import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import hero from "@/assets/hero-car.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lustre Auto Studio" },
      { name: "description", content: "Twelve years, 2,400+ cars, and a single obsession: precision detailing. Meet the team behind Lustre Auto Studio in Mumbai." },
      { property: "og:title", content: "About — Lustre Auto Studio" },
      { property: "og:description", content: "Twelve years of precision detailing in India." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <section className="pt-40 pb-16 mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.3em] text-accent">— Our Story</div>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[0.95] max-w-4xl">
            A studio built on <span className="text-shine">obsession.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Lustre Auto Studio was founded in 2013 by a group of detailing nerds who believed Indian car owners deserved world-class care. Today we run one of Mumbai's most respected studios.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 grid gap-12 lg:grid-cols-2 items-center">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img src={hero} alt="Our studio" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </Reveal>
        <div className="space-y-6 text-foreground/85 leading-relaxed">
          <Reveal>
            <h2 className="text-3xl font-bold">Twelve years. One standard.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>What started as a single bay in Andheri is today a 6,000 sqft climate-controlled studio with IDA-certified technicians and global partnerships with Gtechniq, CarPro and XPEL.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>We've polished BMWs, armored Thars for the Himalayas, and restored vintage Mercedes from the 70s. Every car gets the same obsessive attention — because details aren't a service. They're a discipline.</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Core values" title="What we stand for" />
        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {[
            { icon: Award, t: "Certified", d: "IDA & Gtechniq certified detailers only." },
            { icon: Sparkles, t: "Precision", d: "Multi-stage QC on every project." },
            { icon: ShieldCheck, t: "Protection", d: "Real warranties, not marketing words." },
            { icon: Heart, t: "Passion", d: "We obsess over your car like it's ours." },
          ].map((v, i) => (
            <Reveal key={v.t} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <v.icon className="h-7 w-7 text-accent" />
                <h3 className="mt-5 text-lg font-bold">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold">Visit our studio</h2>
            <p className="mt-4 text-muted-foreground">Andheri West, Mumbai — open 7 days a week.</p>
            <Link to="/booking" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-all">
              Book a Visit
            </Link>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}