"use client";

export interface SpanwiseParams {
  aspectRatio: number;
  taper: number;
  cl: number;
  winglet: number;
}

interface SliderDef {
  key: keyof SpanwiseParams;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderDef[] = [
  { key: "aspectRatio", label: "Aspect ratio AR",    unit: "",   min: 2,   max: 20,  step: 0.5  },
  { key: "taper",       label: "Taper ratio λ",      unit: "",   min: 0.2, max: 1.0, step: 0.02 },
  { key: "cl",          label: "Lift coefficient CL", unit: "",  min: 0.2, max: 1.5, step: 0.05 },
  { key: "winglet",     label: "Winglet height/b",   unit: "",   min: 0,   max: 0.15,step: 0.005},
];

export default function SpanwiseCirculationParameterExplorer({
  params,
  onChange,
}: {
  params: SpanwiseParams;
  onChange: (next: SpanwiseParams) => void;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-slate-300">Parameters</div>
      {SLIDERS.map(({ key, label, unit, min, max, step }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="text-sky-300 font-mono">
              {params[key].toFixed(step < 0.1 ? 3 : step < 1 ? 2 : 1)}
              {unit ? ` ${unit}` : ""}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={params[key]}
            onChange={(e) =>
              onChange({ ...params, [key]: Number(e.target.value) })
            }
            className="w-full accent-sky-500"
          />
        </div>
      ))}
    </div>
  );
}
