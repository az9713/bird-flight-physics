"use client";

import { computePhysics } from "./AeroelasticWing3D";

type Physics = ReturnType<typeof computePhysics>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono py-0.5">
      <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-sky-300">{value}</span>
    </div>
  );
}

export default function AeroelasticWingReadout({ physics }: { physics: Physics | null }) {
  if (!physics) {
    return <div className="text-xs text-slate-500 p-3">Initializing simulation…</div>;
  }

  const { Ca, Ur, Ur_flutter, flutter_margin, delta_tip_norm, theta_tip, alpha_eff, thrust, flutter_label } = physics;

  const labelColor = flutter_label.startsWith("FLUTTER")
    ? "text-red-400"
    : flutter_label.startsWith("Near")
    ? "text-yellow-400"
    : "text-green-400";

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-300 mb-2">Live readout</div>
      <Row label="Ca = ρU²L/E" value={Ca.toFixed(3)} />
      <Row label="U<sub>r</sub> = U/(fL)" value={Ur.toFixed(2)} />
      <Row label="U<sub>r,flutter</sub>" value={Ur_flutter.toFixed(2)} />
      <Row label="Flutter margin" value={(flutter_margin * 100).toFixed(1) + " %"} />
      <div className="border-t border-slate-800 mt-1 pt-1">
        <Row label="δ<sub>tip</sub>/b" value={delta_tip_norm.toFixed(3)} />
        <Row label="θ<sub>tip</sub> (rad)" value={theta_tip.toFixed(3)} />
        <Row label="α<sub>eff</sub> (rad)" value={alpha_eff.toFixed(3)} />
        <Row label="Thrust (N)" value={thrust.toFixed(1)} />
      </div>
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div className={`text-xs font-semibold ${labelColor}`}>{flutter_label}</div>
      </div>
    </div>
  );
}
