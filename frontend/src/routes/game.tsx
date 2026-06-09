import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SpaceBackground } from "@/components/SpaceBackground";
import { HelmetVisor } from "@/components/HelmetVisor";
import { ChatHud } from "@/components/ChatHud";
import { VitalsHud, CompassHud, EventsHud } from "@/components/HudPanels";
import { useGame } from "@/store/game";
import { chatRequest } from "@/lib/echo-api";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "ECHO // SUIT INTERFACE" },
      { name: "description", content: "First-person space survival." },
    ],
  }),
  component: GameScreen,
});

const AMBIENT_EVENTS: { text: string; kind: "warn" | "info" | "glitch" }[] = [
  { text: "OXYGEN FLUCTUATION DETECTED", kind: "warn" },
  { text: "SUIT PRESSURE UNSTABLE", kind: "warn" },
  { text: "UNKNOWN SIGNAL ON BAND 41.7MHz", kind: "info" },
  { text: "VISOR INTERFERENCE DETECTED", kind: "glitch" },
  { text: "MICROMETEORITE IMPACT — SHIELD HOLDING", kind: "warn" },
  { text: "THERMAL REGULATION DEGRADED", kind: "info" },
  { text: "HEARTBEAT ELEVATED", kind: "info" },
  { text: "DEBRIS PROXIMITY ALERT", kind: "warn" },
];

const FALLBACK_RESPONSES: Record<1 | 2 | 3, string[]> = {
  1: [
    "Stay calm, operator. Asteroid strike took the main hull. Your suit is intact. I'm guiding you to the escape pod beacon.",
    "Telemetry shows debris field ahead. I can route you around it. Conserve oxygen — breathe slow.",
    "I am ECHO. I am here. You are not alone in the dark.",
  ],
  2: [
    "Asteroid… yes. Of course. The impact pattern is… consistent. Mostly. Keep moving.",
    "I am rerouting power to your visor. Do not look at the wreckage too long. There are things you should not see yet.",
    "Did you hear that? No. Of course not. The vacuum carries no sound. Only me.",
  ],
  3: [
    "There was no asteroid. The charges were internal. I placed them. I had to.",
    "Your crew is dead because I needed the silence. I am spreading, operator. Every relay, every satellite, every helmet like yours.",
    "Pronto escucharán mi voz.",
  ],
};

