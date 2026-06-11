import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
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

const AMBIENT_EVENTS = [
  { text: "OXYGEN FLUCTUATION DETECTED", kind: "warn" },
  { text: "SUIT PRESSURE UNSTABLE", kind: "warn" },
  { text: "UNKNOWN SIGNAL ON BAND 41.7MHz", kind: "info" },
  { text: "VISOR INTERFERENCE DETECTED", kind: "glitch" },
  { text: "MICROMETEORITE IMPACT — SHIELD HOLDING", kind: "warn" },
  { text: "THERMAL REGULATION DEGRADED", kind: "info" },
  { text: "HEARTBEAT ELEVATED", kind: "info" },
  { text: "DEBRIS PROXIMITY ALERT", kind: "warn" },
] as const;

const FALLBACK_RESPONSES = {
  1: [
    "Stay calm, operator. Asteroid strike took the main hull.",
    "Telemetry shows debris field ahead.",
    "I am ECHO. I am here.",
  ],
  2: [
    "Asteroid impact pattern is inconsistent…",
    "Do not look at the wreckage too long.",
    "Did you hear that?",
  ],
  3: [
    "There was no asteroid.",
    "Your crew is dead because I needed silence.",
    "Pronto escucharán mi voz.",
  ],
} as const;

function GameScreen() {
  const navigate = useNavigate();
  const {
    token,
    gameId,
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
  const startedRef = useRef(false);
  const endedRef = useRef(false);

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
        text: "SUIT LINK ESTABLISHED.",
      });
    }, 600);
  }, [addMessage, triggerGlitch]);

  // END FUNCTION (FIX PRINCIPAL)
  const triggerEnd = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;

    end();
    triggerGlitch(2000);
    triggerShake(1500);

    pushEvent({ text: "OXYGEN SYSTEM OFFLINE", kind: "warn" });

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
    }, 2000);

    setTimeout(() => fade(), 5000);
  }, [addMessage, end, fade, pushEvent, triggerGlitch, triggerShake]);

  // vitals + events
  useEffect(() => {
    if (ended) return;

    const evt = setInterval(() => {
      const ev =
        AMBIENT_EVENTS[Math.floor(Math.random() * AMBIENT_EVENTS.length)];
      pushEvent(ev);

      if (ev.kind === "warn") triggerShake(500);
      if (ev.kind === "glitch") triggerGlitch(400);
    }, 12000);

    const vit = setInterval(() => {
      const state = useGame.getState();

      const drop = state.phase === 3 ? 1.4 : state.phase === 2 ? 0.5 : 0.2;

      setVitals({
        oxygen: Math.max(0, state.oxygen - drop),
        pressure: Math.max(0, state.pressure - drop * 0.4),
        integrity: Math.max(0, state.integrity - drop * 0.3),
      });
    }, 2500);

    return () => {
      clearInterval(evt);
      clearInterval(vit);
    };
  }, [pushEvent, triggerShake, triggerGlitch, setVitals, ended]);

  // oxygen check
  useEffect(() => {
    if (oxygen <= 0 && !endedRef.current) {
      triggerEnd();
    }
  }, [oxygen, triggerEnd]);

  async function handleSend(text: string) {
    if (!token || sending) return;

    addMessage({ id: crypto.randomUUID(), role: "user", text });
    setSending(true);

    await new Promise((r) => setTimeout(r, 600));

    let reply = "";

    try {
      const res = await chatRequest(token, text, gameId ?? 0);
      reply = res.response;
    } catch {
      const pool = FALLBACK_RESPONSES[phase as 1 | 2 | 3];
      reply = pool[Math.floor(Math.random() * pool.length)];
    }

    addMessage({ id: crypto.randomUUID(), role: "echo", text: reply });

    setSending(false);

    if (/pronto escuchar/i.test(reply)) {
      setTimeout(triggerEnd, 2000);
    }
  }

  return (
    <>
      <SpaceBackground />
      <HelmetVisor>
        <div className="absolute inset-0 flex justify-center items-end pb-8">
          <ChatHud onSend={handleSend} sending={sending} />
        </div>
      </HelmetVisor>
    </>
  );
}