import React from "react";
import { useGame } from "@/store/game";

export function ObjectiveHud() {
  const objectives = useGame((s) => s.objectives);

  const current = objectives.find((o) => !o.completed) ?? objectives[objectives.length - 1];

  return (
    <div className="hud-panel hud-corner relative rounded-sm p-4 w-full max-w-[92vw] sm:max-w-3xl pointer-events-auto mb-3 shadow-[0_0_40px_rgba(0,255,200,0.08)] border border-[color:var(--hud)]/20">
      <div className="text-[10px] hud-dim tracking-[0.35em] mb-2 uppercase">// OBJETIVO ACTUAL</div>
      <div className="text-lg sm:text-xl font-semibold hud-text leading-tight">
        {current ? current.title : "Completado"}
      </div>
      <div className="mt-3 text-[11px] hud-dim uppercase tracking-[0.35em] opacity-80">
        {current?.completed ? "LISTO" : "SIGUIENTE PASO"}
      </div>
    </div>
  );
}
