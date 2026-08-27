// Nestly brand tokens — "Bright Premium Light" theme (see Section 5 of spec)

export const colors = {
  background: "#FFFFFF",
  surface: "#F7F8FA",

  coral: {
    from: "#FF5A5F",
    to: "#FF385C",
  },

  ocean: "#1A73E8",
  trust: "#00A699",

  text: {
    heading: "#1A1A1A",
    body: "#404040",
    muted: "#717171",
  },

  border: "#EBEBEB",

  admin: {
    background: "#FFFFFF",
    surface: "#F7F8FA",
    accent: "#1A73E8",
    alert: "#FF385C",
  },
} as const;

export const gradients = {
  coral: "linear-gradient(100deg, #FF5A5F 0%, #FF385C 100%)",
};

export const shadows = {
  card: "0 6px 16px rgba(0,0,0,0.08)",
  cardHover: "0 12px 28px rgba(0,0,0,0.12)",
  ctaGlow: "0 8px 20px rgba(255,56,92,0.25)",
};
