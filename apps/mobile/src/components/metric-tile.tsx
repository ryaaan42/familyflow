import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../lib/theme";

export function MetricTile({
  icon,
  label,
  value,
  accent = colors.primary
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    color: colors.muted,
    fontSize: 13
  },
  value: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: "700"
  }
});
