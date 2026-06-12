import React from "react";
import { useGame } from "@/store/game";

export function ObjectiveHud() {
  const objectives = useGame((s) => s.objectives);

  const current = objectives.find((o) => !o.completed) ?? objectives[objectives.length - 1];

  return (
    <div className="hud-panel hud-corner objective-panel relative rounded-2xl p-5 w-full max-w-[92vw] sm:max-w-3xl pointer-events-auto mb-4 border border-[color:var(--hud)]/30 shadow-[0_0_40px_rgba(0,255,200,0.14)]">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="text-[10px] hud-dim tracking-[0.35em] uppercase">// OBJETIVO ACTUAL</div>
          <div className="text-2xl sm:text-3xl font-extrabold hud-text leading-tight tracking-[0.12em]">
            {current ? current.title : "Misión completada"}
          </div>
        </div>
      </div>
      
    </div>
  );
}
