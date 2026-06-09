import { useEffect, useRef, useState } from "react";
import { useGame, type ChatMsg } from "@/store/game";

function useReveal(text: string, speed = 18) {
  const [shown, setShown] = useState("");
  useEffect(() => {
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

function EchoLine({ msg }: { msg: ChatMsg }) {
  const text = useReveal(msg.text, 22);
  const done = text.length === msg.text.length;
  return (
    <div className="mb-3">
      <div className="text-[10px] hud-dim tracking-[0.3em] mb-0.5">» ECHO // TRANSMISSION</div>
      <div className="hud-text text-sm leading-relaxed">
        {text}
        {!done && <span className="cursor-blink">▌</span>}
      </div>
    </div>
  );
}

function SystemLine({ msg }: { msg: ChatMsg }) {
  return (
    <div className="mb-3">
      <div className="hud-warn text-[11px] tracking-[0.25em]">{`>> ${msg.text}`}</div>
    </div>
  );
}

function UserLine({ msg }: { msg: ChatMsg }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] hud-dim tracking-[0.3em] mb-0.5">» OPERATOR LOG</div>
      <div className="text-[color:var(--foreground)]/80 text-sm">{`> ${msg.text}`}</div>
    </div>
  );
}

export function ChatHud({
  onSend,
  sending,
}: {
  onSend: (text: string) => void;
  sending: boolean;
}) {
  const messages = useGame((s) => s.messages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!v || sending) return;
    onSend(v);
    setInput("");
  }

  return (
    <div className="hud-panel hud-corner relative rounded-sm p-4 w-full max-w-xl pointer-events-auto flex flex-col"
      style={{ height: "min(56vh, 520px)" }}>
      <div className="flex items-center justify-between text-[10px] hud-dim tracking-[0.3em] mb-2">
        <span>// COMMS LINK ▸ ECHO-AI</span>
        <span className="hud-text">● LIVE</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 custom-scroll">
        {messages.length === 0 && (
          <div className="hud-dim text-xs italic">
            // Awaiting transmission. Speak to ECHO.
          </div>
        )}
        {messages.map((m) =>
          m.role === "echo" ? (
            <EchoLine key={m.id} msg={m} />
          ) : m.role === "system" ? (
            <SystemLine key={m.id} msg={m} />
          ) : (
            <UserLine key={m.id} msg={m} />
          ),
        )}
        {sending && (
          <div className="hud-dim text-xs tracking-[0.25em] animate-pulse">
            » ECHO IS PROCESSING<span className="cursor-blink">_</span>
          </div>
        )}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2 border-t border-[color:var(--hud)]/30 pt-3">
        <span className="hud-text text-sm pt-1.5">{">"}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          placeholder="transmit to ECHO…"
          className="flex-1 bg-transparent outline-none hud-text placeholder:hud-dim font-mono text-sm py-1"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="border border-[color:var(--hud)] hud-text text-xs px-3 tracking-[0.25em] hover:bg-[color:var(--hud)]/20 disabled:opacity-40"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
