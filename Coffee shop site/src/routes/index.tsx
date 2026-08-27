import { createFileRoute, Link } from "@tanstack/react-router";
import heroCup from "@/assets/hero-cup.jpg";
import beans from "@/assets/beans.jpg";
import pourover from "@/assets/pourover.jpg";
import plant from "@/assets/plant.jpg";
import { Parallax, ScrollRotate, Reveal } from "@/components/parallax";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ethos Roast — Brewed to Perfection, Served with Passion" },
      { name: "description", content: "Premium artisan coffee, small-batch roasted in India. Explore our menu or join our franchise family." },
      { property: "og:title", content: "Ethos Roast — Artisan Coffee" },
      { property: "og:description", content: "Brewed to perfection, served with passion. Small-batch artisan coffee from India." },
      { property: "og:image", content: heroCup },
    ],
  }),
  component: HomePage,
});

const highlights = [
  { kicker: "01", title: "Premium Beans", body: "Single-origin estates in Karnataka & Kerala. 100% traceable, ethically sourced." },
  { kicker: "02", title: "Fresh Brewing", body: "Roasted in micro-batches and served within 14 days for peak aromatic clarity." },
  { kicker: "03", title: "Franchise Ready", body: "A proven model with end-to-end training, supply chain, and brand systems." },
];

const featured = [
  { name: "Single Origin Espresso", img: beans, note: "Notes of Dark Chocolate & Toasted Hazelnut" },
  { name: "The Signature Pour-Over", img: pourover, note: "Bright, floral, lingering finish" },
  { name: "Heritage Cold Brew", img: plant, note: "18-hour steep, velvet body" },
];

