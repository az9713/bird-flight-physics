"use client";

interface Params {
  freq: number;
  amplitude: number;
  speed: number;
  twist: number;
  wakeStrength: number;
}

interface SliderDef {
  key: keyof Params;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderDef[] = [
  { key: "freq", label: "Frequency f", unit: "Hz", min: 0.2, max: 6, step: 0.05 },
  { key: "amplitude", label: "Stroke amplitude A", unit: "m", min: 0.2, max: 3, step: 0.05 },
  { key: "speed", label: "Forward speed U", unit: "m/s", min: 1, max: 20, step: 0.25 },
  { key: "twist", label: "Spanwise twist θ", unit: "rad", min: 0, max: 1.2, step: 0.02 },
  { key: "wakeStrength", label: "Wake strength", unit: "", min: 0.2, max: 2.5, step: 0.05 },
];

export default function ParameterExplorer({
  params,
  onChange,
}: {
  params: Params;
  onChange: (next: Params) => void;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-slate-300">Parameters</div>
      {SLIDERS.map(({ key, label, unit, min, max, step }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="text-sky-300 font-mono">
              {params[key].toFixed(step < 0.1 ? 2 : 2)}
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
