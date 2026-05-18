"use client";

export interface StrouhalParams {
  freq: number;
  amplitude: number;
  speed: number;
}

interface SliderDef {
  key: keyof StrouhalParams;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderDef[] = [
  { key: "freq",      label: "Frequency f",       unit: "Hz",  min: 0.5, max: 6,   step: 0.1  },
  { key: "amplitude", label: "Stroke amplitude A", unit: "m",  min: 0.3, max: 2.5, step: 0.05 },
  { key: "speed",     label: "Forward speed U",    unit: "m/s",min: 2,   max: 15,  step: 0.25 },
];

export default function StrouhalExplorerParameterExplorer({
  params,
  onChange,
}: {
  params: StrouhalParams;
  onChange: (next: StrouhalParams) => void;
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
      <div className="text-xs text-slate-500 pt-1 border-t border-slate-800">
        Orange dots = Albatross, Goose, Gull, Pigeon — white dot = your operating point
      </div>
    </div>
  );
}
