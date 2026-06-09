import { create } from "zustand";

export type ChatMsg = {
  id: string;
  role: "user" | "echo" | "system";
  text: string;
  reveal?: boolean; // typing animation
};

export type HudEvent = {
  id: string;
  text: string;
  kind: "warn" | "info" | "glitch";
  duration?: number;
};

type GameState = {
  token: string | null;
  gameId: number | null;
  messages: ChatMsg[];
  events: HudEvent[];
  phase: 1 | 2 | 3;
  oxygen: number;
  pressure: number;
  integrity: number;
  ended: boolean;
  shaking: boolean;
  glitching: boolean;
  faded: boolean;

  setAuth: (t: string, id: number) => void;
  logout: () => void;
  addMessage: (m: ChatMsg) => void;
  pushEvent: (e: Omit<HudEvent, "id">) => void;
  dismissEvent: (id: string) => void;
  setPhase: (p: 1 | 2 | 3) => void;
  setVitals: (v: Partial<Pick<GameState, "oxygen" | "pressure" | "integrity">>) => void;
  triggerShake: (ms?: number) => void;
  triggerGlitch: (ms?: number) => void;
  end: () => void;
  fade: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useGame = create<GameState>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("echo_token") : null,
  gameId: typeof window !== "undefined" ? Number(localStorage.getItem("echo_game_id")) || null : null,
  messages: [],
  events: [],
  phase: 1,
  oxygen: 92,
  pressure: 88,
  integrity: 74,
  ended: false,
  shaking: false,
  glitching: false,
  faded: false,

  setAuth: (token, gameId) => {
    localStorage.setItem("echo_token", token);
    localStorage.setItem("echo_game_id", String(gameId));
    set({ token, gameId });
  },
  logout: () => {
    localStorage.removeItem("echo_token");
    localStorage.removeItem("echo_game_id");
    set({ token: null, gameId: null, messages: [], phase: 1, ended: false, faded: false });
  },
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  pushEvent: (e) => {
    const id = uid();
    set((s) => ({ events: [...s.events, { id, ...e }] }));
    const dur = e.duration ?? 4500;
    setTimeout(() => get().dismissEvent(id), dur);
  },
  dismissEvent: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),
  setPhase: (p) => set({ phase: p }),
  setVitals: (v) => set((s) => ({ ...s, ...v })),
  triggerShake: (ms = 600) => {
    set({ shaking: true });
    setTimeout(() => set({ shaking: false }), ms);
  },
  triggerGlitch: (ms = 400) => {
    set({ glitching: true });
    setTimeout(() => set({ glitching: false }), ms);
  },
  end: () => set({ ended: true }),
  fade: () => set({ faded: true }),
}));
