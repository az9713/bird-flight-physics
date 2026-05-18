"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const F_MIN = 0.5, F_MAX = 6.0;
const A_MIN = 0.3, A_MAX = 2.5;
const N_F = 22, N_A = 22;
const SCALE_X = 8, SCALE_Y = 3.5, SCALE_Z = 6;

function computeEta(St: number): number {
  if (St <= 0) return 0;
  const St_opt = 0.28;
  const sigma = 0.12;
  const eta_max = 0.84;
  const gauss = Math.exp(-Math.pow((St - St_opt) / sigma, 2) * 0.5);
  const ramp = Math.min(1, St / 0.14);
  return eta_max * gauss * ramp;
}

export function computePhysics(
  freq: number,
  amplitude: number,
  speed: number
) {
  const St = (freq * amplitude) / Math.max(0.5, speed);
  const eta = computeEta(St);
  const k = (Math.PI * freq * 0.75) / Math.max(0.5, speed); // reduced frequency, c=0.75m
  const regime =
    St < 0.2
      ? "Low-St: nearly steady, low efficiency"
      : St > 0.45
      ? "High-St: added-mass dominated"
      : "Efficient band: 0.2–0.45";

  return { St, eta, k, regime, freq, amplitude, speed };
}

// Pre-build grid indices (static)
const gridIndices = (() => {
  const idx: number[] = [];
  for (let i = 0; i < N_F; i++) {
    for (let j = 0; j < N_A; j++) {
      const a = i * (N_A + 1) + j;
      const b = a + 1;
      const c = a + (N_A + 1);
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  return new Uint32Array(idx);
})();

const SPECIES = [
  { name: "Albatross", f: 1.1, A: 1.8 },
  { name: "Goose",     f: 2.5, A: 0.9 },
  { name: "Gull",      f: 2.8, A: 0.8 },
  { name: "Pigeon",    f: 5.5, A: 0.38 },
] as const;

interface SceneProps {
  freq: number;
  amplitude: number;
  speed: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}

function Scene({ freq, amplitude, speed, onPhysics }: SceneProps) {
  const surfaceGeoRef = useRef<THREE.BufferGeometry>(null!);
  const opPointRef = useRef<THREE.Mesh>(null!);

  const nVerts = (N_F + 1) * (N_A + 1);

  const surfaceGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(gridIndices, 1));
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(nVerts * 3), 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(nVerts * 3), 3));
    surfaceGeoRef.current = geo;
    return geo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tempColor = useMemo(() => new THREE.Color(), []);

  // Species sphere refs
  const speciesRefs = useRef<(THREE.Mesh | null)[]>(SPECIES.map(() => null));

  useFrame(() => {
    const p = computePhysics(freq, amplitude, speed);
    const U = Math.max(0.5, speed);

    const posAttr = surfaceGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = surfaceGeo.attributes.color as THREE.BufferAttribute;

    for (let i = 0; i <= N_F; i++) {
      for (let j = 0; j <= N_A; j++) {
        const idx = i * (N_A + 1) + j;
        const f_val = F_MIN + (F_MAX - F_MIN) * (i / N_F);
        const A_val = A_MIN + (A_MAX - A_MIN) * (j / N_A);
        const St = (f_val * A_val) / U;
        const eta = computeEta(St);

        const x = ((f_val - F_MIN) / (F_MAX - F_MIN) - 0.5) * SCALE_X;
        const y = eta * SCALE_Y;
        const z = ((A_val - A_MIN) / (A_MAX - A_MIN) - 0.5) * SCALE_Z;

        posAttr.setXYZ(idx, x, y, z);

        // Color: red→yellow→green based on efficiency
        const t = Math.min(1, eta / 0.8);
        const inBand = St >= 0.2 && St <= 0.45 ? 1 : 0;
        tempColor.setHSL(0.05 + t * 0.3 + inBand * 0.05, 0.9, 0.45 + t * 0.2);
        colAttr.setXYZ(idx, tempColor.r, tempColor.g, tempColor.b);
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    surfaceGeo.computeVertexNormals();

    // Operating point sphere
    const op_St = p.St;
    const op_eta = computeEta(op_St);
    const op_x = ((p.freq - F_MIN) / (F_MAX - F_MIN) - 0.5) * SCALE_X;
    const op_y = op_eta * SCALE_Y + 0.2;
    const op_z = ((p.amplitude - A_MIN) / (A_MAX - A_MIN) - 0.5) * SCALE_Z;
    if (opPointRef.current) {
      opPointRef.current.position.set(op_x, op_y, op_z);
    }

    // Species dots on surface
    SPECIES.forEach((sp, idx2) => {
      const mesh = speciesRefs.current[idx2];
      if (!mesh) return;
      const sp_St = (sp.f * sp.A) / U;
      const sp_eta = computeEta(sp_St);
      const sx = ((sp.f - F_MIN) / (F_MAX - F_MIN) - 0.5) * SCALE_X;
      const sy = sp_eta * SCALE_Y + 0.18;
      const sz = ((sp.A - A_MIN) / (A_MAX - A_MIN) - 0.5) * SCALE_Z;
      mesh.position.set(sx, sy, sz);
    });

    onPhysics?.(p);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />

      {/* Efficiency surface */}
      <mesh geometry={surfaceGeo}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Operating point */}
      <mesh ref={opPointRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#88aaff" emissiveIntensity={0.8} />
      </mesh>

      {/* Species dots */}
      {SPECIES.map((sp, i) => (
        <mesh
          key={sp.name}
          ref={(el) => { speciesRefs.current[i] = el; }}
        >
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color="#ffaa44" emissive="#ff6600" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Axis labels via thin boxes */}
      <mesh position={[0, -0.1, SCALE_Z / 2 + 0.3]}>
        <boxGeometry args={[SCALE_X, 0.03, 0.03]} />
        <meshBasicMaterial color="#334455" />
      </mesh>
      <mesh position={[SCALE_X / 2 + 0.3, -0.1, 0]}>
        <boxGeometry args={[0.03, 0.03, SCALE_Z]} />
        <meshBasicMaterial color="#334455" />
      </mesh>

      <gridHelper args={[12, 12, "#1a2535", "#0f1620"]} position={[0, -0.12, 0]} />
      <OrbitControls enableDamping dampingFactor={0.08} target={[0, 1.5, 0]} />
    </>
  );
}

export default function StrouhalExplorer3D(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [10, 8, 10], fov: 52 }}
      style={{ background: "#05070a" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
