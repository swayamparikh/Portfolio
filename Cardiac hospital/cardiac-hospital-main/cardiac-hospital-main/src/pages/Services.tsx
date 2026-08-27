import { useState } from 'react';
import { 
  Heart, 
  Search, 
  Layers, 
  Activity, 
  Clock, 
  CheckCircle, 
  ActivitySquare, 
  PlusSquare, 
  SlidersHorizontal,
  ChevronRight,
  Info,
  CalendarRange
} from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { SERVICES } from '../data';
import { MedicalService } from '../types';

interface ServicesProps {
  setCurrentPage: (page: string) => void;
}

export function Services({ setCurrentPage }: ServicesProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'cardiac' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<MedicalService | null>(null);

  const filteredServices = SERVICES.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.fullDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookService = (serviceName: string) => {
    setCurrentPage('appointment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="services-page-container" className="bg-slate-50 min-h-screen">
      
      {/* HEADER BANNER */}
      <section className="relative py-16 bg-slate-900 text-white overflow-hidden grid-clinical-pattern">
        <div className="absolute inset-0 bg-sky-950/40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3">
          <ScrollReveal direction="down" delay={0.1}>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Clinical Catalog
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Advanced Clinical Diagnostics & Interventions
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Explore our comprehensive treatments ranging from non-invasive 2D Echocardiograms to livesaving Siemens primary Coronary Angioplasties, brain stroke thrombectomies, and joint replacement workflows.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* FILTER CONTROL HUB */}
      <section className="relative py-6 bg-white border-b border-slate-200 shadow-xs z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Tabs Filter */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              id="btn-filter-all"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-205'
              }`}
            >
              All Specialties
            </button>
            <button
              id="btn-filter-cardiac"
              onClick={() => setActiveCategory('cardiac')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'cardiac'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-205'
              }`}
            >
              <Heart className="h-4 w-4 shrink-0 text-rose-500" />
              <span>Cardiac Care Units</span>
            </button>
            <button
              id="btn-filter-general"
              onClick={() => setActiveCategory('general')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'general'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-205'
              }`}
            >
              <PlusSquare className="h-4 w-4 shrink-0 text-sky-505" />
              <span>Multi-Specialty Lobe</span>
            </button>
          </div>

          {/* Search Query */}
          <div className="relative w-full md:max-w-xs shrink-0 pt-2 md:pt-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="search-services-input"
              type="text"
              placeholder="Search services (e.g. Echo, angio)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>
      </section>

      {/* RENDER LIST OF SERVICES */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, idx) => {
            const isCardiac = service.category === 'cardiac';
            return (
              <ScrollReveal key={service.id} direction="up" delay={0.05 * idx} className="h-full">
                <div className="bg-white rounded-2xl p-6 border border-slate-150 hover:border-sky-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
                  <div className="space-y-3.5">
                    
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-md border ${
                        isCardiac
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-sky-50 text-sky-700 border-sky-100'
                      }`}>
                        {isCardiac ? 'Cardiac Specialty' : 'General Specialty'}
                      </span>
                      
                      <div className="text-slate-400 font-mono text-xs flex items-center gap-1.5 font-bold">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-950 leading-snug group-hover:text-sky-600 transition-colors">
                      {service.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>

                  {/* Primary interactive details action */}
                  <div className="pt-5 border-t border-slate-100 mt-6 flex justify-between items-center gap-2 select-none">
                    <button
                      id={`btn-service-details-${service.id}`}
                      onClick={() => setSelectedService(service)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-all cursor-pointer bg-sky-50 hover:bg-sky-100 py-1.5 px-3 rounded-lg border border-sky-100"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Learn Benefits</span>
                    </button>

                    <button
                      id={`btn-service-book-${service.id}`}
                      onClick={() => handleBookService(service.name)}
                      className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}

          {filteredServices.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-400 text-sm italic">No specialist medical services matched your query.</p>
              <button
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="text-xs text-sky-600 font-bold hover:underline mt-2 cursor-pointer"
              >
                Reset active search query and category filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* DETAIL MODAL PANEL / INTERACTIVE DRAWER OVERLAP */}
      {selectedService && (
        <div id="service-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-sky-100 animate-slideUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50 sticky top-0 z-10 rounded-t-3xl">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600 bg-sky-100 px-2.5 py-1 rounded">
                  {selectedService.category.toUpperCase()} MEDICINE
                </span>
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 mt-1.5 leading-snug">
                  {selectedService.name}
                </h3>
              </div>
              
              <button
                id="close-service-modal-btn"
                onClick={() => setSelectedService(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Full Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">In-Depth Overview</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                  {selectedService.fullDescription}
                </p>
              </div>

              {/* Benefits layout */}
              <div className="space-y-2.5">
                <h4 className="text-xs uppercase tracking-widest text-sky-800 font-extrabold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Primary Treatment Intent & Benefits
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                  {selectedService.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="text-emerald-500 text-sm">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target guidelines */}
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">
                  Who Should Consider This Therapy?
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                  {selectedService.whoShouldConsider.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-150 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Indicative Fee Structure</span>
                  <strong className="text-slate-800 text-sm">{selectedService.pricingRange}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Session / Triage Window</span>
                  <strong className="text-slate-800 text-sm">{selectedService.duration}</strong>
                </div>
              </div>

            </div>

            {/* Modal Footer / Appointment routing */}
            <div className="p-6 border-t border-slate-150 bg-slate-50 flex gap-4 rounded-b-3xl select-none">
              <button
                id="modal-service-dismiss"
                onClick={() => setSelectedService(null)}
                className="w-1/2 py-3 border border-slate-305 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs sm:text-sm text-center transition-colors cursor-pointer"
              >
                Dismiss Details
              </button>
              
              <button
                id="modal-service-book"
                onClick={() => {
                  handleBookService(selectedService.name);
                  setSelectedService(null);
                }}
                className="w-1/2 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs sm:text-sm text-center shadow-lg shadow-sky-600/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarRange className="h-4.5 w-4.5" />
                <span>Book Appointment</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
