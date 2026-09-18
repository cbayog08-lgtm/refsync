import React, { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretLeft, Check } from "phosphor-react-native";

import { WatchScreen } from "@/src/components/watch-screen";
import { JERSEYS } from "@/src/jerseys";
import { useMatch } from "@/src/context/match";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

function ColorRow({
  value,
  onChange,
  testID,
}: {
  value: string;
  onChange: (hex: string) => void;
  testID: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.colorRow} testID={testID}>
      {JERSEYS.map((j) => {
        const active = value.toLowerCase() === j.hex.toLowerCase();
        return (
          <Pressable
            key={j.key}
            testID={`${testID}-${j.key}`}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(j.hex);
            }}
            style={[styles.swatch, { backgroundColor: j.hex }, active && styles.swatchActive]}
          >
            {active ? <Check size={16} color={j.on} weight="bold" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SetupScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { draft, setDraft, startMatch } = useMatch();

  const [homeName, setHomeName] = useState(draft.homeName);
  const [awayName, setAwayName] = useState(draft.awayName);
  const [homeColor, setHomeColor] = useState(draft.homeColor);
  const [awayColor, setAwayColor] = useState(draft.awayColor);
  const [lineupEnabled, setLineupEnabled] = useState(draft.lineupEnabled);

  useEffect(() => {
    if (!draft.category) router.replace("/");
  }, [draft.category, router]);

  const begin = async () => {
    if (!draft.category) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const h = homeName.trim() || "LOCAL";
    const a = awayName.trim() || "VISITANTE";
    if (lineupEnabled) {
      setDraft({ homeName: h, awayName: a, homeColor, awayColor, lineupEnabled: true });
      router.push("/lineup");
      return;
    }
    await startMatch({
      category: draft.category,
      homeName: h,
      awayName: a,
      homeColor,
      awayColor,
      lineupEnabled: false,
      lineups: { home: { onField: [], bench: [] }, away: { onField: [], bench: [] } },
    });
    router.replace("/match");
  };

  return (
    <WatchScreen padScale={0.07}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Pressable testID="setup-back" onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <CaretLeft size={22} color={colors.onSurface} weight="bold" />
          </Pressable>
          <Text style={styles.title}>EQUIPOS</Text>
          <View style={styles.back} />
        </View>

        <KeyboardAwareScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bottomOffset={16}
        >
          <Text style={styles.cat}>{draft.category?.label}</Text>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>LOCAL</Text>
            <TextInput
              testID="home-name-input"
              value={homeName}
              onChangeText={setHomeName}
              placeholder="Nombre local"
              placeholderTextColor={colors.muted}
              style={styles.input}
              maxLength={16}
            />
            <ColorRow value={homeColor} onChange={setHomeColor} testID="home-color" />
          </View>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>VISITANTE</Text>
            <TextInput
              testID="away-name-input"
              value={awayName}
              onChangeText={setAwayName}
              placeholder="Nombre visitante"
              placeholderTextColor={colors.muted}
              style={styles.input}
              maxLength={16}
            />
            <ColorRow value={awayColor} onChange={setAwayColor} testID="away-color" />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Cargar alineaciones</Text>
              <Text style={styles.toggleSub}>Elegir jugadores en vez de teclear</Text>
            </View>
            <Switch
              testID="lineup-toggle"
              value={lineupEnabled}
              onValueChange={setLineupEnabled}
              trackColor={{ true: colors.brandPrimary, false: colors.surfaceTertiary }}
              thumbColor={colors.onSurface}
            />
          </View>
        </KeyboardAwareScrollView>

        <Pressable
          testID="setup-begin-button"
          onPress={begin}
          style={({ pressed }) => [styles.begin, pressed && styles.pressed]}
        >
          <Text style={styles.beginText}>{lineupEnabled ? "SIGUIENTE" : "COMENZAR"}</Text>
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
    fontSize: 26,
    letterSpacing: 1.5,
    color: colors.onSurface,
  },
  scroll: { flex: 1 },
  scrollContent: { gap: 12, paddingVertical: 8 },
  cat: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.brandPrimary,
    textAlign: "center",
  },
  block: { gap: 8 },
  blockLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.onSurfaceTertiary,
  },
  input: {
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 14,
    color: colors.onSurface,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchActive: {
    borderColor: colors.onSurface,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  toggleText: { flex: 1 },
  toggleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  toggleSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
  begin: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  pressed: { opacity: 0.85 },
  beginText: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 2,
    color: colors.onBrandPrimary,
  },
}));
