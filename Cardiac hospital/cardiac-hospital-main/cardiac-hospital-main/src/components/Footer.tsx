import { HeartPulse, MapPin, Phone, Mail, Clock, Award, ShieldAlert } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export function Footer({ setCurrentPage }: FooterProps) {
  const handleFooterLinkClick = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="hospital-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Advisory Accreditation Info */}
      <div className="bg-sky-950 py-4 border-b border-sky-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-sky-200">
            <Award className="h-5 w-5 text-emerald-400 shrink-0" />
            <p>
              <strong className="text-white">NABH Accredited Tertiary Care</strong> • ISO 9001:2015 Cardiology & Multi-specialty Excellence Center
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-5 text-sky-300">
            <span>✓ Certified ICCU & Cath Lab</span>
            <span>✓ Beating Heart Specialist Suite</span>
            <span>✓ 24/7 Stroke response unit</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Blocks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-sky-600 p-2 rounded-xl">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                PULSE HOSPITAL
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India’s premier institute for non-invasive cardiodiagnostics, complex beating-heart interventions, and multi-specialty clinical excellence. Spearheading trust, precision, and healthcare safety.
            </p>
            <div className="pt-2 text-xs text-rose-400 flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Emergency Mobile Cardiac Care: +91 9999-108-108</span>
            </div>
          </div>

          {/* Quick Specialties Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-4 pb-2 border-b border-slate-800">
              Our Specialties
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleFooterLinkClick('services')}
                  className="hover:text-emerald-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Interventional Cardiology
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('services')}
                  className="hover:text-emerald-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Cardiothoracic Surgery (CABG)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('services')}
                  className="hover:text-emerald-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Neurology & Stroke Protocol
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('services')}
                  className="hover:text-emerald-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Pulmonology & Asthma Clinics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('services')}
                  className="hover:text-emerald-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Orthopedics & Joint Care
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('services')}
                  className="hover:text-emerald-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Internal Medicine & Diabetology
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-4 pb-2 border-b border-slate-800">
              Useful Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleFooterLinkClick('home')}
                  className="hover:text-sky-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer text-left"
                >
                  Hospital Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('about')}
                  className="hover:text-sky-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer text-left"
                >
                  Accreditations & Labs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('services')}
                  className="hover:text-sky-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer text-left"
                >
                  Cardiac Checkup Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('doctors')}
                  className="hover:text-sky-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer text-left"
                >
                  Find a Consultant
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('appointment')}
                  className="hover:text-sky-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer text-left"
                >
                  Book Outpatient Slot
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLinkClick('contact')}
                  className="hover:text-sky-400 text-slate-400 hover:translate-x-1 transition-transform cursor-pointer text-left"
                >
                  Reach Us & Core Timings
                </button>
              </li>
            </ul>
          </div>

          {/* Clinic Contact Coordinates */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase pb-2 border-b border-slate-800">
              HQ Coordinates
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-2.5 items-start">
                <MapPin className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  Pulse Hospital Towers, 404, Senapati Bapat Marg, Shivaji Nagar, Pune, Maharashtra - 411016, India.
                </span>
              </div>
              <div className="flex gap-2.5 items-center">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="select-all">+91 20-6677-1111 / 2222</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="hover:text-sky-400 transition-colors select-all">info@pulseheartcare.org</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <Clock className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">OPD Consultation Hours</p>
                  <p className="text-xs text-slate-500">Mon - Sat: 08:00 AM - 08:00 PM</p>
                  <p className="text-xs text-rose-400 font-semibold mt-1">EMERGENCY & ER: open 24x7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Area */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 space-y-4 text-xs text-slate-500 text-center">
          <p className="max-w-4xl mx-auto leading-relaxed border border-slate-800 p-4 rounded-xl bg-slate-950/40">
            <span className="text-rose-400/90 uppercase font-bold block mb-1">⚖ MEDICAL DISCLAIMER</span>
            This website is designed and maintained purely for general patient awareness, public cataloging, and quick educational convenience. Information detailed online is strictly NOT a substitute for professional, in-person medical diagnosis, therapy, treatment, or critical emergency triage. Always seek direct immediate advice from certified medical experts or rush to emergency stroke/heart specialists in case of continuous chest tightness or sudden motor numbness.
          </p>

          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} Pulse Cardiac & Multi-Specialty Hospital Private Limited. All Rights Reserved. Fully Encrypted HIPAA Secure Portal.
          </p>
        </div>
      </div>
    </footer>
  );
}
