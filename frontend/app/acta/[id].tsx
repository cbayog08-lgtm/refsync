import React from "react";
import { FlatList, Pressable, Share, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Export, House } from "phosphor-react-native";

import { api, EventDto } from "@/src/api";
import { EventRow } from "@/src/components/event-row";
import { WatchScreen } from "@/src/components/watch-screen";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";
import { formatDate, minuteLabel, teamName } from "@/src/utils/format";

function eventLine(e: EventDto): string {
  const m = minuteLabel(e);
  if (e.type === "goal") return `${m}  GOL  #${e.dorsal}  (${teamName(e.team)})`;
  if (e.type === "card") {
    const isRed = e.card_color === "red";
    const dbl = e.reason === "double_yellow" ? " (2a amarilla)" : "";
    return `${m}  ${isRed ? "ROJA" : "AMARILLA"}${dbl}  #${e.dorsal}  (${teamName(e.team)})`;
  }
  return `${m}  CAMBIO  sale #${e.dorsal_out} entra #${e.dorsal_in}  (${teamName(e.team)})`;
}

export default function ActaScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: match } = useQuery({
    queryKey: ["match", id],
    queryFn: () => api.getMatch(id as string),
    enabled: !!id,
  });
  const { data: events = [] } = useQuery({
    queryKey: ["events", id],
    queryFn: () => api.getEvents(id as string),
    enabled: !!id,
  });

  const homeGoals = events.filter((e) => e.type === "goal" && e.team === "home").length;
  const awayGoals = events.filter((e) => e.type === "goal" && e.team === "away").length;

  const exportActa = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const lines = [
      "RefSync OS — Acta de Partido",
      match ? `Categoría: ${match.category}` : "",
      match ? `Fecha: ${formatDate(match.finished_at ?? match.created_at)}` : "",
      `Marcador: LOCAL ${homeGoals} - ${awayGoals} VISITANTE`,
      "",
      "Eventos:",
      ...events.map(eventLine),
    ].filter(Boolean);
    try {
      await Share.share({ message: lines.join("\n") });
    } catch {
      // user dismissed share sheet
    }
  };

  return (
    <WatchScreen padScale={0.08}>
      <View style={styles.header}>
        <Pressable testID="acta-home" onPress={() => router.replace("/")} hitSlop={12} style={styles.iconBtn}>
          <House size={20} color={colors.onSurface} weight="bold" />
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.title}>ACTA</Text>
          <Text style={styles.meta}>{match?.category ?? ""}</Text>
        </View>
        <Pressable testID="acta-export" onPress={exportActa} hitSlop={12} style={styles.iconBtn}>
          <Export size={20} color={colors.brandPrimary} weight="bold" />
        </Pressable>
      </View>

      <Text testID="acta-score" style={styles.score}>
        {homeGoals} - {awayGoals}
      </Text>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EventRow item={item} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Sin eventos</Text>}
      />
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 1.5,
    color: colors.onSurface,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceTertiary,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 40,
    textAlign: "center",
    color: colors.onSurface,
    marginVertical: 2,
  },
  listContent: {
    paddingVertical: 4,
    flexGrow: 1,
  },
  sep: {
    height: 1,
    backgroundColor: colors.divider,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginTop: 30,
  },
}));
