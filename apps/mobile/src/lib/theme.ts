export const colors = {
  background: "#FFF9F5",
  foreground: "#171329",
  muted: "#6A6782",
  primary: "#6D5EF4",
  coral: "#FF7E6B",
  mint: "#56C7A1",
  yellow: "#FFBF5A",
  card: "#FFFFFF",
  cardMuted: "#F6F1FF",
  border: "#E8E2FF"
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

