import { Key, useState } from 'react';
import { 
  HeartPlus, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck, 
  Activity, 
  Stethoscope, 
  Users, 
  FlameKindling, 
  ChevronRight, 
  Heart, 
  Clock, 
  AlertTriangle,
  Brain,
  Bone,
  Wind,
  PlusSquare,
  ShieldAlert
} from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { DEPARTMENTS, TESTIMONIALS, SYMPTOMS_GUIDE, SERVICES } from '../data';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  onEmergencyTrigger: () => void;
}

export function Home({ setCurrentPage, onEmergencyTrigger }: HomeProps) {
  const [activeSymptomIndex, setActiveSymptomIndex] = useState(0);

  const handleBookNow = () => {
    setCurrentPage('appointment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLearnMore = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="home-page-container" className="relative">
      
      {/* SECTION 1: HERO CONTAINER (Clinically Clean and Reassuring) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 py-16 md:py-24 grid-clinical-pattern">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Call To Action Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal direction="right" delay={0.1}>
                <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-sky-200/50">
                  <Activity className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                  <span>NABH Accredited Multi-Specialty Excellence</span>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 leading-[1.08] mt-2">
                  Advanced Heart Care <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-700 to-rose-600">
                    You Can Trust.
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                  Pulse Cardiac & Multi-Specialty Hospital brings together top-tier cardiologists, cutting-edge Siemens Cath Lab facilities, and highly capable specialists across critical branches (Neurology, Lungs, Joints, and Internal Medicine) to guide your holistic recovery.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.4}>
                {/* Hero Benchmarks Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-2">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>24/7 Dedicated Cardiac Emergency</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>Gold Standard Bi-Plane Cath Lab</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>Post-Trauma Neurological ICU</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>Paperless HIPAA Encrypted Care</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Action Coordinates */}
              <ScrollReveal direction="up" delay={0.5}>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    id="hero-book-apt-btn"
                    onClick={handleBookNow}
                    className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-sky-600/15 transition-all text-sm sm:text-base cursor-pointer"
                  >
                    <span>Schedule Heart Checkup</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>

                  <button
                    id="hero-emergency-btn"
                    onClick={onEmergencyTrigger}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-rose-600 font-bold px-7 py-3.5 rounded-xl border-2 border-rose-150 transition-all text-sm sm:text-base cursor-pointer shadow-sm"
                  >
                    <PhoneCall className="h-4.5 w-4.5 animate-bounce" />
                    <span>24x7 Ambulance / Call ER</span>
                  </button>
                </div>
              </ScrollReveal>
            </div>

            {/* Hero Visual Block */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <ScrollReveal direction="left" delay={0.3}>
                <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-full">
                  {/* Outer decorative ring to hold doctor photo */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-400 to-rose-500 rounded-[2.5rem] transform rotate-3 scale-102 opacity-20 blur" />
                  
                  <div className="relative rounded-[2.5rem] border-4 border-white bg-slate-100 overflow-hidden shadow-2xl block aspect-square">
                    {/* Reliable clinical picture of a comforting cardiologist consultations */}
                    <img
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600&h=600"
                      alt="Chief Cardiologist consultation at Pulse Hospital"
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Suspended Overlap Card: Heart Rate Live Indicator */}
                  <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-sky-50 flex items-center gap-3 animate-fadeIn">
                    <div className="bg-rose-500 text-white p-2.5 rounded-xl">
                      <Heart className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cardiac Care Live</p>
                      <p className="font-display font-extrabold text-lg text-slate-800">45 Min Door-To-Needle</p>
                      <p className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        Dedicated ICU Ready
                      </p>
                    </div>
                  </div>

                  {/* Suspended Overlap Card 2: Joint & Neuro Emergency ready */}
                  <div className="absolute -top-6 -right-6 hidden sm:flex bg-white py-3 px-4 rounded-xl shadow-lg border border-sky-50 items-center gap-2">
                    <PlusSquare className="h-5 w-5 text-sky-600" />
                    <span className="text-xs font-bold text-slate-700">Multi-Specialty Integrated Bedside Care</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: RED Helplines / Rapid Assessment Banner */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800 relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6">
              <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-base">Cardiac Primary Angioplasty</h3>
                <p className="text-xs text-slate-400 mt-0.5">Emergency blockage dilation within golden minutes.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6">
              <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 text-sky-400 shrink-0">
                <Brain className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-base">Acute Brain Stroke Response</h3>
                <p className="text-xs text-slate-400 mt-0.5">Rapid thrombolytic therapy to reverse neural deficits.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
                <Clock className="h-7 w-7 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-bold text-base">Never Closed • Emergency Trauma</h3>
                <p className="text-xs text-slate-400 mt-0.5">Fully staffed by ICU Registrars and surgeons 24x7.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SYMPTOMS TO EXAMINE (Aesthetic checklist as requested) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
                Symptom Care Management
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3 tracking-tight">
                Warning Symptoms to Watch
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2">
                Cardiology and neurological concerns aren't always sudden. Knowing how to identify early markers can dramatically influence healthcare survival and post-event functional outcomes.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Symptom Tab Selector */}
            <div className="lg:col-span-5 space-y-2.5">
              {SYMPTOMS_GUIDE.map((guide, index) => {
                const isActive = activeSymptomIndex === index;
                const isEmergency = guide.urgency === 'emergency';
                return (
                  <button
                    key={guide.id}
                    id={`symptom-tab-${guide.id}`}
                    onClick={() => setActiveSymptomIndex(index)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-sky-50 border-sky-500 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-sky-500 text-white' 
                          : isEmergency 
                            ? 'bg-rose-50 text-rose-600' 
                            : 'bg-slate-200 text-slate-700'
                      }`}>
                        {index === 0 && <Heart className="h-5 w-5" />}
                        {index === 1 && <Wind className="h-5 w-5" />}
                        {index === 2 && <Activity className="h-5 w-5" />}
                        {index === 3 && <PlusSquare className="h-5 w-5" />}
                        {index === 4 && <Brain className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{guide.title}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isEmergency ? 'text-rose-600 animate-pulse' : 'text-slate-500'
                        }`}>
                          Urgency: {guide.urgency}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform ${
                      isActive ? 'text-sky-600 translate-x-1' : ''
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Symptom Active Detail Card */}
            <div className="lg:col-span-7">
              <ScrollReveal direction="none" delay={0.2} id="active-symptom-display">
                <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-150 shadow-md min-h-[380px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                      <h3 className="font-display font-bold text-xl text-slate-950">
                        {SYMPTOMS_GUIDE[activeSymptomIndex].title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        SYMPTOMS_GUIDE[activeSymptomIndex].urgency === 'emergency'
                          ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {SYMPTOMS_GUIDE[activeSymptomIndex].urgency.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {SYMPTOMS_GUIDE[activeSymptomIndex].description}
                    </p>

                    {/* Critical Alarm Markers */}
                    <div className="mt-5">
                      <h4 className="text-xs text-sky-800 uppercase tracking-widest font-extrabold mb-2.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Critical Associated Signs
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {SYMPTOMS_GUIDE[activeSymptomIndex].warningSigns.map((sign, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5 font-medium">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Immediate Action Pathway */}
                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <div className="bg-white p-4 rounded-xl border border-sky-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-400">Recommended Next Step</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                          {SYMPTOMS_GUIDE[activeSymptomIndex].recommendation}
                        </p>
                      </div>
                      
                      {SYMPTOMS_GUIDE[activeSymptomIndex].urgency === 'emergency' ? (
                        <button
                          onClick={onEmergencyTrigger}
                          className="px-4 py-2 border-2 border-rose-500 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer select-none"
                        >
                          Emergency Helpline
                        </button>
                      ) : (
                        <button
                          onClick={handleBookNow}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shrink-0 shadow transition-colors cursor-pointer select-none"
                        >
                          Book Screening
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DEPARTMENTS (Showing deep multi-specialty footprint) */}
      <section className="py-16 md:py-24 bg-sky-50/50 border-y border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                Multi-Specialty Scope
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3 tracking-tight">
                Our Specialized Healthcare Departments
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                While pioneering advanced cardiovascular treatment, we host highly capable centers for brain strokes, joint restoration, and respiratory illnesses.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept, idx) => (
              <ScrollReveal key={dept.id} direction="up" delay={0.1 * idx} className="h-full">
                <div className="bg-white p-6 rounded-2xl h-full border border-slate-150 hover:border-sky-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                        {dept.id === 'cardiology' && <Heart className="h-6 w-6" />}
                        {dept.id === 'ct-surgery' && <HeartPlus className="h-6 w-6" />}
                        {dept.id === 'neurology' && <Brain className="h-6 w-6" />}
                        {dept.id === 'pulmonology' && <Wind className="h-6 w-6" />}
                        {dept.id === 'joints-ortho' && <Bone className="h-6 w-6" />}
                        {dept.id === 'internal-med' && <Stethoscope className="h-6 w-6" />}
                      </div>
                      <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                        {dept.totalDoctors} Specialists
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-slate-950 mb-2">
                      {dept.name}
                    </h3>

                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {dept.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Highlighted Care</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{dept.keySpecialty}</p>

                    <button
                      onClick={() => handleLearnMore('services')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 mt-4 cursor-pointer"
                    >
                      <span>Explore treatments</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: "WHY CHOOSE US" ACCREDITATION PATHWAY */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual highlight of clinical safety */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="right" delay={0.2}>
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-200/30 rounded-[2rem] transform -rotate-2 scale-102" />
                  <div className="relative rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3] bg-slate-100 border-4 border-white">
                    <img
                      src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
                      alt="Multi-specialty modern critical ICU ICU setup"
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-slate-950/80 text-white py-2 px-3 text-xs font-medium rounded-lg backdrop-blur-sm shadow border border-slate-800">
                    Siemens Cath Lab & Bi-Plane Angiography
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Narrated Values */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal direction="left" delay={0.3}>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                  Exceptional Hospital Benchmarks
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2 tracking-tight">
                  Setting Gold Standards in Clinical Excellence & Safety
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We believe clinical outcomes should speak for themselves. Pulse Hospital was built to ensure patients have quick access to high-precision critical equipment and compassionate experts.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex gap-4">
                    <div className="bg-sky-100 p-2 text-sky-700 rounded-lg shrink-0 h-10 w-10 flex items-center justify-center">
                      <Users className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Highly Credentialed Medical Board</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Our clinical experts possess post-doctoral specializations (DM Cardiology, MCh Cardiothoracic Surgery, UK-based Joint replacements fellowships) with average experiences exceeding 15+ years.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-emerald-100 p-2 text-emerald-700 rounded-lg shrink-0 h-10 w-10 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Infection-Free Laminar Flow Theatres</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Equipped with high-efficiency air filters ensuring less than 0.01% infection rates across bypass surgery and joint-replacement workflows.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-rose-100 p-2 text-rose-700 rounded-lg shrink-0 h-10 w-10 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Gold Standard ICU & Triage response</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Equipped with high-precision ventilators, continuous cardiac vital tracking, and dedicated anesthesiologists permanently stationed on-site.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PATIENT RECOVERY REVIEWS */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full">
                Heartwarming Gratitude
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-3 tracking-tight">
                Patient Recovery Chronicles
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Read real emotional testimonials of patients returning to fully active, healthy, stress-free lives.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((col, idx) => (
              <ScrollReveal key={col.id} direction="up" delay={idx * 0.15}>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-150 flex flex-col justify-between h-full hover:shadow transition-shadow">
                  <div>
                    {/* Stars bar */}
                    <div className="flex text-amber-500 gap-0.5 mb-4">
                      {Array.from({ length: col.rating }).map((_, rIdx) => (
                        <span key={rIdx} className="text-lg">★</span>
                      ))}
                    </div>

                    <p className="text-slate-600 text-sm italic leading-relaxed mb-6">
                      "{col.quote}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 text-sm">{col.name}</h4>
                      <p className="text-xs text-slate-500">{col.age} Years • Treated for <strong className="text-slate-700">{col.conditionTreated}</strong></p>
                    </div>
                    {col.doctorName && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 py-1 px-2.5 rounded-lg font-bold">
                        under {col.doctorName}
                      </span>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: EMERGENCY COUNSULT BOTTOM HELPLINES */}
      <section className="py-12 bg-sky-600 text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500 rounded-full opacity-30 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                Suspicious of persistent heart pressure or physical stroke?
              </h2>
              <p className="text-sky-100 text-sm mt-1 max-w-2xl">
                Do not wait for symptoms to severe. Pulse Hospital’s emergency cardiac and ambulance response vectors operate 24 hours a day, 365 days a year.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
              <button
                onClick={onEmergencyTrigger}
                className="bg-red-600 hover:bg-red-700 text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
              >
                <PhoneCall className="h-4.5 w-4.5 animate-bounce" />
                <span>Call Emergency Ambulance</span>
              </button>

              <button
                onClick={handleBookNow}
                className="bg-white text-sky-700 hover:bg-sky-50 py-3.5 px-6 rounded-xl font-bold transition-all text-sm cursor-pointer border border-sky-200 text-center select-none"
              >
                Online Doctor Scheduling →
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
