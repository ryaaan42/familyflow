import { buildSavingsSummary, useFamilyFlowStore } from "@familyflow/shared";
import { Lightbulb } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { MetricTile } from "../../src/components/metric-tile";
import { ScreenShell } from "../../src/components/screen-shell";
import { colors, formatCurrency } from "../../src/lib/theme";

export default function SavingsScreen() {
  const state = useFamilyFlowStore();
  const summary = buildSavingsSummary(state.savingsScenarios, state.tasks, state.budgetItems);

  return (
    <ScreenShell
      title="Economies"
      subtitle="Scenarios lies aux habitudes et impact concret sur 3, 6 et 12 mois."
    >
      <View style={styles.grid}>
        <MetricTile label="Gain mensuel" value={formatCurrency(summary.monthlySavings)} />
        <MetricTile
          label="Gain annuel"
          value={formatCurrency(summary.annualSavings)}
          accent={colors.mint}
        />
      </View>

      <View style={styles.section}>
        {state.savingsScenarios.map((scenario) => (
          <View key={scenario.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Lightbulb color={colors.coral} size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{scenario.title}</Text>
                <Text style={styles.subtitle}>{scenario.description}</Text>
              </View>
            </View>
            <Text style={styles.impact}>
              {formatCurrency(scenario.monthlyCost - scenario.improvedMonthlyCost)} / mois
            </Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 12
  },
  section: {
    gap: 12
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 14
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0ED"
  },
  title: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 15
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
    lineHeight: 20
  },
  impact: {
    color: colors.mint,
    fontWeight: "700",
    fontSize: 15
  }
});
