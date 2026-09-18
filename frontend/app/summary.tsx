import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { CaretLeft } from "phosphor-react-native";

import { EventRow } from "@/src/components/event-row";
import { WatchScreen } from "@/src/components/watch-screen";
import { useMatch } from "@/src/context/match";
import { useEvents } from "@/src/hooks/events";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

const WHISTLE_IMG =
  "https://images.unsplash.com/photo-1630521301804-84bed5b0288a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxyZWZlcmVlJTIwd2hpc3RsZSUyMHNvY2NlcnxlbnwwfHx8fDE3ODk3NTAxNzh8MA&ixlib=rb-4.1.0&q=85";

export default function SummaryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { matchId, teams, finishAndArchive } = useMatch();
  const { data: events = [], isLoading } = useEvents(matchId);

  const homeGoals = events.filter((e) => e.type === "goal" && e.team === "home").length;
  const awayGoals = events.filter((e) => e.type === "goal" && e.team === "away").length;

  const handleEnd = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const id = await finishAndArchive();
    router.replace(id ? `/acta/${id}` : "/");
  };

  return (
    <WatchScreen padScale={0.08}>
      <View style={styles.header}>
        <Pressable testID="summary-back" onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <CaretLeft size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
        <View style={styles.scoreWrap}>
          <View style={styles.teamMini}>
            <View style={[styles.dot, { backgroundColor: teams.homeColor }]} />
            <Text style={styles.miniName} numberOfLines={1}>{teams.homeName}</Text>
          </View>
          <Text testID="summary-score" style={styles.score}>{homeGoals} - {awayGoals}</Text>
          <View style={styles.teamMini}>
            <View style={[styles.dot, { backgroundColor: teams.awayColor }]} />
            <Text style={styles.miniName} numberOfLines={1}>{teams.awayName}</Text>
          </View>
        </View>
        <View style={styles.back} />
      </View>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <EventRow item={item} homeColor={teams.homeColor} awayColor={teams.awayColor} />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty} testID="summary-empty">
              <Image source={{ uri: WHISTLE_IMG }} style={styles.emptyImg} contentFit="cover" />
              <Text style={styles.emptyText}>Sin eventos aún</Text>
            </View>
          ) : null
        }
      />

      <Pressable
        testID="end-match-button"
        onPress={handleEnd}
        style={({ pressed }) => [styles.endBtn, { backgroundColor: colors.error }, pressed && styles.pressed]}
      >
        <Text style={[styles.endText, { color: colors.onError }]}>FIN DE PARTIDO</Text>
      </Pressable>
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  back: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  scoreWrap: { alignItems: "center", flex: 1 },
  teamMini: { flexDirection: "row", alignItems: "center", gap: 5, maxWidth: 150 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  miniName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    flexShrink: 1,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.onSurface,
    lineHeight: 32,
  },
  listContent: { paddingVertical: 4, flexGrow: 1 },
  sep: { height: 1, backgroundColor: colors.divider },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 30, gap: 14 },
  emptyImg: { width: 110, height: 110, borderRadius: 55, opacity: 0.5 },
  emptyText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onSurfaceTertiary },
  endBtn: {
    marginTop: 6,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.8 },
  endText: { fontFamily: fonts.display, fontSize: 26, letterSpacing: 1.5 },
}));
