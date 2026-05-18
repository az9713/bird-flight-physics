"use client";

import { useState, useCallback } from "react";
import CfdComparison3D, { computePhysics } from "./CfdComparison3D";
import CfdComparisonParameterExplorer from "./CfdComparisonParameterExplorer";
import CfdComparisonReadout from "./CfdComparisonReadout";
import type { CfdParams } from "./CfdComparisonParameterExplorer";

const DEFAULT_PARAMS: CfdParams = {
  logRe: 4.5,    // Re ≈ 30,000 (songbird cruise)
  reducedFreq: 0.3,
  modelLevel: 1,  // Panel / Theodorsen
};

type Physics = ReturnType<typeof computePhysics>;

export default function CfdComparisonDemo() {
  const [params, setParams] = useState<CfdParams>(DEFAULT_PARAMS);
  const [physics, setPhysics] = useState<Physics | null>(null);

  const handlePhysics = useCallback((p: Physics) => {
    setPhysics(p);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
      <div className="p-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
        Model accuracy surface — height = accuracy of selected model at each (Re, k) regime
      </div>

      <div className="w-full h-[420px]">
        <CfdComparison3D {...params} onPhysics={handlePhysics} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border-t border-slate-800">
        <CfdComparisonParameterExplorer params={params} onChange={setParams} />
        <CfdComparisonReadout physics={physics} />
      </div>

      <div className="px-3 pb-3">
        <div className="text-xs text-slate-500 font-mono space-y-0.5 bg-slate-900/60 rounded-lg p-3">
          <div>Surface: x = log Re, z = k, y = accuracy of selected model</div>
          <div>Green = error &lt; 15% · Yellow = 15–35% · Red = &gt; 35%</div>
        </div>
      </div>
    </div>
  );
}
