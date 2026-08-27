import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (type === "hospital") {
      const { hospitalName } = body;
      if (!hospitalName) {
        return NextResponse.json(
          { error: "Hospital name is required" },
          { status: 400 }
        );
      }

      // Generate a unique slug for the hospital
      let slug = hospitalName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      
      // Check if slug is occupied, append random if needed
      const existingHospital = await prisma.hospital.findUnique({
        where: { slug },
      });
      if (existingHospital) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create hospital
        const hospital = await tx.hospital.create({
          data: {
            name: hospitalName,
            slug,
            subscriptionPlan: "PROFESSIONAL",
            isActive: true,
          },
        });

        // Create subscription
        await tx.subscription.create({
          data: {
            hospitalId: hospital.id,
            plan: "PROFESSIONAL",
            status: "ACTIVE",
          },
        });

        // Create hospital admin user
        const user = await tx.user.create({
          data: {
            email,
            name,
            passwordHash,
            role: "HOSPITAL_ADMIN",
            hospitalId: hospital.id,
            isActive: true,
          },
        });

        // Log audit
        await tx.auditLog.create({
          data: {
            userId: user.id,
            hospitalId: hospital.id,
            action: "CREATE",
            entity: "Hospital",
            entityId: hospital.id,
            newValues: { hospitalName, slug, adminEmail: email },
          },
        });

        return { user, hospital };
      });

      return NextResponse.json({
        success: true,
        message: "Hospital and Admin account registered successfully!",
        userId: result.user.id,
        hospitalId: result.hospital.id,
      });

    } else if (type === "patient") {
      const { firstName, lastName, phone, gender, bloodGroup, dateOfBirth } = body;

      // Find first available hospital to assign the patient to
      let hospital = await prisma.hospital.findFirst({
        where: { isActive: true },
      });

      // Fallback in case there are no hospitals seeded yet
      if (!hospital) {
        hospital = await prisma.hospital.create({
          data: {
            name: "Default General Hospital",
            slug: "default-general-hospital",
            subscriptionPlan: "FREE",
          },
        });
      }

      // Generate a unique Medical Record Number (MRN)
      const mrn = `CMC${Date.now().toString().slice(-6)}`;

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create patient user account
        const user = await tx.user.create({
          data: {
            email,
            name: `${firstName} ${lastName}`,
            passwordHash,
            role: "PATIENT",
            hospitalId: hospital.id,
            isActive: true,
          },
        });

        // Create patient profile record
        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            hospitalId: hospital.id,
            mrn,
            firstName,
            lastName,
            email,
            phone,
            gender: gender || "OTHER",
            bloodGroup: bloodGroup || "UNKNOWN",
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            isActive: true,
          },
        });

        // Log audit
        await tx.auditLog.create({
          data: {
            userId: user.id,
            hospitalId: hospital.id,
            action: "CREATE",
            entity: "Patient",
            entityId: patient.id,
            newValues: { mrn, firstName, lastName, email },
          },
        });

        return { user, patient };
      });

      return NextResponse.json({
        success: true,
        message: "Patient account registered successfully!",
        userId: result.user.id,
        patientId: result.patient.id,
        mrn,
      });

    } else {
      return NextResponse.json(
        { error: "Invalid registration type" },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("[Registration API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during registration" },
      { status: 500 }
    );
  }
}
