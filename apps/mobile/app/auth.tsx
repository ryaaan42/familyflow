import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useApp } from "../src/hooks/app-context";
import { colors } from "../src/lib/theme";

export default function AuthScreen() {
  const app = useApp();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      if (mode === "signin") {
        await app.signIn(email.trim(), password);
      } else {
        await app.signUp(email.trim(), password, name.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FamilyFlow mobile</Text>
      <Text style={styles.subtitle}>Connecte-toi pour synchroniser ton foyer en direct.</Text>
      {mode === "signup" ? (
        <TextInput value={name} onChangeText={setName} placeholder="Prénom" style={styles.input} />
      ) : null}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} autoCapitalize="none" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry style={styles.input} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>{mode === "signin" ? "Se connecter" : "Créer le compte"}</Text>
      </Pressable>
      <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
        <Text style={styles.switchText}>
          {mode === "signin" ? "Pas encore de compte ? Inscription" : "Déjà un compte ? Connexion"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, justifyContent: "center", gap: 12 },
  title: { fontSize: 32, fontWeight: "700", color: colors.foreground },
  subtitle: { color: colors.muted, lineHeight: 22, marginBottom: 8 },
  input: { backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 14, padding: 14, marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  switchText: { color: colors.primary, textAlign: "center", marginTop: 8 },
  error: { color: "#d33" }
});
