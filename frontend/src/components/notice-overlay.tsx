import React from "react";
import { Pressable, Text, View } from "react-native";
import { Prohibit, WarningCircle, WarningOctagon } from "phosphor-react-native";

import { useMatch } from "@/src/context/match";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

// Full-screen automatic notice for expulsions / suspension / substitution limits.
export function NoticeOverlay() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { notice, dismissNotice } = useMatch();

  if (!notice) return null;

  const accent =
    notice.tone === "suspend"
      ? colors.error
      : notice.tone === "subs"
        ? colors.info
        : colors.warning;

  return (
    <View style={styles.backdrop} testID="notice-overlay">
      <View style={[styles.card, { borderColor: accent }]}>
        {notice.tone === "suspend" ? (
          <WarningOctagon size={56} color={accent} weight="fill" />
        ) : notice.tone === "subs" ? (
          <WarningCircle size={56} color={accent} weight="fill" />
        ) : (
          <Prohibit size={56} color={accent} weight="fill" />
        )}
        <Text style={[styles.title, { color: accent }]}>{notice.title}</Text>
        <Text style={styles.message}>{notice.message}</Text>
        <Pressable
          testID="notice-dismiss"
          onPress={dismissNotice}
          style={({ pressed }) => [styles.button, { backgroundColor: accent }, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>ENTENDIDO</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    ...({ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as const),
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceSecondary,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  pressed: { opacity: 0.8 },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
    color: colors.onError,
  },
}));
