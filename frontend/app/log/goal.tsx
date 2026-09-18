import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Check, SoccerBall } from "phosphor-react-native";

import { Team } from "@/src/api";
import { ModalHeader } from "@/src/components/modal-header";
import { Numpad } from "@/src/components/numpad";
import { PlayerGrid } from "@/src/components/player-grid";
import { TeamSelect } from "@/src/components/team-select";
import { WatchScreen } from "@/src/components/watch-screen";
import { useMatch } from "@/src/context/match";
import { useAddEvent } from "@/src/hooks/events";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function GoalScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { matchId, currentMinute, currentAdded, lineupEnabled, lineups } = useMatch();
  const addEvent = useAddEvent(matchId);

  const [team, setTeam] = useState<Team>("home");
  const [dorsal, setDorsal] = useState("");

  const changeTeam = (t: Team) => {
    setTeam(t);
    if (lineupEnabled) setDorsal("");
  };

  const canConfirm = dorsal.length > 0 && !addEvent.isPending;

  const confirm = async () => {
    if (!canConfirm) return;
    await addEvent.mutateAsync({
      type: "goal",
      minute: currentMinute,
      added_minute: currentAdded,
      team,
      dorsal: parseInt(dorsal, 10),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <WatchScreen padScale={0.07}>
      <View style={styles.wrap}>
        <ModalHeader title="GOL" onClose={() => router.back()} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.display}>
            <SoccerBall size={26} color={colors.success} weight="fill" />
            <Text testID="goal-dorsal-display" style={styles.displayNum}>{dorsal ? `#${dorsal}` : "#--"}</Text>
          </View>
          <TeamSelect value={team} onChange={changeTeam} />
          {lineupEnabled ? (
            <PlayerGrid
              players={lineups[team].onField}
              selected={dorsal ? parseInt(dorsal, 10) : null}
              onSelect={(n) => setDorsal(String(n))}
              emptyLabel="Sin titulares"
            />
          ) : (
            <Numpad value={dorsal} onChange={setDorsal} />
          )}
        </ScrollView>
        <Pressable
          testID="goal-confirm-button"
          onPress={confirm}
          disabled={!canConfirm}
          style={[styles.confirm, { backgroundColor: colors.success }, !canConfirm && styles.disabled]}
        >
          <Check size={22} color={colors.onSuccess} weight="bold" />
          <Text style={[styles.confirmText, { color: colors.onSuccess }]}>CONFIRMAR</Text>
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
  confirm: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  disabled: { opacity: 0.4 },
  confirmText: { fontFamily: fonts.bodyBold, fontSize: 16, letterSpacing: 1 },
}));
