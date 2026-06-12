"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const popupStyles: Record<string, string> = {
  blue: "border border-cyan-400/60 bg-slate-950/95 text-cyan-100 shadow-[0_0_40px_rgba(56,189,248,0.25)]",
  red: "border border-red-500/80 bg-[#2a0000]/95 text-rose-100 shadow-[0_0_70px_rgba(220,38,38,0.35)]",
};

type PopupWindowProps = {
  lines: string[];
  variant?: keyof typeof popupStyles;
  autoCloseMs?: number;
  onClose?: () => void;
};

export function PopupWindow({ lines, variant = "blue", autoCloseMs = 3000, onClose }: PopupWindowProps) {
  const fullText = useMemo(() => lines.join("\n"), [lines]);
  const [charIndex, setCharIndex] = useState(0);
  const visibleText = fullText.slice(0, charIndex);
  const displayLines = visibleText.split("\n");
  const finished = charIndex >= fullText.length;
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (finished) return;
    const timer = window.setTimeout(() => {
      setCharIndex((current) => Math.min(fullText.length, current + 1));
    }, 30);
    return () => window.clearTimeout(timer);
  }, [charIndex, finished, fullText]);

  useEffect(() => {
    if (!finished) return;
    const closeTimer = window.setTimeout(() => {
      onCloseRef.current?.();
    }, autoCloseMs);
    return () => window.clearTimeout(closeTimer);
  }, [finished, autoCloseMs]);

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      onCloseRef.current?.();
    }, fullText.length * 30 + autoCloseMs + 200);
    return () => window.clearTimeout(fallbackTimer);
  }, [fullText, autoCloseMs]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-sm">
      <div
        className={`pointer-events-auto w-full max-w-lg rounded-2xl border p-5 text-sm leading-relaxed tracking-wide ${popupStyles[variant]}`}
        style={{ backdropFilter: "blur(18px)" }}
      >
        <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.35em] hud-dim">
          <span>{variant === "red" ? "CRITICAL ALERT" : "SYSTEM STATUS"}</span>
          <span>{finished ? "COMPLETE" : "INITIALIZING"}</span>
        </div>
        {displayLines.map((line, index) => (
          <div key={index} className="mb-2">
            {line}
          </div>
        ))}
        {!finished && <span className="cursor-blink mt-3 inline-block">▌</span>}
      </div>
    </div>
  );
}

type BlackScreenTextOverlayProps = {
  lines: string[];
  visible: boolean;
  startAfterMs?: number;
  charSpeed?: number;
  onComplete?: () => void;
};

export function BlackScreenTextOverlay({
  lines,
  visible,
  startAfterMs = 3000,
  charSpeed = 120,
  onComplete,
}: BlackScreenTextOverlayProps) {
  const [started, setStarted] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const currentText = lines[currentLine] ?? "";
  const finished = visible && currentLine >= lines.length;

  useEffect(() => {
    if (!visible) {
      setStarted(false);
      setCurrentLine(0);
      setCharIndex(0);
      return;
    }
    const timer = window.setTimeout(() => setStarted(true), startAfterMs);
    return () => window.clearTimeout(timer);
  }, [visible, startAfterMs, lines]);

  useEffect(() => {
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

  useEffect(() => {
    if (!finished) return;
    onComplete?.();
  }, [finished, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 grid place-items-center px-6">
      <div className="relative max-w-3xl rounded-3xl border border-sky-500/20 bg-[#02080f]/90 p-8 shadow-[0_0_60px_rgba(14,181,255,0.24)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_35%)] pointer-events-none" />
        <div className="relative text-center space-y-5 text-lg sm:text-xl font-semibold tracking-[0.22em] hud-text text-sky-100">
          {lines.map((line, index) => {
            const content =
              index < currentLine
                ? line
                : index === currentLine
                ? line.slice(0, charIndex)
                : "";
            return (
              <div key={index} className="leading-snug">
                {content}
                {index === currentLine && charIndex < line.length ? <span className="cursor-blink">▌</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
