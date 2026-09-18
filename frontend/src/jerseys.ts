// Fixed jersey color palette (16+ options). Literal team colors that must stay
// identical in any theme, so hex values live here (not in the theme tokens).
export type Jersey = { key: string; label: string; hex: string; on: string };

export const JERSEYS: Jersey[] = [
  { key: "white", label: "Blanco", hex: "#F5F5F5", on: "#000000" },
  { key: "black", label: "Negro", hex: "#171717", on: "#FFFFFF" },
  { key: "red", label: "Rojo", hex: "#EF4444", on: "#FFFFFF" },
  { key: "navy", label: "Azul Marino", hex: "#1E3A8A", on: "#FFFFFF" },
  { key: "sky", label: "Azul Celeste", hex: "#38BDF8", on: "#000000" },
  { key: "darkgreen", label: "Verde Oscuro", hex: "#166534", on: "#FFFFFF" },
  { key: "lime", label: "Verde Lima", hex: "#84CC16", on: "#000000" },
  { key: "yellow", label: "Amarillo", hex: "#EAB308", on: "#000000" },
  { key: "orange", label: "Naranja", hex: "#F97316", on: "#000000" },
  { key: "purple", label: "Morado", hex: "#8B5CF6", on: "#FFFFFF" },
  { key: "pink", label: "Rosa", hex: "#EC4899", on: "#FFFFFF" },
  { key: "maroon", label: "Granate", hex: "#7F1D1D", on: "#FFFFFF" },
  { key: "gray", label: "Gris", hex: "#9CA3AF", on: "#000000" },
  { key: "teal", label: "Turquesa", hex: "#14B8A6", on: "#000000" },
  { key: "brown", label: "Marrón", hex: "#78350F", on: "#FFFFFF" },
  { key: "stripes", label: "Rayas", hex: "#64748B", on: "#FFFFFF" },
];

export function jerseyOn(hex: string): string {
  const j = JERSEYS.find((x) => x.hex.toLowerCase() === hex.toLowerCase());
  return j ? j.on : "#FFFFFF";
}
