import React from "react";
import {
  Document,
  type DocumentProps,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import {
  buildSavingsSummary,
  categoryColors,
  categoryLabels,
  DemoDataset,
  PdfTheme
} from "@familyflow/shared";

const weekdayLabels = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];


const mealIdeas = [
  "Lundi: Pâtes légumes / Soupe maison",
  "Mardi: Poulet riz / Omelette salade",
  "Mercredi: Curry doux / Gratin",
  "Jeudi: Poisson vapeur / Tacos maison",
  "Vendredi: Bowl quinoa / Pizza maison"
];

const shoppingChecklist = ["Lait", "Oeufs", "Légumes", "Fruits", "Pâtes", "Riz", "Pain", "Yaourts"];

const themeMap: Record<
  PdfTheme,
  {
    accent: string;
    soft: string;
    page: string;
    text: string;
    muted: string;
    panel: string;
    border: string;
  }
> = {
  minimal: {
    accent: "#3B82F6",
    soft: "#EEF5FF",
    page: "#F7FBFF",
    text: "#10213B",
    muted: "#5D708A",
    panel: "#FFFFFF",
    border: "#DBEAFE"
  },
  "familial-kawaii": {
    accent: "#FF7E6B",
    soft: "#FFF1ED",
    page: "#FFF8F4",
    text: "#452D26",
    muted: "#8A635A",
    panel: "#FFFFFF",
    border: "#FDDCCC"
  },
  premium: {
    accent: "#6D5EF4",
    soft: "#F1EFFF",
    page: "#FAF8FF",
    text: "#171329",
    muted: "#696482",
    panel: "#FFFFFF",
    border: "#E4E0FF"
  },
  print: {
    accent: "#222222",
    soft: "#F3F3F3",
    page: "#FFFFFF",
    text: "#111111",
    muted: "#5A5A5A",
    panel: "#FFFFFF",
    border: "#DDDDDD"
  }
};

