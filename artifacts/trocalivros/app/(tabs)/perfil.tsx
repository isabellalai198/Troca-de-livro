import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBooks } from "@/context/BooksContext";
import { useTrades } from "@/context/TradesContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export default function PerfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useUser();
  const { myBooks } = useBooks();
  const { trades } = useTrades();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city);
  const [bio, setBio] = useState(user.bio);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const acceptedTrades = trades.filter((t) => t.status === "accepted").length;
  const pendingTrades = trades.filter((t) => t.status === "pending").length;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Nome obrigatório", "Por favor, informe um nome.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateUser({ name: name.trim(), city: city.trim(), bio: bio.trim() });
    setEditing(false);
  };

  const handleCancel = () => {
    setName(user.name);
    setCity(user.city);
    setBio(user.bio);
    setEditing(false);
  };

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: topPad + 20 }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{initials}</Text>
          </View>
          {!editing ? (
            <>
              <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
              {user.city ? (
                <View style={styles.cityRow}>
                  <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.city, { color: colors.mutedForeground }]}>{user.city}</Text>
                </View>
              ) : null}
              {user.bio ? (
                <Text style={[styles.bio, { color: colors.mutedForeground }]}>{user.bio}</Text>
              ) : null}
              <Pressable
                style={[styles.editBtn, { borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEditing(true);
                }}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.foreground} />
                <Text style={[styles.editBtnText, { color: colors.foreground }]}>Editar perfil</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.editForm}>
              <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                <Ionicons name="person-outline" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                <Ionicons name="location-outline" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Cidade"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.muted, alignItems: "flex-start" }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Bio (opcional)"
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View style={styles.editActions}>
                <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={handleCancel}>
                  <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                  <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Salvar</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="library-outline" size={22} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>{myBooks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Livros</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#16A34A" />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>{acceptedTrades}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Trocas feitas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={22} color="#D97706" />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>{pendingTrades}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pendentes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sobre o app</Text>
          {[
            { icon: "swap-horizontal-outline" as const, text: "Troque livros com pessoas da sua comunidade" },
            { icon: "shield-checkmark-outline" as const, text: "Seu histórico fica salvo no dispositivo" },
            { icon: "heart-outline" as const, text: "Promova a leitura compartilhada" },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, { borderColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  city: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  bio: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  editBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  editForm: {
    width: "100%",
    gap: 10,
    marginTop: 4,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  statsSection: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
