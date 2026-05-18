"use client";

import { computePhysics } from "./CfdComparison3D";

type Physics = ReturnType<typeof computePhysics>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono py-0.5">
      <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-sky-300">{value}</span>
    </div>
  );
}

export default function CfdComparisonReadout({ physics }: { physics: Physics | null }) {
  if (!physics) {
    return <div className="text-xs text-slate-500 p-3">Initializing simulation…</div>;
  }

  const { Re, k, modelName, selError, dnsError, speedup, isAdequate, lev } = physics;

  const errColor = selError < 0.15 ? "text-green-400" : selError < 0.35 ? "text-yellow-400" : "text-red-400";
  const adequateColor = isAdequate ? "text-green-400" : "text-red-400";

  const speedupStr = speedup >= 1e6 ? (speedup / 1e6).toFixed(0) + "M×"
    : speedup >= 1e3 ? (speedup / 1e3).toFixed(0) + "k×"
    : speedup.toFixed(0) + "×";

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-300 mb-2">Live readout</div>
      <Row label="Re" value={Re >= 1e6 ? (Re / 1e6).toFixed(1) + "M" : Re >= 1e3 ? (Re / 1e3).toFixed(1) + "k" : Re.toFixed(0)} />
      <Row label="k (reduced freq)" value={k.toFixed(2)} />
      <Row label="LEV regime" value={lev ? "Yes" : "No"} />
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div className="flex justify-between text-xs font-mono py-0.5">
          <span className="text-slate-400">Model: {modelName}</span>
        </div>
        <div className="flex justify-between text-xs font-mono py-0.5">
          <span className="text-slate-400">Error vs DNS</span>
          <span className={errColor}>{(selError * 100).toFixed(1)} %</span>
        </div>
        <Row label="DNS error" value={(dnsError * 100).toFixed(1) + " %"} />
        <Row label="Speedup vs DNS" value={speedupStr} />
      </div>
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">Model adequate?</span>
          <span className={`font-bold ${adequateColor}`}>{isAdequate ? "Yes (< 15%)" : "No (> 15%)"}</span>
        </div>
      </div>
    </div>
  );
}
