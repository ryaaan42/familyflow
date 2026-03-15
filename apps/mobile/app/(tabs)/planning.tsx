import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../src/components/screen-shell";
import { useApp } from "../../src/hooks/app-context";
import { colors } from "../../src/lib/theme";

const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function PlanningScreen() {
  const app = useApp();

  return (
    <ScreenShell title="Planning hebdo" subtitle="Tâches par jour, assignation et repas de la semaine.">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tâches du jour</Text>
        {app.tasks.slice(0, 8).map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <Pressable onPress={() => app.toggleTask(task.id, task.status)}>
              <Text style={[styles.status, task.status === "done" && styles.done]}>{task.status === "done" ? "✓" : "○"}</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskMeta}>{task.category} · {task.estimated_minutes} min · {task.due_date}</Text>
            </View>
            {!!app.members[0] ? (
              <Pressable style={styles.assignBtn} onPress={() => app.assignTask(task.id, app.members[0].id)}>
                <Text style={styles.assignText}>Assigner</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Repas hebdomadaires</Text>
        {dayLabels.map((day, i) => {
          const lunch = app.meals.find((meal) => meal.day_of_week === i && meal.meal_type === "lunch");
          const dinner = app.meals.find((meal) => meal.day_of_week === i && meal.meal_type === "dinner");
          return (
            <View key={day} style={styles.mealRow}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.mealText}>Déj: {lunch?.title ?? "-"}</Text>
              <Text style={styles.mealText}>Dîner: {dinner?.title ?? "-"}</Text>
            </View>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 12 },
  sectionTitle: { color: colors.foreground, fontSize: 18, fontWeight: "700" },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.cardMuted, borderRadius: 14, padding: 10 },
  status: { color: colors.primary, fontSize: 18, width: 22 },
  done: { color: colors.mint },
  taskTitle: { color: colors.foreground, fontWeight: "600" },
  taskMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  assignBtn: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  assignText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  mealRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  day: { color: colors.foreground, fontWeight: "700", marginBottom: 4 },
  mealText: { color: colors.muted }
});
