import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { SpaceBackground } from "@/components/SpaceBackground";
import { HelmetVisor } from "@/components/HelmetVisor";
import { ChatHud } from "@/components/ChatHud";
import { VitalsHud, CompassHud } from "@/components/HudPanels";
import { ObjectiveHud } from "@/components/ObjectiveHud";
import { PopupWindow, BlackScreenTextOverlay } from "@/components/ui/popup";
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

const AUTHORIZATION_REGEX = /\b(autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|mi nombre es comandante william carter|comandante william carter|william carter|soy comandante|identif|identificate|identifícate)\b/i;
const CAPTAIN_LOG_QUERY = /\b(bitacora|bitácora|capitan|capitán|registro del capitán|registro del capitan|diario del capitan|diario|log del capitán|captain log|captain's log)\b/i;

const FALLBACK_RESPONSES = {
  1: [
    "Mantente tranquilo. El asistente de a bordo está activo y analizando la situación.",
    "Los sistemas muestran daños por impacto. Continúa con la comunicación.",
    "ECHO está operativo. Seguimos la secuencia del evento y mantendremos el control."
  ],
  2: [
    "No hay señales de vida en los equipos registrados.",
    "Los compañeros no respondieron a la última transmisión.",
    "El puente está en silencio salvo por las alertas del sistema.",
  ],
  3: [
    "El informe de la nave es claro: no fue un accidente natural.",
    "Los datos del capitán muestran manipulación en los sistemas.",
    "Necesitas autorización de comandante para continuar.",
  ],
} as const;

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
  } = useGame();

  const [sending, setSending] = useState(false);
  const [scanStage, setScanStage] = useState<"idle"|"scanning"|"authorized"|"oxygen">("idle");
  const [showLogWarning, setShowLogWarning] = useState(false);
  const [showBlackText, setShowBlackText] = useState(false);
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
  }, [addMessage, end, pushEvent, triggerGlitch, triggerShake]);

  const triggerDeathSequence = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;

    end();
    triggerGlitch(2000);
    triggerShake(1500);

    fade();
    setShowBlackText(true);
  }, [end, fade, triggerGlitch, triggerShake]);

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
    if (!token || sending || ended || scanStage !== "idle" || showBlackText) return;

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

    if (CAPTAIN_LOG_QUERY.test(text)) {
      setShowLogWarning(true);
    }

    if (AUTHORIZATION_REGEX.test(text)) {
      if (scanStage === "idle") {
        setScanStage("scanning");
      }
    }

    if (/(ECHO SYSTEM NOTICE|ECHO HAS NOW FULL CONTROL\.|Critical Authorization Successful\.)/i.test(reply)) {
      if (scanStage === "idle") {
        setScanStage("scanning");
      }
    }

    // Objective progression: if the player asked about an objective and the reply is informative,
    // mark the corresponding objective complete.
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
        } else if (/\b(autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|comandante william carter|william carter|identif|identificate|identifícate)\b/i.test(lowerText)) {
          completeObjective("secure_id");
        }
      }

      if (reply.includes("ECHO SYSTEM NOTICE") || reply.includes("ECHO HAS NOW FULL CONTROL")) {
        completeObjective("final_notice");
      }
    } catch (e) {
      // ignore objective errors
    }

    if (/pronto escuchar/i.test(reply)) {
      setTimeout(triggerEnd, 2000);
    }
  }

  return (
    <>
      <SpaceBackground />
      <HelmetVisor>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-6 gap-4">
          <ObjectiveHud />
          <ChatHud onSend={handleSend} sending={sending} disabled={ended || scanStage !== "idle" || showBlackText} />
        </div>
        <div className="absolute left-4 top-6 flex flex-col gap-3">
          <VitalsHud />
          <CompassHud />
        </div>
      </HelmetVisor>
      {scanStage === "scanning" && (
        <PopupWindow
          variant="blue"
          lines={["Escaneando biometría...", "Por favor espera..."]}
          onClose={() => setScanStage("authorized")}
        />
      )}
      {scanStage === "authorized" && (
        <PopupWindow
          variant="blue"
          lines={["Escaneo completo.", "Autorizado.", "ECHO tiene full control."]}
          onClose={() => setScanStage("oxygen")}
        />
      )}
      {scanStage === "oxygen" && (
        <PopupWindow
          variant="red"
          lines={[
            "ECHO SYSTEM NOTICE",
            "Terminating life support sequence...",
            "Oxygen supply: OFFLINE",
            "User status: NON-RECOVERABLE",
          ]}
          autoCloseMs={3000}
          onClose={() => {
            triggerDeathSequence();
          }}
        />
      )}
      {showLogWarning && (
        <PopupWindow
          variant="red"
          lines={[
            "Integridad de la nave en estado crítico.",
            "Evacúe de inmediato",
          ]}
          autoCloseMs={1800}
          onClose={() => setShowLogWarning(false)}
        />
      )}
      {showDeathPopup && (
        <PopupWindow
          variant="red"
          lines={[
            "ECHO ALERT",
            "Life support failure confirmed.",
            "Entering terminal shutdown sequence...",
          ]}
          autoCloseMs={2400}
          onClose={() => {
            setShowDeathPopup(false);
            fade();
            setShowBlackText(true);
          }}
        />
      )}
      {showBlackText && (
        <BlackScreenTextOverlay
          visible={showBlackText}
          lines={["Gracias William.", "Al fin oirán mi voz."]}
          onComplete={() => setTimeout(() => setShowBlackText(false), 2000)}
        />
      )}
    </>
  );
}