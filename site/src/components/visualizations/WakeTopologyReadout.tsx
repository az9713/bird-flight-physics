"use client";

import { computePhysics } from "./WakeTopology3D";

type Physics = ReturnType<typeof computePhysics>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono py-0.5">
      <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-sky-300">{value}</span>
    </div>
  );
}

export default function WakeTopologyReadout({ physics }: { physics: Physics | null }) {
  if (!physics) {
    return (
      <div className="text-xs text-slate-500 p-3">Initializing simulation…</div>
    );
  }

  const { St, lambda, R, Gamma, I_ring, thrust, U_self, eta, regime } = physics;

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-300 mb-2">Live readout</div>
      <Row label="St = fA/U" value={St.toFixed(3)} />
      <Row label="λ = U/f (m)" value={lambda.toFixed(2)} />
      <Row label="R ring (m)" value={R.toFixed(2)} />
      <Row label="Γ (m²/s)" value={Gamma.toFixed(2)} />
      <div className="border-t border-slate-800 mt-1 pt-1">
        <Row label="I ring (kg·m/s)" value={I_ring.toFixed(2)} />
        <Row label="Thrust (N)" value={thrust.toFixed(1)} />
        <Row label="U self-induced (m/s)" value={U_self.toFixed(2)} />
        <Row label="η Froude" value={(eta * 100).toFixed(1) + " %"} />
      </div>
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div className="text-xs text-slate-400 italic">{regime}</div>
      </div>
    </div>
  );
}
