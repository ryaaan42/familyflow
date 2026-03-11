import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../lib/theme";

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
  const accentColor = accent ?? colors.primary;

  return (
    <View style={styles.card}>
      {icon !== undefined && (
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}18` }]}>{icon}</View>
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 8
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    color: colors.muted,
    fontSize: 13
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5
  }
});
