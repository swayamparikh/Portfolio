// Seeds the Section 5 email sequence templates (one 4-step set per service
// line in the catalog) and creates the admin login from ADMIN_EMAIL /
// ADMIN_PASSWORD env vars. Run with: npm run db:seed
//
// lib/db and its dependents are dynamically imported AFTER dotenv loads
// .env.local — static imports are hoisted above top-level code in ESM, so a
// static import of lib/db here would run (and throw on missing DATABASE_URL)
// before config() ever executes.

import { config } from "dotenv";
config({ path: ".env.local" });

const SEQUENCE_STEPS = [
  {
    stepNumber: 1,
    delayDays: 0,
    subject: "quick one about {company}'s {observation}",
    templateBody: `Hi {first_name},

Noticed {observation}.

We build {service} for companies like yours — recently helped a similar company do {case_study}.

Worth a quick 15-min call to see if there's a fit?

Reply "no thanks" and I won't follow up again.

{your_name}`,
  },
  {
    stepNumber: 2,
    delayDays: 4,
    subject: "re: quick one",
    templateBody: `Following up — thought this might be useful either way: {case_study}.

If timing's off, no worries — just say so and I'll close the loop.`,
  },
  {
    stepNumber: 3,
    delayDays: 4,
    subject: "how a similar company solved this",
    templateBody: `Quick example: a client had a similar problem. We built {service}, result was {metric}.

Happy to share how we'd approach something similar for {company} — free to chat this week?`,
  },
  {
    stepNumber: 4,
    delayDays: 4,
    subject: "closing the loop",
    templateBody: `I'll stop following up here — if it's ever relevant, reply anytime and I'll pick this back up.`,
  },
];

async function main() {
  const { db } = await import("../lib/db");
  const { sequences, users } = await import("../lib/db/schema");
  const { SERVICE_CATALOG } = await import("../lib/service-catalog");
  const bcrypt = (await import("bcryptjs")).default;

  for (const service of SERVICE_CATALOG) {
    for (const step of SEQUENCE_STEPS) {
      await db.insert(sequences).values({
        serviceLine: service.key,
        stepNumber: step.stepNumber,
        subject: step.subject,
        templateBody: step.templateBody,
        delayDays: step.delayDays,
      });
    }
  }
  console.log(`Seeded ${SERVICE_CATALOG.length * SEQUENCE_STEPS.length} sequence steps.`);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user seed.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(users)
    .values({ email: email.toLowerCase(), passwordHash, name: "Admin" })
    .onConflictDoNothing({ target: users.email });
  console.log(`Seeded admin user ${email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
