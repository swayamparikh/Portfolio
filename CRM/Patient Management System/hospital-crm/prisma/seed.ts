import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/hospital_crm?sslmode=disable";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Seeding database...");

  // Create hospital
  const hospital = await prisma.hospital.upsert({
    where: { slug: "city-medical-center" },
    update: {},
    create: {
      name: "City Medical Center",
      slug: "city-medical-center",
      address: "42 Healthcare Avenue, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      phone: "+91 22 1234 5678",
      email: "admin@citymedical.com",
      website: "https://citymedical.com",
      licenseNumber: "MH-HOSP-2024-001",
      subscriptionPlan: "PROFESSIONAL",
    },
  });

  console.log("✅ Hospital created:", hospital.name);

  // Create subscription
  await prisma.subscription.upsert({
    where: { hospitalId: hospital.id },
    update: {},
    create: {
      hospitalId: hospital.id,
      plan: "PROFESSIONAL",
      status: "ACTIVE",
    },
  });

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({ where: { name_hospitalId: { name: "Internal Medicine", hospitalId: hospital.id } }, update: {}, create: { name: "Internal Medicine", hospitalId: hospital.id } }),
    prisma.department.upsert({ where: { name_hospitalId: { name: "Cardiology", hospitalId: hospital.id } }, update: {}, create: { name: "Cardiology", hospitalId: hospital.id } }),
    prisma.department.upsert({ where: { name_hospitalId: { name: "Orthopedics", hospitalId: hospital.id } }, update: {}, create: { name: "Orthopedics", hospitalId: hospital.id } }),
    prisma.department.upsert({ where: { name_hospitalId: { name: "Neurology", hospitalId: hospital.id } }, update: {}, create: { name: "Neurology", hospitalId: hospital.id } }),
    prisma.department.upsert({ where: { name_hospitalId: { name: "Radiology", hospitalId: hospital.id } }, update: {}, create: { name: "Radiology", hospitalId: hospital.id } }),
  ]);

  console.log("✅ Departments created");

  const hashPassword = (pwd: string) => bcrypt.hash(pwd, 12);

  // Create Super Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@medicrm.health" },
    update: {},
    create: {
      email: "admin@medicrm.health",
      name: "System Administrator",
      passwordHash: await hashPassword("Admin@123"),
      role: "SUPER_ADMIN",
      hospitalId: hospital.id,
    },
  });
  console.log("✅ Super Admin:", adminUser.email);

  // Create Hospital Admin
  const hospitalAdmin = await prisma.user.upsert({
    where: { email: "hospital-admin@medicrm.health" },
    update: {},
    create: {
      email: "hospital-admin@medicrm.health",
      name: "Dr. Rajesh Kapoor",
      passwordHash: await hashPassword("Admin@123"),
      role: "HOSPITAL_ADMIN",
      hospitalId: hospital.id,
    },
  });

  // Create Doctors
  const doctorData = [
    { email: "doctor@medicrm.health", name: "Dr. Priya Mehta", spec: "Internal Medicine", dept: 0, fee: 800, pwd: "Doctor@123" },
    { email: "rahul.gupta@medicrm.health", name: "Dr. Rahul Gupta", spec: "Cardiology", dept: 1, fee: 1200, pwd: "Doctor@123" },
    { email: "anil.kumar@medicrm.health", name: "Dr. Anil Kumar", spec: "Orthopedics", dept: 2, fee: 1000, pwd: "Doctor@123" },
    { email: "sneha.joshi@medicrm.health", name: "Dr. Sneha Joshi", spec: "Neurology", dept: 3, fee: 1500, pwd: "Doctor@123" },
  ];

  const doctors = [];
  for (const d of doctorData) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: { email: d.email, name: d.name, passwordHash: await hashPassword(d.pwd), role: "DOCTOR", hospitalId: hospital.id },
    });
    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        hospitalId: hospital.id,
        departmentId: departments[d.dept].id,
        specialization: d.spec,
        consultationFee: d.fee,
      },
    });
    doctors.push({ user, doctor });
  }
  console.log("✅ Doctors created:", doctors.length);

  // Create Receptionist
  const receptionistUser = await prisma.user.upsert({
    where: { email: "reception@medicrm.health" },
    update: {},
    create: {
      email: "reception@medicrm.health",
      name: "Ravi Sharma",
      passwordHash: await hashPassword("Reception@123"),
      role: "RECEPTIONIST",
      hospitalId: hospital.id,
    },
  });

  // Create Patient user
  const patientUser = await prisma.user.upsert({
    where: { email: "patient@medicrm.health" },
    update: {},
    create: {
      email: "patient@medicrm.health",
      name: "Arjun Sharma",
      passwordHash: await hashPassword("Patient@123"),
      role: "PATIENT",
      hospitalId: hospital.id,
    },
  });

  // Create Patients
  const patientsData = [
    { firstName: "Arjun", lastName: "Sharma", mrn: "CMC240001", gender: "MALE" as const, blood: "B_POSITIVE" as const, phone: "+91 98765 43210", email: "patient@medicrm.health", allergies: ["Penicillin"], conditions: ["Hypertension"], userId: patientUser.id },
    { firstName: "Sunita", lastName: "Patel", mrn: "CMC240002", gender: "FEMALE" as const, blood: "O_POSITIVE" as const, phone: "+91 87654 32109", email: "sunita.p@gmail.com", allergies: [], conditions: ["Diabetes Type 2"], userId: undefined },
    { firstName: "Mohammed", lastName: "Ali", mrn: "CMC240003", gender: "MALE" as const, blood: "A_POSITIVE" as const, phone: "+91 76543 21098", email: "m.ali@gmail.com", allergies: ["Sulfa drugs"], conditions: ["Chronic Back Pain"], userId: undefined },
    { firstName: "Deepa", lastName: "Nair", mrn: "CMC240004", gender: "FEMALE" as const, blood: "AB_POSITIVE" as const, phone: "+91 65432 10987", email: "deepa.n@email.com", allergies: [], conditions: ["Anxiety Disorder"], userId: undefined },
    { firstName: "Vikram", lastName: "Singh", mrn: "CMC240005", gender: "MALE" as const, blood: "B_NEGATIVE" as const, phone: "+91 54321 09876", email: "vikram.s@email.com", allergies: ["Aspirin"], conditions: ["Cardiac Arrhythmia"], userId: undefined },
    { firstName: "Priya", lastName: "Desai", mrn: "CMC240006", gender: "FEMALE" as const, blood: "O_NEGATIVE" as const, phone: "+91 43210 98765", email: "priya.d@email.com", allergies: [], conditions: ["Anemia"], userId: undefined },
  ];

  const patients = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.upsert({
      where: { mrn: p.mrn },
      update: {},
      create: {
        mrn: p.mrn,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        bloodGroup: p.blood,
        phone: p.phone,
        email: p.email,
        hospitalId: hospital.id,
        userId: p.userId,
        allergies: p.allergies,
        chronicConditions: p.conditions,
        dateOfBirth: new Date(1982 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      },
    });
    patients.push(patient);
  }
  console.log("✅ Patients created:", patients.length);

  // Create appointments
  const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "SCHEDULED", "CONFIRMED", "NO_SHOW"];
  for (let i = 0; i < 15; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const daysOffset = i < 10 ? -(i * 3) : i - 10;
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
    scheduledAt.setHours(9 + (i % 8), (i % 2) * 30, 0, 0);

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.doctor.id,
        hospitalId: hospital.id,
        scheduledAt,
        duration: 30,
        type: i % 3 === 0 ? "Consultation" : i % 3 === 1 ? "Follow-Up" : "Review",
        status: statuses[i % statuses.length] as any,
        chiefComplaint: `Visit ${i + 1} - general consultation`,
      },
    });
  }
  console.log("✅ Appointments created");

  // Create invoices
  const invoiceStatuses = ["PAID", "PAID", "SENT", "OVERDUE", "DRAFT"];
  for (let i = 0; i < 8; i++) {
    const patient = patients[i % patients.length];
    const subtotal = 1500 + Math.floor(Math.random() * 8500);
    const tax = subtotal * 0.05;
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-CMC-2024-${(i + 1).toString().padStart(4, "0")}`,
        patientId: patient.id,
        hospitalId: hospital.id,
        items: [
          { description: "Consultation Fee", quantity: 1, unitPrice: 800, total: 800, category: "Consultation" },
          { description: "Lab Tests", quantity: 1, unitPrice: subtotal - 800, total: subtotal - 800, category: "Lab" },
        ],
        subtotal,
        taxRate: 0.05,
        taxAmount: tax,
        totalAmount: subtotal + tax,
        status: invoiceStatuses[i % invoiceStatuses.length] as any,
        dueDate: new Date(Date.now() + (i - 2) * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log("✅ Invoices created");

  // Create follow-ups
  for (let i = 0; i < 12; i++) {
    const patient = patients[i % patients.length];
    const days = [3, 7, 15, 30][i % 4];
    const statuses = ["SENT", "PENDING", "PENDING", "FAILED"];
    await prisma.followUp.create({
      data: {
        patientId: patient.id,
        dayOffset: days,
        scheduledAt: new Date(Date.now() + (days - 5) * 24 * 60 * 60 * 1000),
        channel: "EMAIL",
        status: statuses[i % statuses.length] as any,
        subject: `Day ${days} Follow-Up — ${patient.firstName}`,
        message: `Hi ${patient.firstName}, this is your Day ${days} check-in from City Medical Center. How are you feeling?`,
      },
    });
  }
  console.log("✅ Follow-ups created");

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("Demo Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Super Admin:     admin@medicrm.health / Admin@123");
  console.log("Hospital Admin:  hospital-admin@medicrm.health / Admin@123");
  console.log("Doctor:          doctor@medicrm.health / Doctor@123");
  console.log("Receptionist:    reception@medicrm.health / Reception@123");
  console.log("Patient:         patient@medicrm.health / Patient@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });

