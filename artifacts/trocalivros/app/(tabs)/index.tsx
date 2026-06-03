import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookCard } from "@/components/BookCard";
import { EmptyState } from "@/components/EmptyState";
import { GENRES, useBooks } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

const ALL = "Todos";

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { communityBooks, myBooks } = useBooks();
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(ALL);

  const myIds = useMemo(() => new Set(myBooks.map((b) => b.id)), [myBooks]);
  const allBooks = useMemo(
    () => communityBooks.filter((b) => !myIds.has(b.id)),
    [communityBooks, myIds]
  );

  const filtered = useMemo(() => {
    return allBooks.filter((b) => {
      const matchSearch =
        search.trim() === "" ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchGenre = selectedGenre === ALL || b.genre === selectedGenre;
      return matchSearch && matchGenre;
    });
  }, [allBooks, search, selectedGenre]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const genres = [ALL, ...GENRES];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Disponíveis perto de você</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Explorar Livros</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Título ou autor..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search !== "" && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll} contentContainerStyle={styles.genreContent}>
          {genres.map((g) => (
            <Pressable
              key={g}
              style={[
                styles.genreChip,
                {
                  backgroundColor: selectedGenre === g ? colors.primary : colors.muted,
                  borderColor: selectedGenre === g ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedGenre(g)}
            >
              <Text style={[styles.genreChipText, { color: selectedGenre === g ? colors.primaryForeground : colors.mutedForeground }]}>
                {g}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.listEmpty,
          { paddingBottom: Platform.OS === "web" ? 100 : 90 },
        ]}
        scrollEnabled={!!filtered.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="Nenhum livro encontrado"
            subtitle="Tente outros termos ou gêneros."
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
    paddingBottom: 8,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  genreScroll: {
    marginHorizontal: -20,
  },
  genreContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  listEmpty: {
    flex: 1,
  },
});
