import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretLeft, CaretRight, ClockCounterClockwise, DownloadSimple } from "phosphor-react-native";

import { ListScreen } from "@/src/components/list-screen";
import { CATEGORIES, Category } from "@/src/categories";
import { useMatch } from "@/src/context/match";
import { useI18n } from "@/src/i18n";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function CategoriesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const { draft, setDraft } = useMatch();

  const pick = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({ category: cat });
    router.push("/setup");
  };

  return (
    <ListScreen>
      <View style={styles.header}>
        <Pressable testID="cat-back" onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <CaretLeft size={24} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.title}>{t("cat.title")}</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <Pressable key={cat.key} testID={`category-${cat.key}`} onPress={() => pick(cat)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View>
              <Text style={styles.rowLabel}>{cat.label}</Text>
              <Text style={styles.rowSub}>
                2 x {cat.halfMin}' · {cat.maxSubs == null ? t("cat.unlimited") : t("cat.subs", { n: cat.maxSubs })}
              </Text>
            </View>
            <CaretRight size={22} color={colors.onSurfaceTertiary} weight="bold" />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {draft.mode === "watch" ? (
          <Pressable testID="open-pair-button" onPress={() => router.push("/pair")} style={({ pressed }) => [styles.footBtn, pressed && styles.pressed]}>
            <DownloadSimple size={18} color={colors.onSurface} weight="bold" />
            <Text style={styles.footText}>{t("pair.link")}</Text>
          </Pressable>
        ) : null}
        <Pressable testID="open-history-button" onPress={() => router.push("/history")} style={({ pressed }) => [styles.footBtn, pressed && styles.pressed]}>
          <ClockCounterClockwise size={18} color={colors.onSurface} weight="bold" />
          <Text style={styles.footText}>{t("common.historial")}</Text>
        </Pressable>
      </View>
    </ListScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 1.2, color: colors.onSurface },
  list: { gap: 8, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surfaceSecondary, borderRadius: 14, paddingHorizontal: 16, height: 60 },
  pressed: { opacity: 0.7 },
  rowLabel: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.onSurface },
  rowSub: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceTertiary, marginTop: 1 },
  footer: { gap: 8, paddingTop: 8 },
  footBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border },
  footText: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 1, color: colors.onSurface },
}));
