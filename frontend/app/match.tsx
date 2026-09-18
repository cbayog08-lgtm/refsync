import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowsLeftRight,
  ListBullets,
  Pause,
  Play,
  SoccerBall,
  WarningCircle,
} from "phosphor-react-native";

import { ActionButton } from "@/src/components/action-button";
import { WatchScreen } from "@/src/components/watch-screen";
import { useMatch } from "@/src/context/match";
import { useEvents } from "@/src/hooks/events";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";
import { formatClock } from "@/src/utils/format";

export default function MatchScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { matchId, category, status, mainMs, addedMs, start, toggle } = useMatch();
  const { data: events = [] } = useEvents(matchId);

  // Only redirect when THIS screen is focused (avoids racing with the
  // navigation to the acta after finishing a match).
  useFocusEffect(
    useCallback(() => {
      if (!matchId) router.replace("/");
    }, [matchId, router]),
  );

  if (!matchId) return null;

  const homeGoals = events.filter((e) => e.type === "goal" && e.team === "home").length;
  const awayGoals = events.filter((e) => e.type === "goal" && e.team === "away").length;

  const isRunning = status === "running";
  const isStopped = status === "stopped";

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isStopped) start();
    else toggle();
  };

  return (
    <WatchScreen padScale={0.085}>
      <View style={styles.topRow}>
        <View style={styles.scoreBlock}>
          <Text style={styles.teamLabel}>LOC</Text>
          <Text style={styles.score}>{homeGoals}</Text>
        </View>
        <Pressable
          testID="open-summary-button"
          onPress={() => router.push("/summary")}
          style={styles.summaryBtn}
          hitSlop={8}
        >
          <ListBullets size={18} color={colors.onSurfaceTertiary} weight="bold" />
        </Pressable>
        <View style={styles.scoreBlock}>
          <Text style={styles.teamLabel}>VIS</Text>
          <Text style={styles.score}>{awayGoals}</Text>
        </View>
      </View>

      <View style={styles.timerWrap}>
        <Text style={styles.period}>
          {status === "paused" ? "TIEMPO AÑADIDO" : category?.label ?? "1ª PARTE"}
        </Text>
        <Text testID="main-timer" style={styles.timer}>
          {formatClock(mainMs)}
        </Text>
        {addedMs > 0 && (
          <Text testID="added-timer" style={styles.addedTimer}>
            +{formatClock(addedMs)}
          </Text>
        )}

        <Pressable
          testID="play-pause-button"
          onPress={handlePlayPause}
          style={({ pressed }) => [styles.playPause, pressed && styles.pressed]}
        >
          {isRunning ? (
            <Pause size={18} color={colors.onSurface} weight="fill" />
          ) : (
            <Play size={18} color={colors.onSurface} weight="fill" />
          )}
          <Text style={styles.playPauseText}>
            {isStopped ? "INICIAR" : isRunning ? "PAUSA" : "SEGUIR"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <ActionButton
          testID="action-goal"
          label="GOL"
          bgColor={colors.success}
          fgColor={colors.onSuccess}
          icon={<SoccerBall size={24} color={colors.onSuccess} weight="fill" />}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/log/goal");
          }}
        />
        <ActionButton
          testID="action-card"
          label="TARJETA"
          bgColor={colors.warning}
          fgColor={colors.onWarning}
          icon={<WarningCircle size={24} color={colors.onWarning} weight="fill" />}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/log/card");
          }}
        />
        <ActionButton
          testID="action-substitution"
          label="CAMBIO"
          bgColor={colors.info}
          fgColor={colors.onInfo}
          icon={<ArrowsLeftRight size={24} color={colors.onInfo} weight="bold" />}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/log/substitution");
          }}
        />
      </View>
      <View style={styles.bottomSpacer} />
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  scoreBlock: {
    alignItems: "center",
    minWidth: 44,
  },
  teamLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.onSurfaceTertiary,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 32,
    color: colors.onSurface,
  },
  summaryBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  timerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  period: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.onSurfaceTertiary,
  },
  timer: {
    fontFamily: fonts.display,
    fontSize: 78,
    lineHeight: 82,
    color: colors.onSurface,
    letterSpacing: 1,
  },
  addedTimer: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: colors.warning,
  },
  playPause: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
  playPauseText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.onSurface,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  bottomSpacer: {
    flex: 0.55,
  },
}));
