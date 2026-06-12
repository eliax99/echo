import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as create } from "../_libs/zustand.mjs";
function SpaceBackground() {
  const debris = Array.from({ length: 12 }, (_, i) => i);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 overflow-hidden bg-black", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "nebula" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "starfield" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "starfield", style: { animationDuration: "140s", opacity: 0.5 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute rounded-full",
        style: {
          width: 380,
          height: 380,
          right: "-80px",
          top: "20%",
          background: "radial-gradient(circle at 30% 30%, #6a8cff 0%, #2a3a8a 40%, #0a0f30 70%, transparent 100%)",
          boxShadow: "0 0 120px rgba(80,120,255,0.35), inset -40px -20px 80px rgba(0,0,0,0.7)",
          filter: "blur(0.4px)"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute left-[10%] top-[55%] w-[260px] h-[60px]",
        style: {
          background: "linear-gradient(180deg,#171b27,#060911 70%,#000)",
          transform: "rotate(-14deg) skewX(-8deg)",
          boxShadow: "0 0 72px rgba(56,189,248,0.14), inset 0 0 24px rgba(0,255,233,0.05)",
          borderTop: "1px solid rgba(56,189,248,0.2)",
          borderLeft: "1px solid rgba(56,189,248,0.12)"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute right-[18%] bottom-[20%] w-[160px] h-[36px]",
        style: {
          background: "linear-gradient(180deg,#10121b,#05070f)",
          transform: "rotate(22deg)",
          boxShadow: "0 0 40px rgba(56,189,248,0.14)",
          border: "1px solid rgba(56,189,248,0.12)"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute left-[50%] top-[15%] h-[220px] w-[220px] rounded-full",
        style: {
          background: "radial-gradient(circle, rgba(48,207,255,0.18), transparent 55%)",
          transform: "translateX(-50%)",
          filter: "blur(1px)"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute right-[10%] top-[10%] h-[160px] w-[160px] rounded-full",
        style: {
          background: "radial-gradient(circle, rgba(140,80,255,0.12), transparent 55%)",
          filter: "blur(2px)"
        }
      }
    ),
    debris.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute",
        style: {
          width: 2 + i % 4 * 2,
          height: 2 + i % 3 * 2,
          background: i % 3 === 0 ? "#f80" : "#888",
          borderRadius: i % 2 ? "2px" : "50%",
          top: `${i * 53 % 100}%`,
          left: `${i * 37 % 100}%`,
          opacity: 0.7,
          animation: `debris ${40 + i * 7}s linear ${-i * 4}s infinite`,
          boxShadow: i % 3 === 0 ? "0 0 8px #f80" : "none"
        }
      },
      i
    ))
  ] });
}
const uid = () => Math.random().toString(36).slice(2, 10);
const useGame = create((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("echo_token") : null,
  gameId: typeof window !== "undefined" ? Number(localStorage.getItem("echo_game_id")) || null : null,
  messages: [],
  objectives: [
    { key: "discover", title: "descubre qué ocurrió", completed: false },
    { key: "search_team", title: "busca a tus compañeros", completed: false },
    { key: "captain_log", title: "consulta la bitácora del Capitán Hayes", completed: false },
    { key: "escape_pod", title: "llega hasta la cápsula de escape", completed: false },
    { key: "secure_id", title: "AUTENTICACIÓN DE NIVEL CRÍTICO: requerido escaneo biométrico completo del Comandante William Carter. ¿AUTORIZA?", completed: false },
    { key: "final_notice", title: "---", completed: false }
  ],
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
  completeObjective: (key) => {
    set((s) => ({
      objectives: s.objectives.map((o) => o.key === key ? { ...o, completed: true } : o)
    }));
    const obj = get().objectives.find((o) => o.key === key);
    if (obj) {
      const id = uid();
      set((s) => ({ events: [...s.events, { id, text: `Objetivo completado: ${obj.title}`, kind: "info" }] }));
      setTimeout(() => get().dismissEvent(id), 3500);
      if (key === "captain_log") {
        setTimeout(() => {
          get().pushEvent({ text: "niveles de oxígeno críticos", kind: "warn" });
        }, 3e3);
      }
    }
  },
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
  fade: () => set({ faded: true })
}));
function HelmetVisor({ children }) {
  const { shaking, glitching, events, faded } = useGame();
  const hasWarn = events.some((e) => e.kind === "warn" || e.kind === "glitch");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `absolute inset-0 helmet-drift ${shaking ? "helmet-shake" : ""}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-0 helmet-breathe ${glitching ? "helmet-glitch" : ""}`, children })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "visor-tint" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "visor-noise" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "visor-scanline" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scan-bar" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "visor-mask" }),
    hasWarn && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "warn-overlay" }),
    faded && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 bg-black z-[100] transition-opacity duration-[4000ms]",
        style: { opacity: 1 }
      }
    )
  ] });
}
const BASE = "http://localhost:8000";
async function authRequest(path, email, password, username) {
  const body = path === "/auth/register" ? { email, password, username } : { email, password };
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Auth failed (${res.status})`);
  }
  return data;
}
async function chatRequest(token, message, game_id) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message, game_id })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Chat failed (${res.status})`);
  }
  return data;
}
export {
  HelmetVisor as H,
  SpaceBackground as S,
  authRequest as a,
  chatRequest as c,
  useGame as u
};
