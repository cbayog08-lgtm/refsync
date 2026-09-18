import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretLeft, Plus, X } from "phosphor-react-native";

import { Team } from "@/src/api";
import { Numpad } from "@/src/components/numpad";
import { WatchScreen } from "@/src/components/watch-screen";
import { Lineups, useMatch } from "@/src/context/match";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

const emptyLineups = (): Lineups => ({
  home: { onField: [], bench: [] },
  away: { onField: [], bench: [] },
});

export default function LineupScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { draft, startMatch } = useMatch();

  const [team, setTeam] = useState<Team>("home");
  const [dorsal, setDorsal] = useState("");
  const [lineups, setLineups] = useState<Lineups>(emptyLineups());

  const squad = lineups[team];
  const teamColor = team === "home" ? draft.homeColor : draft.awayColor;
  const teamName = team === "home" ? draft.homeName : draft.awayName;

  const exists = (n: number) => squad.onField.includes(n) || squad.bench.includes(n);

  const add = (where: "onField" | "bench") => {
    const n = parseInt(dorsal, 10);
    if (!dorsal || Number.isNaN(n) || exists(n)) return;
    if (where === "onField" && squad.onField.length >= 11) return;
    Haptics.selectionAsync();
    setLineups((prev) => ({
      ...prev,
      [team]: { ...prev[team], [where]: [...prev[team][where], n] },
    }));
    setDorsal("");
  };

  const remove = (where: "onField" | "bench", n: number) => {
    setLineups((prev) => ({
      ...prev,
      [team]: { ...prev[team], [where]: prev[team][where].filter((d) => d !== n) },
    }));
  };

  const ready =
    lineups.home.onField.length >= 1 && lineups.away.onField.length >= 1;

  const begin = async () => {
    if (!ready || !draft.category) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startMatch({
      category: draft.category,
      homeName: draft.homeName,
      awayName: draft.awayName,
      homeColor: draft.homeColor,
      awayColor: draft.awayColor,
      lineupEnabled: true,
      lineups,
    });
    router.replace("/match");
  };

  return (
    <WatchScreen padScale={0.07}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Pressable testID="lineup-back" onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <CaretLeft size={22} color={colors.onSurface} weight="bold" />
          </Pressable>
          <Text style={styles.title}>ALINEACIÓN</Text>
          <View style={styles.back} />
        </View>

        <View style={styles.teamRow}>
          {(["home", "away"] as Team[]).map((t) => {
            const active = team === t;
            const c = t === "home" ? draft.homeColor : draft.awayColor;
            const nm = t === "home" ? draft.homeName : draft.awayName;
            return (
              <Pressable
                key={t}
                testID={`lineup-team-${t}`}
                onPress={() => setTeam(t)}
                style={[styles.teamChip, active && { borderColor: c }]}
              >
                <View style={[styles.dot, { backgroundColor: c }]} />
                <Text style={[styles.teamName, active && styles.teamNameActive]} numberOfLines={1}>
                  {nm}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.count}>
            Titulares {squad.onField.length}/11 · Banca {squad.bench.length}
          </Text>

          <Numpad value={dorsal} onChange={setDorsal} />

          <View style={styles.addRow}>
            <Pressable
              testID="add-starter"
              onPress={() => add("onField")}
              style={({ pressed }) => [styles.addBtn, { borderColor: teamColor }, pressed && styles.pressed]}
            >
              <Plus size={16} color={colors.onSurface} weight="bold" />
              <Text style={styles.addText}>TITULAR</Text>
            </Pressable>
            <Pressable
              testID="add-bench"
              onPress={() => add("bench")}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            >
              <Plus size={16} color={colors.onSurfaceTertiary} weight="bold" />
              <Text style={styles.addTextMuted}>BANCA</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>TITULARES</Text>
          <View style={styles.chips}>
            {squad.onField.map((n) => (
              <Pressable
                key={n}
                testID={`starter-${n}`}
                onPress={() => remove("onField", n)}
                style={[styles.chip, { borderColor: teamColor }]}
              >
                <Text style={styles.chipText}>{n}</Text>
                <X size={12} color={colors.onSurfaceTertiary} weight="bold" />
              </Pressable>
            ))}
            {squad.onField.length === 0 ? <Text style={styles.emptyMini}>—</Text> : null}
          </View>

          <Text style={styles.sectionLabel}>BANCA · {teamName}</Text>
          <View style={styles.chips}>
            {squad.bench.map((n) => (
              <Pressable
                key={n}
                testID={`bench-${n}`}
                onPress={() => remove("bench", n)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{n}</Text>
                <X size={12} color={colors.onSurfaceTertiary} weight="bold" />
              </Pressable>
            ))}
            {squad.bench.length === 0 ? <Text style={styles.emptyMini}>—</Text> : null}
          </View>
        </ScrollView>

        <Pressable
          testID="lineup-begin-button"
          onPress={begin}
          disabled={!ready}
          style={[styles.begin, !ready && styles.disabled]}
        >
          <Text style={styles.beginText}>COMENZAR</Text>
        </Pressable>
      </View>
    </WatchScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 1.5,
    color: colors.onSurface,
  },
  teamRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  teamChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 6,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  teamName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    flexShrink: 1,
  },
  teamNameActive: { color: colors.onSurface },
  scroll: { flex: 1 },
  scrollContent: { gap: 10, paddingVertical: 8 },
  count: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
  },
  addRow: { flexDirection: "row", gap: 8 },
  addBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pressed: { opacity: 0.8 },
  addText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.onSurface,
  },
  addTextMuted: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.onSurfaceTertiary,
  },
  sectionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  chipText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.onSurface,
  },
  emptyMini: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  begin: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  disabled: { opacity: 0.4 },
  beginText: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 2,
    color: colors.onBrandPrimary,
  },
}));
