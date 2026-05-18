"use client";

import { useState, useCallback } from "react";
import AeroelasticWing3D, { computePhysics } from "./AeroelasticWing3D";
import AeroelasticWingParameterExplorer from "./AeroelasticWingParameterExplorer";
import AeroelasticWingReadout from "./AeroelasticWingReadout";
import type { AeroelasticParams } from "./AeroelasticWingParameterExplorer";

const DEFAULT_PARAMS: AeroelasticParams = {
  speed: 8.0,
  stiffness: 1.0,
  freq: 2.0,
  damping: 0.05,
};

type Physics = ReturnType<typeof computePhysics>;

export default function AeroelasticWingDemo() {
  const [params, setParams] = useState<AeroelasticParams>(DEFAULT_PARAMS);
  const [physics, setPhysics] = useState<Physics | null>(null);

  const handlePhysics = useCallback((p: Physics) => {
    setPhysics(p);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
      <div className="p-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
        3D Aeroelastic Wing — color shows bending stress; raise speed to trigger flutter
      </div>

      <div className="w-full h-[420px]">
        <AeroelasticWing3D {...params} onPhysics={handlePhysics} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border-t border-slate-800">
        <AeroelasticWingParameterExplorer params={params} onChange={setParams} />
        <AeroelasticWingReadout physics={physics} />
      </div>

      <div className="px-3 pb-3">
        <div className="text-xs text-slate-500 font-mono space-y-0.5 bg-slate-900/60 rounded-lg p-3">
          <div>Ca = ρU²L/E &nbsp;·&nbsp; U<sub>r</sub> = U/(fL) &nbsp;·&nbsp; δ/b ≈ 0.3 Ca</div>
          <div>θ<sub>tip</sub> ≈ 0.22 Ca &nbsp;·&nbsp; flutter: U<sub>r</sub> &gt; U<sub>r,crit</sub></div>
        </div>
      </div>
    </div>
  );
}
