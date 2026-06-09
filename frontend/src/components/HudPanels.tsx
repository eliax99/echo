import { useGame } from "@/store/game";

function Bar({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[9px] tracking-[0.25em] mb-0.5">
        <span className={warn ? "hud-warn" : "hud-dim"}>{label}</span>
        <span className={warn ? "hud-warn" : "hud-text"}>{Math.round(value)}%</span>
      </div>
      <div className="h-1 bg-[color:var(--hud)]/10 relative">
        <div
          className={warn ? "bg-[color:var(--hud-warn)]" : "bg-[color:var(--hud)]"}
          style={{ width: `${value}%`, height: "100%", boxShadow: "0 0 6px currentColor" }}
        />
      </div>
    </div>
  );
}

export function VitalsHud() {
  const { oxygen, pressure, integrity, phase } = useGame();
  return (
    <div className="hud-panel hud-corner relative rounded-sm p-3 w-56 pointer-events-auto">
      <div className="flex justify-between text-[9px] hud-dim tracking-[0.3em] mb-2">
        <span>// SUIT VITALS</span>
        <span className="hud-text">PH{phase}</span>
      </div>
      <Bar label="O₂" value={oxygen} warn={oxygen < 30} />
      <Bar label="PRESSURE" value={pressure} warn={pressure < 40} />
      <Bar label="HULL INT." value={integrity} warn={integrity < 30} />
    </div>
  );
}

export function CompassHud() {
  return (
    <div className="hud-panel hud-corner relative rounded-sm p-3 w-56 pointer-events-auto">
      <div className="flex justify-between text-[9px] hud-dim tracking-[0.3em] mb-2">
        <span>// NAVIGATION</span>
        <span className="hud-text">DRIFT</span>
      </div>
      <div className="text-[10px] hud-text font-mono leading-tight">
        <div>LAT: <span className="hud-dim">--.--</span></div>
        <div>LON: <span className="hud-dim">--.--</span></div>
        <div>VEL: 0.42 m/s</div>
        <div>SHIP: <span className="hud-warn">DESTROYED</span></div>
      </div>
    </div>
  );
}

export function EventsHud() {
  const events = useGame((s) => s.events);
  if (events.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 pointer-events-none">
      {events.map((e) => (
        <div
          key={e.id}
          className="hud-panel hud-corner relative rounded-sm px-4 py-2 max-w-md animate-pulse"
          style={{
            borderColor:
              e.kind === "warn" || e.kind === "glitch"
                ? "var(--hud-warn)"
                : "var(--hud)",
          }}
        >
          <div className="text-[9px] tracking-[0.3em] hud-dim">
            {e.kind === "warn" ? "▲ WARNING" : e.kind === "glitch" ? "✕ ANOMALY" : "● SYSTEM"}
          </div>
          <div className={`text-sm tracking-wide ${e.kind === "warn" || e.kind === "glitch" ? "hud-warn" : "hud-text"}`}>
            {e.text}
          </div>
        </div>
      ))}
    </div>
  );
}
