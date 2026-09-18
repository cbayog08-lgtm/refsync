import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles } from "@/src/theme";

// Full-height rectangular screen (black, safe-area aware) for data-heavy list
// screens where content must scroll freely without being clipped by a circle.
export function ListScreen({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>{children}</View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
}));