const styles = StyleSheet.create({
  pageLandscape: {
    paddingTop: 20,
    paddingRight: 22,
    paddingBottom: 18,
    paddingLeft: 22,
    fontSize: 9,
    fontFamily: "Helvetica"
  },
  pagePortrait: {
    padding: 26,
    fontSize: 9,
    fontFamily: "Helvetica"
  },
  /* ── Header ribbon ── */
  headerRibbon: {
    borderRadius: 18,
    paddingTop: 14,
    paddingRight: 18,
    paddingBottom: 14,
    paddingLeft: 18
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  eyebrow: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 5
  },
  subtitle: {
    fontSize: 9,
    marginTop: 5,
    lineHeight: 1.5
  },
  /* ── Hero metrics ── */
  heroMetrics: {
    flexDirection: "row",
    marginTop: 12
  },
  heroMetric: {
    flex: 1,
    borderRadius: 12,
    paddingTop: 8,
    paddingRight: 10,
    paddingBottom: 8,
    paddingLeft: 10,
    marginRight: 8
  },
  heroMetricLast: {
    marginRight: 0
  },
  metricLabel: {
    fontSize: 8
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 3
  },
  /* ── Section titles ── */
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700
  },
  sectionNote: {
    fontSize: 8
  },
  /* ── Weekly grid ── */
  weeklyGrid: {
    flexDirection: "row",
    marginTop: 6
  },
  dayColumn: {
    flex: 1,
    borderRadius: 14,
    paddingTop: 10,
    paddingRight: 7,
    paddingBottom: 10,
    paddingLeft: 7,
    marginRight: 6,
    minHeight: 310
  },
  dayColumnLast: {
    marginRight: 0
  },
  dayTitle: {
    fontSize: 9,
    fontWeight: 700
  },
  dayDate: {
    fontSize: 7.5,
    marginTop: 2
  },
  dayDivider: {
    height: 1,
    marginTop: 7,
    marginBottom: 7
  },
  dayTask: {
    borderRadius: 10,
    paddingTop: 6,
    paddingRight: 7,
    paddingBottom: 6,
    paddingLeft: 7,
    marginBottom: 6
  },
  taskTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    lineHeight: 1.3
  },
  taskMeta: {
    fontSize: 7,
    marginTop: 2.5,
    lineHeight: 1.35
  },
  /* ── Legend ── */
  footerLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginRight: 4
  },
  legendText: {
    fontSize: 7.5
  },
  smallNote: {
    fontSize: 7.5,
    marginTop: 5
  },
  /* ── Portrait page ── */
  portraitHeader: {
    marginBottom: 16
  },
  portraitTitle: {
    fontSize: 22,
    fontWeight: 700
  },
  portraitSubtitle: {
    fontSize: 9,
    marginTop: 3
  },
  panel: {
    borderRadius: 14,
    paddingTop: 14,
    paddingRight: 14,
    paddingBottom: 14,
    paddingLeft: 14,
    marginTop: 10
  },
  /* ── Routines ── */
  routinesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8
  },
  routineCard: {
    width: "31.5%",
    borderRadius: 12,
    paddingTop: 8,
    paddingRight: 10,
    paddingBottom: 8,
    paddingLeft: 10,
    marginRight: "2.75%",
    marginBottom: 7
  },
  routineCardThird: {
    marginRight: 0
  },
  routineTitle: {
    fontSize: 9,
    fontWeight: 700
  },
  routineMeta: {
    fontSize: 7.5,
    marginTop: 3,
    lineHeight: 1.35
  },
  /* ── Members ── */
  memberRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 8
  },
  memberPill: {
    width: 100,
    borderRadius: 14,
    paddingTop: 8,
    paddingRight: 9,
    paddingBottom: 8,
    paddingLeft: 9,
    marginRight: 9
  },
  memberName: {
    fontSize: 10,
    fontWeight: 700
  },
  memberRole: {
    fontSize: 7.5,
    marginTop: 2.5
  },
  memberTasks: {
    flex: 1
  },
  assignmentCard: {
    borderRadius: 11,
    paddingTop: 7,
    paddingRight: 9,
    paddingBottom: 7,
    paddingLeft: 9,
    marginBottom: 6
  },
  assignmentMeta: {
    fontSize: 7.5,
    marginTop: 2.5
  },
  /* ── Budget ── */
  budgetRow: {
    flexDirection: "row",
    marginTop: 8
  },
  budgetMetric: {
    flex: 1,
    borderRadius: 12,
    paddingTop: 10,
    paddingRight: 11,
    paddingBottom: 10,
    paddingLeft: 11,
    marginRight: 8
  },
  budgetMetricLast: {
    marginRight: 0
  },
  scenarioCard: {
    borderRadius: 12,
    paddingTop: 9,
    paddingRight: 11,
    paddingBottom: 9,
    paddingLeft: 11,
    marginTop: 7
  },
  scenarioTitle: {
    fontSize: 9,
    fontWeight: 700
  },
  scenarioText: {
    fontSize: 8,
    marginTop: 2.5,
    lineHeight: 1.4
  },
  /* ── Progress bar ── */
  progressTrack: {
    height: 4,
    borderRadius: 99,
    marginTop: 6
  },
  progressFill: {
    height: 4,
    borderRadius: 99
  }
});

