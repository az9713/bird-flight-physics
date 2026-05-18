"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const LOG_RE_MIN = 2, LOG_RE_MAX = 6;
const K_MIN = 0.02, K_MAX = 1.0;
const N_RE = 22, N_K = 22;
const SCALE_X = 9, SCALE_Y = 3.2, SCALE_Z = 6;

export const MODEL_NAMES = ["Quasi-steady", "Panel / Theodorsen", "RANS / LES", "DNS"] as const;
export type ModelName = typeof MODEL_NAMES[number];

// Relative cost (DNS = 1e8 reference)
const MODEL_COSTS = [1, 200, 25000, 100_000_000];

function modelError(logRe: number, k: number, modelLevel: number): number {
  const Re = Math.pow(10, logRe);
  const lev = Re > 2000 && k > 0.28; // leading-edge vortex regime
  const levP = lev ? 0.42 : 0;

  switch (modelLevel) {
    case 0: // quasi-steady
      return Math.min(1, Math.max(0, k / 0.08 - 0.6) * 0.85 + levP + (Re < 200 ? 0.28 : 0));
    case 1: // panel / Theodorsen
      return Math.min(1, Math.max(0, k / 0.55 - 0.6) * 0.65 + levP * 0.7 + (Re < 600 ? 0.22 : 0));
    case 2: // RANS/LES
      return Math.min(1, levP * 0.25 + (Re < 1500 ? 0.35 : 0) + (k > 0.72 ? 0.18 : 0));
    case 3: // DNS
      return 0.015;
    default:
      return 0;
  }
}

const gridIndices = (() => {
  const idx: number[] = [];
  for (let i = 0; i < N_RE; i++) {
    for (let j = 0; j < N_K; j++) {
      const a = i * (N_K + 1) + j;
      const b = a + 1, c = a + (N_K + 1), d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  return new Uint32Array(idx);
})();

export function computePhysics(
  logRe: number,
  reducedFreq: number,
  modelLevel: number
) {
  const Re = Math.pow(10, logRe);
  const k = reducedFreq;

  const errors = MODEL_NAMES.map((_, i) => modelError(logRe, k, i));
  const selError = errors[modelLevel];
  const dnsError = errors[3];
  const selCost = MODEL_COSTS[modelLevel];
  const speedup = MODEL_COSTS[3] / selCost;
  const lev = Re > 2000 && k > 0.28;

  return {
    Re, k, logRe, modelLevel,
    modelName: MODEL_NAMES[modelLevel],
    selError,
    dnsError,
    selCost,
    speedup,
    isAdequate: selError < 0.15,
    lev,
    errors,
  };
}

interface SceneProps {
  logRe: number;
  reducedFreq: number;
  modelLevel: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}

function Scene({ logRe, reducedFreq, modelLevel, onPhysics }: SceneProps) {
  const nVerts = (N_RE + 1) * (N_K + 1);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const surfaceGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(gridIndices, 1));
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(nVerts * 3), 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(nVerts * 3), 3));
    return geo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const p = computePhysics(logRe, reducedFreq, modelLevel);

    const posAttr = surfaceGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = surfaceGeo.attributes.color as THREE.BufferAttribute;

    for (let i = 0; i <= N_RE; i++) {
      for (let j = 0; j <= N_K; j++) {
        const idx = i * (N_K + 1) + j;
        const lr = LOG_RE_MIN + (LOG_RE_MAX - LOG_RE_MIN) * (i / N_RE);
        const kv = K_MIN + (K_MAX - K_MIN) * (j / N_K);
        const err = modelError(lr, kv, modelLevel);
        const acc = 1 - err; // high = good

        const x = ((lr - LOG_RE_MIN) / (LOG_RE_MAX - LOG_RE_MIN) - 0.5) * SCALE_X;
        const y = acc * SCALE_Y;
        const z = ((kv - K_MIN) / (K_MAX - K_MIN) - 0.5) * SCALE_Z;

        posAttr.setXYZ(idx, x, y, z);

        // Color: green=accurate, yellow=marginal, red=inaccurate
        const hue = 0.05 + acc * 0.3;
        tempColor.setHSL(hue, 0.88, 0.42 + acc * 0.2);
        colAttr.setXYZ(idx, tempColor.r, tempColor.g, tempColor.b);
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    surfaceGeo.computeVertexNormals();

    // Operating point
    const op_acc = 1 - p.selError;
    const op_x = ((logRe - LOG_RE_MIN) / (LOG_RE_MAX - LOG_RE_MIN) - 0.5) * SCALE_X;
    const op_y = op_acc * SCALE_Y + 0.22;
    const op_z = ((reducedFreq - K_MIN) / (K_MAX - K_MIN) - 0.5) * SCALE_Z;
    if (opRef.current) opRef.current.position.set(op_x, op_y, op_z);

    onPhysics?.(p);
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />

      <mesh geometry={surfaceGeo}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Operating point */}
      <mesh ref={opRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaccff" emissiveIntensity={0.9} />
      </mesh>

      {/* Axis guides */}
      <mesh position={[0, -0.08, SCALE_Z / 2 + 0.3]}>
        <boxGeometry args={[SCALE_X, 0.03, 0.03]} />
        <meshBasicMaterial color="#334455" />
      </mesh>
      <mesh position={[SCALE_X / 2 + 0.3, -0.08, 0]}>
        <boxGeometry args={[0.03, 0.03, SCALE_Z]} />
        <meshBasicMaterial color="#334455" />
      </mesh>

      <gridHelper args={[12, 12, "#1a2535", "#0f1620"]} position={[0, -0.1, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} target={[0, 1.5, 0]} />
    </>
  );
}

export default function CfdComparison3D(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [10, 8, 10], fov: 52 }}
      style={{ background: "#05070a" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
