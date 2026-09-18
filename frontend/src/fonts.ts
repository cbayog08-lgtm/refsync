import { useFonts } from "expo-font";

// Font family names used across the app.
// Bebas Neue = giant display numbers. DM Sans (variable) = body text.
export const fonts = {
  display: "BebasNeue",
  body: "DMSans",
  bodyMedium: "DMSans",
  bodyBold: "DMSans",
};

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    BebasNeue: require("../assets/fonts/BebasNeue-Regular.ttf"),
    DMSans: require("../assets/fonts/DMSans-Regular.ttf"),
  });
  return loaded;
}
