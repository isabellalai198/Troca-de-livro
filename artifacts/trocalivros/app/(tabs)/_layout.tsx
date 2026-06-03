import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View, useColorScheme } from "react-native";

import { useTrades } from "@/context/TradesContext";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "books.vertical", selected: "books.vertical.fill" }} />
        <Label>Explorar</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="meus-livros">
        <Icon sf={{ default: "tray", selected: "tray.fill" }} />
        <Label>Meus Livros</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trocas">
        <Icon sf={{ default: "arrow.left.arrow.right", selected: "arrow.left.arrow.right" }} />
        <Label>Trocas</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="perfil">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Perfil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function TradesBadge({ color }: { color: string }) {
  const { pendingReceivedCount } = useTrades();
  if (pendingReceivedCount === 0) {
    return Platform.OS === "ios" ? (
      <SymbolView name="arrow.left.arrow.right" tintColor={color} size={22} />
    ) : (
      <Ionicons name="swap-horizontal-outline" size={22} color={color} />
    );
  }
  return (
    <View>
      {Platform.OS === "ios" ? (
        <SymbolView name="arrow.left.arrow.right" tintColor={color} size={22} />
      ) : (
        <Ionicons name="swap-horizontal-outline" size={22} color={color} />
      )}
      <View style={badgeStyles.dot} />
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  dot: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C4621A",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="books.vertical" tintColor={color} size={22} />
            ) : (
              <Ionicons name="search-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="meus-livros"
        options={{
          title: "Meus Livros",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="tray" tintColor={color} size={22} />
            ) : (
              <Ionicons name="library-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="trocas"
        options={{
          title: "Trocas",
          tabBarIcon: ({ color }) => <TradesBadge color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
