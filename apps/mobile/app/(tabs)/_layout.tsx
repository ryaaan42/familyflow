import { Tabs } from "expo-router";
import { Coins, House, LayoutDashboard, Sparkles, Users } from "lucide-react-native";

import { useTheme } from "../../src/lib/theme";

export default function TabsLayout() {
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: 84,
          paddingBottom: 10,
          paddingTop: 10
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Taches",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, size }) => <Coins color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: "Economies",
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: "Foyer",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
