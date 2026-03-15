import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../src/components/screen-shell";
import { useApp } from "../../src/hooks/app-context";
import { colors } from "../../src/lib/theme";

export default function ListsScreen() {
  const app = useApp();

  return (
    <ScreenShell title="Courses & listes" subtitle="Courses, objectifs foyer et liste de naissance.">
      <View style={styles.card}>
        <Text style={styles.title}>Courses</Text>
        {app.shopping.slice(0, 10).map((item) => (
          <Pressable key={item.id} style={styles.row} onPress={() => app.toggleShoppingItem(item.id, item.is_checked)}>
            <Text style={[styles.check, item.is_checked && styles.checked]}>{item.is_checked ? "✓" : "○"}</Text>
            <Text style={styles.text}>{item.name} {item.quantity ? `(${item.quantity})` : ""}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Objectifs</Text>
        {app.goals.map((goal) => (
          <View key={goal.id} style={styles.rowPlain}>
            <Text style={styles.text}>{goal.title}</Text>
            <Text style={styles.meta}>{goal.current_value}/{goal.target_value ?? "-"} {goal.unit ?? ""}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Liste de naissance</Text>
        {app.birthList.slice(0, 8).map((item) => (
          <View key={item.id} style={styles.rowPlain}>
            <Text style={styles.text}>{item.title}</Text>
            <Text style={styles.meta}>{item.priority} · {item.status}</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 10 },
  title: { color: colors.foreground, fontWeight: "700", fontSize: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.cardMuted, borderRadius: 12, padding: 10 },
  rowPlain: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  check: { color: colors.primary, fontSize: 17, width: 20 },
  checked: { color: colors.mint },
  text: { color: colors.foreground, fontWeight: "500", flex: 1 },
  meta: { color: colors.muted, fontSize: 12 }
});
