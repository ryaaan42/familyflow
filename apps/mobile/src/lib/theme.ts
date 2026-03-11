export const colors = {
  background: "#f9f8ff",
  backgroundPanel: "#f4f2ff",
  foreground: "#0d0c1e",
  muted: "#5d5a7a",
  subtle: "#9490b8",
  card: "#ffffff",
  cardMuted: "#f0edff",
  border: "#e5e1ff",
  primary: "#7c3aed",
  violet: "#8b5cf6",
  pink: "#ec4899",
  coral: "#f43f5e",
  orange: "#f97316",
  mint: "#10b981",
  mintStrong: "#059669",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  yellow: "#f59e0b",
  tabBar: "#ffffff",
  tabBarBorder: "#e5e1ff"
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
