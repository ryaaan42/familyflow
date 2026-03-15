import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useApp } from "../src/hooks/app-context";
import { colors } from "../src/lib/theme";

export default function OnboardingScreen() {
  const app = useApp();
  const [name, setName] = useState("Mon foyer");
  const [city, setCity] = useState("Lyon");
  const [memberName, setMemberName] = useState(app.user?.user_metadata?.display_name ?? "Parent");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await app.createHousehold({
        name,
        city,
        memberName,
        housingType: "maison",
        rooms: 5,
        surfaceSqm: 110,
        childrenCount: 1,
        hasPets: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le foyer");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding foyer</Text>
      <Text style={styles.subtitle}>Crée ton foyer réel pour débloquer les modules membres, planning, repas et courses.</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Nom du foyer" style={styles.input} />
      <TextInput value={city} onChangeText={setCity} placeholder="Ville" style={styles.input} />
      <TextInput value={memberName} onChangeText={setMemberName} placeholder="Ton prénom" style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Finaliser l'onboarding</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, justifyContent: "center", gap: 12 },
  title: { fontSize: 30, fontWeight: "700", color: colors.foreground },
  subtitle: { color: colors.muted, lineHeight: 22, marginBottom: 8 },
  input: { backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 14, padding: 14, marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  error: { color: "#d33" }
});
