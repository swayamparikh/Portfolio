import { createFileRoute } from "@tanstack/react-router";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import { Reveal } from "@/components/parallax";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Ethos Roast" },
      { name: "description", content: "Café moments, the craft of brewing, and our community across India." },
      { property: "og:title", content: "Gallery — Ethos Roast" },
      { property: "og:description", content: "Café moments, the craft of brewing, and our community." },
    ],
  }),
  component: GalleryPage,
});

const shots = [
  { src: g1, alt: "Cafe interior", span: "row-span-2" },
  { src: g2, alt: "Barista at espresso machine", span: "" },
  { src: g3, alt: "Customer at window", span: "row-span-2" },
  { src: g4, alt: "Coffee beans in burlap", span: "" },
  { src: g5, alt: "Latte art pour", span: "" },
  { src: g6, alt: "Cafe exterior at dusk", span: "row-span-2" },
];

function GalleryPage() {
  return (
    <div className="pt-12 pb-32">
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <Reveal>
          <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-6 block">Experience</span>
          <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[0.95] mb-6 max-w-[18ch]">
            Moments inside <span className="italic">Ethos.</span>
          </h1>
          <p className="max-w-[56ch] text-mocha/70 text-lg">
            A look at our cafés, the people who run them, and the ritual that brings everyone together.
          </p>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[260px] gap-4">
          {shots.map((s, i) => (
            <Reveal key={i} delay={i * 80} className={`${s.span} overflow-hidden rounded-sm card-tilt`}>
              <img src={s.src} alt={s.alt} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-32 text-center">
        <Reveal>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">Come spend an hour with us.</h2>
          <p className="text-mocha/70 mb-8 max-w-[48ch] mx-auto">Find your nearest Ethos café and pull up a chair. The kettle's always on.</p>
          <a href="/contact" className="inline-block bg-honey text-cream px-8 py-4 rounded-sm text-sm font-medium hover:brightness-110 transition-all">
            Find a Location
          </a>
        </Reveal>
      </section>
    </div>
  );
}
