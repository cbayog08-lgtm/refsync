export type Category = {
  key: string;
  label: string;
  halfMin: number;
  // Substitution rules. null = unlimited (rotating).
  maxSubs: number | null;
  maxWindows: number | null;
};

export const CATEGORIES: Category[] = [
  { key: "alevin", label: "Alevín", halfMin: 30, maxSubs: null, maxWindows: null },
  { key: "infantil", label: "Infantil", halfMin: 35, maxSubs: null, maxWindows: null },
  { key: "cadete", label: "Cadete", halfMin: 40, maxSubs: null, maxWindows: null },
  { key: "juvenil", label: "Juvenil", halfMin: 45, maxSubs: 5, maxWindows: 3 },
  { key: "aficionado", label: "Aficionado", halfMin: 45, maxSubs: 5, maxWindows: 3 },
];
