import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ArrowDown, ArrowUp, Check } from "phosphor-react-native";

import { Team } from "@/src/api";
import { ModalHeader } from "@/src/components/modal-header";
import { Numpad } from "@/src/components/numpad";
import { TeamToggle } from "@/src/components/team-toggle";
import { WatchScreen } from "@/src/components/watch-screen";
import { useMatch } from "@/src/context/match";
import { useAddEvent } from "@/src/hooks/events";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

type Field = "out" | "in";

export default function SubstitutionScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { matchId, currentMinute, currentAdded } = useMatch();
  const addEvent = useAddEvent(matchId);

  const [team, setTeam] = useState<Team>("home");
  const [field, setField] = useState<Field>("out");
  const [out, setOut] = useState("");
  const [inn, setInn] = useState("");

  const value = field === "out" ? out : inn;
  const setValue = field === "out" ? setOut : setInn;
  const canConfirm = out.length > 0 && inn.length > 0 && !addEvent.isPending;

  const confirm = async () => {
    if (!canConfirm) return;
    await addEvent.mutateAsync({
      type: "substitution",
      minute: currentMinute,
      added_minute: currentAdded,
      team,
      dorsal_out: parseInt(out, 10),
      dorsal_in: parseInt(inn, 10),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <WatchScreen padScale={0.07}>
      <View style={styles.wrap}>
        <ModalHeader title="CAMBIO" onClose={() => router.back()} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fields}>
            <Pressable
              testID="sub-field-out"
              onPress={() => setField("out")}
              style={[styles.field, field === "out" && styles.fieldActive]}
            >
              <ArrowDown size={16} color={colors.error} weight="bold" />
              <Text style={styles.fieldLabel}>SALE</Text>
              <Text style={styles.fieldNum}>{out ? `#${out}` : "--"}</Text>
            </Pressable>
            <Pressable
              testID="sub-field-in"
              onPress={() => setField("in")}
              style={[styles.field, field === "in" && styles.fieldActive]}
            >
              <ArrowUp size={16} color={colors.success} weight="bold" />
              <Text style={styles.fieldLabel}>ENTRA</Text>
              <Text style={styles.fieldNum}>{inn ? `#${inn}` : "--"}</Text>
            </Pressable>
          </View>
          <TeamToggle value={team} onChange={setTeam} />
          <Numpad value={value} onChange={setValue} />
        </ScrollView>
        <Pressable
          testID="sub-confirm-button"
          onPress={confirm}
          disabled={!canConfirm}
          style={[styles.confirm, { backgroundColor: colors.info }, !canConfirm && styles.disabled]}
        >
          <Check size={22} color={colors.onInfo} weight="bold" />
          <Text style={[styles.confirmText, { color: colors.onInfo }]}>CONFIRMAR</Text>
        </Pressable>
      </View>
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingVertical: 6,
  },
  fields: {
    flexDirection: "row",
    gap: 8,
  },
  field: {
    flex: 1,
    height: 66,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  fieldActive: {
    borderColor: colors.info,
  },
  fieldLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.onSurfaceTertiary,
  },
  fieldNum: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 28,
    color: colors.onSurface,
  },
  confirm: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  disabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
}));
