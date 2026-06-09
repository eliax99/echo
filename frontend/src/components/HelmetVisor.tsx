import type { ReactNode } from "react";
import { useGame } from "@/store/game";

export function HelmetVisor({ children }: { children: ReactNode }) {
  const { shaking, glitching, events, faded } = useGame();
  const hasWarn = events.some((e) => e.kind === "warn" || e.kind === "glitch");

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className={`absolute inset-0 helmet-drift ${shaking ? "helmet-shake" : ""}`}
      >
        <div className={`absolute inset-0 helmet-breathe ${glitching ? "helmet-glitch" : ""}`}>
          {children}
        </div>
      </div>
      <div className="visor-tint" />
      <div className="visor-noise" />
      <div className="visor-scanline" />
      <div className="scan-bar" />
      <div className="visor-mask" />
      {hasWarn && <div className="warn-overlay" />}
      {faded && (
        <div
          className="absolute inset-0 bg-black z-[100] transition-opacity duration-[4000ms]"
          style={{ opacity: 1 }}
        />
      )}
    </div>
  );
}
