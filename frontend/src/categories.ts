export type Category = {
  key: string;
  label: string;
  halfMin: number;
};

export const CATEGORIES: Category[] = [
  { key: "alevin", label: "Alevín", halfMin: 30 },
  { key: "infantil", label: "Infantil", halfMin: 35 },
  { key: "cadete", label: "Cadete", halfMin: 40 },
  { key: "juvenil", label: "Juvenil", halfMin: 45 },
  { key: "aficionado", label: "Aficionado", halfMin: 45 },
];
