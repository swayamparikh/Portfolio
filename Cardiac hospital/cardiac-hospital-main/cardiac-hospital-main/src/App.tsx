import { useState, startTransition } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Doctors } from './pages/Doctors';
import { Appointment } from './pages/Appointment';
import { Contact } from './pages/Contact';
import { PhoneCall, X, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string>('');
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  const handlePageChange = (newPageId: string) => {
    // Wrap page routing switches in startTransition to prevent HMR/UI locking in iFrames
    startTransition(() => {
      setCurrentPage(newPageId);
    });
  };

  const handleOpenEmergencyModal = () => {
    setShowEmergencyModal(true);
  };

  const handleCloseEmergencyModal = () => {
    setShowEmergencyModal(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setCurrentPage={handlePageChange} 
            onEmergencyTrigger={handleOpenEmergencyModal} 
          />
        );
      case 'about':
        return <About />;
      case 'services':
        return <Services setCurrentPage={handlePageChange} />;
      case 'doctors':
        return (
          <Doctors 
            setCurrentPage={handlePageChange} 
            setSelectedDoctorId={setPreselectedDoctorId} 
          />
        );
      case 'appointment':
        return (
          <Appointment 
            preselectedDoctorId={preselectedDoctorId} 
            clearPreselectedDoctor={() => setPreselectedDoctorId('')} 
            onEmergencyTrigger={handleOpenEmergencyModal}
            setCurrentPage={handlePageChange}
          />
        );
      case 'contact':
        return <Contact onEmergencyTrigger={handleOpenEmergencyModal} />;
      default:
        return (
          <Home 
            setCurrentPage={handlePageChange} 
            onEmergencyTrigger={handleOpenEmergencyModal} 
          />
        );
    }
  };

  return (
    <div id="hospital-app-root" className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-sky-500 selection:text-white">
      
      {/* Sticky Navigation */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange} 
        onEmergencyTrigger={handleOpenEmergencyModal} 
      />

      {/* Main Page Area wrapped with page visual transitions */}
      <main id="main-content-flow" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Accreditations Footer */}
      <Footer setCurrentPage={handlePageChange} />

      {/* FLOATING ACTION EMERGENCY TRIGGERS (Mobile shortcut) */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <button
          id="btn-floating-emergency"
          onClick={handleOpenEmergencyModal}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-3 px-5 rounded-2xl shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Activity className="h-5 w-5 animate-pulse text-white" />
          <span className="text-xs tracking-wider uppercase font-extrabold">EMERGENCY Helpline</span>
        </button>
      </div>

      {/* CRITICAL AMBULANCE EMERGENCY MODAL OVERLAY */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div 
            id="emergency-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          >
            <motion.div 
              id="emergency-modal-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border-2 border-red-550 shadow-2xl"
            >
              
              {/* Emergency Banner */}
              <div className="bg-red-600 text-white p-6 relative">
                <button
                  id="close-emergency-modal-btn"
                  onClick={handleCloseEmergencyModal}
                  className="absolute right-4 top-4 p-2 text-red-100 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  aria-label="Close emergency diagnostic overlay"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-xl text-white">
                    <ShieldAlert className="h-8 w-8 animate-bounce text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight">
                      Pulse Red-Alert Triage
                    </h3>
                    <p className="text-red-100 text-xs font-semibold">
                      Live Cardiac & Stroke Response Hotline
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Guidelines */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Urgent Phone Action Button */}
                <div className="text-center space-y-2">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    CLICK TO COUPLING WITH CARDIAC COMMAND DESK
                  </p>
                  <a
                    href="tel:+919999108108"
                    id="phone-link-er-dial"
                    className="inline-flex items-center gap-3 bg-red-50 hover:bg-red-100 border-2 border-red-505 hover:border-red-600 text-red-700 py-4 px-6 rounded-2xl w-full justify-center transition-all shadow-sm active:scale-98 font-mono text-xl sm:text-2xl font-black tracking-wider"
                  >
                    <PhoneCall className="h-6 w-6 text-red-600 animate-pulse shrink-0" />
                    <span>+91 9999-108-108</span>
                  </a>
                  <p className="text-[10px] text-slate-400 font-medium">
                    (Press to dial instantly inside India. Available 24 hours, 365 days)
                  </p>
                </div>

                {/* Important First-Aid guidelines */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block">
                    🔴 Immediate Ambulance Guidelines
                  </span>
                  
                  <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-semibold">
                    <div className="flex gap-2">
                      <span className="text-red-600">1.</span>
                      <p><strong>Loosen heavy clothes:</strong> Ensure the patient resides in a highly ventilated, peaceful atmosphere. Do not allow crowding or panic noise.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-red-600">2.</span>
                      <p><strong>Chew Aspirin (300mg) immediately:</strong> If suffering crushing angina/chest press, chew a soluble Aspirin if instructed by prior physicians.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-red-600">3.</span>
                      <p><strong>Keep Nitro handy:</strong> If diagnosed with coronary blockages, administer sub-lingual Nitroglycerin spray/pill as prescribed.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-red-600">4.</span>
                      <p><strong>Golden Stroke Checklist:</strong> If showing motor speech drooping, make a strict note of the exact time symptoms triggered to coordinate thrombolysis.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-slate-100/90 border-t border-slate-150 flex justify-between items-center text-xs select-none">
                <span className="text-slate-500 font-medium font-mono text-[10px] uppercase">
                  ⚡ 5 Private Cardiac Ambulances Standby
                </span>
                
                <button
                  onClick={handleCloseEmergencyModal}
                  className="bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 font-bold py-2 px-4 rounded-xl border border-slate-205 transition-colors cursor-pointer text-[11px]"
                >
                  Dismiss Overlay Guide
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
