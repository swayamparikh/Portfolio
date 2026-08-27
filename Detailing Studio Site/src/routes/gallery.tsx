import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";
import hero from "@/assets/hero-car.jpg";
import ceramic from "@/assets/ceramic-coating.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Lustre Auto Studio" },
      { name: "description", content: "Before-and-after detailing transformations on BMW, Mercedes, Audi, Mahindra Thar and more." },
      { property: "og:title", content: "Gallery — Lustre Auto Studio" },
      { property: "og:description", content: "Real cars. Real shine. See our work." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

const items = [
  { src: hero, title: "BMW M340i", tag: "Ceramic Coating", span: "md:col-span-2 md:row-span-2" },
  { src: g1, title: "Mahindra Thar", tag: "Foam Spa", span: "" },
  { src: g2, title: "Mercedes GLC", tag: "Interior Detailing", span: "" },
  { src: g3, title: "Audi A6", tag: "Alloy Restoration", span: "md:col-span-2" },
  { src: ceramic, title: "Range Rover", tag: "9H Coating", span: "" },
  { src: g4, title: "Porsche 911", tag: "Paint Correction", span: "" },
];

function GalleryPage() {
  return (
    <PageShell>
      <section className="pt-40 pb-12 mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.3em] text-accent">— Portfolio</div>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[0.95]">
            Cars we <span className="text-shine">made shine.</span>
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[280px]">
          {items.map((it, i) => (
            <Reveal key={i} delay={(i % 3) * 0.08} className={it.span}>
              <motion.div whileHover={{ scale: 1.02 }} className="group relative h-full w-full overflow-hidden rounded-2xl border border-border">
                <img src={it.src} alt={it.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="text-xs uppercase tracking-widest text-accent">{it.tag}</div>
                  <div className="mt-1 text-xl font-bold">{it.title}</div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}