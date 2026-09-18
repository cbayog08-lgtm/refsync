// Fixed jersey color palette. These are literal team colors that must stay
// identical in any theme, so hex values live here (not in the theme tokens).
export type Jersey = { key: string; label: string; hex: string; on: string };

export const JERSEYS: Jersey[] = [
  { key: "red", label: "Rojo", hex: "#EF4444", on: "#FFFFFF" },
  { key: "blue", label: "Azul", hex: "#3B82F6", on: "#FFFFFF" },
  { key: "green", label: "Verde", hex: "#22C55E", on: "#000000" },
  { key: "yellow", label: "Amarillo", hex: "#EAB308", on: "#000000" },
  { key: "white", label: "Blanco", hex: "#F5F5F5", on: "#000000" },
  { key: "black", label: "Negro", hex: "#171717", on: "#FFFFFF" },
  { key: "orange", label: "Naranja", hex: "#F97316", on: "#000000" },
  { key: "purple", label: "Morado", hex: "#8B5CF6", on: "#FFFFFF" },
];

export function jerseyOn(hex: string): string {
  const j = JERSEYS.find((x) => x.hex.toLowerCase() === hex.toLowerCase());
  return j ? j.on : "#FFFFFF";
}
