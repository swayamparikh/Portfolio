import {
  CalendarClock,
  Hash,
  LayoutTemplate,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Palette,
    title: "Brand voice, remembered",
    description:
      "Set up a brand profile once — tone, industry, audience — and every generation stays on-voice.",
  },
  {
    icon: LayoutTemplate,
    title: "Every platform, formatted right",
    description:
      "Instagram, LinkedIn, X, Facebook, TikTok — each gets platform-specific structure, length, and emoji rules.",
  },
  {
    icon: Hash,
    title: "Hashtags that actually help",
    description:
      "10-15 hashtags grouped into broad, niche, and branded buckets — not a random pile.",
  },
  {
    icon: Wand2,
    title: "Hooks & alternatives",
    description:
      "Get 2-3 alternative opening lines for every post so you can A/B test what lands.",
  },
  {
    icon: CalendarClock,
    title: "7-day content calendars",
    description:
      "Generate a full week of themed post ideas in one shot when you're planning ahead.",
  },
  {
    icon: Sparkles,
    title: "Your content, saved",
    description:
      "Every generation is saved to your library automatically — filter, favorite, and regenerate anytime.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Everything you need to post consistently
        </h2>
        <p className="text-muted-foreground mt-3">
          Built for founders, marketers, and agencies who need good content fast, not eventually.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
