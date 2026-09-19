import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretLeft, DownloadSimple } from "phosphor-react-native";

import { api } from "@/src/api";
import { ListScreen } from "@/src/components/list-screen";
import { useMatch } from "@/src/context/match";
import { useI18n } from "@/src/i18n";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function PairScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const { loadMatch } = useMatch();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const canLoad = code.length === 6 && !loading;

  const load = async () => {
    if (!canLoad) return;
    setLoading(true);
    setError(false);
    try {
      const dto = await api.getMatchByCode(code);
      loadMatch(dto);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/match");
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <ListScreen>
      <View style={styles.header}>
        <Pressable testID="pair-back" onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <CaretLeft size={24} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.title}>{t("pair.title")}</Text>
        <View style={styles.back} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.body} bottomOffset={16} showsVerticalScrollIndicator={false}>
        <DownloadSimple size={48} color={colors.brandPrimary} weight="fill" />
        <Text style={styles.hint}>{t("pair.hint")}</Text>
        <TextInput
          testID="pair-code-input"
          value={code}
          onChangeText={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 6))}
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={6}
        />
        {error ? <Text style={styles.error}>{t("pair.notFound")}</Text> : null}
      </KeyboardAwareScrollView>

      <Pressable testID="pair-load-button" onPress={load} disabled={!canLoad} style={[styles.loadBtn, { backgroundColor: colors.brandPrimary }, !canLoad && styles.disabled]}>
        <Text style={[styles.loadText, { color: colors.onBrandPrimary }]}>{t("pair.load")}</Text>
      </Pressable>
    </ListScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 1, color: colors.onSurface },
  body: { flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.onSurfaceTertiary, textAlign: "center" },
  input: {
    height: 68,
    width: "100%",
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    textAlign: "center",
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: 8,
  },
  error: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.error },
  loadBtn: { height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  disabled: { opacity: 0.4 },
  loadText: { fontFamily: fonts.display, fontSize: 26, letterSpacing: 1.5 },
}));
