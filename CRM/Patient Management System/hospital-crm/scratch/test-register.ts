import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Load environment variables manually if needed
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/hospital_crm";

console.log("🔌 Connecting to database:", connectionString);

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("🧪 Starting signup API simulation test...\n");

  const testEmailHospital = `test.admin.${Date.now()}@testclinic.com`;
  const testEmailPatient = `test.patient.${Date.now()}@gmail.com`;
  const passwordHash = await bcrypt.hash("TestPassword123", 12);

  try {
    // ----------------------------------------------------
    // TEST CASE 1: HOSPITAL REGISTER SIMULATION
    // ----------------------------------------------------
    console.log("🔹 Test Case 1: Registering a new Hospital & Admin...");
    
    const hospitalName = "Test Healthcare Apex Clinic";
    const slug = `test-apex-clinic-${Date.now()}`;

    const resultHosp = await prisma.$transaction(async (tx) => {
      const hospital = await tx.hospital.create({
        data: {
          name: hospitalName,
          slug,
          subscriptionPlan: "PROFESSIONAL",
        },
      });

      await tx.subscription.create({
        data: {
          hospitalId: hospital.id,
          plan: "PROFESSIONAL",
          status: "ACTIVE",
        },
      });

      const user = await tx.user.create({
        data: {
          email: testEmailHospital,
          name: "Test Admin User",
          passwordHash,
          role: "HOSPITAL_ADMIN",
          hospitalId: hospital.id,
        },
      });

      return { user, hospital };
    });

    console.log("✅ Hospital Registered Successfully!");
    console.log("   - Hospital ID:", resultHosp.hospital.id);
    console.log("   - Admin User ID:", resultHosp.user.id);
    console.log("   - Slug:", resultHosp.hospital.slug);

    // ----------------------------------------------------
    // TEST CASE 2: PATIENT REGISTER SIMULATION
    // ----------------------------------------------------
    console.log("\n🔹 Test Case 2: Registering a new Patient...");

    const mrn = `CMC${Date.now().toString().slice(-6)}`;

    const resultPat = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: testEmailPatient,
          name: "Test Patient Arjun",
          passwordHash,
          role: "PATIENT",
          hospitalId: resultHosp.hospital.id,
        },
      });

      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          hospitalId: resultHosp.hospital.id,
          mrn,
          firstName: "Arjun",
          lastName: "Test",
          email: testEmailPatient,
          phone: "+91 99999 88888",
          gender: "MALE",
          bloodGroup: "O_POSITIVE",
          dateOfBirth: new Date("1995-05-15"),
        },
      });

      return { user, patient };
    });

    console.log("✅ Patient Registered Successfully!");
    console.log("   - Patient ID:", resultPat.patient.id);
    console.log("   - User ID:", resultPat.user.id);
    console.log("   - MRN Assigned:", resultPat.patient.mrn);

    console.log("\n🎉 All registration database transaction tests passed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runTests();
