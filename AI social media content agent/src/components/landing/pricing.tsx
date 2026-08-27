import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For trying ContentPilot out on real content.",
    features: [
      "20 generations / day",
      "1 brand profile",
      "All platforms & content types",
      "Content library & favorites",
    ],
    cta: "Start free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For creators and solo marketers posting daily.",
    features: [
      "Unlimited generations",
      "5 brand profiles",
      "7-day content calendars",
      "Priority generation speed",
      "Export to CSV",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$49",
    period: "/month",
    description: "For agencies managing multiple clients.",
    features: [
      "Everything in Pro",
      "Unlimited brand profiles",
      "Team seats (coming soon)",
      "White-label export",
      "Priority support",
    ],
    cta: "Talk to us",
    href: "/signup",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Simple, transparent pricing</h2>
        <p className="text-muted-foreground mt-3">
          Start free. Upgrade when you need more brand profiles or volume.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              "relative flex flex-col",
              tier.highlighted && "border-primary shadow-lg ring-1 ring-primary/20"
            )}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6">
              <ul className="flex flex-1 flex-col gap-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={tier.highlighted ? "gradient" : "outline"}
                className="w-full"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
