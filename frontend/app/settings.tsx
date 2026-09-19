import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretLeft, Check } from "phosphor-react-native";

import { ListScreen } from "@/src/components/list-screen";
import { Lang, useI18n } from "@/src/i18n";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function SettingsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const options: { key: Lang; label: string }[] = [
    { key: "es", label: t("settings.spanish") },
    { key: "pt", label: t("settings.portuguese") },
  ];

  const choose = (l: Lang) => {
    Haptics.selectionAsync();
    setLang(l);
  };

  return (
    <ListScreen>
      <View style={styles.header}>
        <Pressable testID="settings-back" onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <CaretLeft size={24} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.title}>{t("settings.title")}</Text>
        <View style={styles.back} />
      </View>

      <Text style={styles.label}>{t("settings.language")}</Text>
      <View style={styles.list}>
        {options.map((o) => {
          const active = lang === o.key;
          return (
            <Pressable key={o.key} testID={`lang-${o.key}`} onPress={() => choose(o.key)} style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.pressed]}>
              <Text style={[styles.rowText, active && styles.rowTextActive]}>{o.label}</Text>
              {active ? <Check size={22} color={colors.brandPrimary} weight="bold" /> : null}
            </Pressable>
          );
        })}
      </View>
    </ListScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 26, letterSpacing: 1.5, color: colors.onSurface },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 1.5, color: colors.onSurfaceTertiary, marginBottom: 8 },
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surfaceSecondary, borderRadius: 14, paddingHorizontal: 16, height: 58, borderWidth: 1.5, borderColor: colors.border },
  rowActive: { borderColor: colors.brandPrimary },
  pressed: { opacity: 0.8 },
  rowText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.onSurfaceTertiary },
  rowTextActive: { color: colors.onSurface },
}));
