import React from "react";
import { Pressable, Text, View } from "react-native";

import { fonts } from "@/src/fonts";
import { makeStyles } from "@/src/theme";

type Props = {
  label: string;
  bgColor: string;
  fgColor: string;
  icon: React.ReactNode;
  onPress: () => void;
  testID: string;
};

export function ActionButton({ label, bgColor, fgColor, icon, onPress, testID }: Props) {
  const styles = useStyles();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.label, { color: fgColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  button: {
    width: "100%",
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    marginBottom: 2,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
}));