const testimonials = [
  { quote: "The closest thing to a perfect cup I've had outside of Italy. Ethos has redefined coffee in Bengaluru.", name: "Ananya R.", role: "Mumbai" },
  { quote: "We partnered with Ethos in 2022. Two outlets later, the brand still feels personal and the support is unmatched.", name: "Vikram S.", role: "Franchise Partner, Pune" },
  { quote: "Every visit feels like a ritual. The baristas know your name and your roast preference.", name: "Meera K.", role: "Bengaluru" },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-12 md:pt-20 pb-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          <Reveal className="relative z-10">
            <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-honey mb-8">
              <span className="size-1 rounded-full bg-honey" />
              Est. Heritage Roasters · India
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] text-balance mb-8 font-medium">
              <span className="italic">Brewed to perfection,</span>
              <br />
              served with passion.
            </h1>
            <p className="max-w-[52ch] text-lg text-mocha/75 mb-10 leading-relaxed">
              Experience the alchemy of small-batch roasting and precision brewing. An artisan collective bringing the soul of the farm to the heart of your neighborhood.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/menu" className="bg-honey text-cream px-8 py-4 rounded-sm text-sm font-medium hover:brightness-110 active:scale-95 transition-all">
                Explore the Menu
              </Link>
              <Link to="/franchise" className="px-8 py-4 rounded-sm text-sm font-medium ring-1 ring-mocha/15 hover:bg-mocha/5 transition-colors">
                Own a Franchise
              </Link>
            </div>
          </Reveal>

          {/* Hero visual */}
          <div className="relative h-[480px] md:h-[600px]">
            <Parallax speed={0.15} className="absolute -top-10 -right-10 w-72 h-72 bg-honey/15 rounded-full blur-3xl" >
              <div />
            </Parallax>
            <Parallax speed={0.25} className="absolute bottom-0 left-0 w-40 h-40 bg-mocha/10 rounded-full blur-3xl">
              <div />
            </Parallax>

            {/* Decorative ring */}
            <ScrollRotate className="absolute inset-0 grid place-items-center pointer-events-none">
              <svg viewBox="0 0 400 400" className="w-[110%] h-[110%] opacity-30">
                <defs>
                  <path id="circle" d="M 200,200 m -160,0 a 160,160 0 1,1 320,0 a 160,160 0 1,1 -320,0" />
                </defs>
                <text fill="#3c2f2c" fontSize="14" letterSpacing="6" fontFamily="Instrument Sans">
                  <textPath href="#circle">FARM · ROAST · GRIND · BREW · POUR · SIP · FARM · ROAST · GRIND · BREW · POUR · SIP ·</textPath>
                </text>
              </svg>
            </ScrollRotate>

            <div className="absolute inset-0 grid place-items-center">
              <div className="relative w-[320px] md:w-[400px] aspect-[4/5] animate-float">
                <img
                  src={heroCup}
                  alt="Steaming espresso cup"
                  width={1024}
                  height={1280}
                  className="w-full h-full object-cover rounded-sm shadow-2xl"
                />
                {/* Steam */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-12 bg-gradient-to-t from-transparent via-cream/60 to-transparent rounded-full blur-md animate-steam" />
                <span className="absolute top-2 left-[45%] w-1.5 h-10 bg-gradient-to-t from-transparent via-cream/40 to-transparent rounded-full blur-md animate-steam" style={{ animationDelay: "0.8s" }} />
                <span className="absolute top-2 left-[55%] w-1.5 h-10 bg-gradient-to-t from-transparent via-cream/40 to-transparent rounded-full blur-md animate-steam" style={{ animationDelay: "1.6s" }} />
              </div>
            </div>

            <div className="absolute bottom-0 right-0 bg-cream/90 backdrop-blur-sm p-4 border border-mocha/10 max-w-[200px] hidden md:block">
              <div className="font-mono text-[9px] uppercase tracking-widest text-mocha/50 mb-1">Current Roast</div>
              <div className="text-sm font-serif font-medium">Single Origin Coorg</div>
              <div className="text-xs text-mocha/60">Bergamot & Jasmine</div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="py-24 bg-paper">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4 font-medium">Why Ethos</h2>
            <p className="text-mocha/70">Three commitments that shape every cup we serve and every store we open.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-px bg-mocha/10 border border-mocha/10">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 120} className="bg-cream p-10 group hover:bg-paper transition-colors">
                <div className="font-mono text-[10px] text-honey mb-12">({h.kicker})</div>
                <h3 className="text-2xl mb-3">{h.title}</h3>
                <p className="text-sm text-mocha/70 leading-relaxed">{h.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <Reveal>
              <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-4 block">The Collection</span>
              <h2 className="font-serif text-4xl md:text-5xl font-medium max-w-[20ch]">Hand-crafted favourites.</h2>
            </Reveal>
            <Link to="/menu" className="text-sm font-medium border-b border-honey pb-1 text-honey">
              View the full menu →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((f, i) => (
              <Reveal key={f.name} delay={i * 150} className={`group ${i === 1 ? "md:mt-16" : ""}`}>
                <div className="card-tilt overflow-hidden rounded-sm mb-6 outline-1 outline-mocha/5">
                  <img src={f.img} alt={f.name} loading="lazy" className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="font-serif text-2xl mb-2">{f.name}</h3>
                <p className="text-sm text-mocha/70 leading-relaxed">{f.note}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FRANCHISE BANNER */}
      <section className="py-32 bg-mocha text-cream relative overflow-hidden">
        <Parallax speed={0.2} className="absolute inset-0 opacity-15">
          <img src={beans} alt="" className="w-full h-full object-cover" />
        </Parallax>
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-6">Growth Opportunity</span>
          <Reveal>
            <h2 className="font-serif text-5xl md:text-6xl text-balance leading-tight mb-8 max-w-[20ch] font-medium mx-auto">
              Carry the torch of artisanal excellence.
            </h2>
          </Reveal>
          <p className="max-w-[48ch] text-cream/70 mb-12">
            Join our expanding family of franchise partners. We provide the sourcing, training and brand soul—you provide the local heart.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/franchise" className="bg-cream text-mocha px-8 py-4 rounded-sm text-sm font-medium hover:bg-latte transition-colors">
              Become a Partner
            </Link>
            <Link to="/about" className="px-8 py-4 rounded-sm text-sm font-medium border border-cream/20 hover:bg-cream/5 transition-colors">
              Our Philosophy
            </Link>
          </div>
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 text-left">
            {[
              ["12+", "Active States"],
              ["18mo", "Avg. ROI Period"],
              ["24/7", "Supply Support"],
              ["85%", "Retention Rate"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-honey font-serif text-4xl mb-2">{v}</div>
                <div className="text-[10px] uppercase tracking-widest text-cream/40">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-16 max-w-xl">
            <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-4 block">Voices</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium">What our community says.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <figure className="bg-paper p-8 rounded-sm h-full flex flex-col">
                  <div className="text-honey font-serif text-5xl leading-none mb-4">"</div>
                  <blockquote className="font-serif text-xl leading-snug italic flex-1">{t.quote}</blockquote>
                  <figcaption className="mt-6 text-sm">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-mocha/50 text-xs">{t.role}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
