export { auth as proxy } from "@/auth";

export const config = {
  // Protect every dashboard route; leave /login, /api/auth, /api/cron and
  // /api/webhooks open (cron/webhooks are protected separately by secrets —
  // see lib/cron-auth.ts and each integration's verifyWebhook* helper).
  matcher: ["/((?!login|api/auth|api/cron|api/webhooks|_next/static|_next/image|favicon.ico).*)"],
};
