"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── Physics ──────────────────────────────────────────────────────────────────
const RHO = 1.225;
const S = 7.5;
const C_CHORD = 0.75;

export function computePhysics(
  freq: number,
  amplitude: number,
  speed: number,
  twist: number,
  t: number
) {
  const omega = 2 * Math.PI * freq;
  const flapDot = amplitude * omega * Math.cos(omega * t);
  const flapDDot = -amplitude * omega * omega * Math.sin(omega * t);

  const alphaEff = twist - Math.atan2(flapDot, speed);
  const Ueff = Math.sqrt(speed * speed + flapDot * flapDot);

  const CL = 2 * Math.PI * alphaEff;
  const CD = 0.025 + 0.08 * alphaEff * alphaEff;

  const lift = 0.5 * RHO * Ueff * Ueff * S * CL;
  const profileDrag = 0.5 * RHO * Ueff * Ueff * S * CD;
  const addedMass = RHO * C_CHORD * C_CHORD * flapDDot * S;

  const gamma = Math.atan2(flapDot, speed);
  const thrust = Math.max(0, lift * Math.sin(gamma) - profileDrag * Math.cos(gamma));
  const drag = Math.abs(profileDrag);

  const St = (freq * amplitude) / speed;
  const Re = (speed * C_CHORD) / 1.5e-5;

  return { alphaEff, Ueff, CL, CD, lift, thrust, drag, addedMass, St, Re, flapDot };
}

// ─── Wing mesh ───────────────────────────────────────────────────────────────
function Wing({ side }: { side: 1 | -1 }) {
  const chord = 1.45;
  const span = 5.4;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(span, chord, 38, 12);
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const eta = Math.abs(x) / (span / 2);
      const taper = Math.max(0.15, 1.0 - 0.55 * eta);
      const camber = 0.12 * Math.sin(Math.PI * (y / chord + 0.5)) * taper;
      const sweep = 0.18 * side * eta * eta;
      pos.setY(i, y * taper + sweep);
      pos.setZ(i, camber);
    }

    geo.computeVertexNormals();
    return geo;
  }, [side]);

  return (
    <mesh geometry={geometry} rotation={[0, Math.PI / 2, 0]} position={[side * 2.75, 0, 0]}>
      <meshStandardMaterial
        color="#66aaff"
        side={THREE.DoubleSide}
        transparent
        opacity={0.88}
        roughness={0.38}
        metalness={0.02}
      />
    </mesh>
  );
}

// ─── Vortex wake (instanced mesh for performance) ─────────────────────────────
const PARTICLE_COUNT = 320;

function WakeParticles({ speed, freq, wakeStrength }: { speed: number; freq: number; wakeStrength: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        phase: Math.random() * Math.PI * 2,
        radius: 0.5 + Math.random() * 2.0,
        side: Math.random() < 0.5 ? -1 : 1,
        z: -Math.random() * 44,
      })),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const omega = 2 * Math.PI * freq;

    particles.forEach((p, i) => {
      p.z += 0.055 * speed * 0.016;

      const zLag = -p.z;
      const ringPhase = 0.65 * zLag + omega * t + p.phase;
      const ringRadius = p.radius * wakeStrength;

      const px = p.side * (1.2 + ringRadius * Math.cos(ringPhase));
      const py =
        -0.035 * zLag +
        ringRadius * 0.38 * Math.sin(ringPhase) -
        0.55 * wakeStrength * Math.sin(omega * t - 0.13 * zLag);

      if (p.z > 8) {
        p.z = -44 - Math.random() * 4;
        p.phase = Math.random() * Math.PI * 2;
        p.side = Math.random() < 0.5 ? -1 : 1;
        p.radius = 0.5 + Math.random() * 2.0;
      }

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

// ─── Bird (body + wings + animated force arrows) ──────────────────────────────
function Bird({
  freq,
  amplitude,
  twist,
  onPhysics,
}: {
  freq: number;
  amplitude: number;
  twist: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}) {
  const birdRef = useRef<THREE.Group>(null!);
  const leftRef = useRef<THREE.Group>(null!);
  const rightRef = useRef<THREE.Group>(null!);

  const liftArrow = useMemo(
    () => new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.2, 0), 1.5, 0x00ff77, 0.35, 0.22),
    []
  );
  const thrustArrow = useMemo(
    () => new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -0.25, 0), 1.5, 0xff4444, 0.35, 0.22),
    []
  );
  const dragArrow = useMemo(
    () => new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, -0.55, 0), 1.5, 0xffdd44, 0.35, 0.22),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const omega = 2 * Math.PI * freq;
    const flap = Math.sin(omega * t);

    const physics = computePhysics(freq, amplitude, 6, twist, t);
    onPhysics?.(physics);

    const strokeAngle = 0.62 * amplitude * flap;
    const pitchAngle = twist * Math.cos(omega * t);

    leftRef.current.rotation.z = strokeAngle;
    leftRef.current.rotation.x = pitchAngle;
    rightRef.current.rotation.z = -strokeAngle;
    rightRef.current.rotation.x = -pitchAngle;
    birdRef.current.position.y = 0.08 * Math.sin(omega * t + Math.PI / 5);

    liftArrow.setLength(Math.max(0.3, Math.min(5.5, Math.abs(physics.lift) * 0.008)), 0.35, 0.22);
    thrustArrow.setLength(Math.max(0.25, Math.min(4.5, physics.thrust * 0.018)), 0.35, 0.22);
    dragArrow.setLength(Math.max(0.25, Math.min(4.5, physics.drag * 0.018)), 0.35, 0.22);
  });

  return (
    <group ref={birdRef}>
      <mesh scale={[1.4, 0.8, 0.75]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color="#ffaa44" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.18, 0.62]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#ffc777" roughness={0.5} />
      </mesh>

      <group ref={leftRef}><Wing side={-1} /></group>
      <group ref={rightRef}><Wing side={1} /></group>

      <primitive object={liftArrow} />
      <primitive object={thrustArrow} />
      <primitive object={dragArrow} />
    </group>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────
export interface SceneProps {
  freq: number;
  amplitude: number;
  speed: number;
  twist: number;
  wakeStrength: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}

function Scene({ freq, amplitude, speed, twist, wakeStrength, onPhysics }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 8, 7]} intensity={1.2} />
      <directionalLight position={[-6, 2, -8]} intensity={0.55} color="#88bbff" />
      <gridHelper args={[60, 60, "#2c3440", "#161b22"]} />
      <Bird freq={freq} amplitude={amplitude} twist={twist} onPhysics={onPhysics} />
      <WakeParticles speed={speed} freq={freq} wakeStrength={wakeStrength} />
      <OrbitControls enableDamping dampingFactor={0.08} />
    </>
  );
}

// ─── Public component ────────────────────────────────────────────────────────
export default function FlappingWing3D(props: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 4.5, 13], fov: 60 }} style={{ background: "#05070a" }}>
      <Scene {...props} />
    </Canvas>
  );
}
