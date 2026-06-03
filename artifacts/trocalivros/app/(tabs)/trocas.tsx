import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { TradeCard } from "@/components/TradeCard";
import { useTrades } from "@/context/TradesContext";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | "sent" | "received";

export default function TrocasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { trades, pendingReceivedCount } = useTrades();
  const [filter, setFilter] = useState<Filter>("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = trades.filter((t) => {
    if (filter === "sent") return t.direction === "sent";
    if (filter === "received") return t.direction === "received";
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "sent", label: "Enviadas" },
    { key: "received", label: "Recebidas" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Trocas</Text>
          {pendingReceivedCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>{pendingReceivedCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {trades.length} {trades.length === 1 ? "solicitação" : "solicitações"}
        </Text>
        <View style={[styles.filterRow, { backgroundColor: colors.muted }]}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterBtn, filter === f.key && { backgroundColor: colors.card }]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? colors.foreground : colors.mutedForeground },
                  filter === f.key && { fontFamily: "Inter_600SemiBold" },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TradeCard trade={item} />}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.listEmpty,
          { paddingBottom: Platform.OS === "web" ? 100 : 90 },
        ]}
        scrollEnabled={!!filtered.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="swap-horizontal-outline"
            title="Nenhuma troca aqui"
            subtitle="Suas solicitações de troca aparecem aqui."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filterRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  listEmpty: {
    flex: 1,
  },
});
