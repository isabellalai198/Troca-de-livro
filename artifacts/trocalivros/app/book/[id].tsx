import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBooks } from "@/context/BooksContext";
import { useTrades } from "@/context/TradesContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

function conditionColor(condition: string): string {
  switch (condition) {
    case "Novo": return "#16A34A";
    case "Ótimo": return "#2563EB";
    case "Bom": return "#D97706";
    case "Regular": return "#DC2626";
    default: return "#6B7280";
  }
}

export default function BookDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBook, myBooks } = useBooks();
  const { requestTrade } = useTrades();
  const { user } = useUser();
  const [selectedMyBookId, setSelectedMyBookId] = useState<string | null>(null);

  const book = getBook(id ?? "");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!book) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Livro não encontrado</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.primary }]}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const isOwnBook = book.ownerId === user.id || book.isOwn;
  const availableMyBooks = myBooks.filter((b) => b.available);

  const initials = book.title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handleRequestTrade = async () => {
    if (!selectedMyBookId) {
      Alert.alert("Selecione um livro", "Escolha um dos seus livros para oferecer na troca.");
      return;
    }
    const myBook = myBooks.find((b) => b.id === selectedMyBookId);
    if (!myBook) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await requestTrade({
      myBookId: myBook.id,
      myBookTitle: myBook.title,
      theirBookId: book.id,
      theirBookTitle: book.title,
      theirOwnerName: book.ownerName,
    });
    Alert.alert(
      "Solicitação enviada!",
      `Sua proposta de troca por "${book.title}" foi enviada para ${book.ownerName}.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 100 }}>
        <View style={[styles.coverSection, { backgroundColor: book.coverColor }]}>
          <View style={styles.coverTextWrap}>
            <Text style={styles.coverInitials}>{initials}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.conditionTag, { backgroundColor: conditionColor(book.condition) + "22" }]}>
            <View style={[styles.conditionDot, { backgroundColor: conditionColor(book.condition) }]} />
            <Text style={[styles.conditionText, { color: conditionColor(book.condition) }]}>{book.condition}</Text>
          </View>

          <Text style={[styles.bookTitle, { color: colors.foreground }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.mutedForeground }]}>{book.author}</Text>

          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Ionicons name="bookmark-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{book.genre}</Text>
            </View>
          </View>

          {book.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Descrição</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{book.description}</Text>
            </View>
          ) : null}

          {!isOwnBook && (
            <View style={[styles.ownerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.ownerAvatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.ownerAvatarText, { color: colors.primaryForeground }]}>
                  {book.ownerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.ownerName, { color: colors.foreground }]}>{book.ownerName}</Text>
                <Text style={[styles.ownerSub, { color: colors.mutedForeground }]}>Proprietário</Text>
              </View>
            </View>
          )}

          {!isOwnBook && book.available && availableMyBooks.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Oferecer em troca</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                Selecione um dos seus livros para propor
              </Text>
              {availableMyBooks.map((mb) => (
                <Pressable
                  key={mb.id}
                  style={[
                    styles.myBookOption,
                    {
                      borderColor: selectedMyBookId === mb.id ? colors.primary : colors.border,
                      backgroundColor: selectedMyBookId === mb.id ? colors.primary + "15" : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedMyBookId(mb.id)}
                >
                  <View style={[styles.optionCover, { backgroundColor: mb.coverColor }]}>
                    <Text style={styles.optionInitials}>
                      {mb.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: colors.foreground }]} numberOfLines={1}>{mb.title}</Text>
                    <Text style={[styles.optionAuthor, { color: colors.mutedForeground }]} numberOfLines={1}>{mb.author}</Text>
                  </View>
                  {selectedMyBookId === mb.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {!isOwnBook && book.available && availableMyBooks.length === 0 && (
            <View style={[styles.noMyBooks, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.noMyBooksText, { color: colors.mutedForeground }]}>
                Adicione livros em "Meus Livros" para propor uma troca.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {!isOwnBook && book.available && (
        <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomPad + 16, borderTopColor: colors.border }]}>
          <Pressable
            style={[
              styles.tradeBtn,
              { backgroundColor: selectedMyBookId ? colors.primary : colors.muted },
            ]}
            onPress={handleRequestTrade}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={20}
              color={selectedMyBookId ? colors.primaryForeground : colors.mutedForeground}
            />
            <Text style={[styles.tradeBtnText, { color: selectedMyBookId ? colors.primaryForeground : colors.mutedForeground }]}>
              Propor Troca
            </Text>
          </Pressable>
        </View>
      )}

      {!book.available && (
        <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomPad + 16, borderTopColor: colors.border }]}>
          <View style={[styles.unavailableNotice, { backgroundColor: colors.muted }]}>
            <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.unavailableText, { color: colors.mutedForeground }]}>
              Este livro está em processo de troca
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  back: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  coverSection: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  coverTextWrap: {
    width: 80,
    height: 110,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  coverInitials: {
    fontSize: 32,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  conditionTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  conditionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  conditionText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  bookTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
  },
  author: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  tags: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  section: {
    gap: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  sectionSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerAvatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  ownerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  ownerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  myBookOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionCover: {
    width: 40,
    height: 54,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  optionInitials: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  optionAuthor: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  noMyBooks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  noMyBooksText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  tradeBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  unavailableNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
  },
  unavailableText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
