import React, { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowsLeftRight,
  ListBullets,
  Minus,
  Pause,
  Play,
  Plus,
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
  const {
    matchId,
    category,
    teams,
    status,
    mainMs,
    addedMs,
    announcedAddedMin,
    incAdded,
    decAdded,
    start,
    toggle,
  } = useMatch();
  const { data: events = [] } = useEvents(matchId);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: size.w * index, animated: true });
    setPage(index);
  };

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

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (size.w > 0) {
      setPage(Math.round(e.nativeEvent.contentOffset.x / size.w));
    }
  };

  const go = (path: "/log/goal" | "/log/card" | "/log/substitution" | "/summary") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path);
  };

  return (
    <WatchScreen padScale={0.08}>
      <View
        style={styles.pager}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        {size.w > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            testID="match-pager"
          >
            {/* Page 1 — Time & Score */}
            <View style={[styles.page, { width: size.w, height: size.h }]}>
              <View style={styles.scoreboard}>
                <View style={styles.teamCol}>
                  <View style={styles.teamTag}>
                    <View style={[styles.dot, { backgroundColor: teams.homeColor }]} />
                    <Text style={styles.teamName} numberOfLines={1}>{teams.homeName}</Text>
                  </View>
                  <Text style={styles.score}>{homeGoals}</Text>
                </View>
                <Text style={styles.scoreDash}>-</Text>
                <View style={styles.teamCol}>
                  <View style={styles.teamTag}>
                    <View style={[styles.dot, { backgroundColor: teams.awayColor }]} />
                    <Text style={styles.teamName} numberOfLines={1}>{teams.awayName}</Text>
                  </View>
                  <Text style={styles.score}>{awayGoals}</Text>
                </View>
              </View>

              <View style={styles.timerBlock}>
                <Text style={styles.period}>
                  {status === "paused" ? "TIEMPO AÑADIDO" : category?.label ?? "1ª PARTE"}
                </Text>
                <Text testID="main-timer" style={styles.timer}>{formatClock(mainMs)}</Text>
                {addedMs > 0 && (
                  <Text testID="added-timer" style={styles.addedTimer}>+{formatClock(addedMs)}</Text>
                )}
              </View>

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

              <View style={styles.addedStepper}>
                <Pressable testID="added-minus" onPress={decAdded} style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}>
                  <Minus size={20} color={colors.onSurface} weight="bold" />
                </Pressable>
                <View style={styles.addedValue}>
                  <Text style={styles.addedLabel}>AÑADIDO</Text>
                  <View style={styles.addedPill}>
                    <Text testID="added-announced" style={styles.addedNum}>{`+${announcedAddedMin}`}</Text>
                    <Text style={styles.addedUnit}>MIN</Text>
                  </View>
                </View>
                <Pressable testID="added-plus" onPress={incAdded} style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}>
                  <Plus size={20} color={colors.onSurface} weight="bold" />
                </Pressable>
              </View>
            </View>

            {/* Page 2 — Actions */}
            <View style={[styles.page, { width: size.w, height: size.h }]}>
              <View style={styles.actionsCol}>
                <ActionButton
                  testID="action-goal"
                  label="+ GOL"
                  bgColor={colors.success}
                  fgColor={colors.onSuccess}
                  icon={<SoccerBall size={24} color={colors.onSuccess} weight="fill" />}
                  onPress={() => go("/log/goal")}
                />
                <ActionButton
                  testID="action-card"
                  label="TARJETA"
                  bgColor={colors.warning}
                  fgColor={colors.onWarning}
                  icon={<WarningCircle size={24} color={colors.onWarning} weight="fill" />}
                  onPress={() => go("/log/card")}
                />
                <ActionButton
                  testID="action-substitution"
                  label="CAMBIO"
                  bgColor={colors.info}
                  fgColor={colors.onInfo}
                  icon={<ArrowsLeftRight size={24} color={colors.onInfo} weight="bold" />}
                  onPress={() => go("/log/substitution")}
                />
                <Pressable
                  testID="open-summary-button"
                  onPress={() => go("/summary")}
                  style={({ pressed }) => [styles.summaryBtn, pressed && styles.pressed]}
                >
                  <ListBullets size={18} color={colors.onSurface} weight="bold" />
                  <Text style={styles.summaryText}>RESUMEN</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        )}

        <View style={styles.dots}>
          <Pressable testID="tab-time" onPress={() => goToPage(0)} hitSlop={10}>
            <View style={[styles.dotPage, page === 0 && styles.dotPageActive]} />
          </Pressable>
          <Pressable testID="tab-actions" onPress={() => goToPage(1)} hitSlop={10}>
            <View style={[styles.dotPage, page === 1 && styles.dotPageActive]} />
          </Pressable>
        </View>
      </View>
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  pager: { flex: 1 },
  page: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  scoreboard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  teamCol: {
    alignItems: "center",
    maxWidth: 110,
  },
  teamTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: 110,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  teamName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.onSurface,
    flexShrink: 1,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 42,
    color: colors.onSurface,
  },
  scoreDash: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.onSurfaceTertiary,
    marginTop: 14,
  },
  timerBlock: {
    alignItems: "center",
    gap: 0,
  },
  period: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.onSurfaceTertiary,
  },
  timer: {
    fontFamily: fonts.display,
    fontSize: 74,
    lineHeight: 78,
    color: colors.onSurface,
    letterSpacing: 1,
  },
  addedTimer: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 28,
    color: colors.warning,
  },
  playPause: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSecondary,
  },
  pressed: { opacity: 0.7 },
  playPauseText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.onSurface,
  },
  addedStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 48,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  addedValue: {
    alignItems: "center",
    minWidth: 92,
    gap: 3,
  },
  addedLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.onSurfaceTertiary,
  },
  addedPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    backgroundColor: colors.brandPrimary,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 38,
    justifyContent: "center",
  },
  addedNum: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.onBrandPrimary,
  },
  addedUnit: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.onBrandPrimary,
  },
  actionsCol: {
    width: "100%",
    gap: 10,
    paddingHorizontal: 6,
  },
  summaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  summaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.onSurface,
  },
  dots: {
    ...({ position: "absolute", bottom: 0, left: 0, right: 0 } as const),
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dotPage: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.surfaceTertiary,
  },
  dotPageActive: {
    backgroundColor: colors.onSurface,
    width: 18,
  },
}));
