import { useColorScheme } from "react-native";

export const lightColors = {
  background: "#f7f4ff",
  backgroundStrong: "#ece6ff",
  backgroundPanel: "#f0ebff",
  foreground: "#120a2e",
  muted: "#5a4d8a",
  subtle: "#8a79bb",
  card: "#ffffff",
  cardMuted: "#ede7ff",
  border: "#d0c4ff",
  primary: "#7c5ef4",
  violet: "#a855f7",
  pink: "#ec4899",
  coral: "#ff6b6b",
  orange: "#f97316",
  mint: "#10d98e",
  mintStrong: "#059669",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  yellow: "#f59e0b",
  tabBar: "#f0ebff",
  tabBarBorder: "#d0c4ff"
};

export const darkColors = {
  background: "#0d0820",
  backgroundStrong: "#180f30",
  backgroundPanel: "#130b28",
  foreground: "#eee8ff",
  muted: "#a898d8",
  subtle: "#7868a8",
  card: "#1a1035",
  cardMuted: "#22163f",
  border: "#3a2a6a",
  primary: "#a87ef6",
  violet: "#c084fc",
  pink: "#f472b6",
  coral: "#fb7185",
  orange: "#fb923c",
  mint: "#34d399",
  mintStrong: "#10b981",
  blue: "#60a5fa",
  cyan: "#22d3ee",
  yellow: "#fbbf24",
  tabBar: "#130b28",
  tabBarBorder: "#3a2a6a"
};

export type AppColors = typeof lightColors;

export function useTheme(): AppColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);

/** @deprecated Use useTheme() hook instead */
export const colors = lightColors;
