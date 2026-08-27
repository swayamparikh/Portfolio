import { useState, useEffect, FormEvent } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Stethoscope, 
  Heart, 
  ArrowLeft, 
  PhoneCall, 
  AlertCircle, 
  Activity,
  FileCheck,
  Printer,
  ChevronDown
} from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { DOCTORS, DEPARTMENTS, SERVICES } from '../data';
import { Appointment as AppointmentRecord, Doctor } from '../types';

interface AppointmentProps {
  preselectedDoctorId?: string;
  clearPreselectedDoctor?: () => void;
  onEmergencyTrigger: () => void;
  setCurrentPage: (page: string) => void;
}

export function Appointment({ 
  preselectedDoctorId, 
  clearPreselectedDoctor, 
  onEmergencyTrigger,
  setCurrentPage
}: AppointmentProps) {
  // Form values
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [selectedDeptId, setSelectedDeptId] = useState('cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  // Form error
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentRecord | null>(null);

  // Filter doctors based on selected department
  const filteredDoctors = DOCTORS.filter(doc => doc.department === selectedDeptId);

  // Filter services based on selected department (Cardiac vs. General)
  const isCardiacDept = selectedDeptId === 'cardiology' || selectedDeptId === 'ct-surgery';
  const filteredServices = SERVICES.filter(s => 
    isCardiacDept ? s.category === 'cardiac' : s.category === 'general'
  );

  // Pre-fill doctor logic if passed from catalog
  useEffect(() => {
    if (preselectedDoctorId) {
      const doc = DOCTORS.find(d => d.id === preselectedDoctorId);
      if (doc) {
        setSelectedDeptId(doc.department);
        setSelectedDoctorId(doc.id);
      }
    } else if (filteredDoctors.length > 0 && !selectedDoctorId) {
      // Pick first doctor of department as default
      setSelectedDoctorId(filteredDoctors[0].id);
    }
  }, [preselectedDoctorId]);

  // Adjust doctor selection if department changes
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    if (clearPreselectedDoctor) clearPreselectedDoctor();
    setSelectedDoctorId('');
    setSelectedSlot('');
    
    // Choose first doctor in the new department
    const deptsDoctors = DOCTORS.filter(doc => doc.department === deptId);
    if (deptsDoctors.length > 0) {
      setSelectedDoctorId(deptsDoctors[0].id);
    }
    
    // Reset service
    setSelectedServiceId('');
  };

  // Get active selected doctor details
  const currentDoctor = DOCTORS.find(d => d.id === selectedDoctorId);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!patientName.trim()) tempErrors.patientName = 'Patient Name is required';
    if (!phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,14}$/.test(phone.replace(/\s/g, ''))) {
      tempErrors.phone = 'Please provide a valid phone number (10-12 digits)';
    }

    if (!age.trim()) {
      tempErrors.age = 'Age is required';
    } else {
      const numAge = parseInt(age);
      if (isNaN(numAge) || numAge <= 0 || numAge > 120) {
        tempErrors.age = 'Please provide a realistic age (1-120)';
      }
    }

    if (!date) tempErrors.date = 'Appointment date is required';
    if (!selectedSlot) tempErrors.selectedSlot = 'Please select an available timeslot';
    if (!selectedDoctorId) tempErrors.doctorId = 'Please select a consultant';
    if (!selectedServiceId) tempErrors.serviceId = 'Please select a clinical package';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate clinical confirmation record creation
    const mockRecord: AppointmentRecord = {
      id: `PULSE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      phone,
      age: parseInt(age),
      gender,
      doctorId: selectedDoctorId,
      serviceId: selectedServiceId,
      date,
      timeSlot: selectedSlot,
      additionalNotes: notes,
      bookingTime: new Date().toLocaleTimeString(),
      isEmergency
    };

    setConfirmedBooking(mockRecord);
    if (clearPreselectedDoctor) clearPreselectedDoctor();
  };

  const resetForm = () => {
    setPatientName('');
    setPhone('');
    setAge('');
    setGender('Male');
    setSelectedDeptId('cardiology');
    setSelectedDoctorId('');
    setSelectedServiceId('');
    setDate('');
    setSelectedSlot('');
    setNotes('');
    setIsEmergency(false);
    setConfirmedBooking(null);
  };

  const activeDocDetails = DOCTORS.find(d => d.id === confirmedBooking?.doctorId);
  const activeServiceDetails = SERVICES.find(s => s.id === confirmedBooking?.serviceId);

  return (
    <div id="appointment-page-container" className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* IF CONFIRMED: Clinical Digital Receipt */}
        {confirmedBooking ? (
          <ScrollReveal direction="none" delay={0.1}>
            <div className="bg-white rounded-3xl overflow-hidden border border-emerald-250 shadow-xl max-w-2xl mx-auto">
              
              {/* Header */}
              <div className="bg-emerald-600 text-white p-6 text-center space-y-2">
                <div className="mx-auto bg-white/20 p-2.5 rounded-full inline-block">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl">
                  Appointment Confirmed
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                  Your electronic triage slot has been locked with the consultant.
                </p>
              </div>

              {/* Body Receipt Details */}
              <div className="p-6 md:p-8 space-y-6">
                
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Triage Ref Code</span>
                    <strong className="text-sky-700 text-base font-extrabold">{confirmedBooking.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Status</span>
                    <strong className="text-emerald-600 uppercase">Confirmed/Standby</strong>
                  </div>
                </div>

                {/* Details layout */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-100 pb-1.5">
                    Patient Profile
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block">Patient Name</span>
                      <strong className="text-slate-800">{confirmedBooking.patientName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Age & Gender</span>
                      <strong className="text-slate-800">{confirmedBooking.age} Years • {confirmedBooking.gender}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Secure Mobile</span>
                      <strong className="text-slate-800">{confirmedBooking.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ambulance standby?</span>
                      <strong className={confirmedBooking.isEmergency ? "text-rose-600 uppercase" : "text-slate-500"}>
                        {confirmedBooking.isEmergency ? "YES / STANDBY" : "NO"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-100 pb-1.5">
                    Consultation Slot
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="flex gap-2.5 items-start">
                      <Stethoscope className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block">Assigned Doctor</span>
                        <strong className="text-slate-900">{activeDocDetails?.name}</strong>
                        <p className="text-xs text-slate-500">{activeDocDetails?.specialty}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <Calendar className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 block">Locked Schedule</span>
                        <strong className="text-slate-900">{confirmedBooking.date}</strong>
                        <p className="text-xs text-sky-600 flex items-center gap-1 font-bold mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{confirmedBooking.timeSlot}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Prep Guidelines */}
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 text-xs leading-relaxed text-sky-950 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 uppercase text-sky-900 tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                    Patient Preparation Instructions
                  </p>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-sky-800">
                    <li>Please arrive strictly 15 minutes before your timeslot at the <strong>Aura OP Desk (2nd Floor)</strong> for vital diagnostics entries (BP, pulse, weight).</li>
                    {activeServiceDetails?.id === 'pack-heart' && (
                      <li className="font-semibold text-rose-700">Heart Checkup Package guidelines: Please observe continuous fasting of 8-10 hours prior to checks. Water is permissible.</li>
                    )}
                    <li>Bring your past files, prescription sheets, and active ECG strips for the doctors to inspect.</li>
                    <li>Cashless procedures require approved identity photocopies (Aadhaar or corporate medical cards).</li>
                  </ul>
                </div>

                <div className="text-center text-[10px] text-slate-400 block">
                  A verification confirmation code has been triggered via SMS & WhatsApp to {confirmedBooking.phone}.
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-150 bg-slate-50 flex flex-col sm:flex-row gap-3 rounded-b-3xl select-none">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-1/2 py-3 border border-slate-300 hover:bg-slate-205 rounded-xl font-bold text-xs sm:text-sm text-center text-slate-705 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
                
                <button
                  onClick={resetForm}
                  className="w-full sm:w-1/2 py-3 bg-sky-600 hover:bg-sky-700 hover:shadow-sky-600/15 text-white rounded-xl font-bold text-xs sm:text-sm text-center shadow transition-all cursor-pointer"
                >
                  Book Another Slot
                </button>
              </div>

            </div>
          </ScrollReveal>
        ) : (
          
          /* RENDER BOOKING FORM */
          <div className="space-y-6">
            <ScrollReveal direction="down" delay={0.1}>
              <div className="text-center space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
                  OPD & Diagnostics Booking
                </span>
                <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight mt-3">
                  Schedule Your Medical Consult
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  Fill in details below to instantly lock timespots across cardiology, chest specialist labs, orthopedics, or neurology.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-md">
                <form id="appointment-form" onSubmit={handleBookingSubmit} className="space-y-6" noValidate>
                  
                  {/* Emergency notification trigger */}
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="emergency-checkbox"
                      checked={isEmergency}
                      onChange={(e) => setIsEmergency(e.target.checked)}
                      className="mt-1.5 h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="emergency-checkbox" className="text-xs text-rose-800 leading-relaxed cursor-pointer select-none">
                      <strong className="font-bold flex items-center gap-1 text-rose-900 mb-0.5">
                        <AlertCircle className="h-4 w-4 text-rose-600 animate-pulse" />
                        CRITICAL EMERGENCY REQUEST?
                      </strong>
                      Check this box if the patient is suffering active crushing chest pain, speech changes, motor numbness, or asthma attacks. This places our cardiac ambulatory triage on high standby and initiates immediate diagnostic callbacks.
                    </label>
                  </div>

                  {/* Section: Patient Demographics */}
                  <div className="space-y-4">
                    <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                      1. Patient Personal Profile
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Name */}
                      <div>
                        <label htmlFor="patient-name-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Patient Full Name *
                        </label>
                        <input
                          id="patient-name-field"
                          type="text"
                          placeholder="E.g., Drg. Ramesh Varma"
                          value={patientName}
                          onChange={(e) => {
                            setPatientName(e.target.value);
                            if (errors.patientName) setErrors({ ...errors, patientName: '' });
                          }}
                          className={`w-full bg-slate-50 border py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:bg-white transition-all ${
                            errors.patientName ? 'border-red-500' : 'border-slate-205 focus:border-sky-505'
                          }`}
                        />
                        {errors.patientName && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.patientName}</span>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="patient-phone-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Secure Mobile Phone *
                        </label>
                        <input
                          id="patient-phone-field"
                          type="tel"
                          placeholder="E.g., +91 98765 43210"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          className={`w-full bg-slate-50 border py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:bg-white transition-all ${
                            errors.phone ? 'border-red-500' : 'border-slate-205 focus:border-sky-505'
                          }`}
                        />
                        {errors.phone && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.phone}</span>
                        )}
                      </div>

                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      
                      {/* Age */}
                      <div className="col-span-1">
                        <label htmlFor="patient-age-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Age (Years) *
                        </label>
                        <input
                          id="patient-age-field"
                          type="number"
                          placeholder="E.g., 55"
                          value={age}
                          onChange={(e) => {
                            setAge(e.target.value);
                            if (errors.age) setErrors({ ...errors, age: '' });
                          }}
                          className={`w-full bg-slate-50 border py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:bg-white transition-all ${
                            errors.age ? 'border-red-500' : 'border-slate-300 focus:border-sky-500'
                          }`}
                        />
                        {errors.age && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.age}</span>
                        )}
                      </div>

                      {/* Gender Selector */}
                      <div className="col-span-1">
                        <label htmlFor="patient-gender-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Gender *
                        </label>
                        <div className="relative">
                          <select
                            id="patient-gender-field"
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-300 py-2.5 pl-3.5 pr-8 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-sky-500 appearance-none cursor-pointer font-semibold text-slate-800"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Section: Medical Department and Doctor */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                      2. Clinical Specialty & Department
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Department Select */}
                      <div>
                        <label htmlFor="dept-select-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Medical Department *
                        </label>
                        <div className="relative">
                          <select
                            id="dept-select-field"
                            value={selectedDeptId}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 py-2.5 pl-3.5 pr-8 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-sky-500 appearance-none cursor-pointer font-semibold text-slate-800"
                          >
                            {DEPARTMENTS.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Doctor Selection */}
                      <div>
                        <label htmlFor="doctor-select-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Assigned Consultant *
                        </label>
                        <div className="relative">
                          <select
                            id="doctor-select-field"
                            value={selectedDoctorId}
                            onChange={(e) => {
                              setSelectedDoctorId(e.target.value);
                              setSelectedSlot('');
                              if (errors.doctorId) setErrors({ ...errors, doctorId: '' });
                            }}
                            className={`w-full bg-slate-50 border py-2.5 pl-3.5 pr-8 rounded-xl text-sm focus:outline-none focus:bg-white appearance-none cursor-pointer font-semibold text-slate-800 ${
                              errors.doctorId ? 'border-red-500' : 'border-slate-300 focus:border-sky-500'
                            }`}
                          >
                            <option value="">-- Choose Doctor --</option>
                            {filteredDoctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} ({doc.specialty})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.doctorId && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.doctorId}</span>
                        )}
                      </div>

                      {/* Service / Diagnostics */}
                      <div>
                        <label htmlFor="service-select-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Diagnostic Package / Service *
                        </label>
                        <div className="relative">
                          <select
                            id="service-select-field"
                            value={selectedServiceId}
                            onChange={(e) => {
                              setSelectedServiceId(e.target.value);
                              if (errors.serviceId) setErrors({ ...errors, serviceId: '' });
                            }}
                            className={`w-full bg-slate-50 border py-2.5 pl-3.5 pr-8 rounded-xl text-sm focus:outline-none focus:bg-white appearance-none cursor-pointer font-semibold text-slate-800 ${
                              errors.serviceId ? 'border-red-500' : 'border-slate-300 focus:border-sky-500'
                            }`}
                          >
                            <option value="">-- Choose Diagnosis Package --</option>
                            {filteredServices.map((srv) => (
                              <option key={srv.id} value={srv.id}>
                                {srv.name} (pricing: {srv.pricingRange.split(' ')[0]}...)
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.serviceId && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.serviceId}</span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Section: Date and available timeslots */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                      3. Date & Available Slot
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      
                      {/* Date Select */}
                      <div>
                        <label htmlFor="date-select-field" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Appointment Date *
                        </label>
                        <input
                          id="date-select-field"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={date}
                          onChange={(e) => {
                            setDate(e.target.value);
                            if (errors.date) setErrors({ ...errors, date: '' });
                          }}
                          className={`w-full bg-slate-50 border py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:bg-white transition-all cursor-pointer ${
                            errors.date ? 'border-red-500' : 'border-slate-300 focus:border-sky-500'
                          }`}
                        />
                        {errors.date && (
                          <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.date}</span>
                        )}
                      </div>

                      {/* Time Slots Blocks */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                          Select Outpatient Slot *
                        </label>
                        
                        {currentDoctor ? (
                          <div className="grid grid-cols-3 gap-2 select-none">
                            {currentDoctor.slots.map((slot) => {
                              const isSelected = selectedSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  id={`slot-${slot.replace(/[:\s]/g, '-')}`}
                                  onClick={() => {
                                    setSelectedSlot(slot);
                                    if (errors.selectedSlot) setErrors({ ...errors, selectedSlot: '' });
                                  }}
                                  className={`py-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                                      : 'bg-slate-50 border-slate-205 text-slate-705 hover:bg-slate-100'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-slate-100 p-4 rounded-xl border border-slate-150 text-center text-xs text-slate-500">
                            Please select a consultant first to load active diagnostic slots.
                          </div>
                        )}
                        
                        {errors.selectedSlot && (
                          <span className="text-[10px] text-red-500 font-bold block mt-2">{errors.selectedSlot}</span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Section: Notes */}
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <label htmlFor="notes-textarea" className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Secondary Clinical Indicators / Notes (Optional)
                    </label>
                    <textarea
                      id="notes-textarea"
                      rows={3}
                      placeholder="E.g., high stress lifestyle, history of coronary bypass, current prescription medicines, allergy details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 py-2.5 px-3.5 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-sky-505 transition-all outline-none"
                    />
                  </div>

                  {/* Submit Container */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">
                      * Indicates mandatory medical profile details
                    </p>

                    <button
                      id="submit-booking-form-btn"
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold px-8 py-3.5 rounded-xl text-sm sm:text-base cursor-pointer shadow-md shadow-sky-600/10 transition-all text-center select-none"
                    >
                      Lock Consultation Slot
                    </button>
                  </div>

                </form>
              </div>
            </ScrollReveal>
          </div>
        )}

      </div>
    </div>
  );
}
