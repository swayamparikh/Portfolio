import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { sendEmail, followUpEmail } from "@/lib/email";
import { addDays } from "date-fns";

const FOLLOW_UP_DAYS = [3, 7, 15, 30];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { patientId, appointmentId } = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        hospital: true,
        medicalRecords: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const latestRecord = patient.medicalRecords[0];
    const diagnosis = latestRecord?.diagnosis?.join(", ") ?? "your recent treatment";
    const patientName = patient.firstName;

    // Generate personalized messages using AI
    const messagePrompt = `Generate 4 personalized, warm follow-up messages for a patient named ${patientName} who was treated for: ${diagnosis}.
Messages should be for Day 3, Day 7, Day 15, and Day 30 post-appointment.
Format as JSON array: [{"day": 3, "subject": "...", "message": "..."}, ...]
Keep each message under 100 words. Be empathetic and caring. Include a wellness tip for the condition.
Never provide medical advice or diagnosis. End with a suggestion to contact the doctor if needed.`;

    let messages: Array<{ day: number; subject: string; message: string }>;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a healthcare AI assistant. Respond ONLY with valid JSON, no markdown." },
          { role: "user", content: messagePrompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
      messages = parsed.messages ?? parsed;
    } catch {
      // Fallback messages if AI fails
      messages = FOLLOW_UP_DAYS.map((day) => ({
        day,
        subject: day === 3 ? "How are you feeling?" : day === 7 ? "Checking in on your recovery" : day === 15 ? "Medication reminder" : "Time for a follow-up?",
        message:
          day === 3 ? `Hi ${patientName}, how are you feeling after your recent appointment? We hope you are recovering well. Please don't hesitate to reach out if you have any concerns.` :
          day === 7 ? `Hello ${patientName}, it's been a week since your appointment. Have your symptoms improved? Remember to complete any prescribed treatments.` :
          day === 15 ? `Dear ${patientName}, please remember to take your prescribed medications regularly. Consistent medication adherence is key to your recovery.` :
          `Dear ${patientName}, it's been a month since your last visit. Would you like to schedule a follow-up appointment? Your health is our priority.`,
      }));
    }

    // Create follow-up records
    const now = new Date();
    const followUps = await Promise.all(
      messages.map((msg) =>
        prisma.followUp.create({
          data: {
            patientId,
            appointmentId,
            dayOffset: msg.day,
            scheduledAt: addDays(now, msg.day),
            channel: "EMAIL",
            status: "PENDING",
            message: msg.message,
            subject: msg.subject,
          },
        })
      )
    );

    return NextResponse.json({ followUps, count: followUps.length });
  } catch (error) {
    console.error("[AI Follow-up]", error);
    return NextResponse.json({ error: "Failed to generate follow-ups" }, { status: 500 });
  }
}

// Send pending follow-ups (called by cron)
export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const pending = await prisma.followUp.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: now },
      },
      include: {
        patient: { include: { hospital: true } },
      },
      take: 50,
    });

    const results = await Promise.all(
      pending.map(async (followUp) => {
        if (!followUp.patient.email) {
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: { status: "SKIPPED" },
          });
          return { id: followUp.id, status: "SKIPPED" };
        }

        const html = followUpEmail({
          patientName: followUp.patient.firstName,
          message: followUp.message,
          hospitalName: followUp.patient.hospital.name,
          dayOffset: followUp.dayOffset,
        });

        const result = await sendEmail({
          to: followUp.patient.email,
          subject: followUp.subject ?? `Day ${followUp.dayOffset} Follow-Up`,
          html,
        });

        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: result.success ? "SENT" : "FAILED",
            sentAt: result.success ? now : undefined,
            error: result.success ? undefined : String(result.error),
          },
        });

        return { id: followUp.id, status: result.success ? "SENT" : "FAILED" };
      })
    );

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("[Send Follow-ups]", error);
    return NextResponse.json({ error: "Failed to send follow-ups" }, { status: 500 });
  }
}
