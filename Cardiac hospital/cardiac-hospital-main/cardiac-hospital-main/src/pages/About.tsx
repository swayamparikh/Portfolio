import { ShieldCheck, Heart, Award, Cpu, Building2, FlameKindling, Landmark, MapPin, Milestone, Users } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export function About() {
  const values = [
    {
      title: "Patient-Centered Compassion",
      description: "Our treatment pathways are oriented around safety, comfort, and direct clear medical guidance, guaranteeing zero unrequested overhead or treatment delay.",
      iconName: Heart
    },
    {
      title: "Scientific Rigour & Precision",
      description: "Implementing evidence-based therapies, following strict international cardiac society protocols, and continuously upgrading our clinical assets.",
      iconName: ShieldCheck
    },
    {
      title: "Absolute Financial Transparency",
      description: "Every package cost, stent charge, valve option, and ICU bedside rate is transparently communicated to families, offering multiple options to suit financial layouts.",
      iconName: Landmark
    }
  ];

  const infrastructureHighlights = [
    {
      facility: "Siemens Bi-Plane Cath Lab",
      purpose: "Enables simultaneous frontal and lateral imaging of cardiac blocks, cutting dye consumption by 40% and shortening angioplasty procedural windows."
    },
    {
      facility: "Pre-Operative Cardiac ICU",
      purpose: "State-of-the-art bed spaces featuring continuous centralized monitoring, bedside echocardiograms, and real-time oxygenation profiling."
    },
    {
      facility: "Ultra-Clean Surgical Theatres",
      purpose: "Laminar airflows filtering airborne particulate matter, maintaining complete sterility for complex valve bypass operations."
    },
    {
      facility: "Advanced Diagnostic Suite",
      purpose: "Housing ultra-quiet 3T MRI, 128-slice rapid CT coronary angiography, and high-performance Spirometer (PFT) models."
    }
  ];

  return (
    <div id="about-us-container" className="bg-slate-50 min-h-screen">
      {/* HEADER BANNER */}
      <section className="relative py-16 bg-slate-900 text-white overflow-hidden grid-clinical-pattern">
        <div className="absolute inset-0 bg-sky-950/40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3">
          <ScrollReveal direction="down" delay={0.1}>
            <span className="text-xs uppercase font-bold tracking-widest text-sky-400">
              Who We Are
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              A Legacy of Trust, Precision & Healing
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Serving citizens across Maharashtra for over 15+ years with top-tier Non-invasive Cardiac Diagnostics, Interventional Core Procedures, and robust Multi-Specialty medical integrations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CORE NARRATIVE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Mission Content */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal direction="right" delay={0.1}>
                <span className="text-xs uppercase tracking-widest font-extrabold text-sky-600">
                  Our Identity
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
                  Building Healthy Hearts & Comprehensive Care Pathways
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mt-4">
                  Born as a focused pediatric cardiac therapy room, Pulse Hospital has transitioned into a highly advanced 120-bed multi-specialty clinical hub. Under the direct leadership of Dr. Arvind Mahajan, the clinic integrates world-class interventional heart protocols while supporting dedicated clinics for joint recovery, diabetic monitoring, and critical respiratory illnesses.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mt-4">
                  Maintaining accreditation from the prestigious National Accreditation Board for Hospitals (NABH), we operate with the simple vision of returning every patient back to an active life with absolute safety and minimal physical discomfort.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <ScrollReveal direction="up" delay={0.2} className="bg-sky-50 p-5 rounded-2xl border border-sky-100">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    <Heart className="h-5 w-5 text-rose-500" />
                    Our Core Vision
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                    To render elite, stress-free clinical therapies accessible, affordable, and warm, establishing absolute benchmarks in cardiac survival variables.
                  </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.3} className="bg-emerald-50 p-5 rounded-2xl border border-emerald-150">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Trusted Accreditations
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                    Governed strictly by global HIPAA patient privacy regulations and audited monthly for zero hospital-acquired infection benchmarks.
                  </p>
                </ScrollReveal>
              </div>
            </div>

            {/* Side visual statistics */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <ScrollReveal direction="left" delay={0.2}>
                <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 space-y-6">
                  <h3 className="font-display font-bold text-lg border-b border-slate-800 pb-3">Pulse Hospital in Numbers</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="font-display text-3xl sm:text-4xl font-extrabold text-sky-400">15+</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Years of Trust</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl sm:text-4xl font-extrabold text-rose-400">15,000+</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Coronary Procedures</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-400">120+</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Patient Bed ICU</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl sm:text-4xl font-extrabold text-amber-400">99.4%</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Angioplasty Success</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                      Licensed Cardiac ambulance fleet with ICU setups
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                      Affiliated with all major cashless health insurance TPA
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY / PRINCIPLES */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Ethical Benchmarks
              </span>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 mt-2 tracking-tight">
                Our Patient-First Philosophy
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                Modern corporate hospitals often put parameters over patience. At Pulse, we align each workflow to ensure complete warmth and medical clarity.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 0.15}>
                <div className="bg-white p-6 rounded-2xl h-full border border-slate-150 flex flex-col items-center text-center shadow-xs">
                  <div className="bg-sky-50 text-sky-600 p-3 rounded-xl mb-4">
                    <v.iconName className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{v.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{v.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED HOSPITAL INFRASTRUCTURE HIGHLIGHTS */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <ScrollReveal direction="right" delay={0.1}>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-600">
                  Critical Care Architecture
                </span>
                <h2 className="font-display font-extrabold text-3xl text-slate-900 mt-2 leading-tight">
                  State-of-the-Art Medical Infrastructure
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mt-2">
                  Healing requires quietness, cleanliness, and instant diagnostic support. Our hospital features a modern layout with quick corridors connecting our EMERGENCY triage directly with the ICCU and Cath Lab.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 inline-block font-mono text-xs text-slate-600">
                  ⚠️ Authorized family access cards required inside ICCU corridors
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {infrastructureHighlights.map((infra, idx) => (
                  <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                    <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-colors h-full flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{infra.facility}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{infra.purpose}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
