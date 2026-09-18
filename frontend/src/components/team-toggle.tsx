import React from "react";
import { Pressable, Text, View } from "react-native";

import { Team } from "@/src/api";
import { fonts } from "@/src/fonts";
import { makeStyles } from "@/src/theme";

type Props = {
  value: Team;
  onChange: (team: Team) => void;
};

export function TeamToggle({ value, onChange }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Pressable
        testID="team-toggle-home"
        onPress={() => onChange("home")}
        style={[styles.seg, value === "home" && styles.segActiveHome]}
      >
        <Text style={[styles.segText, value === "home" && styles.segTextActive]}>
          LOCAL
        </Text>
      </Pressable>
      <Pressable
        testID="team-toggle-away"
        onPress={() => onChange("away")}
        style={[styles.seg, value === "away" && styles.segActiveAway]}
      >
        <Text style={[styles.segText, value === "away" && styles.segTextActive]}>
          VISITANTE
        </Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  seg: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  segActiveHome: {
    backgroundColor: colors.onSurface,
    borderColor: colors.onSurface,
  },
  segActiveAway: {
    backgroundColor: colors.onSurface,
    borderColor: colors.onSurface,
  },
  segText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.onSurfaceTertiary,
  },
  segTextActive: {
    color: colors.onSurfaceInverse,
  },
}));
