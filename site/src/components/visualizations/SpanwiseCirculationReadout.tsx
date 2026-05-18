"use client";

import { computePhysics } from "./SpanwiseCirculation3D";

type Physics = ReturnType<typeof computePhysics>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono py-0.5">
      <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-sky-300">{value}</span>
    </div>
  );
}

export default function SpanwiseCirculationReadout({ physics }: { physics: Physics | null }) {
  if (!physics) {
    return <div className="text-xs text-slate-500 p-3">Initializing simulation…</div>;
  }

  const { aspectRatio, e, CDi, L, Di, Gamma_max, alpha_i, r_tip, b, c_root } = physics;

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-300 mb-2">Live readout</div>
      <Row label="AR = b²/S" value={aspectRatio.toFixed(1)} />
      <Row label="e (Oswald)" value={e.toFixed(3)} />
      <Row label="C<sub>Di</sub> = C<sub>L</sub>²/πeAR" value={CDi.toFixed(4)} />
      <Row label="α<sub>i</sub> (rad)" value={alpha_i.toFixed(4)} />
      <div className="border-t border-slate-800 mt-1 pt-1">
        <Row label="b (m)" value={b.toFixed(2)} />
        <Row label="c root (m)" value={c_root.toFixed(2)} />
        <Row label="Γ<sub>max</sub> (m²/s)" value={Gamma_max.toFixed(2)} />
        <Row label="r<sub>tip</sub> vortex (m)" value={r_tip.toFixed(3)} />
      </div>
      <div className="border-t border-slate-800 mt-1 pt-1">
        <Row label="Lift L (N)" value={L.toFixed(1)} />
        <Row label="Induced drag D<sub>i</sub> (N)" value={Di.toFixed(2)} />
      </div>
    </div>
  );
}
