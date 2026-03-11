import { selectDashboardSummary, useFamilyFlowStore } from "@familyflow/shared";
import { CheckCircle2, PiggyBank, Users2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { MetricTile } from "../../src/components/metric-tile";
import { ScreenShell } from "../../src/components/screen-shell";
import { colors, formatCurrency } from "../../src/lib/theme";

export default function DashboardScreen() {
  const state = useFamilyFlowStore();
  const summary = selectDashboardSummary(state);

  return (
    <ScreenShell
      title="FamilyFlow"
      subtitle="Organisation familiale, budget et economies dans une seule app."
    >
      <LinearGradient
        colors={["#6D5EF4", "#4A8EFF", "#56C7A1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>Famille Martin</Text>
        <Text style={styles.heroTitle}>{summary.completionRate} % des taches completees</Text>
        <Text style={styles.heroSubtitle}>
          Economie annuelle potentielle: {formatCurrency(summary.savings.annualSavings)}
        </Text>
      </LinearGradient>

      <View style={styles.grid}>
        <MetricTile
          icon={<CheckCircle2 color={colors.primary} size={18} />}
          label="Taches du jour"
          value={`${state.tasks.filter((task) => task.status !== "done").length}`}
        />
        <MetricTile
          icon={<PiggyBank color={colors.coral} size={18} />}
          label="Budget restant"
          value={formatCurrency(summary.disposableIncome)}
          accent={colors.coral}
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Users2 color={colors.primary} size={18} />
          <Text style={styles.sectionTitle}>Priorites du jour</Text>
        </View>
        <View style={styles.list}>
          {state.tasks.slice(0, 4).map((task) => (
            <View key={task.id} style={styles.listItem}>
              <View>
                <Text style={styles.itemTitle}>{task.title}</Text>
                <Text style={styles.itemSubtitle}>
                  {state.profile.members.find((member) => member.id === task.assignedMemberId)?.name ??
                    "A assigner"}
                </Text>
              </View>
              <Text style={[styles.status, task.status === "done" && styles.statusDone]}>
                {task.status === "done" ? "Fait" : "A faire"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 30,
    padding: 20,
    gap: 8
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -1
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 22
  },
  grid: {
    flexDirection: "row",
    gap: 12
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 18,
    gap: 14
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground
  },
  list: {
    gap: 12
  },
  listItem: {
    backgroundColor: colors.cardMuted,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  itemTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600"
  },
  itemSubtitle: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 13
  },
  status: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  },
  statusDone: {
    color: colors.mint
  }
});
