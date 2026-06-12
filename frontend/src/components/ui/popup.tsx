"use client";

import { useEffect, useMemo, useState } from "react";

const popupStyles: Record<string, string> = {
  blue: "border-sky-400 bg-sky-950/90 text-sky-200 shadow-[0_0_40px_rgba(56,189,248,0.25)]",
  red: "border-red-500 bg-[#3b0000]/95 text-red-200 shadow-[0_0_60px_rgba(220,38,38,0.35)]",
};

type PopupWindowProps = {
  lines: string[];
  variant?: keyof typeof popupStyles;
  autoCloseMs?: number;
  onClose?: () => void;
};

export function PopupWindow({ lines, variant = "blue", autoCloseMs = 2000, onClose }: PopupWindowProps) {
  const fullText = useMemo(() => lines.join("\n"), [lines]);
  const [charIndex, setCharIndex] = useState(0);
  const visibleText = fullText.slice(0, charIndex);
  const displayLines = visibleText.split("\n");
  const finished = charIndex >= fullText.length;

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
      onClose?.();
    }, autoCloseMs);
    return () => window.clearTimeout(closeTimer);
  }, [finished, onClose, autoCloseMs]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-md border p-4 text-sm leading-relaxed ${popupStyles[variant]}`}
      >
        {displayLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        {!finished && <span className="cursor-blink">▌</span>}
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
    <div className="fixed inset-0 z-[120] bg-black grid place-items-center px-6">
      <div className="text-center space-y-4 text-lg font-mono hud-text text-sky-100">
        {lines.map((line, index) => {
          const content =
            index < currentLine
              ? line
              : index === currentLine
              ? line.slice(0, charIndex)
              : "";
          return (
            <div key={index}>
              {content}
              {index === currentLine && charIndex < line.length ? <span className="cursor-blink">▌</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
