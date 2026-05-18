"use client";

export interface AeroelasticParams {
  speed: number;
  stiffness: number;
  freq: number;
  damping: number;
}

interface SliderDef {
  key: keyof AeroelasticParams;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderDef[] = [
  { key: "speed",     label: "Flow speed U",       unit: "m/s", min: 2,    max: 15,  step: 0.25 },
  { key: "stiffness", label: "Wing stiffness E",    unit: "",    min: 0.2,  max: 3.0, step: 0.05 },
  { key: "freq",      label: "Flapping freq f",     unit: "Hz",  min: 0.5,  max: 6,   step: 0.1  },
  { key: "damping",   label: "Structural damping ζ",unit: "",    min: 0.01, max: 0.2, step: 0.005},
];

export default function AeroelasticWingParameterExplorer({
  params,
  onChange,
}: {
  params: AeroelasticParams;
  onChange: (next: AeroelasticParams) => void;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-slate-300">Parameters</div>
      {SLIDERS.map(({ key, label, unit, min, max, step }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="text-sky-300 font-mono">
              {params[key].toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 2)}
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
