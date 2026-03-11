import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../lib/theme";

export function ScreenShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
    gap: 16
  },
  header: {
    paddingTop: 10,
    gap: 8
  },
  title: {
    color: colors.foreground,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.1
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24
  }
});
