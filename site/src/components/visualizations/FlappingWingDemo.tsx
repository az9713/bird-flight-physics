"use client";

import { useState, useCallback } from "react";
import FlappingWing3D, { computePhysics } from "./FlappingWing3D";
import ParameterExplorer from "./ParameterExplorer";
import PhysicsReadout from "./PhysicsReadout";

const DEFAULT_PARAMS = {
  freq: 1.5,
  amplitude: 1.0,
  speed: 6.0,
  twist: 0.4,
  wakeStrength: 1.0,
};

type Physics = ReturnType<typeof computePhysics>;

export default function FlappingWingDemo() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [physics, setPhysics] = useState<Physics | null>(null);

  const handlePhysics = useCallback((p: Physics) => {
    setPhysics(p);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
      <div className="p-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
        3D Flapping Wing Aerodynamics — drag to orbit, scroll to zoom
      </div>

      {/* Canvas */}
      <div className="w-full h-[420px]">
        <FlappingWing3D
          {...params}
          onPhysics={handlePhysics}
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border-t border-slate-800">
        <ParameterExplorer params={params} onChange={setParams} />
        <PhysicsReadout physics={physics} />
      </div>

      {/* Equation strip */}
      <div className="px-3 pb-3">
        <div className="text-xs text-slate-500 font-mono space-y-0.5 bg-slate-900/60 rounded-lg p-3">
          <div>α<sub>eff</sub>(r,t) = θ(r,t) − tan⁻¹(ḣ/U)</div>
          <div>L′(r,t) = ½ρ U<sub>eff</sub>² c(r) C<sub>L</sub>(α<sub>eff</sub>)</div>
          <div>L′ = ρ U Γ &nbsp;·&nbsp; F ≈ −dI/dt &nbsp;·&nbsp; St = fA/U</div>
        </div>
      </div>
    </div>
  );
}
