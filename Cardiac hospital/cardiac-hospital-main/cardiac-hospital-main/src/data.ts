import { Doctor, MedicalService, Department, Testimonial, SymptomGuide } from './types';

export const DEPARTMENTS: Department[] = [
  {
    id: 'cardiology',
    name: 'Cardiology & Heart Care',
    description: 'Our flagship center for advanced interventional cardiology, electrophysiology, and non-invasive diagnostics. Fully equipped with modern Cath Labs and intensive care units.',
    totalDoctors: 4,
    keySpecialty: 'Interventional Cardiology & Electrophysiology'
  },
  {
    id: 'ct-surgery',
    name: 'Cardiothoracic Surgery',
    description: 'Expert surgical team for bypass surgeries (CABG), heart valve repair/replacement, pacemaker implants, and congenital heart surgery with high success rates.',
    totalDoctors: 2,
    keySpecialty: 'Beating Heart CABG & Valve Operations'
  },
  {
    id: 'neurology',
    name: 'Neurology & Stroke Center',
    description: 'Comprehensive neurological screening, advanced stroke protocol, and treatment of complex brain, spine, and nerve disorders.',
    totalDoctors: 2,
    keySpecialty: 'Comprehensive Neuropathy & Acute Stroke Management'
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology & Critical Care',
    description: 'Dedicated treatment of chronic obstructive pulmonary disease (COPD), bronchial asthma, interstitial lung disease, and modern ICU services.',
    totalDoctors: 2,
    keySpecialty: 'PFT, Bronchoscopy & Advanced Ventilatory Care'
  },
  {
    id: 'joints-ortho',
    name: 'Orthopedics & Joint Care',
    description: 'High-performance joint replacement surgeries, arthroscopy, pain management pathways, and customized physical rehabilitation programs.',
    totalDoctors: 2,
    keySpecialty: 'Total Hip & Knee Replacements'
  },
  {
    id: 'internal-med',
    name: 'Internal Medicine & Diabetology',
    description: 'Preventative medicine, chronic lifestyle disease management, thyroid clinics, and hypertensive crises intervention.',
    totalDoctors: 2,
    keySpecialty: 'Lifestyle Disorders & Complex Diagnosis'
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 'dr1',
    name: 'Dr. Arvind Mahajan',
    qualification: 'MD, DM (Cardiology), FACC',
    experience: 22,
    specialty: 'Chief Interventional Cardiologist',
    department: 'cardiology',
    bio: 'Dr. Arvind Mahajan has performed over 10,000 successful coronary angiographies, angioplasties, and pacemaker implantations. He is a national pioneer in radial artery access treatments and highly complex heart failure options.',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slots: ['09:00 AM', '10:30 AM', '11:15 AM', '02:00 PM', '03:30 PM', '04:15 PM'],
    languages: ['English', 'Hindi', 'Gujarati'],
    achievements: ['Lifetime Achievement in Radial Cardiology - ICS 2023', 'Over 15,000+ happy cardiac recoveries'],
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'dr2',
    name: 'Dr. Rajeshwari Nair',
    qualification: 'MD (Gen Med), DNB (Cardiology), FSCAI',
    experience: 16,
    specialty: 'Senior Consultant & Cardiac Electrophysiologist',
    department: 'cardiology',
    bio: 'Dr. Rajeshwari Nair specializes in clinical arrhythmias, pediatric electrophysiology, and advanced 2D/3D echocardiographic studies. She is known for her reassuring clinical manner and focus on preventive cardiac therapies.',
    availability: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
    slots: ['10:00 AM', '11:30 AM', '12:15 PM', '03:00 PM', '04:30 PM'],
    languages: ['English', 'Hindi', 'Malayalam', 'Tamil'],
    achievements: ['Gold Medalist in Cardiology (Diplomate National Board)', 'Published over 40+ international technical papers on Arrhythmias'],
    imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'dr3',
    name: 'Dr. Somesh Khurana',
    qualification: 'MS (General Surgery), MCh (Cardiothoracic Surgery)',
    experience: 20,
    specialty: 'Chief Cardiothoracic & Heart Surgeon',
    department: 'ct-surgery',
    bio: 'A veteran surgeon with decades of training in premier institutions. Dr. Somesh Khurana specialize in minimally invasive beating heart bypass surgery, biological valve reconstructions, and thoracic oncology.',
    availability: ['Tuesday', 'Thursday', 'Friday'],
    slots: ['11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'],
    languages: ['English', 'Hindi', 'Punjabi'],
    achievements: ['Recipient of National Award for Medical Excellence 2025', 'Successfully spearheaded Pune-wide clinical chest-bypass programs'],
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'dr4',
    name: 'Dr. Preeti Vasudev',
    qualification: 'MD, DM (Neurology), FESO',
    experience: 15,
    specialty: 'Senior Stroke & Stroke-Rehabilitation Expert',
    department: 'neurology',
    bio: 'Dr. Preeti Vasudev clinic centers on acute stroke intervention, neuromuscular disorders, Parkinson’s management, and diagnostic sleep studies. She leads our multi-specialty Emergency Stroke Response squad.',
    availability: ['Monday', 'Tuesday', 'Friday', 'Saturday'],
    slots: ['09:15 AM', '10:45 AM', '01:30 PM', '02:45 PM', '04:00 PM'],
    languages: ['English', 'Hindi', 'Kannada'],
    achievements: ['Outstanding Woman Neurologist Award - INS 2024', 'Successfully established modern Post-stroke recovery trails in Mumbai'],
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'dr5',
    name: 'Dr. Vikramaditya Sen',
    qualification: 'MD (Chest Diseases), FCCP (USA)',
    experience: 18,
    specialty: 'Head - Pulmonology & ICU Director',
    department: 'pulmonology',
    bio: 'Dr. Vikramaditya is an authority on allergy assessments, respiratory critical care, and advanced sleep apnea treatments. He operates our state-of-the-art pulmonary function testing (PFT) suite.',
    availability: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    slots: ['10:00 AM', '11:15 AM', '02:30 PM', '03:45 PM'],
    languages: ['English', 'Bengali', 'Hindi'],
    achievements: ['Former Research Scholar at Johns Hopkins School of Medicine', 'Pioneered custom outpatient COPD guidelines in Eastern India'],
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400&h=400&q_seed=dr5'
  },
  {
    id: 'dr6',
    name: 'Dr. Amitav Kulkarni',
    qualification: 'MS (Orthopedics), MCh (Joint Replacements - UK)',
    experience: 17,
    specialty: 'Chief Joint Reconstruction Surgeon',
    department: 'joints-ortho',
    bio: 'Dr. Amitav specializes in total knee arthroplasty, complex skeletal trauma, and microscopic joint arthroscopy. He strives to return patients to an active, pain-free life within weeks of surgery using rapid rehabilitation.',
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    slots: ['10:30 AM', '12:00 PM', '03:15 PM', '04:30 PM'],
    languages: ['English', 'Marathi', 'Hindi'],
    achievements: ['Over 4,000 successful hip and knee joint reconstructions', 'Fellow of Royal College of Surgeons, Edinburgh'],
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400&q_seed=dr6'
  },
  {
    id: 'dr7',
    name: 'Dr. Meera Deshpande',
    qualification: 'MD (Internal Medicine), PG Dip Diabetology (Boston)',
    experience: 14,
    specialty: 'Senior Diabetologist & Preventative Physician',
    department: 'internal-med',
    bio: 'Dr. Meera handles complicated diabetic management protocols, severe hypertension control, geriatric wellness, and preventive care. She focuses heavily on nutrition, metabolic tuning, and regular clinical monitoring.',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slots: ['08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    languages: ['English', 'Hindi', 'Marathi', 'Sanskrit'],
    achievements: ['Established "Diabetes Free India" patient education program', 'Certified Clinical Nutrition Specialist - Harvard Medical'],
    imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400&h=400&q_seed=dr7'
  }
];

export const SERVICES: MedicalService[] = [
  {
    id: 'pack-heart',
    category: 'cardiac',
    name: 'Comprehensive Heart Checkup Package',
    shortDescription: 'All-inclusive evaluation consisting of Echo, ECG, TMT, Chest X-ray, and consultations.',
    fullDescription: 'A thorough preventative heart assessment designed for early detection of occult cardiac conditions, lifestyle diseases, and structural coronary irregularities.',
    benefits: [
      'Complete reassurance regarding your myocardial stamina',
      'Detailed lipid profile, blood sugar, and critical lipid breakdown',
      'One-on-one direct advisory with a Senior Cardiologist',
      'Early spotting of hypertension, ischemic heart disease markers'
    ],
    whoShouldConsider: [
      'Individuals aged 35+ with high stress lives',
      'Anyone with a familial history of high cholesterol or early heart attacks',
      'Diabetic and hypertensive patients looking for baseline reviews'
    ],
    pricingRange: 'INR 4,500 - 6,500',
    duration: '2.5 Hours'
  },
  {
    id: 'serv-ecg',
    category: 'cardiac',
    name: '12-Lead Electrocardiogram (ECG)',
    shortDescription: 'Rapid electrical cardiac tracing to detect active myocardial ischemia and arrhythmia.',
    fullDescription: 'The foundational diagnostic test in cardiology mapping the rhythm and heart-wave patterns to quickly triage cardiac symptoms or assess active medication outcomes.',
    benefits: [
      'Instantaneous results interpreted by in-house physicians',
      'Detects acute changes in heartbeat regularity (arrhythmias)',
      'A vital tool for emergency triage of angina and chest discomfort'
    ],
    whoShouldConsider: [
      'Patients experiencing fluttering sensations, skipped beats',
      'General routine pre-operative clearance'
    ],
    pricingRange: 'INR 400 - 600',
    duration: '15 Mins'
  },
  {
    id: 'serv-echo',
    category: 'cardiac',
    name: '2D Echocardiography & Color Doppler',
    shortDescription: 'In-depth cardiovascular ultrasound examining valves, chambers, and blood flow velocity.',
    fullDescription: 'High-definition live video ultrasound mapping structural features of the heart. Accurately determines pumping efficiency (ejection fraction), valve stenosis, or congenital defects.',
    benefits: [
      'Fully non-invasive, radiation-free dynamic imaging',
      'Calculates exact Ejection Fraction (EF) representing heart muscle contractility',
      'Critical for identifying post-infarct myocardial scar positions'
    ],
    whoShouldConsider: [
      'Individuals suffering from breathing difficulties, chronic leg swelling',
      'High blood pressure patients after persistent anomalies'
    ],
    pricingRange: 'INR 2,200 - 3,000',
    duration: '30 Mins'
  },
  {
    id: 'serv-tmt',
    category: 'cardiac',
    name: 'Treadmill Test (TMT / Stress Test)',
    shortDescription: 'Electrocardiograph tracking while running on a calibrated workload gradient.',
    fullDescription: 'Exposes how the heart handles increasing stress workloads. Critical to unmask ischemic heart diseases that do not show up during rest ECGs.',
    benefits: [
      'Clear evaluation of coronary reserve and exercise tolerance',
      'Safely supervised by trained critical care registrars',
      'Detects latent angina triggers'
    ],
    whoShouldConsider: [
      'Smokers or high-risk coronary individuals seeking sports clearance',
      'Patients recovering from generic chest discomfort'
    ],
    pricingRange: 'INR 1,800 - 2,500',
    duration: '45 Mins'
  },
  {
    id: 'serv-angioplasty',
    category: 'cardiac',
    name: 'Angiography & Coronary Angioplasty (PCI)',
    shortDescription: 'Minimally invasive wire-guided block removal and medicated stent deployment.',
    fullDescription: 'Our hallmark interventional procedure performed inside a state-of-the-art Siemens Cath Lab. Blocks are visualized via radiopaque dye, mapped, dilated using micro-balloons, and sealed using modern drug-eluting stents.',
    benefits: [
      'Lifesaving emergency revascularization for acute heart attacks',
      'Short recovery window (mostly discharged within 36-48 hours)',
      'Restores perfect functional blood flow to ischemic myocardium'
    ],
    whoShouldConsider: [
      'Patients diagnosed with major blocks (>70%) on CT coronary studies',
      'Emergency heart attack admissions requesting immediate primary angioplasty'
    ],
    pricingRange: 'INR 1,20,000 - 2,50,000',
    duration: '1.5 Hours'
  },
  {
    id: 'serv-pacemaker',
    category: 'cardiac',
    name: 'Pacemaker / AICD Implantation',
    shortDescription: 'Sub-cutaneous miniature computer mapping and regulating severe heart blocks.',
    fullDescription: 'Surgical sub-clavicular pocket implanting wires into the right chambers of the heart. Resolves life-threatening bradycardia, sick sinus syndrome, or lethal ventricular fibrillation.',
    benefits: [
      'Eliminates fainting, unexplained blackouts, and severe heart-related fatigue',
      'Intelligent automatic tracking and pacing adjustments',
      'Battery lifespans lasting over 10-14 years with reliable monitors'
    ],
    whoShouldConsider: [
      'Patients with 3rd Degree Complete Heart Block',
      'High-risk arrhythmia patients prone to sudden cardiac arrest'
    ],
    pricingRange: 'INR 1,50,000 - 4,00,000',
    duration: '2 Hours'
  },
  {
    id: 'serv-stroke',
    category: 'general',
    name: 'Emergency Brain Stroke Pathway & MRI',
    shortDescription: 'Rapid multi-specialty intervention using thrombolysis to reverse acute ischemic stroke.',
    fullDescription: 'Time-sensitive pathways deploying tissue plasminogen activator (tPA) or mechanical thrombectomy. Our neurologists act inside the golden-hour to restore stroke patients to complete functional independence.',
    benefits: [
      'Immediate access to 24/7 Stroke Team',
      'Rapid door-to-needle times (under 45 minutes)',
      'Full physical, speech, and movement occupational therapy integration'
    ],
    whoShouldConsider: [
      'Anyone sudden displaying weakness in arm/leg, slurred speech, facial drooping'
    ],
    pricingRange: 'Based on diagnosis / emergency protocols',
    duration: 'Emergency Response'
  },
  {
    id: 'serv-pft',
    category: 'general',
    name: 'Spirometry & Pulmonary Diagnostics',
    shortDescription: 'Advanced breathing test analyzing airflow capabilities for asthma and COPD.',
    fullDescription: 'Measures volume and speed of inhaled/exhaled air. Vital for sizing chronic lungs inflammation, sizing industrial lung risks, and tailoring steroid inhaler ratios.',
    benefits: [
      'Pinpoint differentiation of Asthma versus COPD parameters',
      'Analyzes physical lung reserves before major cardiac bypasses',
      'Aides in monitoring occupational lung pollution impact'
    ],
    whoShouldConsider: [
      'Chronic smokers, asthmatics with persistent coughing or wheezing',
      'Recovering Post-COVID pulmonary fibrosis patients'
    ],
    pricingRange: 'INR 1,200 - 1,800',
    duration: '30 Mins'
  },
  {
    id: 'serv-joints',
    category: 'general',
    name: 'Comprehensive Joint Replacement Program',
    shortDescription: 'Minimally-invasive high-flex total knee & hip replacement under laminar flow theatres.',
    fullDescription: 'State-of-the-art orthopedic surgery using durable cobalt-chromium implants. Supported by computerized navigation software to achieve perfect biomechanical orientation and rapid pain-free ambulation.',
    benefits: [
      'Restores painless freedom of joint movement',
      'Laminar-airflow operating theatres minimizing postoperative infection risks',
      'Intense, tailored bedside physical therapy program begins within 24 hours of surgery'
    ],
    whoShouldConsider: [
      'Patients struggling with Grade IV advanced osteoarthritis of the hips/knees',
      'Severe rheumatoid arthritis with total mobility loss'
    ],
    pricingRange: 'INR 1,80,000 - 3,50,000',
    duration: '2 Hours'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ramesh Chawla',
    age: 62,
    conditionTreated: 'Emergency Angioplasty (PCI)',
    quote: 'I felt heavy chest pain at 2 AM. We rushed to Pulse Hospital, and within 40 minutes, Dr. Mahajan had successfully put 2 stents into my blocked artery. Clean, professional, and saved my life.',
    rating: 5,
    doctorName: 'Dr. Arvind Mahajan'
  },
  {
    id: 't2',
    name: 'Anjali Sharma',
    age: 48,
    conditionTreated: 'Pacemaker Implantation & Arrhythmia',
    quote: 'My mother was suffering from severe blackouts and extreme tiredness. Dr. Rajeshwari diagnosed a complete heart block. The pacemaker surgery went smoothly, and she has her energy back fully!',
    rating: 5,
    doctorName: 'Dr. Rajeshwari Nair'
  },
  {
    id: 't3',
    name: 'K. Sreeraman',
    age: 71,
    conditionTreated: 'Triple Bypass Surgery (CABG)',
    quote: 'Dr. Khurana and the CT team performed a beating heart bypass. I was extremely nervous, but the gentle care by nurses and continuous updates to my family made it highly comfortable.',
    rating: 5,
    doctorName: 'Dr. Somesh Khurana'
  },
  {
    id: 't4',
    name: 'Shankar Salvi',
    age: 55,
    conditionTreated: 'Severe Stroke Recovery & Rehab',
    quote: 'My left-side was completely paralyzed during a workspace brain stroke. Pulse Hospital initiated their golden stroke protocol immediately. After 3 months of physical therapy by Dr. Vasudev, I can walk again on my own.',
    rating: 5,
    doctorName: 'Dr. Preeti Vasudev'
  }
];

export const SYMPTOMS_GUIDE: SymptomGuide[] = [
  {
    id: 'sym1',
    title: 'Crushing Chest Pain / Pressure',
    description: 'Feels like weight, squeeze, or constriction right in the center of the chest, sometimes radiating to the left arm, neck, shoulder, or jaw.',
    urgency: 'emergency',
    recommendation: 'DO NOT WAIT. Call our emergency response helpline (+91 9999-108-108) or go to the nearest emergency room immediately. Do not drive yourself.',
    warningSigns: [
      'Radiates to neck, jaw, arm, or back',
      'Accompanied by cold sweating and dizziness',
      'Unresolved by rest or nitroglycerine medications',
      'Shortness of breath'
    ]
  },
  {
    id: 'sym2',
    title: 'Shortness of Breath (Dyspnea)',
    description: 'Difficulty breathing or sudden gasp for air during mild physical walking or while lying down completely flat on the bed.',
    urgency: 'moderate',
    recommendation: 'Requires cardiac evaluation, 2D Echo, and lung capacity testing. Book a rapid cardiology or chest consult within 24-48 hours.',
    warningSigns: [
      'Worse when sleeping (needs extra pillows)',
      'Accompanied by rapid feet or ankle swelling',
      'Dry hacking cough with pinkish fluid'
    ]
  },
  {
    id: 'sym3',
    title: 'Irregular Beats / Palpitations',
    description: 'Feeling like your heart is racing, pounding, thumping, or skipping a beat entirely while sitting quietly or active.',
    urgency: 'moderate',
    recommendation: 'Requires a diagnostic 12-Lead ECG or 24-Hour Holter Monitor. Book a consult with an Electrophysiologist or Cardiologist.',
    warningSigns: [
      'Leads to sudden feeling of faintness or dizziness',
      'Lasting continuously for more than 5 minutes',
      'Accompanied by mild chest pressure'
    ]
  },
  {
    id: 'sym4',
    title: 'Persistent High Blood Pressure',
    description: 'Blood pressure readings consistently measuring above 140/90 mmHg over consecutive days.',
    urgency: 'low',
    recommendation: 'Ideal case for custom medical tailoring, lifestyle tuning, and preventive cardiology consults. Schedule an appointment with Internal Medicine.',
    warningSigns: [
      'Severe morning headaches',
      'Visual blurry spots or ringing ears/tinnitus',
      'Blood spots in vision'
    ]
  },
  {
    id: 'sym5',
    title: 'Sudden Weakness / Slurred Speech',
    description: 'Sudden inability to lift one arm, facial symmetry loss (drooping on one side), or sudden inability to form coherent words.',
    urgency: 'emergency',
    recommendation: 'This is a neurological emergency - stroke suspect (FAST checklist: Face, Arms, Speech, Time). Rush to our Golden Stroke ICU instantly!',
    warningSigns: [
      'Sudden loss of balance or coordination',
      'Sudden blindness or double vision in one eye',
      'Severe headache with no known previous history'
    ]
  }
];
