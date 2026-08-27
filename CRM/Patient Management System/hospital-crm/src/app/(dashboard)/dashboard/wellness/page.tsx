import type { Metadata } from "next";
import WellnessChatClient from "./WellnessChatClient";
export const metadata: Metadata = { title: "AI Wellness Assistant" };
export default function WellnessPage() { return <WellnessChatClient />; }
