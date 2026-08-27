// Section 1 — What You're Selling. Edit this list to match reality; it drives
// service-tag matching (lib/scoring.ts) and which sequence template gets used
// (lib/db/schema.ts `sequences.serviceLine`).

export type ServiceLineKey =
  | "web_app_development"
  | "shopify_development"
  | "wordpress_development"
  | "crm_development"
  | "hrms_development"
  | "ai_automation"
  | "custom_business_solutions"
  | "admin_panels_dashboards";

export interface ServiceLine {
  key: ServiceLineKey;
  label: string;
  whatItIncludes: string;
  // Keywords/signals scanned for in enrichment data (tech stack, hiring
  // signals, site copy) to auto-tag a lead with this service line.
  fitSignalKeywords: string[];
}

export const SERVICE_CATALOG: ServiceLine[] = [
  {
    key: "web_app_development",
    label: "Web/App Development",
    whatItIncludes:
      "Websites, web apps, mobile apps — any tech stack (React, Next.js, MERN, PHP, Laravel, etc.)",
    fitSignalKeywords: ["no website", "outdated site", "poor ux", "slow site", "legacy stack"],
  },
  {
    key: "shopify_development",
    label: "Shopify Development",
    whatItIncludes:
      "New store builds, theme customization, app integrations, migrations to Shopify",
    fitSignalKeywords: ["shopify", "d2c", "shopify plus", "liquid theme"],
  },
  {
    key: "wordpress_development",
    label: "WordPress Development",
    whatItIncludes:
      "Custom themes/plugins, WooCommerce, site migrations, speed/security fixes",
    fitSignalKeywords: ["wordpress", "woocommerce", "elementor", "plugin bloat"],
  },
  {
    key: "crm_development",
    label: "CRM Development",
    whatItIncludes: "Custom CRM builds, CRM customization",
    fitSignalKeywords: ["spreadsheet crm", "zoho", "hubspot", "generic crm", "manual pipeline"],
  },
  {
    key: "hrms_development",
    label: "HRMS Development",
    whatItIncludes: "HR management systems, payroll, attendance",
    fitSignalKeywords: ["hiring hr", "manual payroll", "attendance tracking", "growing team"],
  },
  {
    key: "ai_automation",
    label: "AI & Automation",
    whatItIncludes: "Chatbots, workflow automation, AI agents (like this one), internal tooling",
    fitSignalKeywords: ["ops manager", "manual process", "repetitive task", "hiring ops"],
  },
  {
    key: "custom_business_solutions",
    label: "Custom Business Solutions",
    whatItIncludes: "Bespoke software for specific workflows, any tech stack",
    fitSignalKeywords: ["we do x differently", "unique workflow", "operational bottleneck"],
  },
  {
    key: "admin_panels_dashboards",
    label: "Admin Panels & Dashboards",
    whatItIncludes: "Internal tools, analytics dashboards, reporting systems",
    fitSignalKeywords: ["data scattered", "no single source of truth", "reporting gap"],
  },
];

export function getServiceLine(key: string): ServiceLine | undefined {
  return SERVICE_CATALOG.find((s) => s.key === key);
}
