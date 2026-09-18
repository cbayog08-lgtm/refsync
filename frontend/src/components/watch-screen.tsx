import React from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles } from "@/src/theme";

type Props = {
  children: React.ReactNode;
  padScale?: number;
};

// Renders content inside a circular "watch face" viewport (Wear OS / watchOS
// style) centered on a pure-black backdrop.
export function WatchScreen({ children, padScale = 0.1 }: Props) {
  const styles = useStyles();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const size = Math.min(width, height - insets.top - insets.bottom, 440);
  const pad = Math.round(size * padScale);

  return (
    <View style={styles.backdrop}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.inner, { padding: pad }]}>{children}</View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.borderStrong,
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    width: "100%",
  },
}));
