"use client";

import { computePhysics } from "./FlappingWing3D";

type Physics = ReturnType<typeof computePhysics>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono py-0.5">
      <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-sky-300">{value}</span>
    </div>
  );
}

export default function PhysicsReadout({ physics }: { physics: Physics | null }) {
  if (!physics) {
    return (
      <div className="text-xs text-slate-500 p-3">Initializing simulation…</div>
    );
  }

  const { alphaEff, Ueff, CL, CD, lift, thrust, drag, addedMass, St, Re } = physics;

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-300 mb-2">Live readout</div>
      <Row label="St&nbsp;=&nbsp;fA/U" value={St.toFixed(3)} />
      <Row label="Re" value={Re.toExponential(2)} />
      <Row label="α<sub>eff</sub>&nbsp;(rad)" value={alphaEff.toFixed(3)} />
      <Row label="U<sub>eff</sub>&nbsp;(m/s)" value={Ueff.toFixed(2)} />
      <Row label="C<sub>L</sub>" value={CL.toFixed(2)} />
      <Row label="C<sub>D</sub>" value={CD.toFixed(3)} />
      <div className="border-t border-slate-800 mt-1 pt-1">
        <Row label="Lift&nbsp;(N)" value={lift.toFixed(1)} />
        <Row label="Thrust&nbsp;(N)" value={thrust.toFixed(1)} />
        <Row label="Drag&nbsp;(N)" value={drag.toFixed(1)} />
        <Row label="Added-mass&nbsp;∝" value={addedMass.toFixed(1)} />
      </div>
    </div>
  );
}
