import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api, CardColor, MatchDto, Team } from "@/src/api";
import { Category, CATEGORIES } from "@/src/categories";
import { teamName } from "@/src/utils/format";

export type TimerStatus = "stopped" | "running" | "paused";

export type NoticeTone = "expel" | "suspend" | "subs";
export type Notice = { tone: NoticeTone; title: string; message: string } | null;

export type TeamsConfig = {
  homeName: string;
  awayName: string;
  homeColor: string;
  awayColor: string;
};

export type Squad = { onField: number[]; bench: number[] };
export type Lineups = { home: Squad; away: Squad };

export type Draft = {
  category: Category | null;
  mode: "watch" | "mobile";
  homeName: string;
  awayName: string;
  homeColor: string;
  awayColor: string;
  lineupEnabled: boolean;
};

export type StartConfig = {
  category: Category;
  homeName: string;
  awayName: string;
  homeColor: string;
  awayColor: string;
  lineupEnabled: boolean;
  lineups: Lineups;
};

const emptyLineups = (): Lineups => ({
  home: { onField: [], bench: [] },
  away: { onField: [], bench: [] },
});

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
  teams: TeamsConfig;
  lineupEnabled: boolean;
  lineups: Lineups;
  announcedAddedMin: number;
  pairCode: string;
  draft: Draft;
  setDraft: (partial: Partial<Draft>) => void;
  startMatch: (config: StartConfig) => Promise<void>;
  loadMatch: (dto: MatchDto) => void;
  start: () => void;
  toggle: () => void;
  incAdded: () => void;
  decAdded: () => void;
  finishAndArchive: () => Promise<string | null>;
  logCard: (input: { team: Team; dorsal: number; color: CardColor; reason?: string }) => Promise<void>;
  logSub: (input: { team: Team; out: number; inn: number }) => Promise<void>;
  dismissNotice: () => void;
};

