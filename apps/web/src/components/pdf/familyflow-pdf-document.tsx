import React from "react";
import {
  Document,
  type DocumentProps,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import { addDays, startOfWeek } from "date-fns";
import {
  buildSavingsSummary,
  categoryColors,
  categoryLabels,
  DemoDataset,
  PdfTheme
} from "@familyflow/shared";

const weekdayLabels = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const themeMap: Record<
  PdfTheme,
  {
    accent: string;
    soft: string;
    page: string;
    text: string;
    muted: string;
    panel: string;
  }
> = {
  minimal: {
    accent: "#3B82F6",
    soft: "#EEF5FF",
    page: "#F7FBFF",
    text: "#10213B",
    muted: "#5D708A",
    panel: "#FFFFFF"
  },
  "familial-kawaii": {
    accent: "#FF7E6B",
    soft: "#FFF1ED",
    page: "#FFF8F4",
    text: "#452D26",
    muted: "#8A635A",
    panel: "#FFFFFF"
  },
  premium: {
    accent: "#6D5EF4",
    soft: "#F1EFFF",
    page: "#FAF8FF",
    text: "#171329",
    muted: "#696482",
    panel: "#FFFFFF"
  },
  print: {
    accent: "#222222",
    soft: "#F3F3F3",
    page: "#FFFFFF",
    text: "#111111",
    muted: "#5A5A5A",
    panel: "#FFFFFF"
  }
};

const styles = StyleSheet.create({
  pageLandscape: {
    paddingTop: 22,
    paddingRight: 24,
    paddingBottom: 20,
    paddingLeft: 24,
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  pagePortrait: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  headerRibbon: {
    borderRadius: 22,
    paddingTop: 18,
    paddingRight: 20,
    paddingBottom: 18,
    paddingLeft: 20
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  eyebrow: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.3
  },
  title: {
    fontSize: 25,
    fontWeight: 700,
    marginTop: 6
  },
  subtitle: {
    fontSize: 10,
    marginTop: 6,
    lineHeight: 1.5
  },
  heroMetrics: {
    flexDirection: "row",
    marginTop: 16
  },
  heroMetric: {
    flex: 1,
    borderRadius: 16,
    paddingTop: 10,
    paddingRight: 12,
    paddingBottom: 10,
    paddingLeft: 12,
    marginRight: 10
  },
  heroMetricLast: {
    marginRight: 0
  },
  metricLabel: {
    fontSize: 9
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 4
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700
  },
  sectionNote: {
    fontSize: 9
  },
  routinesWrap: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  routineCard: {
    width: "31.5%",
    borderRadius: 16,
    paddingTop: 10,
    paddingRight: 12,
    paddingBottom: 10,
    paddingLeft: 12,
    marginRight: "2.75%",
    marginBottom: 8
  },
  routineCardThird: {
    marginRight: 0
  },
  routineTitle: {
    fontSize: 10,
    fontWeight: 700
  },
  routineMeta: {
    fontSize: 8,
    marginTop: 4,
    lineHeight: 1.4
  },
  weeklyGrid: {
    flexDirection: "row",
    marginTop: 2
  },
  dayColumn: {
    flex: 1,
    borderRadius: 18,
    paddingTop: 10,
    paddingRight: 8,
    paddingBottom: 10,
    paddingLeft: 8,
    marginRight: 8,
    minHeight: 252
  },
  dayColumnLast: {
    marginRight: 0
  },
  dayTitle: {
    fontSize: 10,
    fontWeight: 700
  },
  dayDate: {
    fontSize: 8,
    marginTop: 2
  },
  dayDivider: {
    height: 1,
    marginTop: 8,
    marginBottom: 8
  },
  dayTask: {
    borderRadius: 12,
    paddingTop: 7,
    paddingRight: 8,
    paddingBottom: 7,
    paddingLeft: 8,
    marginBottom: 7
  },
  taskTitle: {
    fontSize: 8.6,
    fontWeight: 700,
    lineHeight: 1.35
  },
  taskMeta: {
    fontSize: 7.4,
    marginTop: 3,
    lineHeight: 1.45
  },
  footerLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 6
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginRight: 5
  },
  legendText: {
    fontSize: 8
  },
  portraitHeader: {
    marginBottom: 18
  },
  portraitTitle: {
    fontSize: 24,
    fontWeight: 700
  },
  portraitSubtitle: {
    fontSize: 10,
    marginTop: 4
  },
  panel: {
    borderRadius: 18,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    marginTop: 12
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 10
  },
  memberPill: {
    width: 112,
    borderRadius: 16,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    marginRight: 10
  },
  memberName: {
    fontSize: 11,
    fontWeight: 700
  },
  memberRole: {
    fontSize: 8,
    marginTop: 3
  },
  memberTasks: {
    flex: 1
  },
  assignmentCard: {
    borderRadius: 14,
    paddingTop: 9,
    paddingRight: 10,
    paddingBottom: 9,
    paddingLeft: 10,
    marginBottom: 7
  },
  assignmentMeta: {
    fontSize: 8,
    marginTop: 3
  },
  budgetRow: {
    flexDirection: "row",
    marginTop: 10
  },
  budgetMetric: {
    flex: 1,
    borderRadius: 16,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    marginRight: 10
  },
  budgetMetricLast: {
    marginRight: 0
  },
  scenarioCard: {
    borderRadius: 14,
    paddingTop: 11,
    paddingRight: 12,
    paddingBottom: 11,
    paddingLeft: 12,
    marginTop: 8
  },
  scenarioTitle: {
    fontSize: 10,
    fontWeight: 700
  },
  scenarioText: {
    fontSize: 8.4,
    marginTop: 3,
    lineHeight: 1.45
  }
});

const formatDateLabel = (date: Date) =>
  `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;

const getMemberName = (data: DemoDataset, memberId?: string) =>
  data.profile.members.find((member) => member.id === memberId)?.name ?? "A attribuer";

const getWeekStart = (data: DemoDataset) => {
  const referenceTaskDate = data.tasks[0] ? new Date(data.tasks[0].dueDate) : new Date();
  return startOfWeek(referenceTaskDate, { weekStartsOn: 1 });
};

const getDailyTasks = (data: DemoDataset) =>
  data.tasks
    .filter((task) => task.frequency === "quotidienne")
    .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes);

const getWeeklyBuckets = (data: DemoDataset) => {
  const weekStart = getWeekStart(data);

  return weekdayLabels.map((label, index) => {
    const date = addDays(weekStart, index);
    const tasks = data.tasks
      .filter((task) => {
        if (task.frequency === "quotidienne") {
          return false;
        }

        const dueDate = new Date(task.dueDate);

        return (
          dueDate.getFullYear() === date.getFullYear() &&
          dueDate.getMonth() === date.getMonth() &&
          dueDate.getDate() === date.getDate()
        );
      })
      .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes);

    return { label, date, tasks };
  });
};

export function FamilyFlowPdfDocument({
  data,
  theme
}: {
  data: DemoDataset;
  theme: PdfTheme;
}): React.ReactElement<DocumentProps> {
  const palette = themeMap[theme];
  const savings = buildSavingsSummary(data.savingsScenarios, data.tasks, data.budgetItems);
  const weekStart = getWeekStart(data);
  const weekEnd = addDays(weekStart, 6);
  const dailyTasks = getDailyTasks(data);
  const weeklyBuckets = getWeeklyBuckets(data);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ ...styles.pageLandscape, backgroundColor: palette.page, color: palette.text }}>
        <View style={{ ...styles.headerRibbon, backgroundColor: palette.soft }}>
          <View style={styles.headerTopRow}>
            <View style={{ maxWidth: "68%" }}>
              <Text style={{ ...styles.eyebrow, color: palette.accent }}>FamilyFlow - Edition frigo</Text>
              <Text style={styles.title}>Planning hebdomadaire a accrocher</Text>
              <Text style={{ ...styles.subtitle, color: palette.muted }}>
                {data.profile.household.name} | semaine du {formatDateLabel(weekStart)} au {formatDateLabel(weekEnd)}
              </Text>
            </View>
            <View style={{ width: 150 }}>
              <Text style={{ ...styles.eyebrow, color: palette.muted }}>Mode</Text>
              <Text style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>Organisation + economies</Text>
              <Text style={{ ...styles.subtitle, color: palette.muted }}>
                Vue claire pour les routines, les taches de la semaine et les couts evites.
              </Text>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <View style={{ ...styles.heroMetric, backgroundColor: palette.panel }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Membres</Text>
              <Text style={styles.metricValue}>{data.profile.members.length}</Text>
            </View>
            <View style={{ ...styles.heroMetric, backgroundColor: palette.panel }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Score d'equite</Text>
              <Text style={styles.metricValue}>{data.profile.household.balanceScore}/100</Text>
            </View>
            <View style={{ ...styles.heroMetric, ...styles.heroMetricLast, backgroundColor: palette.panel }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Economies potentielles</Text>
              <Text style={styles.metricValue}>{Math.round(savings.monthlySavings)} EUR/mois</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Routines quotidiennes</Text>
          <Text style={{ ...styles.sectionNote, color: palette.muted }}>
            A repeter tous les jours pour garder un foyer fluide
          </Text>
        </View>

        <View style={styles.routinesWrap}>
          {dailyTasks.slice(0, 6).map((task, index) => (
            <View
              key={task.id}
              style={{
                ...styles.routineCard,
                ...(index % 3 === 2 ? styles.routineCardThird : {}),
                backgroundColor: index % 2 === 0 ? "#FFFFFF" : palette.soft,
                borderWidth: 1,
                borderColor: index % 2 === 0 ? "#ECE7FF" : "#E3DCF7"
              }}
            >
              <Text style={styles.routineTitle}>[ ] {task.title}</Text>
              <Text style={{ ...styles.routineMeta, color: palette.muted }}>
                {getMemberName(data, task.assignedMemberId)} | {task.estimatedMinutes} min
              </Text>
              <Text style={{ ...styles.routineMeta, color: palette.muted }}>
                {task.smartReason ?? "routine proposee automatiquement"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Tableau semaine</Text>
          <Text style={{ ...styles.sectionNote, color: palette.muted }}>
            Colonnes par jour, cases a cocher et membre deja suggere
          </Text>
        </View>

        <View style={styles.weeklyGrid}>
          {weeklyBuckets.map((bucket, index) => (
            <View
              key={bucket.label}
              style={{
                ...styles.dayColumn,
                ...(index === weeklyBuckets.length - 1 ? styles.dayColumnLast : {}),
                backgroundColor: bucket.tasks.length > 0 ? "#FFFFFF" : palette.soft,
                borderWidth: 1,
                borderColor: "#E7E2FF"
              }}
            >
              <Text style={styles.dayTitle}>{bucket.label}</Text>
              <Text style={{ ...styles.dayDate, color: palette.muted }}>{formatDateLabel(bucket.date)}</Text>
              <View style={{ ...styles.dayDivider, backgroundColor: palette.soft }} />
              {bucket.tasks.length === 0 ? (
                <Text style={{ ...styles.taskMeta, color: palette.muted }}>
                  Pas de tache ciblee ce jour-la. Laisser une place libre pour les imprevus.
                </Text>
              ) : (
                bucket.tasks.slice(0, 5).map((task) => (
                  <View key={task.id} style={{ ...styles.dayTask, backgroundColor: palette.soft }}>
                    <Text style={styles.taskTitle}>[ ] {task.title}</Text>
                    <Text style={{ ...styles.taskMeta, color: palette.muted }}>
                      {getMemberName(data, task.assignedMemberId)} | {task.estimatedMinutes} min
                    </Text>
                    <Text style={{ ...styles.taskMeta, color: palette.muted }}>
                      {categoryLabels[task.category]} | difficulte {task.difficulty}/5
                    </Text>
                  </View>
                ))
              )}
            </View>
          ))}
        </View>

        <View style={styles.footerLegend}>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <View key={key} style={styles.legendItem}>
              <View style={{ ...styles.legendDot, backgroundColor: categoryColors[key] }} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={{ ...styles.pagePortrait, backgroundColor: palette.page, color: palette.text }}>
        <View style={styles.portraitHeader}>
          <Text style={styles.portraitTitle}>Repartition et economies</Text>
          <Text style={{ ...styles.portraitSubtitle, color: palette.muted }}>
            Deuxieme page pour suivre la charge par membre et les leviers budgetaires.
          </Text>
        </View>

        <View style={{ ...styles.panel, backgroundColor: palette.soft }}>
          <Text style={styles.sectionTitle}>Repartition par membre</Text>
          {data.profile.members.map((member) => {
            const memberTasks = data.tasks
              .filter((task) => task.assignedMemberId === member.id)
              .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes);

            return (
              <View key={member.id} style={styles.memberRow}>
                <View style={{ ...styles.memberPill, backgroundColor: member.avatarColor }}>
                  <Text style={{ ...styles.memberName, color: "#FFFFFF" }}>{member.name}</Text>
                  <Text style={{ ...styles.memberRole, color: "#F7F4FF" }}>
                    {member.role} | {member.availabilityHoursPerWeek} h / semaine
                  </Text>
                </View>
                <View style={styles.memberTasks}>
                  {memberTasks.slice(0, 3).map((task) => (
                    <View key={task.id} style={{ ...styles.assignmentCard, backgroundColor: "#FFFFFF" }}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={{ ...styles.assignmentMeta, color: palette.muted }}>
                        {categoryLabels[task.category]} | {task.estimatedMinutes} min | {task.smartReason}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ ...styles.panel, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8E2FF" }}>
          <Text style={styles.sectionTitle}>Budget et projections</Text>
          <View style={styles.budgetRow}>
            <View style={{ ...styles.budgetMetric, backgroundColor: palette.soft }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Objectif d'epargne</Text>
              <Text style={styles.metricValue}>{data.budget.targetSavings} EUR</Text>
            </View>
            <View style={{ ...styles.budgetMetric, backgroundColor: palette.soft }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Gain mensuel</Text>
              <Text style={styles.metricValue}>{Math.round(savings.monthlySavings)} EUR</Text>
            </View>
            <View style={{ ...styles.budgetMetric, ...styles.budgetMetricLast, backgroundColor: palette.soft }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Gain annuel</Text>
              <Text style={styles.metricValue}>{Math.round(savings.annualSavings)} EUR</Text>
            </View>
          </View>

          {data.savingsScenarios.map((scenario) => (
            <View key={scenario.id} style={{ ...styles.scenarioCard, backgroundColor: palette.soft }}>
              <Text style={styles.scenarioTitle}>{scenario.title}</Text>
              <Text style={{ ...styles.scenarioText, color: palette.muted }}>{scenario.description}</Text>
              <Text style={{ ...styles.scenarioText, color: palette.muted }}>
                Cout actuel {scenario.monthlyCost} EUR/mois | cible {scenario.improvedMonthlyCost} EUR/mois
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export const createFamilyFlowPdfDocument = (
  data: DemoDataset,
  theme: PdfTheme
): React.ReactElement<DocumentProps> => <FamilyFlowPdfDocument data={data} theme={theme} />;
