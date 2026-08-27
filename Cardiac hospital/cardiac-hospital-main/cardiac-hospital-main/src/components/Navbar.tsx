import { useState } from 'react';
import { HeartPulse, PhoneCall, CalendarRange, Menu, X, Activity } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onEmergencyTrigger: () => void;
}

export function Navbar({ currentPage, setCurrentPage, onEmergencyTrigger }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services & Packages' },
    { id: 'doctors', label: 'Our Doctors' },
    { id: 'appointment', label: 'Book Appointment' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header id="hospital-header" className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-sky-100">
      {/* Top Banner (Emergency Info) */}
      <div className="bg-red-600 text-white py-2 px-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm font-medium gap-1 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-white rounded-full animate-ping" />
            <Activity className="h-4 w-4 animate-pulse inline" />
            <span>24/7 Red-Alert Emergency Cardiac & Trauma Helpline:</span>
            <a href="tel:+919999108108" className="font-extrabold hover:underline tracking-wider select-all">
              +91 9999-108-108
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-red-100 divide-x divide-red-400">
            <span className="pl-4">Chest Pain Triage: Under 45 Mins</span>
            <span className="pl-4">Acute Stroke Protocol Live</span>
            <span className="pl-4">NABH Accredited Tertiary Facility</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand Area */}
          <div 
            id="navbar-brand"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="bg-gradient-to-tr from-sky-600 to-rose-500 p-2.5 rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
              <HeartPulse className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 sm:text-2xl">
                  PULSE
                </span>
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Care
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase leading-none mt-1">
                Cardiac & Multi-Specialty Hospital
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 select-none">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250 cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border-b-2 border-sky-600'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3 select-none">
            {/* Quick Consultation Booking Call */}
            <button
              id="cta-emergency-navbar"
              onClick={onEmergencyTrigger}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border border-rose-100 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4 animate-bounce" />
              <span>Emergency Services</span>
            </button>

            <button
              id="cta-booking-navbar"
              onClick={() => handleNavClick('appointment')}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white py-2.5 px-5 rounded-xl text-sm font-bold shadow-md shadow-sky-600/10 hover:shadow-sky-600/20 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <CalendarRange className="h-4 w-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile responsive hamburger menu */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="cta-emergency-mobile"
              onClick={onEmergencyTrigger}
              className="bg-rose-50 text-rose-700 p-2.5 rounded-xl border border-rose-100"
              aria-label="Emergency helpline"
            >
              <PhoneCall className="h-5 w-5 animate-pulse" />
            </button>
            
            <button
              id="navbar-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all duration-150"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div id="navbar-mobile-menu" className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2 animate-fadeIn shadow-inner">
          <div className="pb-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Departments & Navigation</p>
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-mobile-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 space-y-2">
            <button
              id="mobile-nav-book-btn"
              onClick={() => handleNavClick('appointment')}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-sm"
            >
              <CalendarRange className="h-4 w-4" />
              <span>Book Appointment</span>
            </button>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                Pulse Cardiac & Multi-Specialty Hospital • NABH Certified
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
