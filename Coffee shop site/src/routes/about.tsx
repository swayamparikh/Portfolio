import { createFileRoute } from "@tanstack/react-router";
import beans from "@/assets/beans.jpg";
import pourover from "@/assets/pourover.jpg";
import plant from "@/assets/plant.jpg";
import { Parallax, Reveal } from "@/components/parallax";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Ethos Roast" },
      { name: "description", content: "From the volcanic slopes of Coorg to your neighborhood cup — the story of Ethos Roast." },
      { property: "og:title", content: "Our Story — Ethos Roast" },
      { property: "og:description", content: "From bean to cup, our journey of craft and community." },
    ],
  }),
  component: AboutPage,
});

const timeline = [
  { y: "2014", t: "First Roast", b: "A 12kg drum roaster, a Bengaluru garage, and an obsession with origin." },
  { y: "2017", t: "Direct Trade", b: "Partnerships with five micro-lot estates in Karnataka and Kerala." },
  { y: "2020", t: "First Café", b: "Our flagship opens in Indiranagar with floor-to-ceiling glass and a single bean menu." },
  { y: "2022", t: "Franchise Begins", b: "First partner outlets launch in Pune and Hyderabad." },
  { y: "2025", t: "12 States", b: "An ever-growing collective of artisan operators across India." },
];

function AboutPage() {
  return (
    <div className="pt-12 pb-32">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
        <Reveal>
          <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-6 block">Our Story</span>
          <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[0.95] mb-8 text-balance">
            A decade-long love letter <span className="italic">to the bean.</span>
          </h1>
          <p className="text-lg text-mocha/70 max-w-[56ch] mx-auto">
            We started with a single roaster and a stubborn belief: India deserves coffee that honours the farmer, the roaster, and the drinker — equally.
          </p>
        </Reveal>
      </section>

      {/* MISSION & VISION */}
      <section className="py-24 bg-paper">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
          <Reveal>
            <span className="font-mono text-[10px] uppercase tracking-widest text-honey mb-4 block">Mission</span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6">Bring specialty coffee to the Indian street corner.</h2>
            <p className="text-mocha/70 leading-relaxed">
              We want world-class coffee to feel as everyday as masala chai. That means traceable sourcing, fair pricing for farmers, and baristas trained to extract the soul of every roast.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-honey mb-4 block">Vision</span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6">Be the most trusted coffee collective in South Asia by 2030.</h2>
            <p className="text-mocha/70 leading-relaxed">
              A network of independent operators, united by craft. Each outlet a third place. Each cup a quiet act of attention.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SOURCING */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <Reveal className="relative">
            <Parallax speed={0.15} className="absolute -top-6 -left-6 w-32 h-32 bg-honey/15 rounded-full blur-3xl"><div /></Parallax>
            <img src={beans} alt="Roasted coffee beans" loading="lazy" className="relative w-full aspect-[4/5] object-cover rounded-sm card-tilt" />
          </Reveal>
          <Reveal delay={150}>
            <span className="text-honey text-xs tracking-[0.2em] uppercase mb-4 block">Sourcing</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">From volcanic soils, with care.</h2>
            <p className="text-mocha/70 mb-6 leading-relaxed">
              Our beans come from high-altitude shade-grown estates in Coorg, Chikmagalur, and Wayanad. We pay above market for cup-quality, and visit every harvest.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><span className="text-honey">→</span>100% traceable to the estate and lot</li>
              <li className="flex gap-3"><span className="text-honey">→</span>Direct trade partnerships, 6+ years average</li>
              <li className="flex gap-3"><span className="text-honey">→</span>Shade-grown, ethically harvested</li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-32 bg-mocha text-cream">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <span className="text-honey text-xs tracking-[0.2em] uppercase mb-4 block">Journey</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium">A decade of slow growth.</h2>
          </Reveal>
          <ol className="relative border-l border-cream/15 ml-2 space-y-12">
            {timeline.map((t, i) => (
              <Reveal key={t.y} delay={i * 80} className="pl-8 relative">
                <span className="absolute -left-[7px] top-2 size-3 rounded-full bg-honey" />
                <div className="font-mono text-xs uppercase tracking-widest text-honey mb-2">{t.y}</div>
                <h3 className="font-serif text-3xl mb-2 font-medium">{t.t}</h3>
                <p className="text-cream/70 max-w-[56ch]">{t.b}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CRAFT */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <Reveal delay={100}>
            <span className="text-honey text-xs tracking-[0.2em] uppercase mb-4 block">Craft</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">Timed to the second, measured to the gram.</h2>
            <p className="text-mocha/70 leading-relaxed">
              Our baristas spend three weeks in immersive training before they pull their first paying shot. Extraction, temperature, milk texturing — the small things, religiously.
            </p>
          </Reveal>
          <Reveal>
            <img src={pourover} alt="Barista pour over" loading="lazy" className="w-full aspect-[4/5] object-cover rounded-sm card-tilt" />
          </Reveal>
        </div>
      </section>

      {/* HERITAGE */}
      <section className="py-24 bg-paper">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Reveal>
            <img src={plant} alt="Coffee plant sketch" loading="lazy" className="w-48 mx-auto mb-10 rounded-sm" />
            <blockquote className="font-serif text-3xl md:text-4xl italic leading-snug text-mocha max-w-[40ch] mx-auto">
              "Every cup is a culmination of thousands of miles and hundreds of hands."
            </blockquote>
            <div className="mt-6 text-sm text-mocha/60">— The Ethos Manifesto</div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
