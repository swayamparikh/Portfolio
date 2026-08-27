import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  Shield,
  Droplets,
  Wrench,
  Star,
  ArrowRight,
  CheckCircle2,
  Award,
  Users,
  Clock,
} from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import ceramic from "@/assets/ceramic-coating.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lustre Auto Studio — Precision Detailing. Ultimate Shine." },
      { name: "description", content: "Premium car detailing in India: ceramic coating, PPF, paint correction, and luxury interior care for BMW, Mercedes, Audi, Thar & more." },
      { property: "og:title", content: "Lustre Auto Studio — Precision Detailing" },
      { property: "og:description", content: "Ceramic coating, PPF & luxury detailing for India's finest cars." },
      { property: "og:image", content: "/hero-car.jpg" },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Droplets, title: "Car Spa & Foam Wash", desc: "Foam bath, interior vacuum & dashboard polish." },
  { icon: Shield, title: "Ceramic Coating", desc: "9H glass-hard hydrophobic shield. Lasts up to 5 years." },
  { icon: Sparkles, title: "PPF Film", desc: "Self-healing paint protection film. Invisible armor." },
  { icon: Wrench, title: "Paint Correction", desc: "Multi-stage polish that erases swirls & holograms." },
];

const stats = [
  { value: "2,400+", label: "Cars Detailed" },
  { value: "12 Yrs", label: "Of Craft" },
  { value: "9H", label: "Coating Hardness" },
  { value: "4.9★", label: "Google Rating" },
];

const testimonials = [
  { name: "Rohan Mehta", car: "BMW M340i", text: "The ceramic coating finish is unreal. Water beads like mercury. Worth every rupee." },
  { name: "Ananya Iyer", car: "Mercedes GLC", text: "Picked up my car looking better than the showroom. Their attention to detail is on another level." },
  { name: "Vikram Singh", car: "Mahindra Thar", text: "Mud, sand, scratches — gone. The PPF saved my paint on the next trail trip." },
];

function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const carY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const carScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <PageShell>
      {/* HERO */}
      <section ref={heroRef} className="relative h-[100vh] overflow-hidden">
        <motion.div
          style={{ y: carY, scale: carScale }}
          className="absolute inset-0"
        >
          <img
            src={heroCar}
            alt="Luxury BMW in detailing studio"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
        </motion.div>

        <motion.div
          style={{ y: textY, opacity: heroOpacity }}
          className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            India's Premium Detailing Studio
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            className="mt-6 max-w-4xl text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.92]"
          >
            Precision Detailing.
            <br />
            <span className="text-shine">Ultimate Shine.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Hand-crafted ceramic coatings, paint protection films, and luxury interior care for India's finest automobiles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/booking"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-all"
            >
              Book Appointment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 text-sm font-semibold hover:bg-card transition-all"
            >
              View Services
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-accent to-transparent animate-float-slow" />
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border bg-card py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6 text-2xl md:text-4xl font-display font-bold text-muted-foreground/60">
              {["BMW", "Mercedes-Benz", "Audi", "Mahindra Thar", "Porsche", "Range Rover", "Lexus", "Jaguar"].map((m) => (
                <span key={m} className="flex items-center gap-12">
                  {m}
                  <span className="text-accent">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <div className="text-4xl md:text-6xl font-display font-bold text-shine">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="What we do" title="Signature Services" subtitle="From a deep cleanse to glass-hard armor — every service performed by certified technicians using globally-sourced products." />
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className="group relative h-full rounded-2xl border border-border bg-card p-7 overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground text-background">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-accent font-semibold group">
            Explore all services <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* CERAMIC FEATURE */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <Reveal>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl"
            >
              <img src={ceramic} alt="Ceramic coating" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 ring-1 ring-inset ring-border" />
            </motion.div>
          </Reveal>
          <div>
            <SectionHeading eyebrow="Flagship" title="9H Ceramic Coating" subtitle="A liquid-glass nano shield, hand-cured layer by layer. Hydrophobic, scratch-resistant, UV-blocking — and so glossy it looks wet in the sun." />
            <ul className="mt-8 space-y-3">
              {["Up to 5 years of protection", "Self-cleaning hydrophobic effect", "UV & chemical resistance", "Mirror-grade depth & gloss"].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/booking" className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-all">
              Book Coating <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading center eyebrow="Proof" title="Before & After" subtitle="Real cars. Real transformations. Drag your eyes across the gloss." />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[gallery1, gallery3, gallery4].map((src, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div whileHover={{ scale: 1.02 }} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border">
                <img src={src} alt={`Detailing showcase ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="text-xs uppercase tracking-widest text-accent">Project 0{i + 1}</div>
                  <div className="mt-1 text-lg font-bold">
                    {["Foam Wash & Wax", "Wheel Restoration", "Paint Correction"][i]}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-sm text-accent font-semibold group">
            View full gallery <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <SectionHeading center eyebrow="The Lustre Standard" title="Why Choose Us" />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Award, title: "Certified Products", desc: "Gtechniq, CarPro & XPEL — globally-trusted detailing chemistry only." },
            { icon: Users, title: "Skilled Professionals", desc: "IDA-certified detailers with 8+ years of hands-on experience." },
            { icon: Clock, title: "Affordable Packages", desc: "Transparent pricing, EMI options, and seasonal membership plans." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-8">
                <f.icon className="h-8 w-8 text-accent" />
                <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Word of mouth" title="From Our Clients" />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
                <div className="mt-6 border-t border-border pt-4">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.car}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 md:p-20 text-center">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[120%] rounded-full bg-accent/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-bold">Ready for the <span className="text-shine">ultimate shine?</span></h2>
              <p className="mt-5 text-muted-foreground max-w-xl mx-auto">Book a slot today — most premium services include free pickup & drop in Mumbai.</p>
              <Link to="/booking" className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-all">
                Book Appointment <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
