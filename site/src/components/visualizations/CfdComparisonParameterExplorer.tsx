"use client";

import { MODEL_NAMES } from "./CfdComparison3D";

export interface CfdParams {
  logRe: number;
  reducedFreq: number;
  modelLevel: number;
}

export default function CfdComparisonParameterExplorer({
  params,
  onChange,
}: {
  params: CfdParams;
  onChange: (next: CfdParams) => void;
}) {
  const re = Math.pow(10, params.logRe);
  const reStr = re >= 1e6 ? (re / 1e6).toFixed(1) + "M"
    : re >= 1e3 ? (re / 1e3).toFixed(1) + "k"
    : re.toFixed(0);

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-slate-300">Parameters</div>

      {/* Re slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Reynolds number Re</span>
          <span className="text-sky-300 font-mono">{reStr}</span>
        </div>
        <input
          type="range" min={2} max={6} step={0.05}
          value={params.logRe}
          onChange={(e) => onChange({ ...params, logRe: Number(e.target.value) })}
          className="w-full accent-sky-500"
        />
      </div>

      {/* k slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Reduced frequency k</span>
          <span className="text-sky-300 font-mono">{params.reducedFreq.toFixed(2)}</span>
        </div>
        <input
          type="range" min={0.02} max={1.0} step={0.02}
          value={params.reducedFreq}
          onChange={(e) => onChange({ ...params, reducedFreq: Number(e.target.value) })}
          className="w-full accent-sky-500"
        />
      </div>

      {/* Model selector */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Model fidelity</span>
          <span className="text-sky-300 font-mono">{MODEL_NAMES[params.modelLevel]}</span>
        </div>
        <input
          type="range" min={0} max={3} step={1}
          value={params.modelLevel}
          onChange={(e) => onChange({ ...params, modelLevel: Number(e.target.value) })}
          className="w-full accent-sky-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-0.5">
          <span>Q-S</span><span>Panel</span><span>RANS</span><span>DNS</span>
        </div>
      </div>
    </div>
  );
}
