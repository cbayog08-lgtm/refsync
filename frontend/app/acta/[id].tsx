import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Export, House } from "phosphor-react-native";

import { api, EventDto } from "@/src/api";
import { EventRow } from "@/src/components/event-row";
import { ListScreen } from "@/src/components/list-screen";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";
import { formatDate, minuteLabel, reasonSuffix } from "@/src/utils/format";

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

  const homeName = match?.home_team ?? "LOCAL";
  const awayName = match?.away_team ?? "VISITANTE";
  const homeColor = match?.home_color ?? colors.error;
  const awayColor = match?.away_color ?? colors.info;

  const homeGoals = events.filter((e) => e.type === "goal" && e.team === "home").length;
  const awayGoals = events.filter((e) => e.type === "goal" && e.team === "away").length;

  const teamNameOf = (t: string) => (t === "home" ? homeName : awayName);

  const eventLine = (e: EventDto): string => {
    const m = minuteLabel(e);
    if (e.type === "goal") return `${m}  GOL  #${e.dorsal}  (${teamNameOf(e.team)})`;
    if (e.type === "card") {
      const isRed = e.card_color === "red";
      const dbl = e.reason === "double_yellow" ? " (2a amarilla)" : reasonSuffix(e);
      return `${m}  ${isRed ? "ROJA" : "AMARILLA"}${dbl}  #${e.dorsal}  (${teamNameOf(e.team)})`;
    }
    return `${m}  CAMBIO  sale #${e.dorsal_out} entra #${e.dorsal_in}  (${teamNameOf(e.team)})`;
  };

  const exportActa = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const rows = events
      .map((e) => `<tr><td style="padding:6px;border-bottom:1px solid #ddd">${eventLine(e)}</td></tr>`)
      .join("");
    const html = `<html><head><meta charset="utf-8"/></head>
      <body style="font-family:-apple-system,Arial,sans-serif;padding:28px;color:#111">
        <h1 style="margin:0;letter-spacing:1px">RefSync OS</h1>
        <div style="color:#666;margin:2px 0 12px">${match?.category ?? ""} · ${match ? formatDate(match.finished_at ?? match.created_at) : ""}</div>
        <h2 style="margin:0 0 12px">${homeName} ${homeGoals} - ${awayGoals} ${awayName}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows || "<tr><td>—</td></tr>"}</table>
      </body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
      }
    } catch {
      // user cancelled or sharing unavailable
    }
  };

  return (
    <ListScreen>
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

      <View style={styles.scoreRow}>
        <View style={styles.teamMini}>
          <View style={[styles.dot, { backgroundColor: homeColor }]} />
          <Text style={styles.miniName} numberOfLines={1}>{homeName}</Text>
        </View>
        <Text testID="acta-score" style={styles.score}>{homeGoals} - {awayGoals}</Text>
        <View style={styles.teamMini}>
          <View style={[styles.dot, { backgroundColor: awayColor }]} />
          <Text style={styles.miniName} numberOfLines={1}>{awayName}</Text>
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <EventRow item={item} homeColor={homeColor} awayColor={awayColor} />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator
        ListEmptyComponent={<Text style={styles.emptyText}>Sin eventos</Text>}
      />
    </ListScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center" },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: 1.5,
    color: colors.onSurface,
  },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceTertiary },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 8,
  },
  teamMini: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: 130 },
  dot: { width: 12, height: 12, borderRadius: 3 },
  miniName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    flexShrink: 1,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.onSurface,
  },
  listContent: { paddingVertical: 4, paddingBottom: 24 },
  sep: { height: 1, backgroundColor: colors.divider },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginTop: 30,
  },
}));
