import { Tabs } from "expo-router";
import { CalendarDays, House, Settings, ShoppingCart, Users } from "lucide-react-native";

import { colors } from "../../src/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: "#FFFCFA",
          borderTopColor: "#EFE7FF",
          height: 84,
          paddingBottom: 10,
          paddingTop: 10
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil", tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="planning" options={{ title: "Planning", tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
      <Tabs.Screen name="household" options={{ title: "Foyer", tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tabs.Screen name="lists" options={{ title: "Listes", tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} /> }} />
      <Tabs.Screen name="assistant" options={{ title: "IA & réglages", tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="budget" options={{ href: null }} />
      <Tabs.Screen name="savings" options={{ href: null }} />
    </Tabs>
  );
}
