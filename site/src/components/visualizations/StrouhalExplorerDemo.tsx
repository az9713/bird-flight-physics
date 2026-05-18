"use client";

import { useState, useCallback } from "react";
import StrouhalExplorer3D, { computePhysics } from "./StrouhalExplorer3D";
import StrouhalExplorerParameterExplorer from "./StrouhalExplorerParameterExplorer";
import StrouhalExplorerReadout from "./StrouhalExplorerReadout";
import type { StrouhalParams } from "./StrouhalExplorerParameterExplorer";

const DEFAULT_PARAMS: StrouhalParams = {
  freq: 2.5,
  amplitude: 0.9,
  speed: 8.0,
};

type Physics = ReturnType<typeof computePhysics>;

export default function StrouhalExplorerDemo() {
  const [params, setParams] = useState<StrouhalParams>(DEFAULT_PARAMS);
  const [physics, setPhysics] = useState<Physics | null>(null);

  const handlePhysics = useCallback((p: Physics) => {
    setPhysics(p);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
      <div className="p-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
        3D Propulsive Efficiency Surface — height = η<sub>p</sub>(St), drag to orbit
      </div>

      <div className="w-full h-[420px]">
        <StrouhalExplorer3D {...params} onPhysics={handlePhysics} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border-t border-slate-800">
        <StrouhalExplorerParameterExplorer params={params} onChange={setParams} />
        <StrouhalExplorerReadout physics={physics} />
      </div>

      <div className="px-3 pb-3">
        <div className="text-xs text-slate-500 font-mono space-y-0.5 bg-slate-900/60 rounded-lg p-3">
          <div>St = fA/U &nbsp;·&nbsp; η<sub>p</sub> peaks at St ≈ 0.28</div>
          <div>Surface: x = frequency f, z = amplitude A, y = η<sub>p</sub></div>
        </div>
      </div>
    </div>
  );
}
