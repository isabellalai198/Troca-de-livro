import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Trade, TradeStatus, useTrades } from "@/context/TradesContext";
import { useColors } from "@/hooks/useColors";

function statusLabel(status: TradeStatus, direction: "sent" | "received") {
  if (status === "pending") return direction === "sent" ? "Aguardando" : "Pendente";
  if (status === "accepted") return "Aceita";
  return "Recusada";
}

function statusColor(status: TradeStatus): string {
  if (status === "pending") return "#D97706";
  if (status === "accepted") return "#16A34A";
  return "#DC2626";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface TradeCardProps {
  trade: Trade;
}

export function TradeCard({ trade }: TradeCardProps) {
  const colors = useColors();
  const { respondTrade, deleteTrade } = useTrades();

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    respondTrade(trade.id, true);
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    respondTrade(trade.id, false);
  };

  const handleDelete = () => {
    Alert.alert("Remover solicitação", "Deseja remover esta troca?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteTrade(trade.id);
        },
      },
    ]);
  };

  const color = statusColor(trade.status);
  const label = statusLabel(trade.status, trade.direction);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.directionBadge, { backgroundColor: trade.direction === "sent" ? colors.muted : colors.secondary }]}>
          <Ionicons
            name={trade.direction === "sent" ? "arrow-up-outline" : "arrow-down-outline"}
            size={12}
            color={colors.mutedForeground}
          />
          <Text style={[styles.directionText, { color: colors.mutedForeground }]}>
            {trade.direction === "sent" ? "Enviada" : "Recebida"}
          </Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.statusBadge, { backgroundColor: color + "22" }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.statusText, { color }]}>{label}</Text>
          </View>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeAgo(trade.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.booksRow}>
        <View style={[styles.bookChip, { backgroundColor: colors.secondary }]}>
          <Ionicons name="book-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.bookTitle, { color: colors.foreground }]} numberOfLines={1}>
            {trade.direction === "sent" ? trade.myBookTitle : trade.theirBookTitle}
          </Text>
        </View>
        <Ionicons name="swap-horizontal-outline" size={18} color={colors.primary} />
        <View style={[styles.bookChip, { backgroundColor: colors.secondary }]}>
          <Ionicons name="book-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.bookTitle, { color: colors.foreground }]} numberOfLines={1}>
            {trade.direction === "sent" ? trade.theirBookTitle : trade.myBookTitle || "—"}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.ownerRow}>
          <Ionicons name="person-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.owner, { color: colors.mutedForeground }]}>
            {trade.direction === "sent" ? trade.theirOwnerName : "Você"}
          </Text>
        </View>
        <View style={styles.actions}>
          {trade.direction === "received" && trade.status === "pending" && (
            <>
              <Pressable style={[styles.actionBtn, { backgroundColor: "#16A34A22" }]} onPress={handleAccept}>
                <Ionicons name="checkmark" size={16} color="#16A34A" />
              </Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: "#DC262622" }]} onPress={handleReject}>
                <Ionicons name="close" size={16} color="#DC2626" />
              </Pressable>
            </>
          )}
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  directionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  directionText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  booksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  owner: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
