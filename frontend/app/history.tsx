import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { CaretLeft, CaretRight, ClockCounterClockwise } from "phosphor-react-native";

import { api } from "@/src/api";
import { ListScreen } from "@/src/components/list-screen";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";
import { formatDate } from "@/src/utils/format";

export default function HistoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", "finished"],
    queryFn: () => api.listMatches("finished"),
  });

  return (
    <ListScreen>
      <View style={styles.header}>
        <Pressable testID="history-back" onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <CaretLeft size={22} color={colors.onSurface} weight="bold" />
        </Pressable>
        <Text style={styles.title}>HISTORIAL</Text>
        <View style={styles.back} />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            testID={`history-row-${item.id}`}
            onPress={() => router.push(`/acta/${item.id}`)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowCat}>{item.category}</Text>
              <View style={styles.teamsRow}>
                <View style={[styles.dot, { backgroundColor: item.home_color }]} />
                <Text style={styles.teamsText} numberOfLines={1}>
                  {item.home_team} vs {item.away_team}
                </Text>
                <View style={[styles.dot, { backgroundColor: item.away_color }]} />
              </View>
              <Text style={styles.rowDate}>{formatDate(item.finished_at ?? item.created_at)}</Text>
            </View>
            <CaretRight size={20} color={colors.onSurfaceTertiary} weight="bold" />
          </Pressable>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty} testID="history-empty">
              <ClockCounterClockwise size={48} color={colors.onSurfaceTertiary} weight="light" />
              <Text style={styles.emptyText}>Sin partidos finalizados</Text>
            </View>
          ) : null
        }
      />
    </ListScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 1.5,
    color: colors.onSurface,
  },
  listContent: {
    gap: 8,
    paddingVertical: 4,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  teamsText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.onSurface,
    flexShrink: 1,
  },
  rowCat: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.onSurface,
  },
  rowDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurfaceTertiary,
  },
}));