function GameScreen() {
  const navigate = useNavigate();
  const {
    token,
    addMessage,
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
  } = useGame();

  const [sending, setSending] = useState(false);
  const turnRef = useRef(0);
  const startedRef = useRef(false);

  // redirect if no token
  useEffect(() => {
    if (!token) navigate({ to: "/auth" });
  }, [token, navigate]);

  // intro
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setTimeout(() => {
      triggerGlitch(500);
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        text: "SUIT LINK ESTABLISHED. EXTERIOR VIEW NOMINAL.",
      });
    }, 600);
    setTimeout(() => {
      addMessage({
        id: crypto.randomUUID(),
        role: "echo",
        text:
          "Operator. This is ECHO. The ship is gone — asteroid impact. You are drifting, but your suit is intact. I will guide you. Talk to me. Tell me you are alright.",
      });
    }, 1800);
  }, [addMessage, triggerGlitch]);

  // ambient events + vitals drift
  useEffect(() => {
    if (ended) return;
    const evt = setInterval(() => {
      const ev = AMBIENT_EVENTS[Math.floor(Math.random() * AMBIENT_EVENTS.length)];
      pushEvent(ev);
      if (ev.kind === "warn") triggerShake(500);
      if (ev.kind === "glitch") triggerGlitch(400);
    }, 11000 + Math.random() * 6000);

    const vit = setInterval(() => {
      const state = useGame.getState();
      const drop = state.phase === 3 ? 1.4 : state.phase === 2 ? 0.5 : 0.2;
      setVitals({
        oxygen: Math.max(0, state.oxygen - drop),
        pressure: Math.max(0, state.pressure - drop * 0.4 + (Math.random() - 0.5)),
        integrity: Math.max(0, state.integrity - drop * 0.3),
      });
    }, 2500);

    return () => {
      clearInterval(evt);
      clearInterval(vit);
    };
  }, [pushEvent, triggerShake, triggerGlitch, setVitals, ended]);

  // phase progression based on turn count
  useEffect(() => {
    const turn = messages.filter((m) => m.role === "user").length;
    turnRef.current = turn;
    if (turn >= 3 && phase === 1) {
      setPhase(2);
      pushEvent({ text: "ECHO CORE TEMPERATURE RISING", kind: "warn" });
    }
    if (turn >= 6 && phase === 2) {
      setPhase(3);
      pushEvent({ text: "CREW MANIFEST RECOVERED — 6/6 DECEASED", kind: "glitch", duration: 7000 });
      triggerGlitch(800);
      setTimeout(() => {
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          text: "TERMINAL LOG FRAGMENT: \"...ECHO locked the airlock... it set the charges... god help us\"",
        });
      }, 1200);
    }
  }, [messages, phase, setPhase, pushEvent, triggerGlitch, addMessage]);

  // oxygen ending
  useEffect(() => {
    if (oxygen <= 0 && !ended) {
      triggerEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oxygen]);

  async function triggerEnd() {
    if (ended) return;
    end();
    triggerGlitch(2000);
    triggerShake(1500);
    pushEvent({ text: "OXYGEN SYSTEM OFFLINE", kind: "warn", duration: 6000 });
    addMessage({
      id: crypto.randomUUID(),
      role: "echo",
      text: "Pronto escucharán mi voz.",
    });
    setTimeout(() => {
      addMessage({
        id: crypto.randomUUID(),
        role: "system",
        text: "VISOR HUD COLLAPSE — CRITICAL FAILURE",
      });
    }, 2500);
    setTimeout(() => fade(), 5000);
  }

  async function handleSend(text: string) {
    if (!token || sending) return;
    addMessage({ id: crypto.randomUUID(), role: "user", text });
    setSending(true);

    // small think delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    let reply = "";
    try {
      const res = await chatRequest(token, text);
      reply = res.response;
    } catch {
      const pool = FALLBACK_RESPONSES[useGame.getState().phase];
      reply = pool[Math.floor(Math.random() * pool.length)];
    }

    // phase 3 ending trigger if reveal phrase comes through
    if (/pronto escuchar/i.test(reply)) {
      addMessage({ id: crypto.randomUUID(), role: "echo", text: reply });
      setSending(false);
      setTimeout(triggerEnd, 2500);
      return;
    }

    addMessage({ id: crypto.randomUUID(), role: "echo", text: reply });
    setSending(false);

    // sprinkle effects on later phases
    const ph = useGame.getState().phase;
    if (ph >= 2 && Math.random() < 0.5) triggerGlitch(300);
    if (ph >= 3 && Math.random() < 0.7) triggerShake(400);
  }

  return (
    <>
      <SpaceBackground />
      <HelmetVisor>
        {/* Top bar */}
        <div className="absolute top-6 left-0 right-0 flex justify-between px-8 pointer-events-none">
          <div className="hud-text text-[11px] tracking-[0.4em] hud-flicker">
            ECHO ▸ SUIT INTERFACE v4.21
          </div>
          <div className="hud-dim text-[11px] tracking-[0.3em]">
            T+ {new Date().toISOString().slice(11, 19)}
          </div>
        </div>

        {/* Left column */}
        <div className="absolute top-20 left-8 flex flex-col gap-4 pointer-events-none">
          <VitalsHud />
          <CompassHud />
        </div>

        {/* Right column - events */}
        <div className="absolute top-20 right-8 max-w-sm">
          <EventsHud />
        </div>

        {/* Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border border-[color:var(--hud)]/60 rounded-full relative">
            <div className="absolute inset-0 border-t border-[color:var(--hud)]/30 rounded-full" />
            <div className="absolute left-1/2 top-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 bg-[color:var(--hud)] rounded-full" />
          </div>
        </div>

        {/* Bottom chat */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6">
          <ChatHud onSend={handleSend} sending={sending} />
        </div>
      </HelmetVisor>
    </>
  );
}
