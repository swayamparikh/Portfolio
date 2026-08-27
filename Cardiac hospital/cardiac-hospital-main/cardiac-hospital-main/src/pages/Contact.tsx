import { useState, FormEvent } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  PhoneCall, 
  Building,
  Heart
} from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

interface ContactProps {
  onEmergencyTrigger: () => void;
}

export function Contact({ onEmergencyTrigger }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  const handleQuerySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorStatus('Please complete name, email, and message fields.');
      return;
    }
    setErrorStatus('');
    setIsSent(true);
  };

  return (
    <div id="contact-page-container" className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner introduction */}
        <ScrollReveal direction="down" delay={0.1}>
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
              Get in Touch
            </span>
            <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight mt-3">
              Reach Our Care Coordinators
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Have clinical checkup queries? Contact our Pune tertiary hub or connect with emergency cardiac transport squads immediately.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Hospital Coordinates & Emergency Helplines (Lg: col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction="right" delay={0.2}>
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                
                <h3 className="font-display font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Building className="h-5 w-5 text-sky-600" />
                  Primary Facility Information
                </h3>

                {/* Contact items */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                  
                  {/* Address */}
                  <div className="flex gap-3.5 items-start">
                    <MapPin className="h-5 w-5 text-sky-605 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 font-bold block">Hospital Location Address</strong>
                      <p className="text-slate-500 mt-1 leading-relaxed">
                        Pulse Hospital Towers, 404, Senapati Bapat Marg, Shivaji Nagar, Pune, Maharashtra - 411016, India.
                      </p>
                    </div>
                  </div>

                  {/* Phone contact */}
                  <div className="flex gap-3.5 items-start">
                    <Phone className="h-5 w-5 text-sky-605 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 font-bold block">Patient Helpdesk Lines</strong>
                      <p className="text-slate-500 mt-1 select-all font-semibold">
                        +91 20-6677-1111 / 2222
                      </p>
                    </div>
                  </div>

                  {/* Email contact */}
                  <div className="flex gap-3.5 items-start">
                    <Mail className="h-5 w-5 text-sky-605 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 font-bold block">Administrative Email Address</strong>
                      <p className="text-slate-500 mt-1 select-all font-semibold">
                        info@pulseheartcare.org
                      </p>
                    </div>
                  </div>

                  {/* Operational hours */}
                  <div className="flex gap-3.5 items-start bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <Clock className="h-5 w-5 text-sky-605 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 font-bold block">Clinic & OPD Registry Times</strong>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                        Monday to Saturday: 08:00 AM - 08:00 PM <br />
                        Sunday OPD hours: 09:00 AM - 01:00 PM (Emergency only) <br />
                        <span className="text-rose-600 font-semibold block mt-1">EMERGENCY & ER DOCTOR: 24/7/365 Open</span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Direct emergency hotline trigger */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={onEmergencyTrigger}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md shadow-red-500/15"
                  >
                    <PhoneCall className="h-4.5 w-4.5 animate-bounce" />
                    <span>Emergency Ambulance Line</span>
                  </button>
                </div>

              </div>
            </ScrollReveal>
          </div>

          {/* Column 2: Interactive Contact query Form (Lg: col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal direction="left" delay={0.2}>
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm min-h-[432px] flex flex-col justify-center">
                
                {isSent ? (
                  <div className="text-center py-8 space-y-4 animate-fadeIn">
                    <div className="bg-emerald-100 p-3 rounded-full inline-block text-emerald-600 mx-auto">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="font-display font-extrabold text-xl text-slate-900">
                      General Helpdesk Request Dispatch Succesful!
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Pulse Hospital. Our patient welfare officer will review your clinical diagnostic inquiry and call back on the phone number supplied within 4-6 business hours.
                    </p>
                    <button
                      onClick={() => {
                        setIsSent(false);
                        setName('');
                        setEmail('');
                        setPhone('');
                        setMessage('');
                      }}
                      className="text-xs text-sky-600 font-bold hover:underline cursor-pointer bg-slate-50 border px-4 py-2 rounded-lg"
                    >
                      Dispatch another query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuerySubmit} className="space-y-4">
                    <h3 className="font-display font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3">
                      Dispatch Direct Consultation Queries
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          placeholder="E.g., Animesh Joshi"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-sky-505 transition-all outline-none"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Email ID *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          placeholder="name@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-sky-505 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="+91 90000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-sky-505 transition-all outline-none"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Specific Question / Medical Query *
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        placeholder="Inquire about cardiac checkups, surgery estimates, diagnostic prep details..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-sky-505 transition-all outline-none"
                      />
                    </div>

                    {errorStatus && (
                      <p className="text-[10px] text-red-500 font-bold">{errorStatus}</p>
                    )}

                    <button
                      id="contact-form-submit-btn"
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm cursor-pointer shadow"
                    >
                      <Send className="h-4 w-4" />
                      <span>Dispatch Query</span>
                    </button>
                  </form>
                )}

              </div>
            </ScrollReveal>
          </div>

        </div>

        {/* SECTION 3: STYLISH MAPPED DIRECTIONS (India-based Pune) */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-150 shadow-sm p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-905 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sky-600" />
                   शिवाजी नगर (Shivaji Nagar) Tertiary Campus Coordinates
                </h3>
                <p className="text-slate-400 text-xs">Directly opposite Shivaji Nagar Police HQ, SB Marg.</p>
              </div>

              <div className="flex items-center gap-2.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 text-[10px] sm:text-xs font-bold text-emerald-800">
                <span className="w-1.5 h-1.5 bg-emerald-550 rounded-full animate-pulse" />
                <span>Cardiac Ambulance Gateway Clean Corridor</span>
              </div>
            </div>

            {/* Simulated premium styled vector Map representation, highly architectural */}
            <div className="relative h-80 bg-sky-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center">
              
              {/* Background grid clinical pattern style */}
              <div className="absolute inset-0 grid-clinical-pattern opacity-15" />
              
              {/* SVG Map details styling representing Shivaji Nagar map block */}
              <div id="vector-map-graphic" className="relative text-center p-6 space-y-4 max-w-md bg-white/80 backdrop-blur-md rounded-2xl border border-sky-100 shadow-md">
                <div className="inline-flex p-3 bg-rose-500/10 text-rose-600 rounded-full">
                  <Heart className="h-8 w-8 animate-pulse" />
                </div>
                
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">Pulse Cardiac & Multi-Specialty Hospital</h4>
                  <p className="text-xs text-slate-500 mt-1">Ground Floor: Emergency trauma pathways & Ambulatory Gateway.</p>
                  <p className="text-xs text-slate-500 mt-0.5">Floor 1-2: Catheterization Labs (Bi-Plane), Coronary ICU units, OPD counters.</p>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] font-bold text-sky-600 hover:underline border border-sky-200 px-3 py-1 bg-sky-50 rounded-lg cursor-pointer"
                  >
                    Open in Apple/Google Maps
                  </a>
                  <button
                    onClick={onEmergencyTrigger}
                    className="text-[11px] font-bold text-rose-600 border border-rose-200 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100 cursor-pointer"
                  >
                    Get Ambulatory Directions
                  </button>
                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
