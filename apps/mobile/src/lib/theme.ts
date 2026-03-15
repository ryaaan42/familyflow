export const colors = {
  background: "#FFFFFF",
  foreground: "#111827",
  primary: "#6D5EF4",
  "primary-foreground": "#FFFFFF",
  secondary: "#F472B6",
  "secondary-foreground": "#FFFFFF",
  muted: "#6B7280",
  "muted-foreground": "#E5E7EB",
  accent: "#FBBF24",
  destructive: "#EF4444",
  border: "#E5E7EB",
  ring: "#A78BFA",
  card: "#FFFFFF",
  "card-foreground": "#111827"
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

