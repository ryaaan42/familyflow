import { useFamilyFlowStore } from "@familyflow/shared";
import { Shuffle, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../src/components/screen-shell";
import { colors } from "../../src/lib/theme";

export default function TasksScreen() {
  const state = useFamilyFlowStore();

  return (
    <ScreenShell
      title="Taches"
      subtitle="Repartition equitable, completion rapide et moteur de suggestions."
    >
      <Pressable style={styles.action} onPress={() => state.rebalanceAssignments()}>
        <Shuffle color={colors.primary} size={18} />
        <Text style={styles.actionText}>Reequilibrer automatiquement</Text>
      </Pressable>

      <View style={styles.list}>
        {state.tasks.map((task) => (
          <Pressable
            key={task.id}
            style={styles.card}
            onPress={() => state.toggleTask(task.id)}
          >
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Sparkles color={colors.primary} size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{task.title}</Text>
                <Text style={styles.subtitle}>
                  {state.profile.members.find((member) => member.id === task.assignedMemberId)?.name ??
                    "A assigner"}{" "}
                  · {task.estimatedMinutes} min
                </Text>
              </View>
              <Text style={[styles.badge, task.status === "done" && styles.done]}>
                {task.status === "done" ? "Fait" : "A faire"}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  actionText: {
    color: colors.foreground,
    fontWeight: "600"
  },
  list: {
    gap: 12
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2EEFF"
  },
  title: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600"
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4
  },
  badge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  },
  done: {
    color: colors.mint
  }
});
