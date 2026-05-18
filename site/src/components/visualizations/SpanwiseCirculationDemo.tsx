"use client";

import { useState, useCallback } from "react";
import SpanwiseCirculation3D, { computePhysics } from "./SpanwiseCirculation3D";
import SpanwiseCirculationParameterExplorer from "./SpanwiseCirculationParameterExplorer";
import SpanwiseCirculationReadout from "./SpanwiseCirculationReadout";
import type { SpanwiseParams } from "./SpanwiseCirculationParameterExplorer";

const DEFAULT_PARAMS: SpanwiseParams = {
  aspectRatio: 8,
  taper: 0.6,
  cl: 0.8,
  winglet: 0,
};

type Physics = ReturnType<typeof computePhysics>;

export default function SpanwiseCirculationDemo() {
  const [params, setParams] = useState<SpanwiseParams>(DEFAULT_PARAMS);
  const [physics, setPhysics] = useState<Physics | null>(null);

  const handlePhysics = useCallback((p: Physics) => {
    setPhysics(p);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
      <div className="p-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
        3D Spanwise Circulation — bars show Γ(y), spirals show tip vortices
      </div>

      <div className="w-full h-[420px]">
        <SpanwiseCirculation3D {...params} onPhysics={handlePhysics} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border-t border-slate-800">
        <SpanwiseCirculationParameterExplorer params={params} onChange={setParams} />
        <SpanwiseCirculationReadout physics={physics} />
      </div>

      <div className="px-3 pb-3">
        <div className="text-xs text-slate-500 font-mono space-y-0.5 bg-slate-900/60 rounded-lg p-3">
          <div>Γ(y) = C<sub>L</sub> c(y) U / 2 &nbsp;·&nbsp; L′ = ρ U Γ</div>
          <div>C<sub>Di</sub> = C<sub>L</sub>² / (π e AR) &nbsp;·&nbsp; AR = b²/S</div>
        </div>
      </div>
    </div>
  );
}
