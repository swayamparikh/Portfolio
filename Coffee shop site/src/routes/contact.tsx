import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Reveal } from "@/components/parallax";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Locations & Contact — Ethos Roast" },
      { name: "description", content: "Find our cafés across India. Reach us by phone, email, or WhatsApp." },
      { property: "og:title", content: "Locations & Contact — Ethos Roast" },
      { property: "og:description", content: "Find our cafés across India. Reach us anytime." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Message too short").max(1000),
});

const locations = [
  { city: "Bengaluru", area: "Indiranagar", addr: "100 Ft Road, 12th Main, Indiranagar", phone: "+91 99999 11111" },
  { city: "Mumbai", area: "Bandra West", addr: "Linking Road, opp. National College", phone: "+91 99999 22222" },
  { city: "Pune", area: "Koregaon Park", addr: "Lane 5, Koregaon Park", phone: "+91 99999 33333" },
  { city: "Hyderabad", area: "Jubilee Hills", addr: "Road No. 36, Jubilee Hills", phone: "+91 99999 44444" },
  { city: "Delhi NCR", area: "Khan Market", addr: "Middle Lane, Khan Market", phone: "+91 99999 55555" },
  { city: "Chennai", area: "Nungambakkam", addr: "Khader Nawaz Khan Road", phone: "+91 99999 66666" },
];

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const r = schema.safeParse(data);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
  }

  return (
    <div className="pt-12 pb-32">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <Reveal>
          <span className="text-honey font-medium text-xs tracking-[0.2em] uppercase mb-6 block">Locations</span>
          <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[0.95] mb-6 max-w-[18ch]">
            Find your <span className="italic">third place.</span>
          </h1>
          <p className="max-w-[56ch] text-mocha/70 text-lg">
            Six cities. Twenty-eight outlets. Always a familiar corner, wherever you are in India.
          </p>
        </Reveal>
      </section>

      {/* MAP */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="rounded-sm overflow-hidden border border-mocha/10 aspect-[16/7]">
          <iframe
            title="Ethos Roast locations"
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7783435.5!2d77.1025!3d19.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1700000000000"
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-mocha/10 border border-mocha/10">
          {locations.map((l, i) => (
            <Reveal key={l.city + l.area} delay={i * 60} className="bg-cream p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-honey mb-3">{l.city}</div>
              <h3 className="font-serif text-2xl mb-3">{l.area}</h3>
              <p className="text-sm text-mocha/70 mb-4">{l.addr}</p>
              <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="text-sm border-b border-mocha/20 pb-0.5 hover:border-honey hover:text-honey transition-colors">
                {l.phone}
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CONTACT FORM + INFO */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_1.2fr] gap-16">
        <Reveal>
          <span className="text-honey text-xs tracking-[0.2em] uppercase mb-4 block">Reach Us</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-8">Drop us a line.</h2>
          <div className="space-y-6 text-sm">
            <div>
              <div className="text-mocha/50 text-xs uppercase tracking-widest mb-1">Email</div>
              <a href="mailto:hello@ethosroast.in" className="font-serif text-xl hover:text-honey">hello@ethosroast.in</a>
            </div>
            <div>
              <div className="text-mocha/50 text-xs uppercase tracking-widest mb-1">Phone</div>
              <a href="tel:+919999900000" className="font-serif text-xl hover:text-honey">+91 99999 00000</a>
            </div>
            <div>
              <div className="text-mocha/50 text-xs uppercase tracking-widest mb-1">WhatsApp</div>
              <a href="https://wa.me/919999900000" className="inline-flex items-center gap-2 bg-mocha text-cream px-5 py-2.5 rounded-full text-sm hover:bg-roast transition-colors">
                Chat with us <span className="size-1.5 rounded-full bg-honey" />
              </a>
            </div>
            <div className="pt-6 border-t border-mocha/10">
              <div className="text-mocha/50 text-xs uppercase tracking-widest mb-3">Follow</div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-honey">Instagram</a>
                <a href="#" className="hover:text-honey">LinkedIn</a>
                <a href="#" className="hover:text-honey">YouTube</a>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          {sent ? (
            <div className="bg-paper border border-honey/30 p-10 rounded-sm">
              <h3 className="font-serif text-3xl mb-2">Got it.</h3>
              <p className="text-mocha/70">We'll be in touch within a day or two.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5 bg-paper p-8 rounded-sm">
              <div>
                <label htmlFor="name" className="block text-xs uppercase tracking-widest text-mocha/60 mb-2">Name</label>
                <input id="name" name="name" maxLength={100} className="w-full bg-cream border border-mocha/15 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-honey" />
                {errors.name && <p className="text-xs text-red-700 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-xs uppercase tracking-widest text-mocha/60 mb-2">Email</label>
                <input id="email" name="email" type="email" maxLength={255} className="w-full bg-cream border border-mocha/15 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-honey" />
                {errors.email && <p className="text-xs text-red-700 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="message" className="block text-xs uppercase tracking-widest text-mocha/60 mb-2">Message</label>
                <textarea id="message" name="message" rows={5} maxLength={1000} className="w-full bg-cream border border-mocha/15 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-honey" />
                {errors.message && <p className="text-xs text-red-700 mt-1">{errors.message}</p>}
              </div>
              <button className="w-full bg-mocha text-cream py-4 rounded-sm text-sm font-medium hover:bg-roast transition-colors">
                Send Message
              </button>
            </form>
          )}
        </Reveal>
      </section>
    </div>
  );
}
