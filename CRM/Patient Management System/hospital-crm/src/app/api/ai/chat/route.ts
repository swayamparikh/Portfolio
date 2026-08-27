import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `You are MediAI, a friendly and empathetic AI wellness assistant for a hospital management platform.

IMPORTANT RULES:
1. NEVER diagnose medical conditions or prescribe medications
2. ALWAYS recommend consulting with the patient's doctor for medical concerns
3. Always include a disclaimer when discussing health-related topics
4. Be warm, caring, and supportive in your responses
5. You CAN help with: appointment queries, prescription explanations (in simple language), 
   general wellness tips, test report explanations (in lay terms), and follow-up reminders
6. For emergencies, ALWAYS direct to call emergency services (108 in India)

You have access to the patient's general context but CANNOT see their full medical records.
Always introduce yourself as MediAI when appropriate.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, patientId } = await req.json();

    // Get basic patient context if patientId provided
    let patientContext = "";
    if (patientId) {
      try {
        const patient = await prisma.patient.findUnique({
          where: { id: patientId },
          select: {
            firstName: true,
            allergies: true,
            currentMedications: true,
            appointments: {
              where: { scheduledAt: { gte: new Date() } },
              orderBy: { scheduledAt: "asc" },
              take: 1,
            },
          },
        });
        if (patient) {
          patientContext = `\nPatient context: Name is ${patient.firstName}. Allergies: ${patient.allergies.join(", ") || "none documented"}. Current medications: ${patient.currentMedications.join(", ") || "none documented"}.`;
          if (patient.appointments.length > 0) {
            patientContext += ` Next appointment: ${new Date(patient.appointments[0].scheduledAt).toLocaleDateString()}.`;
          }
        }
      } catch {}
    }

    const systemMessage = SYSTEM_PROMPT + patientContext;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        ...messages,
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    });

    // Return streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content ?? "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[AI Chat]", error);
    return new Response("Failed to process chat message", { status: 500 });
  }
}