const DEFAULT_TEAMS: TeamsConfig = {
  homeName: "LOCAL",
  awayName: "VISITANTE",
  homeColor: "#EF4444",
  awayColor: "#1E3A8A",
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
  const [teams, setTeams] = useState<TeamsConfig>(DEFAULT_TEAMS);
  const [lineupEnabled, setLineupEnabled] = useState(false);
  const [lineups, setLineups] = useState<Lineups>(emptyLineups());
  const [announcedAddedMin, setAnnouncedAddedMin] = useState(0);
  const [pairCode, setPairCode] = useState("");
  const [draftState, setDraftState] = useState<Draft>({
    category: null,
    mode: "watch",
    homeName: "LOCAL",
    awayName: "VISITANTE",
    homeColor: "#EF4444",
    awayColor: "#1E3A8A",
    lineupEnabled: false,
  });

  const lastRef = useRef(0);
  // Substitution "window" tracking (default rule: subs made within the same
  // paused period count as ONE window; windows close when play resumes).
  const windowCountRef = useRef<{ home: number; away: number }>({ home: 0, away: 0 });
  const openWindowRef = useRef<{ home: boolean; away: boolean }>({ home: false, away: false });

  // Ticking loop.
  useEffect(() => {
    if (status === "stopped") return;
    if (status === "running") {
      // Play resumed -> close any open substitution windows.
      openWindowRef.current = { home: false, away: false };
    }
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

  const setDraft = useCallback((partial: Partial<Draft>) => {
    setDraftState((d) => ({ ...d, ...partial }));
  }, []);

  const startMatch = useCallback(async (config: StartConfig) => {
    const m = await api.createMatch({
      home_team: config.homeName,
      away_team: config.awayName,
      home_color: config.homeColor,
      away_color: config.awayColor,
      category: config.category.label,
      half_duration_min: config.category.halfMin,
      lineup_enabled: config.lineupEnabled,
      lineups: config.lineups,
    });
    setMatchId(m.id);
    setPairCode(m.pair_code);
    setCategory(config.category);
    setHalfDurationMs(config.category.halfMin * 60 * 1000);
    setTeams({
      homeName: config.homeName,
      awayName: config.awayName,
      homeColor: config.homeColor,
      awayColor: config.awayColor,
    });
    setLineupEnabled(config.lineupEnabled);
    setLineups(config.lineups);
    setStatus("stopped");
    setMainMs(0);
    setAddedMs(0);
    setAnnouncedAddedMin(0);
    windowCountRef.current = { home: 0, away: 0 };
    openWindowRef.current = { home: false, away: false };
  }, []);

  const loadMatch = useCallback((dto: MatchDto) => {
    const cat: Category =
      CATEGORIES.find((c) => c.label === dto.category) ?? {
        key: "custom",
        label: dto.category,
        halfMin: dto.half_duration_min,
        maxSubs: null,
        maxWindows: null,
      };
    setMatchId(dto.id);
    setPairCode(dto.pair_code);
    setCategory(cat);
    setHalfDurationMs(dto.half_duration_min * 60 * 1000);
    setTeams({
      homeName: dto.home_team,
      awayName: dto.away_team,
      homeColor: dto.home_color,
      awayColor: dto.away_color,
    });
    setLineupEnabled(dto.lineup_enabled);
    const l = dto.lineups as { home?: unknown };
    setLineups(l && l.home ? (dto.lineups as Lineups) : emptyLineups());
    setStatus("stopped");
    setMainMs(0);
    setAddedMs(0);
    setAnnouncedAddedMin(0);
    windowCountRef.current = { home: 0, away: 0 };
    openWindowRef.current = { home: false, away: false };
  }, []);

  const start = useCallback(() => setStatus("running"), []);
  const toggle = useCallback(
    () => setStatus((s) => (s === "running" ? "paused" : "running")),
    [],
  );
  const incAdded = useCallback(() => setAnnouncedAddedMin((n) => Math.min(15, n + 1)), []);
  const decAdded = useCallback(() => setAnnouncedAddedMin((n) => Math.max(0, n - 1)), []);

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
    setAnnouncedAddedMin(0);
    setLineupEnabled(false);
    setLineups(emptyLineups());
    setTeams(DEFAULT_TEAMS);
    qc.invalidateQueries({ queryKey: ["matches"] });
    return id;
  }, [matchId, qc]);

  const halfMin = halfDurationMs / 60000;
  const inStoppage = status === "paused";
  const currentMinute = inStoppage
    ? halfMin
    : Math.min(halfMin, Math.floor(mainMs / 60000) + 1);
  const currentAdded = inStoppage ? Math.floor(addedMs / 60000) + 1 : 0;

  const captureMinute = useCallback(() => {
    const inStop = status === "paused";
    return {
      minute: inStop ? halfMin : Math.min(halfMin, Math.floor(mainMs / 60000) + 1),
      added: inStop ? Math.floor(addedMs / 60000) + 1 : 0,
    };
  }, [status, halfMin, mainMs, addedMs]);

  const logCard = useCallback(
    async ({ team, dorsal, color, reason }: { team: Team; dorsal: number; color: CardColor; reason?: string }) => {
      if (!matchId) return;
      const { minute, added } = captureMinute();
      const existing = await api.getEvents(matchId);

      await api.addEvent(matchId, {
        type: "card",
        minute,
        added_minute: added,
        team,
        dorsal,
        card_color: color,
        reason,
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
    [matchId, captureMinute, qc],
  );

  const logSub = useCallback(
    async ({ team, out, inn }: { team: Team; out: number; inn: number }) => {
      if (!matchId) return;
      const { minute, added } = captureMinute();
      const existing = await api.getEvents(matchId);

      await api.addEvent(matchId, {
        type: "substitution",
        minute,
        added_minute: added,
        team,
        dorsal_out: out,
        dorsal_in: inn,
      });

      // Update lineup: out -> bench, in -> onField.
      if (lineupEnabled) {
        setLineups((prev) => {
          const squad = prev[team];
          const onField = squad.onField.filter((d) => d !== out).concat(inn);
          const bench = squad.bench.filter((d) => d !== inn).concat(out);
          return { ...prev, [team]: { onField, bench } };
        });
      }

      qc.invalidateQueries({ queryKey: ["events", matchId] });

      // Substitution limits (Juvenil/Aficionado): 5 subs / 3 windows.
      if (category && category.maxSubs != null && category.maxWindows != null) {
        const subsSoFar = existing.filter((e) => e.type === "substitution" && e.team === team).length + 1;

        let openedNewWindow = false;
        if (!openWindowRef.current[team]) {
          windowCountRef.current[team] += 1;
          openWindowRef.current[team] = true;
          openedNewWindow = true;
        }
        const windows = windowCountRef.current[team];

        if (subsSoFar > category.maxSubs) {
          setNotice({
            tone: "subs",
            title: "LÍMITE DE CAMBIOS",
            message: `${teamName(team)}: ${subsSoFar}º cambio (máx ${category.maxSubs})`,
          });
        } else if (openedNewWindow && windows > category.maxWindows) {
          setNotice({
            tone: "subs",
            title: "VENTANAS AGOTADAS",
            message: `${teamName(team)}: ${windows}ª ventana (máx ${category.maxWindows})`,
          });
        }
      }
    },
    [matchId, captureMinute, category, lineupEnabled, qc],
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
    teams,
    lineupEnabled,
    lineups,
    announcedAddedMin,
    pairCode,
    draft: draftState,
    setDraft,
    startMatch,
    loadMatch,
    start,
    toggle,
    incAdded,
    decAdded,
    finishAndArchive,
    logCard,
    logSub,
    dismissNotice,
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
}

export function useMatch(): MatchContextValue {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error("useMatch must be used within MatchProvider");
  return ctx;
}
