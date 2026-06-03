import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Book } from "@/context/BooksContext";
import { useColors } from "@/hooks/useColors";

interface BookCardProps {
  book: Book;
  showOwner?: boolean;
  onLongPress?: () => void;
}

function conditionColor(condition: string): string {
  switch (condition) {
    case "Novo": return "#16A34A";
    case "Ótimo": return "#2563EB";
    case "Bom": return "#D97706";
    case "Regular": return "#DC2626";
    default: return "#6B7280";
  }
}

export function BookCard({ book, showOwner = true, onLongPress }: BookCardProps) {
  const colors = useColors();
  const router = useRouter();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    router.push(`/book/${book.id}`);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  const initials = book.title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={400}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.cover, { backgroundColor: book.coverColor }]}>
            <Text style={styles.coverText}>{initials}</Text>
            {!book.available && (
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableText}>Em troca</Text>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.author, { color: colors.mutedForeground }]} numberOfLines={1}>
              {book.author}
            </Text>
            <View style={styles.meta}>
              <View style={[styles.genreBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.genreText, { color: colors.mutedForeground }]}>{book.genre}</Text>
              </View>
              <View style={[styles.conditionDot, { backgroundColor: conditionColor(book.condition) }]} />
              <Text style={[styles.conditionText, { color: conditionColor(book.condition) }]}>{book.condition}</Text>
            </View>
            {showOwner && (
              <View style={styles.ownerRow}>
                <Ionicons name="person-circle-outline" size={13} color={colors.mutedForeground} />
                <Text style={[styles.owner, { color: colors.mutedForeground }]}>{book.ownerName}</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.border} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  cover: {
    width: 56,
    height: 78,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  unavailableBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 2,
    alignItems: "center",
  },
  unavailableText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  author: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  genreBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  conditionText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  owner: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
