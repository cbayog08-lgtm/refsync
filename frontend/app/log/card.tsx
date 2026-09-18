import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ArrowRight, Cardholder } from "phosphor-react-native";

import { CardColor, Team } from "@/src/api";
import { RED_REASONS, YELLOW_REASONS } from "@/src/card-reasons";
import { ModalHeader } from "@/src/components/modal-header";
import { Numpad } from "@/src/components/numpad";
import { PlayerGrid } from "@/src/components/player-grid";
import { TeamSelect } from "@/src/components/team-select";
import { WatchScreen } from "@/src/components/watch-screen";
import { useMatch } from "@/src/context/match";
import { useEvents } from "@/src/hooks/events";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";
import { expelledSet } from "@/src/utils/format";

export default function CardScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { matchId, logCard, lineupEnabled, lineups } = useMatch();
  const { data: events = [] } = useEvents(matchId);

  const [step, setStep] = useState<"select" | "color" | "reason">("select");
  const [team, setTeam] = useState<Team>("home");
  const [dorsal, setDorsal] = useState("");
  const [color, setColor] = useState<CardColor>("yellow");
  const [saving, setSaving] = useState(false);

  const expelled = expelledSet(events, team);
  const dorsalNum = dorsal ? parseInt(dorsal, 10) : null;
  const isExpelled = dorsalNum != null && expelled.has(dorsalNum);

  const changeTeam = (t: Team) => {
    setTeam(t);
    if (lineupEnabled) setDorsal("");
  };

  const canNext = dorsal.length > 0 && !isExpelled;
  const reasons = color === "yellow" ? YELLOW_REASONS : RED_REASONS;

  const save = async (reason: string) => {
    if (saving || dorsalNum == null) return;
    setSaving(true);
    await logCard({ team, dorsal: dorsalNum, color, reason });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const availablePlayers = lineupEnabled
    ? lineups[team].onField.filter((d) => !expelled.has(d))
    : [];

  if (step === "reason") {
    return (
      <WatchScreen padScale={0.07}>
        <View style={styles.wrap}>
          <ModalHeader title="MOTIVO" onClose={() => setStep("color")} />
          <View style={styles.display}>
            <Cardholder
              size={24}
              color={color === "red" ? colors.error : colors.warning}
              weight="fill"
            />
            <Text style={styles.displayNum}>#{dorsal}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.reasonList} showsVerticalScrollIndicator={false}>
            {reasons.map((r) => (
              <Pressable
                key={r.code}
                testID={`reason-${r.code}`}
                onPress={() => save(r.code)}
                style={({ pressed }) => [styles.reasonBtn, pressed && styles.pressed]}
              >
                <Text style={styles.reasonCode}>{r.code}</Text>
                <Text style={styles.reasonLabel} numberOfLines={1}>{r.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </WatchScreen>
    );
  }

  if (step === "color") {
    return (
      <WatchScreen padScale={0.07}>
        <View style={styles.wrap}>
          <ModalHeader title="TARJETA" onClose={() => setStep("select")} />
          <View style={styles.display}>
            <Cardholder size={24} color={colors.onSurfaceTertiary} weight="fill" />
            <Text style={styles.displayNum}>#{dorsal}</Text>
          </View>
          <Pressable
            testID="card-yellow-button"
            onPress={() => {
              setColor("yellow");
              setStep("reason");
            }}
            style={({ pressed }) => [styles.colorBtn, { backgroundColor: colors.warning }, pressed && styles.pressed]}
          >
            <Text style={[styles.colorText, { color: colors.onWarning }]}>AMARILLA</Text>
          </Pressable>
          <Pressable
            testID="card-red-button"
            onPress={() => {
              setColor("red");
              setStep("reason");
            }}
            style={({ pressed }) => [styles.colorBtn, { backgroundColor: colors.error }, pressed && styles.pressed]}
          >
            <Text style={[styles.colorText, { color: colors.onError }]}>ROJA</Text>
          </Pressable>
        </View>
      </WatchScreen>
    );
  }

  return (
    <WatchScreen padScale={0.07}>
      <View style={styles.wrap}>
        <ModalHeader title="TARJETA" onClose={() => router.back()} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.display}>
            <Cardholder size={26} color={colors.warning} weight="fill" />
            <Text testID="card-dorsal-display" style={styles.displayNum}>{dorsal ? `#${dorsal}` : "#--"}</Text>
          </View>
          <TeamSelect value={team} onChange={changeTeam} />
          {isExpelled ? <Text style={styles.warn}>Jugador ya expulsado</Text> : null}
          {lineupEnabled ? (
            <PlayerGrid
              players={availablePlayers}
              selected={dorsalNum}
              onSelect={(n) => setDorsal(String(n))}
              emptyLabel="Sin titulares disponibles"
            />
          ) : (
            <Numpad value={dorsal} onChange={setDorsal} />
          )}
        </ScrollView>
        <Pressable
          testID="card-next-button"
          onPress={() => canNext && setStep("color")}
          disabled={!canNext}
          style={[styles.next, { backgroundColor: colors.onSurface }, !canNext && styles.disabled]}
        >
          <Text style={[styles.nextText, { color: colors.onSurfaceInverse }]}>SIGUIENTE</Text>
          <ArrowRight size={20} color={colors.onSurfaceInverse} weight="bold" />
        </Pressable>
      </View>
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { gap: 10, paddingVertical: 6 },
  display: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  displayNum: { fontFamily: fonts.display, fontSize: 40, color: colors.onSurface },
  warn: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.error,
    textAlign: "center",
  },
  next: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  disabled: { opacity: 0.4 },
  nextText: { fontFamily: fonts.bodyBold, fontSize: 16, letterSpacing: 1 },
  colorBtn: { flex: 1, borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 10 },
  pressed: { opacity: 0.85 },
  colorText: { fontFamily: fonts.display, fontSize: 44, letterSpacing: 2 },
  reasonList: { gap: 8, paddingVertical: 6 },
  reasonBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 54,
  },
  reasonCode: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.onSurface,
    minWidth: 66,
  },
  reasonLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurfaceTertiary,
    flexShrink: 1,
  },
}));
