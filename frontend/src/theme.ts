// Design tokens for RefSync OS. OLED dark-only palette (pure black #000000).
// The keys match the "color" block of /app/design_guidelines.json.
// makeStyles() builds StyleSheets from these colors; useTheme().colors reads
// them for color props. Never write color literals in components.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

// The app must ALWAYS render pure black (OLED). We fill the default slot with
// the dark tactical palette so it looks identical regardless of device scheme.
const light = {
  surface: "#000000",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#1A1A1A",
  onSurfaceSecondary: "#FFFFFF",
  surfaceTertiary: "#262626",
  onSurfaceTertiary: "#A3A3A3",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#000000",
  muted: "#737373",

  brand: "#EAB308",
  onBrand: "#000000",
  brandPrimary: "#EAB308",
  onBrandPrimary: "#000000",
  brandSecondary: "#F59E0B",
  onBrandSecondary: "#000000",
  brandTertiary: "#332616",
  onBrandTertiary: "#FDE68A",

  success: "#22C55E",
  onSuccess: "#000000",
  warning: "#EAB308",
  onWarning: "#000000",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#3B82F6",
  onInfo: "#FFFFFF",

  border: "#262626",
  borderStrong: "#404040",
  divider: "#1A1A1A",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
