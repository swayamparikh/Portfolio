export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  experience: number;
  specialty: string;
  department: string;
  bio: string;
  availability: string[];
  slots: string[];
  languages: string[];
  achievements: string[];
  imageUrl: string;
}

export interface MedicalService {
  id: string;
  category: 'cardiac' | 'general';
  name: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  whoShouldConsider: string[];
  pricingRange: string;
  duration: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  totalDoctors: number;
  keySpecialty: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  doctorId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  additionalNotes?: string;
  bookingTime: string;
  isEmergency: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  age: number;
  conditionTreated: string;
  quote: string;
  rating: number;
  doctorName?: string;
}

export interface SymptomGuide {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'moderate' | 'emergency';
  recommendation: string;
  warningSigns: string[];
}
