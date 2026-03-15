import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useApp } from "../src/hooks/app-context";
import { colors } from "../src/lib/theme";

export default function Index() {
  const app = useApp();

  if (app.loading || !app.bootstrapped) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!app.session) return <Redirect href="/auth" />;
  if (!app.household) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
