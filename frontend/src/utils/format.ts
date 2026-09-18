import { EventDto, Team } from "@/src/api";

export function formatClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function minuteLabel(e: EventDto): string {
  return e.added_minute > 0 ? `${e.minute}+${e.added_minute}'` : `${e.minute}'`;
}

export function teamName(team: Team | string): string {
  return team === "home" ? "LOCAL" : "VISITANTE";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Set of dorsals that have been sent off (red card / double yellow) for a team.
export function expelledSet(events: EventDto[], team: Team): Set<number> {
  const set = new Set<number>();
  for (const e of events) {
    if (e.type === "card" && e.card_color === "red" && e.team === team && e.dorsal != null) {
      set.add(e.dorsal);
    }
  }
  return set;
}

// Reason suffix for an event (sigla), ignoring the internal double_yellow marker.
export function reasonSuffix(e: EventDto): string {
  if (e.type !== "card") return "";
  if (!e.reason || e.reason === "double_yellow") return "";
  return ` · ${e.reason}`;
}
