import React from "react";
import { Pressable, Text, View } from "react-native";

import { Team } from "@/src/api";
import { useMatch } from "@/src/context/match";
import { fonts } from "@/src/fonts";
import { makeStyles } from "@/src/theme";

type Props = {
  value: Team;
  onChange: (team: Team) => void;
};

export function TeamSelect({ value, onChange }: Props) {
  const styles = useStyles();
  const { teams } = useMatch();

  const chips: { key: Team; name: string; color: string }[] = [
    { key: "home", name: teams.homeName, color: teams.homeColor },
    { key: "away", name: teams.awayName, color: teams.awayColor },
  ];

  return (
    <View style={styles.row}>
      {chips.map((c) => {
        const active = value === c.key;
        return (
          <Pressable
            key={c.key}
            testID={`team-select-${c.key}`}
            onPress={() => onChange(c.key)}
            style={[styles.chip, active && styles.chipActive, active && { borderColor: c.color }]}
          >
            <View style={[styles.dot, { backgroundColor: c.color }]} />
            <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
              {c.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  chipActive: {
    backgroundColor: colors.surfaceTertiary,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.3,
    color: colors.onSurfaceTertiary,
    flexShrink: 1,
  },
  nameActive: {
    color: colors.onSurface,
  },
}));
