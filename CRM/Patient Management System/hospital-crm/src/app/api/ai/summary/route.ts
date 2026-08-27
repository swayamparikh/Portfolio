import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { patientId } = await req.json();
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

    // Fetch comprehensive patient data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        medicalRecords: {
          include: { doctor: { include: { user: true } }, prescriptions: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        labReports: { orderBy: { reportedAt: "desc" }, take: 5 },
        appointments: { orderBy: { scheduledAt: "desc" }, take: 10 },
      },
    });

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const patientContext = `
Patient: ${patient.firstName} ${patient.lastName} (${patient.mrn})
Age: ${patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : "Unknown"} years
Gender: ${patient.gender}
Blood Group: ${patient.bloodGroup}
Allergies: ${patient.allergies.join(", ") || "None documented"}
Chronic Conditions: ${patient.chronicConditions.join(", ") || "None documented"}
Current Medications: ${patient.currentMedications.join(", ") || "None documented"}

Medical Records (${patient.medicalRecords.length} consultations):
${patient.medicalRecords.map((r) =>
  `- ${new Date(r.createdAt).toLocaleDateString()} by ${r.doctor.user.name}: ${r.consultationNotes ?? "No notes"} | Diagnoses: ${r.diagnosis.join(", ") || "None"}`
).join("\n")}

Recent Appointments:
${patient.appointments.map((a) =>
  `- ${new Date(a.scheduledAt).toLocaleDateString()}: ${a.type} - ${a.status}`
).join("\n")}

Lab Reports:
${patient.labReports.map((r) =>
  `- ${new Date(r.reportedAt).toLocaleDateString()}: ${r.testName} (${r.reportType})`
).join("\n")}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a clinical AI assistant that summarizes patient medical histories for healthcare professionals.
Your summary must be clinically structured, concise, and actionable.
Format your response in markdown with clear sections:
## Key Medical Conditions
## Previous Treatments & Response
## Risk Indicators  
## Follow-Up Recommendations
Never provide definitive diagnoses — indicate these are AI-generated summaries for physician review.`,
        },
        {
          role: "user",
          content: `Please generate a comprehensive medical summary for this patient:\n\n${patientContext}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const summary = completion.choices[0].message.content ?? "";

    // Save AI summary to latest medical record
    if (patient.medicalRecords.length > 0) {
      await prisma.medicalRecord.update({
        where: { id: patient.medicalRecords[0].id },
        data: { aiSummary: summary },
      });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[AI Summary]", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
