// Official card reason codes (siglas).
export type CardReason = { code: string; label: string };

export const YELLOW_REASONS: CardReason[] = [
  { code: "AP", label: "Ataque Prometedor" },
  { code: "PR", label: "Protesta" },
  { code: "JP", label: "Juego Peligroso" },
  { code: "DT", label: "Desconsideración / Tiempo" },
  { code: "C", label: "Conducta antideportiva" },
];

export const RED_REASONS: CardReason[] = [
  { code: "DOGSO", label: "Ocasión Manifiesta de Gol" },
  { code: "JVG", label: "Juego Violento Grave" },
  { code: "CD", label: "Conducta Antideportiva Grave" },
  { code: "INS", label: "Insultos / Ofensas" },
];

// Reason codes only (labels via i18n when needed).
export const YELLOW_CODES = YELLOW_REASONS.map((r) => r.code);
export const RED_CODES = RED_REASONS.map((r) => r.code);
