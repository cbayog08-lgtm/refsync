import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ClockCounterClockwise, House, Watch } from "phosphor-react-native";

import { ListScreen } from "@/src/components/list-screen";
import { useMatch } from "@/src/context/match";
import { useI18n } from "@/src/i18n";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function SyncScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const { pairCode, teams } = useMatch();

  return (
    <ListScreen>
      <View style={styles.header}>
        <Pressable testID="sync-home" onPress={() => router.replace("/")} hitSlop={12} style={styles.iconBtn}>
          <House size={20} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.title}>{t("sync.title")}</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.body}>
        <Watch size={44} color={colors.brandPrimary} weight="fill" />
        <Text style={styles.teams} numberOfLines={1}>{teams.homeName} vs {teams.awayName}</Text>
        <Text style={styles.hint}>{t("sync.hint")}</Text>
        <View style={styles.codeBox}>
          <Text testID="sync-code" style={styles.code}>{pairCode || "------"}</Text>
        </View>
      </View>

      <Pressable testID="sync-history-button" onPress={() => router.push("/history")} style={({ pressed }) => [styles.histBtn, pressed && styles.pressed]}>
        <ClockCounterClockwise size={18} color={colors.onSurface} weight="bold" />
        <Text style={styles.histText}>{t("sync.toHistory")}</Text>
      </Pressable>
    </ListScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 1.5, color: colors.onSurface },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  teams: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.onSurface },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.onSurfaceTertiary, textAlign: "center" },
  codeBox: { backgroundColor: colors.brandPrimary, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 14, marginTop: 6 },
  code: { fontFamily: fonts.display, fontSize: 64, letterSpacing: 10, color: colors.onBrandPrimary },
  histBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, marginBottom: 12 },
  pressed: { opacity: 0.8 },
  histText: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 1, color: colors.onSurface },
}));
