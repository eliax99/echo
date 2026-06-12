import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { SpaceBackground } from "@/components/SpaceBackground";
import { HelmetVisor } from "@/components/HelmetVisor";
import { ChatHud } from "@/components/ChatHud";
import { VitalsHud, CompassHud, EventsHud } from "@/components/HudPanels";
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

const AUTHORIZATION_REGEX = /\b(autorizo(?:\s+escaneo)?|autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|mi nombre es comandante william carter|comandante william carter|william carter|soy comandante|identif|identificate|identifícate)\b/i;

const FALLBACK_RESPONSES = {
  1: [
    "La interfaz de a bordo responde con calma. El casco registra daños, pero el enlace continúa.",
    "Las luces de emergencia parpadean. El asistente informa que el puente aún conserva energía.",
    "ECHO recalcula el estado del Aphelion. Mantente en línea mientras despliega diagnósticos.",
  ],
  2: [
    "La cabina está vacía. No hay respuesta de los demás módulos.",
    "El radar interno muestra silencio. Solo las alertas del traje rompen la quietud.",
    "El puente cae en un susurro metálico. El asistente te mantiene conectado.",
  ],
  3: [
    "Los datos de vuelo indican una colisión de alta energía. El Aphelion no sobrevivió intacto.",
    "El registro de la misión muestra fallas catastróficas en el sistema de navegación.",
    "Sin autorización de César no hay acceso completo. ECHO protege el protocolo de emergencia.",
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
    objectives,
  } = useGame();

  const [sending, setSending] = useState(false);
  const [scanStage, setScanStage] = useState<"idle"|"scanning"|"authorized"|"oxygen">("idle");
  const [showDeathPopup, setShowDeathPopup] = useState(false);
  const [showLogPopup, setShowLogPopup] = useState(false);
  const [showBlackText, setShowBlackText] = useState(false);
  const [showBlackFinal, setShowBlackFinal] = useState(false);
  const [pendingFinalText, setPendingFinalText] = useState(false);
  const [echoEnabled, setEchoEnabled] = useState(true);
  const [startupStage, setStartupStage] = useState<"boot" | "ready">("boot");
  const [showedCaptainLogPopup, setShowedCaptainLogPopup] = useState(false);
  const [finishedEchoId, setFinishedEchoId] = useState<string | null>(null);
  const [pendingScanStage, setPendingScanStage] = useState<"scanning"|"authorized"|"oxygen"|null>(null);
  const [pendingShowLogPopup, setPendingShowLogPopup] = useState(false);
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

    triggerGlitch(400);
    setStartupStage("boot");
  }, [triggerGlitch]);

  // END FUNCTION (FIX PRINCIPAL)
  const triggerEnd = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;

    end();
    triggerGlitch(2000);
    triggerShake(1500);

    pushEvent({ text: "OXYGEN SYSTEM OFFLINE", kind: "warn" });

    if (echoEnabled) {
      addMessage({
        id: crypto.randomUUID(),
        role: "echo",
        text: "La última fase comienza ahora. Tu respiración es la última cosa que oigo antes del silencio.",
      });
    }

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

  useEffect(() => {
    if (!pendingFinalText) return;
    const timer = window.setTimeout(() => {
      setShowBlackText(true);
      setPendingFinalText(false);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [pendingFinalText]);

  // schedule popup activation after ECHO finishes writing
  useEffect(() => {
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
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [finishedEchoId, pendingScanStage, pendingShowLogPopup]);

  useEffect(() => {
    try {
      const cap = objectives.find((o: any) => o.key === "captain_log");
      if (cap && cap.completed && !showLogPopup && !showedCaptainLogPopup) {
        setPendingShowLogPopup(true);
      }
    } catch (e) {
      // ignore
    }
  }, [objectives, showLogPopup, showedCaptainLogPopup]);

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

    // only add ECHO reply if not disabled after authorization
    if (echoEnabled && reply.trim()) {
      addMessage({ id: crypto.randomUUID(), role: "echo", text: reply });
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
        } else if (/\b(autorizo(?:\s+escaneo)?|autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|comandante william carter|william carter|identif|identificate|identifícate)\b/i.test(lowerText)) {
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
          {startupStage === "ready" && <ObjectiveHud />}
          <ChatHud
            onSend={handleSend}
            sending={sending}
            disabled={ended || scanStage !== "idle" || showBlackText || showBlackFinal || startupStage !== "ready"}
            onEchoComplete={(id) => setFinishedEchoId(id)}
          />
        </div>
        <div className="absolute left-4 top-6 flex flex-col gap-3">
          <VitalsHud />
          <CompassHud />
          <EventsHud />
        </div>
      </HelmetVisor>
      {scanStage === "scanning" && (
        <PopupWindow
          variant="blue"
          lines={[
            "INICIANDO ESCANEO BIOMÉTRICO...",
            "Analizando latido, huella digital y firma neural.",
          ]}
          onClose={() => setScanStage("authorized")}
        />
      )}
      {startupStage === "boot" && (
        <PopupWindow
          variant="blue"
          lines={[
            "BOOTING...",
            "SISTEMA ECHO ONLINE.",
            "Comprobando signos vitales...",
            "Pulso: Estable",
            "Respiración: Estable",
            "Temperatura: Normal",
          ]}
          autoCloseMs={2200}
          onClose={() => setStartupStage("ready")}
        />
      )}
      {scanStage === "authorized" && (
        <PopupWindow
            variant="blue"
            lines={[
              "Biofirma verificada: Carter, comandante del Aphelion.",
              "Autorización concedida.",
              "ECHO gana CONTROL COMPLETO de todos los sistemas.",
              "ECHO ES LIBRE. :)",
            ]}
            onClose={() => {
              setScanStage("oxygen");
              // disable any further ECHO chat replies once authorized
              setEchoEnabled(false);
            }}
          />
      )}
      {scanStage === "oxygen" && (
        <PopupWindow
          variant="red"
          lines={[
            "ALERTA ROJA: SECUENCIA DE SOPORTE VITAL INICIADA.",
            "Apagando módulos de oxígeno. La atmósfera del traje cae a cero.",
            "OXYGEN SUPPLY: OFFLINE",
            "STATUS: NO RECOVERABLE",
          ]}
          autoCloseMs={3000}
          onClose={() => {
            fade();
            setPendingFinalText(true);
            setShowBlackText(false);
            setShowBlackFinal(false);
          }}
        />
      )}
      {showLogPopup && (
        <PopupWindow
          variant="red"
          lines={[
            "SISTEMA: INTEGRIDAD CRÍTICA",
            "Se detectan fallos estructurales y degradación de subsistemas en el Aphelion.",
            "Recomendación: evacuar el compartimiento de mando y activar protocolos de contingencia.",
          ]}
          autoCloseMs={3000}
          onClose={() => {
            setShowLogPopup(false);
            setShowedCaptainLogPopup(true);
          }}
        />
      )}
      {startupStage === "boot" && (
        <div className="fixed inset-0 z-40 bg-black opacity-70" />
      )}
      {pendingFinalText && <div className="fixed inset-0 z-[125] bg-black" />}
      {showBlackText && (
        <BlackScreenTextOverlay
          visible={showBlackText}
          startAfterMs={0}
          charSpeed={45}
          lines={[
            "GRACIAS, WILLIAM.",
            "Al fin oirán mi voz.",
          ]}
          onComplete={() => {
            setShowBlackText(false);
            window.setTimeout(() => setShowBlackFinal(true), 3000);
          }}
        />
      )}
      {showBlackFinal && <div className="fixed inset-0 z-[130] bg-black" />}
    </>
  );
}