import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../lib/theme";

export function MetricTile({
  icon,
  label,
  value,
  accent
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  const colors = useTheme();
  const accentColor = accent ?? colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>{icon}</View>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    gap: 8
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontSize: 13
  },
  value: {
    fontSize: 24,
    fontWeight: "700"
  }
});
