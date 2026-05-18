"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const RHO = 1.225;
const RING_COUNT = 18;
const WAKE_DEPTH = 30;

export function computePhysics(
  freq: number,
  speed: number,
  amplitude: number,
  decay: number,
  t: number
) {
  const St = (freq * amplitude) / Math.max(0.5, speed);
  const lambda = speed / Math.max(0.1, freq);
  const R = Math.max(0.3, amplitude * 0.65);
  const a_core = Math.max(0.04, 0.07 * R);

  // Quasi-steady Kutta-Joukowski circulation
  const C_L_eff = 2 * Math.PI * 0.12;
  const Gamma = Math.max(0.05, C_L_eff * 0.75 * speed * amplitude * 0.5);

  // Hydrodynamic impulse per ring: I = ρΓπR²
  const I_ring = RHO * Gamma * Math.PI * R * R;

  // Thrust = impulse shed per unit time
  const thrust = I_ring * freq;

  // Ring self-induced velocity (thin-core Biot-Savart)
  const U_self = (Gamma / (4 * Math.PI * R)) * (Math.log(8 * R / a_core) - 0.25);

  // Froude efficiency
  const A_disk = Math.PI * R * R;
  const w_induced = thrust / (2 * RHO * A_disk * Math.max(0.5, speed));
  const eta = speed / (speed + 0.5 * w_induced);

  const regime =
    St < 0.2
      ? "Discrete rings (low St)"
      : St > 0.5
      ? "Ladder wake (high St)"
      : "Optimal band: 0.2–0.4";

  // suppress unused param warning
  void t;

  return { St, lambda, R, Gamma, I_ring, thrust, U_self, eta, regime };
}

const RING_COLORS = [0x44ccff, 0x66aaff, 0x55ddee] as const;

export interface SceneProps {
  freq: number;
  speed: number;
  amplitude: number;
  decay: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}

function Scene({ freq, speed, amplitude, decay, onPhysics }: SceneProps) {
  const ringMeshes = useRef<(THREE.Mesh | null)[]>(Array(RING_COUNT).fill(null));

  const simState = useRef({
    ringZ: Float32Array.from({ length: RING_COUNT }, (_, i) =>
      i < 10 ? -(i * 2.8) : -999
    ),
    ringAge: Float32Array.from({ length: RING_COUNT }, (_, i) =>
      i < 10 ? i * 0.45 : 0
    ),
    nextShedTime: 0.15,
  });

  const thrustArrow = useMemo(
    () =>
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0.6),
        1.5,
        0xff4444,
        0.4,
        0.26
      ),
    []
  );

  const ringGeo = useMemo(() => new THREE.TorusGeometry(1, 0.065, 12, 52), []);

  const ringMats = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, i) =>
        new THREE.MeshBasicMaterial({
          color: RING_COLORS[i % RING_COLORS.length],
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        })
      ),
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const state = simState.current;

    if (t >= state.nextShedTime) {
      let slot = -1;
      for (let i = 0; i < RING_COUNT; i++) {
        if (state.ringZ[i] < -(WAKE_DEPTH - 1)) {
          slot = i;
          break;
        }
      }
      if (slot >= 0) {
        state.ringZ[slot] = 0;
        state.ringAge[slot] = 0;
      }
      state.nextShedTime = t + 1 / Math.max(0.1, freq);
    }

    const physics = computePhysics(freq, speed, amplitude, decay, t);

    for (let i = 0; i < RING_COUNT; i++) {
      const mesh = ringMeshes.current[i];
      if (!mesh) continue;

      if (state.ringZ[i] < -(WAKE_DEPTH - 0.5)) {
        mesh.visible = false;
        continue;
      }

      state.ringZ[i] -= Math.max(0.5, speed) * delta;
      state.ringAge[i] += delta;

      if (state.ringZ[i] < -(WAKE_DEPTH - 0.5)) {
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;
      mesh.position.z = state.ringZ[i];

      const ringR = Math.max(0.3, amplitude * 0.65) * (1 + state.ringAge[i] * 0.018);
      mesh.scale.set(ringR, ringR, 1);

      const opacity = Math.max(0, 1 - decay * state.ringAge[i] * 0.18);
      (mesh.material as THREE.MeshBasicMaterial).opacity = opacity * 0.72;
    }

    thrustArrow.setLength(
      Math.max(0.3, Math.min(6, physics.thrust * 0.005)),
      0.4,
      0.26
    );

    onPhysics?.(physics);
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 9, 5]} intensity={1.1} />
      <gridHelper args={[40, 40, "#1a2535", "#0f1620"]} />

      {/* Bird body */}
      <mesh position={[0, 0, 0.3]}>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color="#ffaa44" roughness={0.45} />
      </mesh>

      {/* Wing stubs */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.9, 0, 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.05, 1.2, 10]} />
          <meshStandardMaterial color="#cc8833" roughness={0.5} />
        </mesh>
      ))}

      {/* Vortex rings */}
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { ringMeshes.current[i] = el; }}
          geometry={ringGeo}
          material={ringMats[i]}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        />
      ))}

      <primitive object={thrustArrow} />
      <OrbitControls enableDamping dampingFactor={0.08} />
    </>
  );
}

export default function WakeTopology3D(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [10, 7, 12], fov: 55 }}
      style={{ background: "#05070a" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
