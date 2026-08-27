import { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  BookOpen, 
  Star, 
  Languages, 
  Award, 
  ChevronRight, 
  Clock, 
  Stethoscope,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { DOCTORS, DEPARTMENTS } from '../data';
import { Doctor } from '../types';

interface DoctorsProps {
  setCurrentPage: (page: string) => void;
  setSelectedDoctorId: (doctorId: string) => void;
}

export function Doctors({ setCurrentPage, setSelectedDoctorId }: DoctorsProps) {
  const [activeDept, setActiveDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);

  const filteredDoctors = DOCTORS.filter(doc => {
    const matchesDept = activeDept === 'all' || doc.department === activeDept;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleBookDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setCurrentPage('appointment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBio = (docId: string) => {
    setExpandedBioId(expandedBioId === docId ? null : docId);
  };

  return (
    <div id="doctors-page-container" className="bg-slate-50 min-h-screen">
      
      {/* HEADER BANNER */}
      <section className="relative py-16 bg-slate-900 text-white overflow-hidden grid-clinical-pattern">
        <div className="absolute inset-0 bg-sky-950/40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3">
          <ScrollReveal direction="down" delay={0.1}>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Medical Board
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Our Certified Consultants & Surgeons
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Consult with internationally qualified cardiologists, bypass surgeons, acute stroke specialists, joint replacement surgeons, and lifestyle management experts.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* SEARCH AND FILTER BAR */}
      <section className="py-6 bg-white border-b border-slate-205 shadow-xs sticky top-[130px] lg:top-[96px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Dept Select Dropdown (For compact responsive styling) */}
            <div className="flex items-center gap-1.5 w-full overflow-x-auto pb-2 md:pb-0 scrollbar-none select-none">
              <button
                id="btn-dept-all"
                onClick={() => setActiveDept('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  activeDept === 'all'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Doctors
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  id={`btn-dept-${dept.id}`}
                  onClick={() => setActiveDept(dept.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    activeDept === dept.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept.name.split(' & ')[0]}
                </button>
              ))}
            </div>

            {/* In-page Name Search */}
            <div className="relative w-full md:max-w-xs shrink-0 select-text">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="search-doctors-input"
                type="text"
                placeholder="Search by specialty, degree, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-220 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-sky-505 focus:bg-white transition-all shadow-inner"
              />
            </div>

          </div>
        </div>
      </section>

      {/* DOCTORS GRID */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {filteredDoctors.map((doc, idx) => {
            const isExpanded = expandedBioId === doc.id;
            const docDept = DEPARTMENTS.find(d => d.id === doc.department);
            return (
              <ScrollReveal key={doc.id} direction="up" delay={0.05 * idx}>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-150 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4">
                  
                  {/* Doctor Card Top Layout */}
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Headshot Portrait */}
                    <div className="shrink-0 mx-auto sm:mx-0">
                      <div className="relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-sky-100/50 bg-slate-50 bg-clinical-pattern shadow-sm aspect-square">
                        <img
                          src={doc.imageUrl}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="object-cover w-full h-full transform hover:scale-105 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Meta data */}
                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-sky-100">
                        <Stethoscope className="h-3 w-3" />
                        <span>{docDept?.name.split(' & ')[0] || doc.department}</span>
                      </div>

                      <h3 className="font-display font-extrabold text-lg text-slate-900 leading-snug">
                        {doc.name}
                      </h3>

                      <p className="text-xs font-bold text-slate-500 leading-none">
                        {doc.qualification}
                      </p>

                      <p className="text-xs font-bold text-sky-600 pt-1 leading-snug">
                        {doc.specialty}
                      </p>

                      <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-mono font-medium pt-1">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          <strong>{doc.experience} Years</strong> Exp
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Languages className="h-3.5 w-3.5 text-slate-400" />
                          <span>{doc.languages.slice(0, 2).join(', ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements bullet */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 flex items-start gap-2.5">
                    <Award className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-extrabold text-slate-400 leading-none">Key Accomplishment</p>
                      <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">{doc.achievements[0]}</p>
                    </div>
                  </div>

                  {/* collapsible Bio */}
                  <div>
                    <button
                      id={`btn-toggle-bio-${doc.id}`}
                      onClick={() => toggleBio(doc.id)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Professional Bio' : 'Read Full Bio & Accomplishments'}</span>
                      <ChevronRight className={`h-3 w-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-3 text-xs text-slate-500 leading-relaxed space-y-2 border-l-2 border-sky-100 pl-3 animate-fadeIn">
                        <p>{doc.bio}</p>
                        <div className="pt-2">
                          <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px]">Secondary Achievements</p>
                          <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
                            {doc.achievements.map((ach, aIdx) => (
                              <li key={aIdx}>{ach}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Availability Slots & CTAs */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="text-xs">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Availability
                      </p>
                      <p className="text-slate-800 font-bold mt-1 leading-none">
                        {doc.availability.join(', ')}
                      </p>
                    </div>

                    <button
                      id={`btn-doctor-book-${doc.id}`}
                      onClick={() => handleBookDoctor(doc.id)}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/5 transition-all outline-none"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Book Consultation</span>
                    </button>
                  </div>

                </div>
              </ScrollReveal>
            );
          })}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-400 text-sm italic">No clinical specialists matched your criteria.</p>
              <button
                onClick={() => { setActiveDept('all'); setSearchQuery(''); }}
                className="text-xs text-sky-600 font-bold hover:underline mt-2 cursor-pointer"
              >
                Reset active search query and department tags
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
