# React Three Fiber Patterns for Scientific Visualization

## Core Component Structure

Every simulation follows this four-file pattern:

```
MySimulation.tsx       — R3F Canvas + Scene (pure 3D, no UI)
MySimulationDemo.tsx   — Combined wrapper: Canvas + sliders + live readout
MySimulationLazy.tsx   — Client-side lazy loader (ssr: false)
ParameterExplorer.tsx  — Reusable slider panel
PhysicsReadout.tsx     — Reusable live numbers display
```

---

## Simulation Component Template

```tsx
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ── Export physics computation so PhysicsReadout can use same function ──────
export function computePhysics(param1: number, param2: number, t: number) {
  // Pure math — no Three.js, no React
  const result = /* ... */;
  return { result, /* other derived quantities */ };
}

// ── Scene (the actual 3D content) ────────────────────────────────────────────
function Scene({ param1, param2, onPhysics }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const physics = computePhysics(param1, param2, t);
    onPhysics?.(physics);

    // Mutate Three.js objects directly — do NOT set React state here
    meshRef.current.position.y = physics.result;
  });

  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 8, 7]} intensity={1.2} />
      <gridHelper args={[60, 60, "#2c3440", "#161b22"]} />

      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#66aaff" />
      </mesh>

      <OrbitControls enableDamping dampingFactor={0.08} />
    </>
  );
}

// ── Public props ─────────────────────────────────────────────────────────────
export interface SceneProps {
  param1: number;
  param2: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}

// ── Canvas wrapper ───────────────────────────────────────────────────────────
export default function MySimulation(props: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 4.5, 13], fov: 60 }} style={{ background: "#05070a" }}>
      <Scene {...props} />
    </Canvas>
  );
}
```

---

## useFrame — The Animation Loop

`useFrame` runs every render frame (~60fps). Key rules:
- **Never set React state inside `useFrame`** — causes re-renders every frame (disaster)
- **Mutate Three.js objects directly**: `meshRef.current.position.y = ...`
- **Call `onPhysics(result)` sparingly** — the callback sets React state in the Demo wrapper; this is OK because the Demo wrapper uses `useCallback`

```tsx
useFrame(({ clock }) => {
  const t = clock.getElapsedTime();
  // ✅ Direct mutation
  meshRef.current.rotation.y = t;
  meshRef.current.position.y = Math.sin(t);
  // ✅ Callback for UI update (causes one re-render per frame — acceptable)
  onPhysics?.({ angle: Math.sin(t), velocity: Math.cos(t) });
});
```

---

## Force Arrows (ArrowHelper)

Use `THREE.ArrowHelper` for displaying vectors (lift, thrust, gravity, etc.):

```tsx
const liftArrow = useMemo(
  () => new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),        // initial direction
    new THREE.Vector3(0, 0.2, 0),      // origin
    1.5,                                // initial length
    0x00ff77,                           // color (hex number, not string)
    0.35,                               // head length
    0.22                                // head width
  ),
  []
);

// In useFrame:
liftArrow.setLength(Math.max(0.3, Math.min(5.5, Math.abs(forceValue) * 0.008)), 0.35, 0.22);
liftArrow.setDirection(new THREE.Vector3(0, Math.sign(forceValue), 0));

// In JSX:
<primitive object={liftArrow} />
```

---

## Instanced Mesh (Particle Systems)

For 100+ identical objects (particles, vortex wake, etc.) use `instancedMesh` — it's a single draw call:

```tsx
const PARTICLE_COUNT = 320;

function Particles({ speed, freq }: { speed: number; freq: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Particle state (mutable, NOT React state)
  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, () => ({
      phase: Math.random() * Math.PI * 2,
      radius: 0.5 + Math.random() * 2.0,
      z: -Math.random() * 44,
    })),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      // Update particle position
      p.z += 0.055 * speed * 0.016;
      if (p.z > 8) { p.z = -44; p.phase = Math.random() * Math.PI * 2; }

      const px = Math.cos(p.phase + t) * p.radius;
      const py = Math.sin(p.phase + t) * p.radius * 0.5;

      dummy.position.set(px, py, p.z);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial color="#44ccff" transparent opacity={0.74} />
    </instancedMesh>
  );
}
```

---

## Geometry with Custom Vertex Modification

For wing-like or deformable shapes, modify `PlaneGeometry` vertices directly:

