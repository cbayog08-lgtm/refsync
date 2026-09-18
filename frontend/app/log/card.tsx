import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ArrowRight, Cardholder } from "phosphor-react-native";

import { CardColor, Team } from "@/src/api";
import { ModalHeader } from "@/src/components/modal-header";
import { Numpad } from "@/src/components/numpad";
import { TeamToggle } from "@/src/components/team-toggle";
import { WatchScreen } from "@/src/components/watch-screen";
import { useMatch } from "@/src/context/match";
import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

export default function CardScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { logCard } = useMatch();

  const [step, setStep] = useState<"select" | "color">("select");
  const [team, setTeam] = useState<Team>("home");
  const [dorsal, setDorsal] = useState("");
  const [saving, setSaving] = useState(false);

  const canNext = dorsal.length > 0;

  const save = async (cardColor: CardColor) => {
    if (saving) return;
    setSaving(true);
    await logCard({ team, dorsal: parseInt(dorsal, 10), color: cardColor });
    // Vibration confirms the card was saved.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

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
            onPress={() => save("yellow")}
            style={({ pressed }) => [styles.colorBtn, { backgroundColor: colors.warning }, pressed && styles.pressed]}
          >
            <Text style={[styles.colorText, { color: colors.onWarning }]}>AMARILLA</Text>
          </Pressable>
          <Pressable
            testID="card-red-button"
            onPress={() => save("red")}
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.display}>
            <Cardholder size={26} color={colors.warning} weight="fill" />
            <Text testID="card-dorsal-display" style={styles.displayNum}>
              {dorsal ? `#${dorsal}` : "#--"}
            </Text>
          </View>
          <TeamToggle value={team} onChange={setTeam} />
          <Numpad value={dorsal} onChange={setDorsal} />
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
  wrap: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingVertical: 6,
  },
  display: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  displayNum: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.onSurface,
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
  disabled: {
    opacity: 0.4,
  },
  nextText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
  colorBtn: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  colorText: {
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: 2,
  },
}));
