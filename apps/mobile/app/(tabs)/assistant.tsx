import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "../../src/components/screen-shell";
import { useApp } from "../../src/hooks/app-context";
import { colors } from "../../src/lib/theme";

export default function AssistantScreen() {
  const app = useApp();
  const pendingTasks = app.tasks.filter((task) => task.status !== "done").length;
  const doneGoals = app.goals.filter((goal) => goal.status === "completed").length;

  return (
    <ScreenShell title="IA & paramètres" subtitle="Assistant mobile basé sur les données réelles du foyer.">
      <View style={styles.card}>
        <Text style={styles.title}>Suggestions IA</Text>
        <Text style={styles.text}>• Priorité: terminer {pendingTasks} tâches en retard pour lisser la semaine.</Text>
        <Text style={styles.text}>• Rééquilibrage: déplacer 2 tâches ménages vers le membre le plus disponible.</Text>
        <Text style={styles.text}>• Objectifs: {doneGoals} complétés, garde le rythme avec un check-in jeudi soir.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.text}>Compte: {app.user?.email}</Text>
        <Text style={styles.text}>Foyer: {app.household?.name ?? "-"}</Text>
        <Pressable style={styles.button} onPress={app.signOut}>
          <Text style={styles.buttonText}>Se déconnecter</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 10 },
  title: { color: colors.foreground, fontWeight: "700", fontSize: 18 },
  text: { color: colors.muted, lineHeight: 21 },
  button: { marginTop: 6, backgroundColor: colors.primary, borderRadius: 12, padding: 12 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
