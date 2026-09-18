import React from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Backspace } from "phosphor-react-native";

import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];

export function Numpad({ value, onChange }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  const handle = (key: string) => {
    Haptics.selectionAsync();
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "clear") {
      onChange("");
      return;
    }
    const next = `${value}${key}`;
    const num = parseInt(next, 10);
    if (next.length <= 2 && num >= 0 && num <= 99) {
      onChange(next.replace(/^0+(?=\d)/, ""));
    }
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((key) => {
        const isDel = key === "del";
        const isClear = key === "clear";
        return (
          <Pressable
            key={key}
            testID={`numpad-key-${key}`}
            onPress={() => handle(key)}
            style={({ pressed }) => [
              styles.key,
              (isDel || isClear) && styles.keyMuted,
              pressed && styles.keyPressed,
            ]}
          >
            {isDel ? (
              <Backspace size={26} color={colors.onSurface} weight="bold" />
            ) : isClear ? (
              <Text style={styles.clearText}>C</Text>
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
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
    justifyContent: "space-between",
    rowGap: 10,
  },
  key: {
    width: "31%",
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  keyMuted: {
    backgroundColor: colors.surfaceTertiary,
  },
  keyPressed: {
    opacity: 0.6,
  },
  keyText: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.onSurface,
  },
  clearText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.onSurfaceTertiary,
  },
}));
