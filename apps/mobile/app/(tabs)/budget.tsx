import { useFamilyFlowStore } from "@familyflow/shared";
import { PiggyBank, Wallet } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { MetricTile } from "../../src/components/metric-tile";
import { ScreenShell } from "../../src/components/screen-shell";
import { colors, formatCurrency } from "../../src/lib/theme";

export default function BudgetScreen() {
  const state = useFamilyFlowStore();
  const income = state.budgetItems
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const spend = state.budgetItems
    .filter((item) => item.type !== "income")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <ScreenShell
      title="Budget"
      subtitle="Depenses mensuelles, categories et objectif d'epargne."
    >
      <View style={styles.grid}>
        <MetricTile
          icon={<Wallet color={colors.primary} size={18} />}
          label="Revenus"
          value={formatCurrency(income)}
        />
        <MetricTile
          icon={<PiggyBank color={colors.coral} size={18} />}
          label="Reste"
          value={formatCurrency(income - spend)}
          accent={colors.coral}
        />
      </View>

      <View style={styles.section}>
        {state.budgetItems.map((item) => (
          <View key={item.id} style={styles.item}>
            <View>
              <Text style={styles.title}>{item.label}</Text>
              <Text style={styles.subtitle}>{item.category}</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
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
  item: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  title: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 15
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4
  },
  amount: {
    color: colors.foreground,
    fontWeight: "700"
  }
});
