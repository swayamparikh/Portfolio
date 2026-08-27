import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book an Appointment — Lustre Auto Studio" },
      { name: "description", content: "Reserve your slot at India's premium detailing studio. Choose a service, pick a time and we'll confirm via WhatsApp." },
      { property: "og:title", content: "Book — Lustre Auto Studio" },
      { property: "og:description", content: "Reserve your detailing slot in seconds." },
      { property: "og:url", content: "/booking" },
    ],
    links: [{ rel: "canonical", href: "/booking" }],
  }),
  component: BookingPage,
});

const SERVICES = [
  "Car Spa & Cleaning",
  "Ceramic Coating",
  "Paint Protection Film (PPF)",
  "Polishing & Rubbing",
  "Interior Detailing",
  "Engine Bay Cleaning",
  "Headlight Restoration",
  "Anti-Rust Coating",
  "Glass Coating",
  "Alloy Wheel Coating",
];

function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    car: "",
    service: SERVICES[0],
    date: "",
    time: "",
  });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const waLink = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Lustre! I'd like to book.\n\nName: ${form.name}\nPhone: ${form.phone}\nCar: ${form.car}\nService: ${form.service}\nDate: ${form.date}\nTime: ${form.time}`,
  )}`;

  return (
    <PageShell>
      <section className="pt-40 pb-12 mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.3em] text-accent">— Reserve a slot</div>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[0.95]">
            Book your <span className="text-shine">detailing.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Fill in your details and we'll confirm your slot on WhatsApp within minutes.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <Field label="Full name">
                    <input required value={form.name} onChange={onChange("name")} className={inputCls} placeholder="Rohan Mehta" />
                  </Field>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Phone">
                      <input required type="tel" value={form.phone} onChange={onChange("phone")} className={inputCls} placeholder="+91 98765 43210" />
                    </Field>
                    <Field label="Car model">
                      <input required value={form.car} onChange={onChange("car")} className={inputCls} placeholder="BMW M340i" />
                    </Field>
                  </div>
                  <Field label="Service">
                    <select required value={form.service} onChange={onChange("service")} className={inputCls}>
                      {SERVICES.map((s) => (
                        <option key={s} value={s} className="bg-background">{s}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Preferred date">
                      <input required type="date" value={form.date} onChange={onChange("date")} className={inputCls} />
                    </Field>
                    <Field label="Preferred time">
                      <input required type="time" value={form.time} onChange={onChange("time")} className={inputCls} />
                    </Field>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-3">
                    <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-all">
                      Confirm Booking <ArrowRight className="h-4 w-4" />
                    </button>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 text-sm font-semibold hover:border-[#25D366] hover:text-[#25D366] transition-all"
                    >
                      <MessageCircle className="h-4 w-4" /> Book via WhatsApp
                    </a>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <CheckCircle2 className="h-16 w-16 text-accent mx-auto" />
                  <h2 className="mt-6 text-3xl font-bold">Booking received!</h2>
                  <p className="mt-3 text-muted-foreground">We'll confirm your slot on WhatsApp within minutes.</p>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4 fill-white" /> Open WhatsApp Chat
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}