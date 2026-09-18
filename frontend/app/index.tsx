import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretRight, ClockCounterClockwise, SoccerBall } from "phosphor-react-native";

import { WatchScreen } from "@/src/components/watch-screen";
import { CATEGORIES, Category } from "@/src/categories";
import { useMatch } from "@/src/context/match";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function CategoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { setDraft } = useMatch();

  const pick = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({ category: cat });
    router.push("/setup");
  };

  return (
    <WatchScreen padScale={0.09}>
      <View style={styles.header}>
        <SoccerBall size={22} color={colors.brandPrimary} weight="fill" />
        <Text style={styles.title}>REFSYNC</Text>
      </View>
      <Text style={styles.subtitle}>ELIGE CATEGORÍA</Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            testID={`category-${cat.key}`}
            onPress={() => pick(cat)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View>
              <Text style={styles.rowLabel}>{cat.label}</Text>
              <Text style={styles.rowSub}>
                2 x {cat.halfMin}' · {cat.maxSubs == null ? "cambios ilimitados" : `${cat.maxSubs} cambios`}
              </Text>
            </View>
            <CaretRight size={22} color={colors.onSurfaceTertiary} weight="bold" />
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        testID="open-history-button"
        onPress={() => router.push("/history")}
        style={({ pressed }) => [styles.historyBtn, pressed && styles.rowPressed]}
      >
        <ClockCounterClockwise size={20} color={colors.onSurface} weight="bold" />
        <Text style={styles.historyText}>HISTORIAL</Text>
      </Pressable>
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: 3,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textAlign: "center",
    color: colors.onSurfaceTertiary,
    marginTop: 2,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
    paddingVertical: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.onSurface,
  },
  rowSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    marginTop: 1,
  },
  historyBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  historyText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.onSurface,
  },
}));
