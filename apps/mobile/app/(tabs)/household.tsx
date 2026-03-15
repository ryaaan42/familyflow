import { Dog, Home, Users2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { ScreenShell } from "../../src/components/screen-shell";
import { useApp } from "../../src/hooks/app-context";
import { colors } from "../../src/lib/theme";

export default function HouseholdScreen() {
  const app = useApp();

  return (
    <ScreenShell title="Foyer" subtitle="Membres, animaux et structure du logement synchronisés.">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{app.household?.name}</Text>
        <Text style={styles.heroSubtitle}>{app.household?.housing_type} · {app.household?.surface_sqm} m² · {app.household?.city}</Text>
      </View>

      <View style={styles.stats}>
        <Stat icon={<Users2 color={colors.primary} size={18} />} value={`${app.members.length}`} label="Membres" />
        <Stat icon={<Dog color={colors.coral} size={18} />} value={`${app.pets.length}`} label="Animaux" />
        <Stat icon={<Home color={colors.mint} size={18} />} value={`${app.household?.rooms ?? 0}`} label="Pièces" />
      </View>

      {app.members.map((member) => (
        <View key={member.id} style={styles.memberCard}>
          <View style={[styles.avatar, { backgroundColor: member.avatar_color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{member.display_name}</Text>
            <Text style={styles.memberMeta}>{member.role} · {member.age} ans · {Number(member.availability_hours_per_week)} h/sem.</Text>
          </View>
        </View>
      ))}
    </ScreenShell>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.card, borderRadius: 28, padding: 20, gap: 8 },
  heroTitle: { color: colors.foreground, fontSize: 28, fontWeight: "700", letterSpacing: -1 },
  heroSubtitle: { color: colors.muted, lineHeight: 22 },
  stats: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 8 },
  statValue: { color: colors.foreground, fontSize: 24, fontWeight: "700" },
  statLabel: { color: colors.muted, fontSize: 13 },
  memberCard: { backgroundColor: colors.card, borderRadius: 24, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  memberName: { color: colors.foreground, fontSize: 16, fontWeight: "600" },
  memberMeta: { color: colors.muted, marginTop: 4 }
});