```tsx
const geometry = useMemo(() => {
  const geo = new THREE.PlaneGeometry(span, chord, segmentsX, segmentsY);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const eta = Math.abs(x) / (span / 2);          // 0→1 spanwise
    const taper = Math.max(0.15, 1.0 - 0.55 * eta);
    const camber = 0.12 * Math.sin(Math.PI * (y / chord + 0.5)) * taper;
    pos.setZ(i, camber);                            // lift the surface
  }

  geo.computeVertexNormals();
  return geo;
}, []); // recompute only when shape params change
```

---

## Demo Wrapper Pattern

The Demo wrapper manages parameter state and feeds it into both the canvas and the UI:

```tsx
"use client";

import { useState, useCallback } from "react";
import MySimulation, { computePhysics } from "./MySimulation";
import ParameterExplorer from "./ParameterExplorer";
import PhysicsReadout from "./PhysicsReadout";

type Physics = ReturnType<typeof computePhysics>;

const DEFAULTS = { param1: 1.5, param2: 6.0 };

export default function MySimulationDemo() {
  const [params, setParams] = useState(DEFAULTS);
  const [physics, setPhysics] = useState<Physics | null>(null);

  // useCallback prevents re-creating the function every render
  const handlePhysics = useCallback((p: Physics) => setPhysics(p), []);

  return (
    <div className="my-8 rounded-2xl border border-slate-700 overflow-hidden bg-slate-950">
      <div className="p-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
        3D Simulation — drag to orbit, scroll to zoom
      </div>

      <div className="w-full h-[420px]">
        <MySimulation {...params} onPhysics={handlePhysics} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border-t border-slate-800">
        <ParameterExplorer params={params} onChange={setParams} />
        <PhysicsReadout physics={physics} />
      </div>
    </div>
  );
}
```

---

## Parameter Slider Panel

```tsx
"use client";

interface Params { param1: number; param2: number; /* ... */ }

interface SliderDef {
  key: keyof Params;
  label: string;
  unit: string;
  min: number; max: number; step: number;
}

const SLIDERS: SliderDef[] = [
  { key: "param1", label: "Parameter 1", unit: "unit", min: 0.1, max: 5, step: 0.1 },
  { key: "param2", label: "Parameter 2", unit: "m/s", min: 1, max: 20, step: 0.5 },
];

export default function ParameterExplorer({
  params, onChange,
}: { params: Params; onChange: (next: Params) => void }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-slate-300">Parameters</div>
      {SLIDERS.map(({ key, label, unit, min, max, step }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="text-sky-300 font-mono">
              {params[key].toFixed(2)}{unit ? ` ${unit}` : ""}
            </span>
          </div>
          <input
            type="range" min={min} max={max} step={step} value={params[key]}
            onChange={(e) => onChange({ ...params, [key]: Number(e.target.value) })}
            className="w-full accent-sky-500"
          />
        </div>
      ))}
    </div>
  );
}
```

---

## Live Physics Readout

```tsx
"use client";
import { computePhysics } from "./MySimulation";
type Physics = ReturnType<typeof computePhysics>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono py-0.5">
      <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-sky-300">{value}</span>
    </div>
  );
}

export default function PhysicsReadout({ physics }: { physics: Physics | null }) {
  if (!physics) return <div className="text-xs text-slate-500 p-3">Initializing…</div>;

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-0.5">
      <div className="text-xs font-semibold text-slate-300 mb-2">Live readout</div>
      {/* Add rows for each derived quantity */}
      <Row label="Energy (J)" value={physics.energy.toFixed(2)} />
      <Row label="Period (s)" value={physics.period.toFixed(3)} />
    </div>
  );
}
```

---

## Choosing Camera Position

| Scene type | Camera position | FOV |
|------------|----------------|-----|
| Wide horizontal (wings, orbits) | `[0, 4.5, 13]` | 60 |
| Vertical (pendulum, column) | `[0, 0, 10]` | 50 |
| Isometric feel | `[8, 6, 8]` | 45 |
| Close detail | `[0, 0, 5]` | 75 |

---

## Color Conventions for Forces / Quantities

Consistent colors make force arrows immediately readable:

| Color | Hex | Use |
|-------|-----|-----|
| Green | `0x00ff77` | Lift / upward forces |
| Red | `0xff4444` | Thrust / driving force |
| Yellow | `0xffdd44` | Drag / resistance |
| Cyan | `0x44ccff` | Vortex / fluid particles |
| Orange | `0xffaa44` | Body / structure |
| Blue | `0x66aaff` | Wings / surfaces |
