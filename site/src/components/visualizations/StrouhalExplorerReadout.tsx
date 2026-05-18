"use client";

import { computePhysics } from "./StrouhalExplorer3D";

type Physics = ReturnType<typeof computePhysics>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono py-0.5">
      <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-sky-300">{value}</span>
    </div>
  );
}

export default function StrouhalExplorerReadout({ physics }: { physics: Physics | null }) {
  if (!physics) {
    return <div className="text-xs text-slate-500 p-3">Initializing simulation…</div>;
  }

  const { St, eta, k, regime } = physics;

  const etaColor =
    eta > 0.65
      ? "text-green-400"
      : eta > 0.35
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-300 mb-2">Live readout</div>
      <Row label="St = fA/U" value={St.toFixed(3)} />
      <Row label="k = πfc/U" value={k.toFixed(3)} />
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div className="flex justify-between text-xs font-mono py-0.5">
          <span className="text-slate-400">η<sub>p</sub> (propulsive)</span>
          <span className={`font-bold ${etaColor}`}>{(eta * 100).toFixed(1)} %</span>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div className="text-xs text-slate-400 italic leading-relaxed">{regime}</div>
      </div>
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div className="text-xs text-slate-500">
          Efficient band: St = 0.20–0.45
        </div>
      </div>
    </div>
  );
}
