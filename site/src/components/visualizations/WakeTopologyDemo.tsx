"use client";

import { useState, useCallback } from "react";
import WakeTopology3D, { computePhysics } from "./WakeTopology3D";
import WakeTopologyParameterExplorer from "./WakeTopologyParameterExplorer";
import WakeTopologyReadout from "./WakeTopologyReadout";
import type { WakeParams } from "./WakeTopologyParameterExplorer";

const DEFAULT_PARAMS: WakeParams = {
  freq: 2.0,
  speed: 7.0,
  amplitude: 1.0,
  decay: 0.6,
};

type Physics = ReturnType<typeof computePhysics>;

export default function WakeTopologyDemo() {
  const [params, setParams] = useState<WakeParams>(DEFAULT_PARAMS);
  const [physics, setPhysics] = useState<Physics | null>(null);

  const handlePhysics = useCallback((p: Physics) => {
    setPhysics(p);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
      <div className="p-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
        3D Vortex Wake — drag to orbit, scroll to zoom
      </div>

      <div className="w-full h-[420px]">
        <WakeTopology3D {...params} onPhysics={handlePhysics} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border-t border-slate-800">
        <WakeTopologyParameterExplorer params={params} onChange={setParams} />
        <WakeTopologyReadout physics={physics} />
      </div>

      <div className="px-3 pb-3">
        <div className="text-xs text-slate-500 font-mono space-y-0.5 bg-slate-900/60 rounded-lg p-3">
          <div>λ = U/f &nbsp;·&nbsp; I = ρΓπR² &nbsp;·&nbsp; F = −dI/dt</div>
          <div>η<sub>F</sub> = U / (U + ½w) &nbsp;·&nbsp; St = fA/U</div>
        </div>
      </div>
    </div>
  );
}