const formatDateLabel = (date: Date) =>
  `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;

const addDaysNative = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const startOfWeekMonday = (date: Date) => {
  const next = new Date(date);
  const mondayOffset = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - mondayOffset);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getMemberName = (data: DemoDataset, memberId?: string) =>
  data.profile.members.find((member) => member.id === memberId)?.name ?? "À attribuer";

const getWeekStart = (data: DemoDataset) => {
  const referenceTaskDate = data.tasks[0] ? new Date(data.tasks[0].dueDate) : new Date();
  return startOfWeekMonday(referenceTaskDate);
};

const getWeeklyBuckets = (data: DemoDataset) => {
  const weekStart = getWeekStart(data);

  return weekdayLabels.map((label, index) => {
    const date = addDaysNative(weekStart, index);
    const dayOfWeek = (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    const tasks = data.tasks
      .filter((task) => {
        if (task.dayOfWeek) return task.dayOfWeek === dayOfWeek;
        const dueDate = new Date(task.dueDate);
        const dueWeekday = (dueDate.getDay() + 6) % 7 + 1;
        return dueWeekday === dayOfWeek;
      })
      .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes);

    return { label, date, tasks };
  });
};

export function PlanillePdfDocument({
  data,
  theme
}: {
  data: DemoDataset;
  theme: PdfTheme;
}): React.ReactElement<DocumentProps> {
  const palette = themeMap[theme];
  const savings = buildSavingsSummary(data.savingsScenarios, data.tasks, data.budgetItems);
  const weekStart = getWeekStart(data);
  const weekEnd = addDaysNative(weekStart, 6);
  const weeklyBuckets = getWeeklyBuckets(data);
  const routineTasks = data.tasks
    .filter((task) => task.frequency === "quotidienne" || task.category === "routine")
    .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes);

  return (
    <Document>
      {/* ══════════════════════════════════════════════════════════
          PAGE 1 — Planning hebdomadaire (Paysage A4)
      ══════════════════════════════════════════════════════════ */}
      <Page
        size="A4"
        orientation="landscape"
        style={{ ...styles.pageLandscape, backgroundColor: palette.page, color: palette.text }}
        wrap={false}
      >
        {/* Header ribbon */}
        <View style={{ ...styles.headerRibbon, backgroundColor: palette.soft }}>
          <View style={styles.headerTopRow}>
            <View style={{ maxWidth: "65%" }}>
              <Text style={{ ...styles.eyebrow, color: palette.accent }}>Planille — Édition frigo</Text>
              <Text style={styles.title}>Planning hebdomadaire</Text>
              <Text style={{ ...styles.subtitle, color: palette.muted }}>
                {data.profile.household.name} — semaine du {formatDateLabel(weekStart)} au {formatDateLabel(weekEnd)}
              </Text>
            </View>
            <View style={{ width: 140 }}>
              <Text style={{ ...styles.eyebrow, color: palette.muted }}>Mode</Text>
              <Text style={{ fontSize: 11, fontWeight: 700, marginTop: 5 }}>Organisation + économies</Text>
              <Text style={{ ...styles.subtitle, color: palette.muted }}>
                Routines, tâches de la semaine et coûts évités.
              </Text>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <View style={{ ...styles.heroMetric, backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.border }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Membres</Text>
              <Text style={{ ...styles.metricValue, color: palette.text }}>{data.profile.members.length}</Text>
            </View>
            <View style={{ ...styles.heroMetric, backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.border }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Score d'équité</Text>
              <Text style={{ ...styles.metricValue, color: palette.text }}>{data.profile.household.balanceScore}/100</Text>
            </View>
            <View
              style={{
                ...styles.heroMetric,
                ...styles.heroMetricLast,
                backgroundColor: palette.panel,
                borderWidth: 1,
                borderColor: palette.border
              }}
            >
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Économies potentielles</Text>
              <Text style={{ ...styles.metricValue, color: palette.accent }}>
                {Math.round(savings.monthlySavings)} €/mois
              </Text>
            </View>
          </View>
        </View>

        {/* Section title */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Tableau de la semaine</Text>
          <Text style={{ ...styles.sectionNote, color: palette.muted }}>
            Cases à cocher — impression pleine largeur
          </Text>
        </View>

        {/* Weekly grid — each day is a column */}
        <View style={styles.weeklyGrid}>
          {weeklyBuckets.map((bucket, index) => (
            <View
              key={bucket.label}
              style={{
                ...styles.dayColumn,
                ...(index === weeklyBuckets.length - 1 ? styles.dayColumnLast : {}),
                backgroundColor: bucket.tasks.length > 0 ? palette.panel : palette.soft,
                borderWidth: 1,
                borderColor: palette.border
              }}
            >
              <Text style={{ ...styles.dayTitle, color: palette.text }}>{bucket.label}</Text>
              <Text style={{ ...styles.dayDate, color: palette.muted }}>{formatDateLabel(bucket.date)}</Text>
              <View style={{ ...styles.dayDivider, backgroundColor: palette.soft }} />

              {bucket.tasks.length === 0 ? (
                <Text style={{ ...styles.taskMeta, color: palette.muted }}>
                  Jour léger — marge pour les imprévus.
                </Text>
              ) : (
                bucket.tasks.slice(0, 4).map((task) => (
                  <View key={task.id} style={{ ...styles.dayTask, backgroundColor: palette.soft }}>
                    <Text style={{ ...styles.taskTitle, color: palette.text }}>☐ {task.title}</Text>
                    <Text style={{ ...styles.taskMeta, color: palette.muted }}>
                      {getMemberName(data, task.assignedMemberId)} · {task.estimatedMinutes} min
                    </Text>
                    <Text style={{ ...styles.taskMeta, color: palette.muted }}>
                      {categoryLabels[task.category]} · niveau {task.difficulty}/5
                    </Text>
                  </View>
                ))
              )}
              {bucket.tasks.length > 4 ? (
                <Text style={{ ...styles.taskMeta, color: palette.muted }}>
                  +{bucket.tasks.length - 4} autre(s) dans l'app
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={{ ...styles.smallNote, color: palette.muted }}>
          Astuce : choisissez le thème Noir & blanc pour un rendu économique en encre.
        </Text>

        <View style={styles.footerLegend}>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <View key={key} style={styles.legendItem}>
              <View style={{ ...styles.legendDot, backgroundColor: categoryColors[key] }} />
              <Text style={{ ...styles.legendText, color: palette.muted }}>{label}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE 2 — Routines & Répartition (Portrait A4)
      ══════════════════════════════════════════════════════════ */}
      <Page
        size="A4"
        style={{ ...styles.pagePortrait, backgroundColor: palette.page, color: palette.text }}
      >
        <View style={styles.portraitHeader}>
          <Text style={{ ...styles.portraitTitle, color: palette.text }}>Répartition et économies</Text>
          <Text style={{ ...styles.portraitSubtitle, color: palette.muted }}>
            Charge par membre et leviers budgétaires — page 2/2
          </Text>
        </View>

        {/* Routines quotidiennes — max 6 pour tenir sur la page */}
        <View style={{ ...styles.panel, backgroundColor: palette.soft }} wrap={false}>
          <Text style={{ ...styles.sectionTitle, color: palette.text }}>Routines quotidiennes</Text>
          <View style={styles.routinesWrap}>
            {routineTasks.slice(0, 6).map((task, index) => (
              <View
                key={task.id}
                style={{
                  ...styles.routineCard,
                  ...(index % 3 === 2 ? styles.routineCardThird : {}),
                  backgroundColor: palette.panel,
                  borderWidth: 1,
                  borderColor: palette.border
                }}
              >
                <Text style={{ ...styles.routineTitle, color: palette.text }}>☐ {task.title}</Text>
                <Text style={{ ...styles.routineMeta, color: palette.muted }}>
                  {getMemberName(data, task.assignedMemberId)} · {task.estimatedMinutes} min
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Répartition par membre — chaque membre dans un bloc séparé */}
        <View style={{ ...styles.panel, backgroundColor: palette.soft }}>
          <Text style={{ ...styles.sectionTitle, color: palette.text }}>Répartition par membre</Text>
          {data.profile.members.map((member) => {
            const memberTasks = data.tasks
              .filter((task) => task.assignedMemberId === member.id)
              .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes);

            return (
              <View key={member.id} style={{ ...styles.memberRow }} wrap={false}>
                <View style={{ ...styles.memberPill, backgroundColor: member.avatarColor }}>
                  <Text style={{ ...styles.memberName, color: "#FFFFFF" }}>{member.name}</Text>
                  <Text style={{ ...styles.memberRole, color: "#F7F4FF" }}>
                    {member.role} · {member.availabilityHoursPerWeek} h/sem
                  </Text>
                </View>
                <View style={styles.memberTasks}>
                  {memberTasks.slice(0, 2).map((task) => (
                    <View
                      key={task.id}
                      style={{
                        ...styles.assignmentCard,
                        backgroundColor: palette.panel,
                        borderWidth: 1,
                        borderColor: palette.border
                      }}
                    >
                      <Text style={{ ...styles.taskTitle, color: palette.text }}>{task.title}</Text>
                      <Text style={{ ...styles.assignmentMeta, color: palette.muted }}>
                        {categoryLabels[task.category]} · {task.estimatedMinutes} min · {task.smartReason}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>



        <View style={{ ...styles.panel, backgroundColor: palette.soft }}>
          <Text style={{ ...styles.sectionTitle, color: palette.text }}>Repas & courses (ajoutés au PDF)</Text>
          <Text style={{ ...styles.smallNote, color: palette.muted }}>Plan repas hebdomadaire</Text>
          {mealIdeas.map((meal) => (
            <Text key={meal} style={{ ...styles.scenarioText, color: palette.text }}>{meal}</Text>
          ))}
          <Text style={{ ...styles.smallNote, color: palette.muted, marginTop: 8 }}>Liste de courses suggérée</Text>
          <Text style={{ ...styles.scenarioText, color: palette.text }}>{shoppingChecklist.join(' · ')}</Text>
        </View>

        {/* Budget et projections */}
        <View
          style={{
            ...styles.panel,
            backgroundColor: palette.panel,
            borderWidth: 1,
            borderColor: palette.border
          }}
          wrap={false}
        >
          <Text style={{ ...styles.sectionTitle, color: palette.text }}>Budget et projections</Text>
          <View style={styles.budgetRow}>
            <View style={{ ...styles.budgetMetric, backgroundColor: palette.soft }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Objectif d'épargne</Text>
              <Text style={{ ...styles.metricValue, color: palette.text }}>{data.budget.targetSavings} €</Text>
            </View>
            <View style={{ ...styles.budgetMetric, backgroundColor: palette.soft }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Gain mensuel</Text>
              <Text style={{ ...styles.metricValue, color: palette.accent }}>
                {Math.round(savings.monthlySavings)} €
              </Text>
            </View>
            <View style={{ ...styles.budgetMetric, ...styles.budgetMetricLast, backgroundColor: palette.soft }}>
              <Text style={{ ...styles.metricLabel, color: palette.muted }}>Gain annuel</Text>
              <Text style={{ ...styles.metricValue, color: palette.accent }}>
                {Math.round(savings.annualSavings)} €
              </Text>
            </View>
          </View>

          {data.savingsScenarios.slice(0, 3).map((scenario) => {
            const pct =
              scenario.monthlyCost > 0
                ? Math.round(
                    ((scenario.monthlyCost - scenario.improvedMonthlyCost) / scenario.monthlyCost) * 100
                  )
                : 0;
            return (
              <View key={scenario.id} style={{ ...styles.scenarioCard, backgroundColor: palette.soft }}>
                <Text style={{ ...styles.scenarioTitle, color: palette.text }}>{scenario.title}</Text>
                <Text style={{ ...styles.scenarioText, color: palette.muted }}>{scenario.description}</Text>
                <View style={{ ...styles.progressTrack, backgroundColor: "#E5E7EB" }}>
                  <View
                    style={{
                      ...styles.progressFill,
                      backgroundColor: palette.accent,
                      width: `${Math.min(pct, 100)}%`
                    }}
                  />
                </View>
                <Text style={{ ...styles.scenarioText, color: palette.muted }}>
                  {scenario.monthlyCost} €/mois → {scenario.improvedMonthlyCost} €/mois · économie : {scenario.monthlyCost - scenario.improvedMonthlyCost} €
                </Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}

export const createPlanillePdfDocument = (
  data: DemoDataset,
  theme: PdfTheme
 ): React.ReactElement<DocumentProps> => <PlanillePdfDocument data={data} theme={theme} />;
