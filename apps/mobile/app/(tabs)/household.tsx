import { useFamilyFlowStore } from "@familyflow/shared";
import { Dog, Home, Users2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../src/components/screen-shell";
import { colors } from "../../src/lib/theme";

export default function HouseholdScreen() {
  const state = useFamilyFlowStore();

  return (
    <ScreenShell
      title="Foyer"
      subtitle="Membres, logement, animaux et structure familiale."
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{state.profile.household.name}</Text>
        <Text style={styles.heroSubtitle}>
          {state.profile.household.housingType} · {state.profile.household.surfaceSqm} m2 ·{" "}
          {state.profile.household.city}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Users2 color={colors.primary} size={18} />
          <Text style={styles.statValue}>{state.profile.members.length}</Text>
          <Text style={styles.statLabel}>Membres</Text>
        </View>
        <View style={styles.statCard}>
          <Dog color={colors.coral} size={18} />
          <Text style={styles.statValue}>{state.profile.pets.length}</Text>
          <Text style={styles.statLabel}>Animaux</Text>
        </View>
        <View style={styles.statCard}>
          <Home color={colors.mint} size={18} />
          <Text style={styles.statValue}>{state.profile.household.rooms}</Text>
          <Text style={styles.statLabel}>Pieces</Text>
        </View>
      </View>

      <View style={styles.list}>
        {state.profile.members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View
              style={[styles.avatar, { backgroundColor: member.avatarColor }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberMeta}>
                {member.role} · {member.age} ans · {member.availabilityHoursPerWeek} h/semaine
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 20,
    gap: 8
  },
  heroTitle: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -1
  },
  heroSubtitle: {
    color: colors.muted,
    lineHeight: 22
  },
  stats: {
    flexDirection: "row",
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 8
  },
  statValue: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: "700"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13
  },
  list: {
    gap: 12
  },
  memberCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  memberName: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "600"
  },
  memberMeta: {
    color: colors.muted,
    marginTop: 4
  }
});
