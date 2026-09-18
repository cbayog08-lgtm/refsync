import React from "react";
import { Pressable, Text, View } from "react-native";
import { CaretLeft } from "phosphor-react-native";

import { fonts } from "@/src/fonts";
import { makeStyles, useTheme } from "@/src/theme";

type Props = {
  title: string;
  onClose: () => void;
};

export function ModalHeader({ title, onClose }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable testID="modal-close" onPress={onClose} hitSlop={12} style={styles.back}>
        <CaretLeft size={26} color={colors.onSurface} weight="bold" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: 1,
    color: colors.onSurface,
  },
  spacer: {
    width: 40,
  },
}));
