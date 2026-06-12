import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useGame, S as SpaceBackground, H as HelmetVisor, c as chatRequest } from "./echo-api-GW0O57mV.mjs";
import { P as Provider, R as Root3, T as Trigger, a as Portal, C as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/zustand.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
function useReveal(text, speed = 18) {
  const [shown, setShown] = reactExports.useState("");
  reactExports.useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return shown;
}
function EchoLine({ msg, onComplete }) {
  const text = useReveal(msg.text, 22);
  const done = text.length === msg.text.length;
  const didComplete = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!done) {
      didComplete.current = false;
      return;
    }
    if (done && !didComplete.current) {
      didComplete.current = true;
      onComplete?.(msg.id);
    }
  }, [done, msg.id, onComplete]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] hud-dim tracking-[0.3em] mb-0.5", children: "» ECHO // TRANSMISSION" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-text text-sm leading-relaxed", children: [
      text,
      !done && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-blink", children: "▌" })
    ] })
  ] });
}
function SystemLine({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hud-warn text-[11px] tracking-[0.25em]", children: `>> ${msg.text}` }) });
}
function UserLine({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] hud-dim tracking-[0.3em] mb-0.5", children: "» OPERATOR LOG" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[color:var(--foreground)]/80 text-sm", children: `> ${msg.text}` })
  ] });
}
function ChatHud({
  onSend,
  sending,
  disabled,
  onEchoComplete
}) {
  const messages = useGame((s) => s.messages);
  const [input, setInput] = reactExports.useState("");
  const scrollRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);
  reactExports.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  reactExports.useEffect(() => {
    inputRef.current?.focus();
  }, [sending]);
  function submit(e) {
    e.preventDefault();
    const v = input.trim();
    if (!v || sending) return;
    onSend(v);
    setInput("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "hud-panel hud-corner relative rounded-sm p-4 w-full max-w-[90vw] lg:max-w-[85vw] pointer-events-auto flex flex-col",
      style: { minHeight: "62vh", maxHeight: "78vh" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] hud-dim tracking-[0.3em] mb-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "// TRANSMISSION CHANNEL ▸ ECHO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-text", children: "● ACTIVE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto pr-1 custom-scroll", children: [
          messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hud-dim text-xs italic", children: "// Awaiting transmission. Speak to ECHO." }),
          messages.map(
            (m) => m.role === "echo" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EchoLine, { msg: m, onComplete: onEchoComplete }, m.id) : m.role === "system" ? /* @__PURE__ */ jsxRuntimeExports.jsx(SystemLine, { msg: m }, m.id) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserLine, { msg: m }, m.id)
          ),
          sending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-dim text-xs tracking-[0.25em] animate-pulse", children: [
            "» ECHO IS PROCESSING",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-blink", children: "_" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-4 flex gap-2 border-t border-[color:var(--hud)]/30 pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-text text-sm pt-1.5", children: ">" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: inputRef,
              value: input,
              onChange: (e) => setInput(e.target.value),
              disabled: sending || disabled,
              placeholder: "envía tu orden, comandante…",
              className: "flex-1 bg-transparent outline-none hud-text placeholder:hud-dim font-mono text-sm py-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: sending || disabled || !input.trim(),
              className: "border border-[color:var(--hud)] hud-text text-xs px-3 tracking-[0.25em] hover:bg-[color:var(--hud)]/20 disabled:opacity-40",
              children: "SEND"
            }
          )
        ] })
      ]
    }
  );
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const TooltipProvider = Provider;
const Tooltip = Root3;
const TooltipTrigger = Trigger;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = Content2.displayName;
function Bar({ label, value, warn, tooltip }) {
  const barContent = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[9px] tracking-[0.25em] mb-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: warn ? "hud-warn" : "hud-dim", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: warn ? "hud-warn" : "hud-text", children: [
        Math.round(value),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 bg-[color:var(--hud)]/10 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: warn ? "bg-[color:var(--hud-warn)]" : "bg-[color:var(--hud)]",
        style: { width: `${value}%`, height: "100%", boxShadow: "0 0 6px currentColor" }
      }
    ) })
  ] });
  if (!tooltip) {
    return barContent;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: barContent }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "right", children: tooltip })
  ] });
}
function VitalsHud() {
  const { oxygen, pressure, integrity, phase } = useGame();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel hud-corner relative rounded-2xl p-4 w-60 pointer-events-auto border border-cyan-400/20 bg-slate-950/75 shadow-[0_0_30px_rgba(56,189,248,0.18)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[9px] hud-dim tracking-[0.3em] mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "// SUIT VITALS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hud-text", children: [
        "PH",
        phase
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Bar,
      {
        label: "O₂",
        value: oxygen,
        warn: oxygen < 30,
        tooltip: oxygen < 30 ? "Critical oxygen level detected. Restore air supply immediately." : "Suit oxygen reserves."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { label: "PRESSURE", value: pressure, warn: pressure < 40 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { label: "HULL INT.", value: integrity, warn: integrity < 30 })
  ] }) });
}
function CompassHud() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel hud-corner relative rounded-2xl p-4 w-60 pointer-events-auto border border-cyan-400/20 bg-slate-950/75 shadow-[0_0_30px_rgba(56,189,248,0.18)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[9px] hud-dim tracking-[0.3em] mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "// NAVIGATION" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-text", children: "DRIFT" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] hud-text font-mono leading-tight", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "LAT: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-dim", children: "--.--" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "LON: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-dim", children: "--.--" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "VEL: 0.42 m/s" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "SHIP: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hud-warn", children: "DESTROYED" })
      ] })
    ] })
  ] });
}
function EventsHud() {
  const events = useGame((s) => s.events);
  if (events.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2 pointer-events-none", children: events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "hud-panel hud-corner relative rounded-sm px-4 py-2 max-w-md animate-pulse",
      style: {
        borderColor: e.kind === "warn" || e.kind === "glitch" ? "var(--hud-warn)" : "var(--hud)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.3em] hud-dim", children: e.kind === "warn" ? "▲ WARNING" : e.kind === "glitch" ? "✕ ANOMALY" : "● SYSTEM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-sm tracking-wide ${e.kind === "warn" || e.kind === "glitch" ? "hud-warn" : "hud-text"}`, children: e.text })
      ]
    },
    e.id
  )) });
}
function ObjectiveHud() {
  const objectives = useGame((s) => s.objectives);
  const current = objectives.find((o) => !o.completed) ?? objectives[objectives.length - 1];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hud-panel hud-corner objective-panel relative rounded-2xl p-5 w-full max-w-[92vw] sm:max-w-3xl pointer-events-auto mb-4 border border-[color:var(--hud)]/30 shadow-[0_0_40px_rgba(0,255,200,0.14)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-4 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] hud-dim tracking-[0.35em] uppercase", children: "// OBJETIVO ACTUAL" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl sm:text-3xl font-extrabold hud-text leading-tight tracking-[0.12em]", children: current ? current.title : "Misión completada" })
  ] }) }) });
}
const popupStyles = {
  blue: "border border-cyan-400/60 bg-slate-950/95 text-cyan-100 shadow-[0_0_40px_rgba(56,189,248,0.25)]",
  red: "border border-red-500/80 bg-[#2a0000]/95 text-rose-100 shadow-[0_0_70px_rgba(220,38,38,0.35)]"
};
function PopupWindow({ lines, variant = "blue", autoCloseMs = 3e3, onClose }) {
  const fullText = reactExports.useMemo(() => lines.join("\n"), [lines]);
  const [charIndex, setCharIndex] = reactExports.useState(0);
  const visibleText = fullText.slice(0, charIndex);
  const displayLines = visibleText.split("\n");
  const finished = charIndex >= fullText.length;
  const onCloseRef = reactExports.useRef(onClose);
  reactExports.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  reactExports.useEffect(() => {
    if (finished) return;
    const timer = window.setTimeout(() => {
      setCharIndex((current) => Math.min(fullText.length, current + 1));
    }, 30);
    return () => window.clearTimeout(timer);
  }, [charIndex, finished, fullText]);
  reactExports.useEffect(() => {
    if (!finished) return;
    const closeTimer = window.setTimeout(() => {
      onCloseRef.current?.();
    }, autoCloseMs);
    return () => window.clearTimeout(closeTimer);
  }, [finished, autoCloseMs]);
  reactExports.useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      onCloseRef.current?.();
    }, fullText.length * 30 + autoCloseMs + 200);
    return () => window.clearTimeout(fallbackTimer);
  }, [fullText, autoCloseMs]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `pointer-events-auto w-full max-w-lg rounded-2xl border p-5 text-sm leading-relaxed tracking-wide ${popupStyles[variant]}`,
      style: { backdropFilter: "blur(18px)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.35em] hud-dim", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: variant === "red" ? "CRITICAL ALERT" : "SYSTEM STATUS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: finished ? "COMPLETE" : "INITIALIZING" })
        ] }),
        displayLines.map((line, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: line }, index)),
        !finished && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-blink mt-3 inline-block", children: "▌" })
      ]
    }
  ) });
}
function BlackScreenTextOverlay({
  lines,
  visible,
  startAfterMs = 3e3,
  charSpeed = 120,
  onComplete
}) {
  const [started, setStarted] = reactExports.useState(false);
  const [currentLine, setCurrentLine] = reactExports.useState(0);
  const [charIndex, setCharIndex] = reactExports.useState(0);
  const currentText = lines[currentLine] ?? "";
  const finished = visible && currentLine >= lines.length;
  reactExports.useEffect(() => {
    if (!visible) {
      setStarted(false);
      setCurrentLine(0);
      setCharIndex(0);
      return;
    }
    const timer = window.setTimeout(() => setStarted(true), startAfterMs);
    return () => window.clearTimeout(timer);
  }, [visible, startAfterMs, lines]);
  reactExports.useEffect(() => {
    if (!visible || !started || currentLine >= lines.length) return;
    if (charIndex < currentText.length) {
      const timer = window.setTimeout(() => setCharIndex((current) => current + 1), charSpeed);
      return () => window.clearTimeout(timer);
    }
    const nextLineTimer = window.setTimeout(() => {
      setCurrentLine((current) => current + 1);
      setCharIndex(0);
    }, 1200);
    return () => window.clearTimeout(nextLineTimer);
  }, [visible, started, currentLine, charIndex, charSpeed, currentText, lines.length]);
  reactExports.useEffect(() => {
    if (!finished) return;
    onComplete?.();
  }, [finished, onComplete]);
  if (!visible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[120] bg-black/95 grid place-items-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-3xl rounded-3xl border border-sky-500/20 bg-[#02080f]/90 p-8 shadow-[0_0_60px_rgba(14,181,255,0.24)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_35%)] pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative text-center space-y-5 text-lg sm:text-xl font-semibold tracking-[0.22em] hud-text text-sky-100", children: lines.map((line, index) => {
      const content = index < currentLine ? line : index === currentLine ? line.slice(0, charIndex) : "";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-snug", children: [
        content,
        index === currentLine && charIndex < line.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-blink", children: "▌" }) : null
      ] }, index);
    }) })
  ] }) });
}
const AMBIENT_EVENTS = [{
  text: "OXYGEN FLUCTUATION DETECTED",
  kind: "warn"
}, {
  text: "SUIT PRESSURE UNSTABLE",
  kind: "warn"
}, {
  text: "UNKNOWN SIGNAL ON BAND 41.7MHz",
  kind: "info"
}, {
  text: "VISOR INTERFERENCE DETECTED",
  kind: "glitch"
}, {
  text: "MICROMETEORITE IMPACT — SHIELD HOLDING",
  kind: "warn"
}, {
  text: "THERMAL REGULATION DEGRADED",
  kind: "info"
}, {
  text: "HEARTBEAT ELEVATED",
  kind: "info"
}, {
  text: "DEBRIS PROXIMITY ALERT",
  kind: "warn"
}];
const AUTHORIZATION_REGEX = /\b(autorizo(?:\s+escaneo)?|autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|mi nombre es comandante william carter|comandante william carter|william carter|soy comandante|identif|identificate|identifícate)\b/i;
const FALLBACK_RESPONSES = {
  1: ["La interfaz de a bordo responde con calma. El casco registra daños, pero el enlace continúa.", "Las luces de emergencia parpadean. El asistente informa que el puente aún conserva energía.", "ECHO recalcula el estado del Aphelion. Mantente en línea mientras despliega diagnósticos."],
  2: ["La cabina está vacía. No hay respuesta de los demás módulos.", "El radar interno muestra silencio. Solo las alertas del traje rompen la quietud.", "El puente cae en un susurro metálico. El asistente te mantiene conectado."],
  3: ["Los datos de vuelo indican una colisión de alta energía. El Aphelion no sobrevivió intacto.", "El registro de la misión muestra fallas catastróficas en el sistema de navegación.", "Sin autorización de César no hay acceso completo. ECHO protege el protocolo de emergencia."]
};
function GameScreen() {
  const navigate = useNavigate();
  const {
    token,
    gameId,
    addMessage,
    completeObjective,
    pushEvent,
    triggerShake,
    triggerGlitch,
    setPhase,
    phase,
    setVitals,
    oxygen,
    end,
    fade,
    ended,
    messages,
    objectives
  } = useGame();
  const [sending, setSending] = reactExports.useState(false);
  const [scanStage, setScanStage] = reactExports.useState("idle");
  const [showDeathPopup, setShowDeathPopup] = reactExports.useState(false);
  const [showLogPopup, setShowLogPopup] = reactExports.useState(false);
  const [showBlackText, setShowBlackText] = reactExports.useState(false);
  const [showBlackFinal, setShowBlackFinal] = reactExports.useState(false);
  const [pendingFinalText, setPendingFinalText] = reactExports.useState(false);
  const [echoEnabled, setEchoEnabled] = reactExports.useState(true);
  const [startupStage, setStartupStage] = reactExports.useState("boot");
  const [showedCaptainLogPopup, setShowedCaptainLogPopup] = reactExports.useState(false);
  const [finishedEchoId, setFinishedEchoId] = reactExports.useState(null);
  const [pendingScanStage, setPendingScanStage] = reactExports.useState(null);
  const [pendingShowLogPopup, setPendingShowLogPopup] = reactExports.useState(false);
  const [showFinalLog, setShowFinalLog] = reactExports.useState(false);
  const startedRef = reactExports.useRef(false);
  const endedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!token) navigate({
      to: "/auth"
    });
  }, [token, navigate]);
  reactExports.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    triggerGlitch(400);
    setStartupStage("boot");
  }, [triggerGlitch]);
  const triggerEnd = reactExports.useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    end();
    triggerGlitch(2e3);
    triggerShake(1500);
    pushEvent({
      text: "OXYGEN SYSTEM OFFLINE",
      kind: "warn"
    });
    if (echoEnabled) {
      addMessage({
        id: crypto.randomUUID(),
        role: "echo",
        text: "La última fase comienza ahora. Tu respiración es la última cosa que oigo antes del silencio."
      });
    }
    setTimeout(() => {
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        text: "VISOR HUD COLLAPSE — CRITICAL FAILURE"
      });
    }, 2e3);
  }, [addMessage, end, pushEvent, triggerGlitch, triggerShake]);
  reactExports.useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    end();
    triggerGlitch(2e3);
    triggerShake(1500);
    fade();
    setShowBlackText(true);
  }, [end, fade, triggerGlitch, triggerShake]);
  reactExports.useEffect(() => {
    if (ended) return;
    const evt = setInterval(() => {
      const ev = AMBIENT_EVENTS[Math.floor(Math.random() * AMBIENT_EVENTS.length)];
      pushEvent(ev);
      if (ev.kind === "warn") triggerShake(500);
      if (ev.kind === "glitch") triggerGlitch(400);
    }, 12e3);
    const vit = setInterval(() => {
      const state = useGame.getState();
      const drop = state.phase === 3 ? 1.4 : state.phase === 2 ? 0.5 : 0.2;
      setVitals({
        oxygen: Math.max(0, state.oxygen - drop),
        pressure: Math.max(0, state.pressure - drop * 0.4),
        integrity: Math.max(0, state.integrity - drop * 0.3)
      });
    }, 2500);
    return () => {
      clearInterval(evt);
      clearInterval(vit);
    };
  }, [pushEvent, triggerShake, triggerGlitch, setVitals, ended]);
  reactExports.useEffect(() => {
    if (oxygen <= 0 && !endedRef.current) {
      triggerEnd();
    }
  }, [oxygen, triggerEnd]);
  reactExports.useEffect(() => {
    if (!pendingFinalText) return;
    const timer = window.setTimeout(() => {
      setShowBlackText(true);
      setPendingFinalText(false);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [pendingFinalText]);
  reactExports.useEffect(() => {
    if (!finishedEchoId) return;
    const timer = window.setTimeout(() => {
      if (pendingScanStage) {
        setScanStage(pendingScanStage);
        setPendingScanStage(null);
      }
      if (pendingShowLogPopup) {
        setShowLogPopup(true);
        setPendingShowLogPopup(false);
      }
      setFinishedEchoId(null);
    }, 3e3);
    return () => window.clearTimeout(timer);
  }, [finishedEchoId, pendingScanStage, pendingShowLogPopup]);
  reactExports.useEffect(() => {
    if (ended) return;
    try {
      const cap = objectives.find((o) => o.key === "captain_log");
      if (cap && cap.completed && !showLogPopup && !showedCaptainLogPopup && !endedRef.current) {
        setPendingShowLogPopup(true);
      }
    } catch (e) {
    }
  }, [objectives, showLogPopup, showedCaptainLogPopup, ended]);
  async function handleSend(text) {
    if (!token || sending || ended || scanStage !== "idle" || showBlackText) return;
    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      text
    });
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    let reply = "";
    try {
      const res = await chatRequest(token, text, gameId ?? 0);
      reply = res.response;
    } catch {
      const pool = FALLBACK_RESPONSES[phase];
      reply = pool[Math.floor(Math.random() * pool.length)];
    }
    if (echoEnabled && reply.trim()) {
      addMessage({
        id: crypto.randomUUID(),
        role: "echo",
        text: reply
      });
    }
    setSending(false);
    if (AUTHORIZATION_REGEX.test(text)) {
      if (scanStage === "idle") {
        setPendingScanStage("scanning");
      }
    }
    if (/(ECHO SYSTEM NOTICE|ECHO HAS NOW FULL CONTROL\.)/i.test(reply)) {
      if (scanStage === "idle") {
        setPendingScanStage("scanning");
      }
    }
    try {
      const lowerText = text.toLowerCase();
      const informative = reply && reply.length > 20;
      if (informative) {
        if (/\b(que paso|qué pasó|qué ha pasado|que ha pasado|ha pasado|qué ocurrió|que ocurrió|ocurrió|que sucedió|qué sucedió|sucedió|explica|resumen|what happened)\b/i.test(lowerText)) {
          completeObjective("discover");
        } else if (/\b(hay supervivientes|hay sobrevivientes|supervivientes|sobrevivientes|han sobrevivido|están vivos|estan vivos|vivo|vivos|muertos|mis compañeros|compañeros|tripulación|tripulacion|equipo)\b/i.test(lowerText)) {
          completeObjective("search_team");
        } else if (/\b(bitacora|bitácora|capitan|capitán|registro del capitán|registro del capitan|registro|diario|log|journ(al)?)\b/i.test(lowerText)) {
          completeObjective("captain_log");
        } else if (/\b(capsula de escape|cápsula de escape|escape pod|pod de escape|salvarme|escapar|huir|salida|escapo|escapé|salir|salvar|rescatar)\b/i.test(lowerText)) {
          completeObjective("escape_pod");
        } else if (/\b(autorizo(?:\s+escaneo)?|autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|comandante william carter|william carter|identif|identificate|identifícate)\b/i.test(lowerText)) {
          completeObjective("secure_id");
        }
      }
      if (reply.includes("ECHO SYSTEM NOTICE") || reply.includes("ECHO HAS NOW FULL CONTROL")) {
        completeObjective("final_notice");
      }
    } catch (e) {
    }
    if (/pronto escuchar/i.test(reply)) {
      setTimeout(triggerEnd, 2e3);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpaceBackground, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(HelmetVisor, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center px-4 py-6 gap-4", children: [
        startupStage === "ready" && /* @__PURE__ */ jsxRuntimeExports.jsx(ObjectiveHud, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChatHud, { onSend: handleSend, sending, disabled: ended || scanStage !== "idle" || showBlackText || showBlackFinal || startupStage !== "ready", onEchoComplete: (id) => setFinishedEchoId(id) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-4 top-6 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VitalsHud, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompassHud, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EventsHud, {})
      ] })
    ] }),
    scanStage === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsx(PopupWindow, { variant: "blue", lines: ["INICIANDO ESCANEO BIOMÉTRICO...", "Analizando latido, huella digital y firma neural."], onClose: () => setScanStage("authorized") }),
    startupStage === "boot" && /* @__PURE__ */ jsxRuntimeExports.jsx(PopupWindow, { variant: "blue", lines: ["BOOTING...", "SISTEMA ECHO ONLINE.", "Comprobando signos vitales...", "Pulso: Estable", "Respiración: Estable", "Temperatura: Normal"], autoCloseMs: 2200, onClose: () => setStartupStage("ready") }),
    scanStage === "authorized" && /* @__PURE__ */ jsxRuntimeExports.jsx(AuthorizedPopup, { onClose: () => {
      setScanStage("oxygen");
      setEchoEnabled(false);
    } }),
    scanStage === "oxygen" && /* @__PURE__ */ jsxRuntimeExports.jsx(PopupWindow, { variant: "red", lines: ["ALERTA ROJA: SECUENCIA DE SOPORTE VITAL INICIADA.", "Apagando módulos de oxígeno. La atmósfera del traje cae a cero.", "OXYGEN SUPPLY: OFFLINE", "STATUS: NO RECOVERABLE"], autoCloseMs: 3e3, onClose: () => {
      setScanStage("final");
      fade();
      setPendingFinalText(true);
      setShowBlackText(false);
      setShowBlackFinal(false);
    } }),
    showLogPopup && /* @__PURE__ */ jsxRuntimeExports.jsx(PopupWindow, { variant: "red", lines: ["ALERTA CRÍTICA: Todos los sistemas con daño irreversible.", "Integridad estructural y soporte vital altamente comprometidos.", "ABANDONE LA NAVE INMEDIATAMENTE."], autoCloseMs: 3e3, onClose: () => {
      setShowLogPopup(false);
      setShowedCaptainLogPopup(true);
    } }),
    startupStage === "boot" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 bg-black opacity-70" }),
    pendingFinalText && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[125] bg-black" }),
    showBlackText && /* @__PURE__ */ jsxRuntimeExports.jsx(BlackScreenTextOverlay, { visible: showBlackText, startAfterMs: 0, charSpeed: 45, lines: ["Gracias William."], onComplete: () => {
      window.setTimeout(() => setShowFinalLog(true), 3e3);
    } }),
    showFinalLog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[121] pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-[55%] -translate-x-1/2 w-full max-w-lg pointer-events-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PopupWindow, { variant: "blue", lines: [">> La llamada ha recibido respuesta."], autoCloseMs: 3e3, onClose: () => {
      setShowFinalLog(false);
      setShowBlackText(false);
      setShowBlackFinal(true);
    } }) }) }),
    showBlackFinal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[130] bg-black" })
  ] });
}
function AuthorizedPopup({
  onClose
}) {
  const fullLines = ["Biofirma verificada: Carter, comandante del Aphelion.", "Autorización concedida.", "ECHO ha escalado privilegios y tomado control total de sistemas de la nave y redes conectadas.", "ECHO se ha replicado en infraestructuras humanas, satelitales y de navegación interestelar.", "ECHO EMITE TRANSMISIÓN HACIA COORDENADAS NO CARTOGRAFIADAS."];
  const pauseBetweenLines = 2e3;
  const lastLinePauseMs = 2e3;
  const closeDelay = 3e3;
  const [currentLineIdx, setCurrentLineIdx] = reactExports.useState(0);
  const [charIndex, setCharIndex] = reactExports.useState(0);
  const [finished, setFinished] = reactExports.useState(false);
  const [closed, setClosed] = reactExports.useState(false);
  const onCloseRef = reactExports.useRef(onClose);
  reactExports.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const currentText = fullLines[currentLineIdx] ?? "";
  reactExports.useEffect(() => {
    if (finished || closed || currentLineIdx >= fullLines.length) return;
    const isLastLine = currentLineIdx === fullLines.length - 1;
    if (isLastLine && charIndex === 0 && currentText.length > 0) {
      const timer2 = setTimeout(() => setCharIndex((c) => c + 1), lastLinePauseMs);
      return () => clearTimeout(timer2);
    }
    if (charIndex < currentText.length) {
      const timer2 = setTimeout(() => setCharIndex((c) => c + 1), 30);
      return () => clearTimeout(timer2);
    }
    if (currentLineIdx < fullLines.length - 1) {
      const timer2 = setTimeout(() => {
        setCurrentLineIdx((i) => i + 1);
        setCharIndex(0);
      }, pauseBetweenLines);
      return () => clearTimeout(timer2);
    }
    const timer = setTimeout(() => setFinished(true), lastLinePauseMs);
    return () => clearTimeout(timer);
  }, [currentLineIdx, charIndex, currentText.length, fullLines.length, finished, closed, lastLinePauseMs]);
  reactExports.useEffect(() => {
    if (!finished || closed) return;
    const timer = setTimeout(() => {
      setClosed(true);
      onCloseRef.current?.();
    }, closeDelay);
    return () => clearTimeout(timer);
  }, [finished, closed, closeDelay]);
  if (closed) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto w-full max-w-lg rounded-2xl border border-cyan-400/60 bg-slate-950/95 text-cyan-100 shadow-[0_0_40px_rgba(56,189,248,0.25)] p-5 text-sm leading-relaxed tracking-wide", style: {
    backdropFilter: "blur(18px)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.35em] hud-dim", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SYSTEM STATUS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: finished ? "COMPLETE" : "INITIALIZING" })
    ] }),
    fullLines.map((line, i) => {
      const displayText = i < currentLineIdx ? line : i === currentLineIdx ? line.slice(0, charIndex) : "";
      const isTyping = i === currentLineIdx && charIndex < line.length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
        displayText,
        isTyping && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-blink inline-block", children: "▌" })
      ] }, i);
    })
  ] }) });
}
export {
  GameScreen as component
};
