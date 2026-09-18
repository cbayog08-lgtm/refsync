import React from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { fonts } from "@/src/fonts";
import { makeStyles } from "@/src/theme";

type Props = {
  players: number[];
  selected: number | null;
  onSelect: (dorsal: number) => void;
  emptyLabel?: string;
};

// Grid of dorsal chips for lineup mode (players currently available).
export function PlayerGrid({ players, selected, onSelect, emptyLabel }: Props) {
  const styles = useStyles();

  if (players.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel ?? "Sin jugadores"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {players.map((d) => {
        const active = selected === d;
        return (
          <Pressable
            key={d}
            testID={`player-chip-${d}`}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(d);
            }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{d}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  chip: {
    width: 52,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.onSurface,
  },
  chipText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: colors.onSurfaceInverse,
  },
  empty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurfaceTertiary,
  },
}));
