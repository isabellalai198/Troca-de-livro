import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BookCondition,
  COVER_COLORS,
  GENRES,
  useBooks,
} from "@/context/BooksContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

const CONDITIONS: BookCondition[] = ["Novo", "Ótimo", "Bom", "Regular"];

export default function BookFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addBook, updateBook, getBook } = useBooks();
  const { user } = useUser();

  const isEditing = !!id;
  const existing = id ? getBook(id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [author, setAuthor] = useState(existing?.author ?? "");
  const [genre, setGenre] = useState(existing?.genre ?? GENRES[0]);
  const [condition, setCondition] = useState<BookCondition>(existing?.condition ?? "Bom");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [coverColor, setCoverColor] = useState(existing?.coverColor ?? COVER_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Título obrigatório", "Por favor, informe o título do livro.");
      return;
    }
    if (!author.trim()) {
      Alert.alert("Autor obrigatório", "Por favor, informe o autor do livro.");
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (isEditing && id) {
        await updateBook(id, { title: title.trim(), author: author.trim(), genre, condition, description: description.trim(), coverColor });
      } else {
        await addBook({
          title: title.trim(),
          author: author.trim(),
          genre,
          condition,
          description: description.trim(),
          coverColor,
          ownerName: user.name,
          ownerId: user.id,
        });
      }
      router.back();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar o livro.");
    } finally {
      setLoading(false);
    }
  };

  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "AB";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.preview}>
          <View style={[styles.coverPreview, { backgroundColor: coverColor }]}>
            <Text style={styles.coverInitials}>{initials}</Text>
          </View>
          <View style={styles.colorGrid}>
            {COVER_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  coverColor === c && styles.colorDotSelected,
                ]}
                onPress={() => setCoverColor(c)}
              />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Título *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: O Alquimista"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Autor *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
              value={author}
              onChangeText={setAuthor}
              placeholder="Ex: Paulo Coelho"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Gênero</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {GENRES.map((g) => (
                  <Pressable
                    key={g}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: genre === g ? colors.primary : colors.muted,
                        borderColor: genre === g ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setGenre(g)}
                  >
                    <Text style={[styles.chipText, { color: genre === g ? colors.primaryForeground : colors.mutedForeground }]}>
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Estado de conservação</Text>
            <View style={styles.chipRow}>
              {CONDITIONS.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: condition === c ? colors.primary : colors.muted,
                      borderColor: condition === c ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setCondition(c)}
                >
                  <Text style={[styles.chipText, { color: condition === c ? colors.primaryForeground : colors.mutedForeground }]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Descrição</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o estado do livro, edição, etc."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: bottomPad + 16, backgroundColor: colors.background }]}>
        <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading}>
          <Ionicons name={isEditing ? "checkmark-outline" : "add-outline"} size={20} color={colors.primaryForeground} />
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Adicionar livro"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 16,
  },
  coverPreview: {
    width: 80,
    height: 110,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  coverInitials: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorDotSelected: {
    transform: [{ scale: 1.25 }],
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  form: {
    paddingHorizontal: 20,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
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
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
