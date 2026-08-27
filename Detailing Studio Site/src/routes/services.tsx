import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Droplets, Shield, Sparkles, Wrench, Sofa, Cog, Lightbulb, ShieldCheck, GlassWater, Disc, ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Lustre Auto Studio" },
      { name: "description", content: "Ceramic coating, PPF, paint correction, interior detailing, engine bay cleaning and more — premium detailing services in India." },
      { property: "og:title", content: "Services — Lustre Auto Studio" },
      { property: "og:description", content: "Full menu of premium car detailing services in India." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Droplets, title: "Car Spa & Cleaning", price: "₹1,499+", desc: "Foam wash, interior vacuum, dashboard polishing & tyre dressing." },
  { icon: Shield, title: "Ceramic Coating", price: "₹19,999+", desc: "Long-lasting paint protection with a glass-hard hydrophobic finish." },
  { icon: Sparkles, title: "Paint Protection Film (PPF)", price: "₹89,999+", desc: "Self-healing transparent film that absorbs scratches & stone chips." },
  { icon: Wrench, title: "Polishing & Rubbing", price: "₹4,999+", desc: "Removes swirl marks, holograms & enhances paint depth." },
  { icon: Sofa, title: "Interior Detailing", price: "₹3,499+", desc: "Deep extraction cleaning & premium leather conditioning." },
  { icon: Cog, title: "Engine Bay Cleaning", price: "₹1,999+", desc: "Degrease, dress & detail every inch under the hood." },
  { icon: Lightbulb, title: "Headlight Restoration", price: "₹1,499+", desc: "Restore yellowed, hazy headlights to crystal clarity." },
  { icon: ShieldCheck, title: "Anti-Rust Coating", price: "₹4,999+", desc: "Underbody protection against corrosion & moisture." },
  { icon: GlassWater, title: "Glass Coating", price: "₹2,499+", desc: "Hydrophobic treatment for clearer vision in heavy rain." },
  { icon: Disc, title: "Alloy Wheel Coating", price: "₹3,999+", desc: "Cleaning, polishing & ceramic coating for your wheels." },
];

function ServicesPage() {
  return (
    <PageShell>
      <section className="pt-40 pb-16 mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.3em] text-accent">— Service Menu</div>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[0.95] max-w-4xl">
            Every detail. <span className="text-shine">Perfected.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Transparent packages crafted for Indian cars and weather. From a weekly polish to multi-year ceramic armor.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.08}>
              <motion.div whileHover={{ y: -6 }} className="group relative h-full rounded-2xl border border-border bg-card p-8 overflow-hidden">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground text-background">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-semibold text-accent">{s.price}</div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  <Link to="/booking" className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground/80 hover:text-accent transition-colors">
                    Book this <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}