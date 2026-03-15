import { CheckCircle2, Dog, Target, Users2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenShell } from "../../src/components/screen-shell";
import { useApp } from "../../src/hooks/app-context";
import { colors } from "../../src/lib/theme";

export default function DashboardScreen() {
  const app = useApp();
  const completed = app.tasks.filter((task) => task.status === "done").length;
  const completionRate = app.tasks.length ? Math.round((completed / app.tasks.length) * 100) : 0;

  return (
    <ScreenShell title="FamilyFlow" subtitle="V1 mobile connectée au foyer en temps réel.">
      <LinearGradient colors={["#6D5EF4", "#4A8EFF", "#56C7A1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroEyebrow}>{app.household?.name ?? "Foyer"}</Text>
        <Text style={styles.heroTitle}>{completionRate}% de tâches terminées</Text>
        <Text style={styles.heroSubtitle}>{app.tasks.length} tâches · {app.goals.filter((goal) => goal.status === "active").length} objectifs actifs</Text>
      </LinearGradient>

      <View style={styles.grid}>
        <Stat icon={<CheckCircle2 color={colors.primary} size={18} />} label="Aujourd'hui" value={`${app.tasks.filter((t) => t.status !== "done").length} à faire`} />
        <Stat icon={<Users2 color={colors.coral} size={18} />} label="Membres" value={`${app.members.length}`} />
      </View>
      <View style={styles.grid}>
        <Stat icon={<Dog color={colors.mint} size={18} />} label="Animaux" value={`${app.pets.length}`} />
        <Stat icon={<Target color={colors.primary} size={18} />} label="Objectifs" value={`${app.goals.length}`} />
      </View>
    </ScreenShell>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 30, padding: 20, gap: 8 },
  heroEyebrow: { color: "rgba(255,255,255,0.78)", fontSize: 13 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "700", letterSpacing: -1 },
  heroSubtitle: { color: "rgba(255,255,255,0.82)", fontSize: 14 },
  grid: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 8 },
  statValue: { color: colors.foreground, fontSize: 20, fontWeight: "700" },
  statLabel: { color: colors.muted, fontSize: 13 }
});
