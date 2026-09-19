import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { DeviceMobile, Gear, SoccerBall, Watch } from "phosphor-react-native";

import { ListScreen } from "@/src/components/list-screen";
import { useMatch } from "@/src/context/match";
import { useI18n } from "@/src/i18n";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function ModeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const { setDraft } = useMatch();

  const go = (mode: "watch" | "mobile") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({ mode });
    router.push("/categories");
  };

  return (
    <ListScreen>
      <View style={styles.header}>
        <View style={styles.brand}>
          <SoccerBall size={24} color={colors.brandPrimary} weight="fill" />
          <Text style={styles.title}>REFSYNC</Text>
        </View>
        <Pressable testID="open-settings-button" onPress={() => router.push("/settings")} hitSlop={10} style={styles.gear}>
          <Gear size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
      </View>

      <View style={styles.cards}>
        <Pressable testID="mode-watch" onPress={() => go("watch")} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <Watch size={44} color={colors.brandPrimary} weight="fill" />
          <Text style={styles.cardTitle}>{t("mode.watch")}</Text>
          <Text style={styles.cardSub}>{t("mode.watchSub")}</Text>
        </Pressable>
        <Pressable testID="mode-mobile" onPress={() => go("mobile")} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <DeviceMobile size={44} color={colors.info} weight="fill" />
          <Text style={styles.cardTitle}>{t("mode.mobile")}</Text>
          <Text style={styles.cardSub}>{t("mode.mobileSub")}</Text>
        </Pressable>
      </View>
    </ListScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: fonts.display, fontSize: 30, letterSpacing: 3, color: colors.onSurface },
  gear: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  cards: { flex: 1, justifyContent: "center", gap: 16 },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.8 },
  cardTitle: { fontFamily: fonts.display, fontSize: 30, letterSpacing: 1.5, color: colors.onSurface, marginTop: 6 },
  cardSub: { fontFamily: fonts.body, fontSize: 14, color: colors.onSurfaceTertiary },
}));
