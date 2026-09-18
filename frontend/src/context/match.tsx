import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api, CardColor, Team } from "@/src/api";
import { Category } from "@/src/categories";
import { teamName } from "@/src/utils/format";

export type TimerStatus = "stopped" | "running" | "paused";

export type NoticeTone = "expel" | "suspend";
export type Notice = { tone: NoticeTone; title: string; message: string } | null;

type MatchContextValue = {
  matchId: string | null;
  category: Category | null;
  halfDurationMs: number;
  status: TimerStatus;
  mainMs: number;
  addedMs: number;
  currentMinute: number;
  currentAdded: number;
  notice: Notice;
  startMatch: (category: Category) => Promise<void>;
  start: () => void;
  toggle: () => void;
  finishAndArchive: () => Promise<string | null>;
  logCard: (input: { team: Team; dorsal: number; color: CardColor }) => Promise<void>;
  dismissNotice: () => void;
};

const MatchContext = createContext<MatchContextValue | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [halfDurationMs, setHalfDurationMs] = useState(45 * 60 * 1000);
  const [status, setStatus] = useState<TimerStatus>("stopped");
  const [mainMs, setMainMs] = useState(0);
  const [addedMs, setAddedMs] = useState(0);
  const [notice, setNotice] = useState<Notice>(null);
  const lastRef = useRef(0);

  // Ticking loop: main clock while running, added clock while paused.
  useEffect(() => {
    if (status === "stopped") return;
    lastRef.current = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      const d = now - lastRef.current;
      lastRef.current = now;
      if (status === "running") {
        setMainMs((m) => Math.min(m + d, halfDurationMs));
      } else {
        setAddedMs((a) => a + d);
      }
    }, 200);
    return () => clearInterval(iv);
  }, [status, halfDurationMs]);

  const startMatch = useCallback(async (cat: Category) => {
    const m = await api.createMatch(cat.label, cat.halfMin);
    setMatchId(m.id);
    setCategory(cat);
    setHalfDurationMs(cat.halfMin * 60 * 1000);
    setStatus("stopped");
    setMainMs(0);
    setAddedMs(0);
  }, []);

  const start = useCallback(() => setStatus("running"), []);

  const toggle = useCallback(
    () => setStatus((s) => (s === "running" ? "paused" : "running")),
    [],
  );

  const finishAndArchive = useCallback(async (): Promise<string | null> => {
    const id = matchId;
    if (id) {
      try {
        await api.finishMatch(id);
      } catch {
        // keep going even if network hiccups
      }
    }
    setMatchId(null);
    setCategory(null);
    setStatus("stopped");
    setMainMs(0);
    setAddedMs(0);
    qc.invalidateQueries({ queryKey: ["matches"] });
    return id;
  }, [matchId, qc]);

  const halfMin = halfDurationMs / 60000;
  const inStoppage = status === "paused";
  const currentMinute = inStoppage
    ? halfMin
    : Math.min(halfMin, Math.floor(mainMs / 60000) + 1);
  const currentAdded = inStoppage ? Math.floor(addedMs / 60000) + 1 : 0;

  const logCard = useCallback(
    async ({ team, dorsal, color }: { team: Team; dorsal: number; color: CardColor }) => {
      if (!matchId) return;
      const minute = inStoppage ? halfMin : Math.min(halfMin, Math.floor(mainMs / 60000) + 1);
      const added = inStoppage ? Math.floor(addedMs / 60000) + 1 : 0;

      // Snapshot before writing so we can evaluate double-yellow / suspension.
      const existing = await api.getEvents(matchId);

      await api.addEvent(matchId, {
        type: "card",
        minute,
        added_minute: added,
        team,
        dorsal,
        card_color: color,
      });

      const priorYellows = existing.filter(
        (e) => e.type === "card" && e.card_color === "yellow" && e.team === team && e.dorsal === dorsal,
      ).length;
      const alreadyRed = existing.some(
        (e) => e.type === "card" && e.card_color === "red" && e.team === team && e.dorsal === dorsal,
      );

      let isExpulsion = false;
      let doubleYellow = false;

      if (color === "yellow" && priorYellows >= 1 && !alreadyRed) {
        // Second yellow => automatic red.
        await api.addEvent(matchId, {
          type: "card",
          minute,
          added_minute: added,
          team,
          dorsal,
          card_color: "red",
          reason: "double_yellow",
        });
        isExpulsion = true;
        doubleYellow = true;
      } else if (color === "red" && !alreadyRed) {
        isExpulsion = true;
      }

      // Total expulsions (red cards) for this team after our additions.
      let teamReds = existing.filter(
        (e) => e.type === "card" && e.card_color === "red" && e.team === team,
      ).length;
      if (isExpulsion) teamReds += 1;

      qc.invalidateQueries({ queryKey: ["events", matchId] });

      if (teamReds >= 5) {
        setNotice({
          tone: "suspend",
          title: "PARTIDO SUSPENDIDO",
          message: `${teamName(team)}: mínimo de jugadores (${teamReds} expulsiones)`,
        });
      } else if (isExpulsion) {
        setNotice({
          tone: "expel",
          title: "EXPULSIÓN",
          message: doubleYellow ? `Doble amarilla · #${dorsal}` : `Tarjeta roja · #${dorsal}`,
        });
      }
    },
    [matchId, inStoppage, halfMin, mainMs, addedMs, qc],
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  const value: MatchContextValue = {
    matchId,
    category,
    halfDurationMs,
    status,
    mainMs,
    addedMs,
    currentMinute,
    currentAdded,
    notice,
    startMatch,
    start,
    toggle,
    finishAndArchive,
    logCard,
    dismissNotice,
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
}

export function useMatch(): MatchContextValue {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error("useMatch must be used within MatchProvider");
  return ctx;
}
