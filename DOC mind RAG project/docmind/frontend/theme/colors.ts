export const colors = {
  background: "#FAFAFA",
  surface: "#FFFFFF",
  border: "#EAEAEA",
  signal: "#E10600",
  graphite: "#1A1A1A",
  muted: "#6B6B6B",
  success: "#16A34A",
  warning: "#D97706",
  error: "#E10600",
} as const;

export const consoleColors = {
  background: "#0A0A0A",
  surface: "#111111",
  border: "#262626",
  text: "#FFFFFF",
  signal: "#E10600",
  muted: "#9CA3AF",
} as const;

export function confidenceColor(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return colors.graphite;
  if (confidence === "medium") return colors.warning;
  return colors.signal;
}
