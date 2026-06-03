import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookCard } from "@/components/BookCard";
import { EmptyState } from "@/components/EmptyState";
import { useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

export default function MeusLivrosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { myBooks, deleteBook } = useBooks();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLongPress = (id: string) => {
    setSelectedId(id);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remover livro", "Deseja remover este livro da sua lista?", [
      { text: "Cancelar", style: "cancel", onPress: () => setSelectedId(null) },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await deleteBook(id);
          setSelectedId(null);
        },
      },
    ]);
  };

  const handleEdit = (id: string) => {
    setSelectedId(null);
    router.push(`/book/form?id=${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Meus Livros</Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/book/form");
            }}
          >
            <Ionicons name="add" size={22} color={colors.primaryForeground} />
          </Pressable>
        </View>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {myBooks.length} {myBooks.length === 1 ? "livro cadastrado" : "livros cadastrados"}
        </Text>
      </View>

      {selectedId && (
        <Animated.View entering={FadeInDown.duration(200)} style={[styles.actionBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.actionBarTitle, { color: colors.foreground }]}>Selecione uma ação</Text>
          <View style={styles.actionBtns}>
            <Pressable style={[styles.actionBarBtn, { backgroundColor: colors.secondary }]} onPress={() => handleEdit(selectedId)}>
              <Ionicons name="pencil-outline" size={18} color={colors.foreground} />
              <Text style={[styles.actionBarBtnText, { color: colors.foreground }]}>Editar</Text>
            </Pressable>
            <Pressable style={[styles.actionBarBtn, { backgroundColor: "#DC262618" }]} onPress={() => handleDelete(selectedId)}>
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              <Text style={[styles.actionBarBtnText, { color: colors.destructive }]}>Remover</Text>
            </Pressable>
            <Pressable style={[styles.actionBarBtn, { backgroundColor: colors.muted }]} onPress={() => setSelectedId(null)}>
              <Ionicons name="close" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </Animated.View>
      )}

      <FlatList
        data={myBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            showOwner={false}
            onLongPress={() => handleLongPress(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          myBooks.length === 0 && styles.listEmpty,
          { paddingBottom: Platform.OS === "web" ? 100 : 90 },
        ]}
        scrollEnabled={!!myBooks.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="library-outline"
            title="Nenhum livro ainda"
            subtitle="Adicione livros que deseja trocar tocando no botão +"
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
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  count: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBar: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  actionBarTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  actionBtns: {
    flexDirection: "row",
    gap: 8,
  },
  actionBarBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBarBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  listEmpty: {
    flex: 1,
  },
});
