import { Tabs } from "expo-router";
import { Coins, House, LayoutDashboard, Sparkles, Users } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

import { colors } from "../../src/lib/theme";

const AnimatedTabBarIcon = ({
  Icon,
  color,
  size,
  focused
}: {
  Icon: LucideIcon;
  color: string;
  size: number;
  focused: boolean;
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1);
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Icon color={color} size={size} />
    </Animated.View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors["muted-foreground"],
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
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
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabBarIcon Icon={LayoutDashboard} color={color} size={size} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Taches",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabBarIcon Icon={House} color={color} size={size} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabBarIcon Icon={Coins} color={color} size={size} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: "Economies",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabBarIcon Icon={Sparkles} color={color} size={size} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: "Foyer",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabBarIcon Icon={Users} color={color} size={size} focused={focused} />
          )
        }}
      />
    </Tabs>
  );
}
