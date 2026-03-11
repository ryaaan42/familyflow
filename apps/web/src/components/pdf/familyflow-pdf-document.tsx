import React from "react";
import {
  Document,
  type DocumentProps,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import { buildSavingsSummary, DemoDataset, PdfTheme } from "@familyflow/shared";

const themeMap: Record<PdfTheme, { accent: string; soft: string; text: string }> = {
  minimal: { accent: "#3B82F6", soft: "#EEF5FF", text: "#10213B" },
  "familial-kawaii": { accent: "#FF7E6B", soft: "#FFF1ED", text: "#452D26" },
  premium: { accent: "#6D5EF4", soft: "#F1EFFF", text: "#171329" },
  print: { accent: "#222222", soft: "#F3F3F3", text: "#111111" }
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    color: "#171329",
    fontFamily: "Helvetica"
  },
  header: {
    marginBottom: 18
  },
  title: {
    fontSize: 24,
    fontWeight: 700
  },
  subtitle: {
    fontSize: 11,
    color: "#61607A",
    marginTop: 4
  },
  section: {
    marginTop: 14,
    padding: 16,
    borderRadius: 16
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10
  },
  metric: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF"
  },
  metricLabel: {
    fontSize: 10,
    color: "#61607A"
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 4
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E2FF"
  }
});

export function FamilyFlowPdfDocument({
  data,
  theme
}: {
  data: DemoDataset;
  theme: PdfTheme;
}): React.ReactElement<DocumentProps> {
  const palette = themeMap[theme];
  const savings = buildSavingsSummary(data.savingsScenarios, data.tasks, data.budgetItems);

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, color: palette.text }}>
        <View style={styles.header}>
          <Text style={styles.title}>FamilyFlow</Text>
          <Text style={styles.subtitle}>
            {data.profile.household.name} - Planning hebdomadaire et budget
          </Text>
        </View>

        <View style={{ ...styles.section, backgroundColor: palette.soft }}>
          <Text style={{ fontSize: 14, fontWeight: 700 }}>Resume du foyer</Text>
          <View style={styles.row}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Membres</Text>
              <Text style={styles.metricValue}>{data.profile.members.length}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Animaux</Text>
              <Text style={styles.metricValue}>{data.profile.pets.length}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Score d'equite</Text>
              <Text style={styles.metricValue}>{data.profile.household.balanceScore}/100</Text>
            </View>
          </View>
        </View>

        <View style={{ ...styles.section, backgroundColor: "#FFFFFF" }}>
          <Text style={{ fontSize: 14, fontWeight: 700 }}>Taches prioritaires</Text>
          {data.tasks.slice(0, 8).map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <View>
                <Text>{task.title}</Text>
                <Text style={{ fontSize: 10, color: "#6A6782", marginTop: 3 }}>
                  {data.profile.members.find((member) => member.id === task.assignedMemberId)?.name ?? "A assigner"}
                </Text>
              </View>
              <Text>{task.status === "done" ? "Oui" : "Non"}</Text>
            </View>
          ))}
        </View>

        <View style={{ ...styles.section, backgroundColor: palette.soft }}>
          <Text style={{ fontSize: 14, fontWeight: 700 }}>Budget & economies</Text>
          <View style={styles.row}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Objectif epargne</Text>
              <Text style={styles.metricValue}>{data.budget.targetSavings} EUR</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Gain mensuel potentiel</Text>
              <Text style={styles.metricValue}>{Math.round(savings.monthlySavings)} EUR</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Gain annuel potentiel</Text>
              <Text style={styles.metricValue}>{Math.round(savings.annualSavings)} EUR</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export const createFamilyFlowPdfDocument = (
  data: DemoDataset,
  theme: PdfTheme
): React.ReactElement<DocumentProps> => <FamilyFlowPdfDocument data={data} theme={theme} />;
