// Section 2 — "Schedule sends so they land in the prospect's morning… not one
// blast time." Rough geo-string -> IANA timezone mapping so send-sequences
// can check the prospect's local hour. Apollo/enrichment data gives a
// free-text geo string, not a precise timezone, so this is a best-effort map
// — extend GEO_TIMEZONE_MAP as you see real geo values come through.

import { toZonedTime } from "date-fns-tz";
import { ICP } from "./icp";

const GEO_TIMEZONE_MAP: Record<string, string> = {
  "united states": "America/New_York",
  usa: "America/New_York",
  us: "America/New_York",
  "united kingdom": "Europe/London",
  uk: "Europe/London",
  canada: "America/Toronto",
  australia: "Australia/Sydney",
  "united arab emirates": "Asia/Dubai",
  uae: "Asia/Dubai",
  germany: "Europe/Berlin",
  france: "Europe/Paris",
  netherlands: "Europe/Amsterdam",
  india: "Asia/Kolkata",
};

function regionKeyForGeo(geo: string): keyof typeof ICP.sendWindowsByRegion {
  const g = geo.toLowerCase();
  if (g.includes("united states") || g === "us" || g === "usa") return "US";
  if (
    g.includes("united kingdom") ||
    g === "uk" ||
    g.includes("germany") ||
    g.includes("france") ||
    g.includes("netherlands") ||
    g.includes("europe")
  ) {
    return "UK_EU";
  }
  return "default";
}

export function guessTimezone(geo: string | null | undefined): string {
  if (!geo) return "UTC";
  const key = Object.keys(GEO_TIMEZONE_MAP).find((k) => geo.toLowerCase().includes(k));
  return key ? GEO_TIMEZONE_MAP[key] : "UTC";
}

// True if right now falls inside this lead's region's configured send window
// (Section 2: US 6-9AM their time, UK/EU mid-morning their time).
export function isWithinSendWindow(geo: string | null | undefined, now: Date = new Date()): boolean {
  const timezone = guessTimezone(geo ?? undefined);
  const zoned = toZonedTime(now, timezone);
  const localHour = zoned.getHours();

  const region = regionKeyForGeo(geo ?? "");
  const window = ICP.sendWindowsByRegion[region];
  return localHour >= window.startHour && localHour < window.endHour;
}
