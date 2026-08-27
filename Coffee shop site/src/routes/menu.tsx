import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import espresso from "@/assets/menu-espresso.jpg";
import cappuccino from "@/assets/menu-cappuccino.jpg";
import latte from "@/assets/menu-latte.jpg";
import cold from "@/assets/menu-cold.jpg";
import frappe from "@/assets/menu-frappe.jpg";
import tea from "@/assets/menu-tea.jpg";
import bakery from "@/assets/menu-bakery.jpg";
import { Reveal } from "@/components/parallax";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "The Menu — Ethos Roast" },
      { name: "description", content: "Espresso, cappuccino, latte, cold coffee, frappes, tea, and fresh bakery — crafted with care." },
      { property: "og:title", content: "The Menu — Ethos Roast" },
      { property: "og:description", content: "Espresso, cappuccino, latte, cold coffee, frappes, tea, and bakery." },
    ],
  }),
  component: MenuPage,
});

type Item = { name: string; desc: string; price: string };
type Category = { id: string; label: string; img: string; items: Item[] };

const categories: Category[] = [
  { id: "espresso", label: "Espresso", img: espresso, items: [
    { name: "Single Shot", desc: "A pure expression of our house blend.", price: "₹140" },
    { name: "Doppio", desc: "Double shot, double depth.", price: "₹180" },
    { name: "Americano", desc: "Espresso lengthened with hot water.", price: "₹190" },
    { name: "Macchiato", desc: "Espresso 'stained' with foamed milk.", price: "₹210" },
  ]},
  { id: "cappuccino", label: "Cappuccino", img: cappuccino, items: [
    { name: "Classic Cappuccino", desc: "Equal parts espresso, steamed milk, foam.", price: "₹230" },
    { name: "Dry Cappuccino", desc: "Less milk, more pillowy foam.", price: "₹240" },
    { name: "Cardamom Cappuccino", desc: "Aromatic Indian spice meets crema.", price: "₹260" },
  ]},
  { id: "latte", label: "Latte", img: latte, items: [
    { name: "Vanilla Latte", desc: "Madagascar vanilla, silky steamed milk.", price: "₹270" },
    { name: "Caramel Latte", desc: "House caramel, drizzle finish.", price: "₹280" },
    { name: "Hazelnut Oat Latte", desc: "Roasted hazelnut, oat milk.", price: "₹300" },
  ]},
  { id: "cold", label: "Cold Coffee", img: cold, items: [
    { name: "Cold Brew", desc: "18-hour slow steep, velvet body.", price: "₹260" },
    { name: "Iced Americano", desc: "Espresso over ice and filtered water.", price: "₹220" },
    { name: "Nitro Cold Brew", desc: "Nitrogen-infused, cascading head.", price: "₹320" },
  ]},
  { id: "frappes", label: "Frappes", img: frappe, items: [
    { name: "Mocha Frappe", desc: "Dark chocolate, espresso, whipped cream.", price: "₹310" },
    { name: "Hazelnut Frappe", desc: "Toasted hazelnut, espresso ice.", price: "₹320" },
    { name: "Caramel Crunch", desc: "House caramel with toffee bits.", price: "₹330" },
  ]},
  { id: "tea", label: "Tea & Others", img: tea, items: [
    { name: "Masala Chai", desc: "Brewed in milk with whole spices.", price: "₹150" },
    { name: "Earl Grey", desc: "Bergamot-scented black tea.", price: "₹170" },
    { name: "Honey Lemon Ginger", desc: "Caffeine-free wellness brew.", price: "₹180" },
  ]},
  { id: "bakery", label: "Bakery & Snacks", img: bakery, items: [
    { name: "All-Butter Croissant", desc: "Hand-rolled, baked at dawn.", price: "₹160" },
    { name: "Almond Danish", desc: "Frangipane, slivered almonds.", price: "₹190" },
    { name: "Pesto Mushroom Sandwich", desc: "Toasted sourdough, basil pesto.", price: "₹280" },
    { name: "Tiramisu Cup", desc: "Espresso-soaked, mascarpone cream.", price: "₹220" },
  ]},
];

function MenuPage() {
  const [active, setActive] = useState<string>("espresso");
  return (
    <div className="pt-12 pb-32">
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <Reveal>
          <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-6 block">The Menu</span>
          <h1 className="font-serif text-5xl md:text-7xl font-medium max-w-[16ch] leading-[0.95] mb-6">
            A curated <span className="italic">tasting</span> across the spectrum.
          </h1>
          <p className="max-w-[60ch] text-mocha/70 text-lg">
            From the precision of a single espresso shot to seasonal bakery — every item is built around the bean and the moment.
          </p>
        </Reveal>
      </section>

      {/* Category tabs */}
      <section className="border-y border-mocha/10 bg-paper sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto scrollbar-hide py-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActive(c.id);
                document.getElementById(c.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${active === c.id ? "bg-mocha text-cream" : "text-mocha hover:bg-mocha/5"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-24 space-y-32">
        {categories.map((c, idx) => (
          <section key={c.id} id={c.id} className="scroll-mt-40">
            <div className={`grid md:grid-cols-[1fr_1.4fr] gap-12 items-start ${idx % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <Reveal className="card-tilt rounded-sm overflow-hidden outline-1 outline-mocha/5">
                <img src={c.img} alt={c.label} loading="lazy" className="w-full aspect-square object-cover" />
              </Reveal>
              <Reveal delay={150}>
                <span className="font-mono text-[10px] uppercase tracking-widest text-honey">({String(idx + 1).padStart(2, "0")})</span>
                <h2 className="font-serif text-4xl md:text-5xl font-medium mt-3 mb-8">{c.label}</h2>
                <ul className="divide-y divide-mocha/10">
                  {c.items.map((it) => (
                    <li key={it.name} className="py-5 flex items-baseline gap-4 group">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-1">
                          <h3 className="font-serif text-xl">{it.name}</h3>
                          <div className="flex-1 border-b border-dotted border-mocha/20" />
                          <span className="font-mono text-sm text-mocha/80">{it.price}</span>
                        </div>
                        <p className="text-sm text-mocha/60">{it.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
