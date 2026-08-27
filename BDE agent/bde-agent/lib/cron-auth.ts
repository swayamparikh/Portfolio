// Protects /api/cron/* routes from public access (Section 21 env var: CRON_SECRET).
// Vercel Cron sends this as `Authorization: Bearer <CRON_SECRET>` automatically
// when CRON_SECRET is set as an env var — see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs

export function isAuthorizedCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // never allow unauthenticated cron execution
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}
