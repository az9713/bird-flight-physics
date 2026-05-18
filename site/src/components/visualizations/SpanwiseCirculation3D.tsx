"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const RHO = 1.225;
const U_FLIGHT = 9.0;
const S_REF = 0.5;

export function computePhysics(
  aspectRatio: number,
  taper: number,
  cl: number,
  winglet: number
) {
  const b = Math.sqrt(aspectRatio * S_REF);
  const c_root = (2 * S_REF) / (b * (1 + taper));

  // Oswald efficiency: elliptic = 1, rectangular ≈ 0.85, tapered improves it
  const e_base = 1.0 - 0.045 * Math.pow(aspectRatio, 0.68) * 0.001; // AR correction (small)
  const e_taper = 0.985 - 0.09 * Math.pow(1 - taper, 1.5);
  const e_winglet_gain = Math.min(0.07, winglet / 0.15 * 0.07);
  const e = Math.min(1.0, Math.max(0.5, e_base * e_taper + e_winglet_gain));

  const CDi = (cl * cl) / (Math.PI * e * aspectRatio);
  const q = 0.5 * RHO * U_FLIGHT * U_FLIGHT;
  const L = q * S_REF * cl;
  const Di = q * S_REF * CDi;

  // Max bound circulation (root, elliptic)
  const Gamma_max = (cl * c_root * U_FLIGHT) / 2;

  // Induced angle (uniform for elliptic)
  const alpha_i = cl / (Math.PI * aspectRatio);

  // Tip vortex core radius estimate
  const r_tip = 0.04 * b;

  return { aspectRatio, taper, cl, winglet, e, CDi, L, Di, Gamma_max, alpha_i, r_tip, b, c_root };
}

const N_BARS = 30; // per wing side
const TOTAL_BARS = N_BARS * 2;
const TIP_VTX_PTS = 60;

interface SceneProps {
  aspectRatio: number;
  taper: number;
  cl: number;
  winglet: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}

function Scene({ aspectRatio, taper, cl, winglet, onPhysics }: SceneProps) {
  const barsRef = useRef<THREE.InstancedMesh>(null!);
  const leftVtxRef = useRef<THREE.Points>(null!);
  const rightVtxRef = useRef<THREE.Points>(null!);
  const wingMeshRef = useRef<THREE.Mesh>(null!);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const barsGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const barsMat = useMemo(
    () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4 }),
    []
  );

  // Tip vortex geometry (updated imperatively)
  const tipGeoL = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(TIP_VTX_PTS * 3), 3));
    return geo;
  }, []);
  const tipGeoR = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(TIP_VTX_PTS * 3), 3));
    return geo;
  }, []);
  const tipMat = useMemo(
    () => new THREE.PointsMaterial({ color: 0x44ccff, size: 0.08, transparent: true, opacity: 0.75 }),
    []
  );

  useFrame(() => {
    const p = computePhysics(aspectRatio, taper, cl, winglet);

    // Visualization scale: b_vis = half-span in scene units
    const b_vis = Math.min(5.5, Math.max(1.5, Math.sqrt(aspectRatio) * 1.4));
    const c_root_vis = Math.min(2.0, Math.max(0.4, 2.5 / b_vis));

    // Update wing mesh transform
    if (wingMeshRef.current) {
      wingMeshRef.current.scale.set(b_vis * 2, 1, c_root_vis * (1 + taper) / 2);
    }

    // Update circulation bars
    if (barsRef.current) {
      for (let i = 0; i < TOTAL_BARS; i++) {
        const side = i < N_BARS ? -1 : 1;
        const j = i % N_BARS;
        const eta = (j + 0.5) / N_BARS; // 0=inboard, 1=tip
        const x = side * eta * b_vis;

        // Elliptic distribution (corrected for taper)
        const elliptic = Math.sqrt(Math.max(0, 1 - eta * eta));
        const taperCorr = 0.85 + 0.15 * taper - 0.08 * (1 - taper) * eta;
        const GammaNorm = elliptic * taperCorr;
        const height = Math.max(0.04, GammaNorm * cl * 1.8);

        const barWidth = (b_vis / N_BARS) * 0.82;

        dummy.position.set(x, height / 2, 0);
        dummy.scale.set(barWidth, height, 0.12);
        dummy.updateMatrix();
        barsRef.current.setMatrixAt(i, dummy.matrix);

        // Color: root = sky blue, tip = cyan
        const hue = 0.58 + eta * 0.08;
        const lightness = 0.45 + (1 - eta) * 0.15;
        tempColor.setHSL(hue, 0.85, lightness);
        barsRef.current.setColorAt(i, tempColor);
      }
      barsRef.current.instanceMatrix.needsUpdate = true;
      if (barsRef.current.instanceColor) barsRef.current.instanceColor.needsUpdate = true;
    }

    // Update tip vortex spirals
    const spiralRadius = 0.12 + winglet * 2.5;
    for (let k = 0; k < 2; k++) {
      const geo = k === 0 ? tipGeoL : tipGeoR;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const sideX = k === 0 ? -b_vis : b_vis;
      const sign = k === 0 ? 1 : -1;

      for (let j = 0; j < TIP_VTX_PTS; j++) {
        const angle = (j / TIP_VTX_PTS) * Math.PI * 6;
        const fade = 1 - j / TIP_VTX_PTS;
        const r = spiralRadius * (1 - j / TIP_VTX_PTS * 0.3);
        const dz = (j / TIP_VTX_PTS) * 5.5;
        const dx = sign * r * Math.sin(angle) * 0.5;
        const dy = r * Math.cos(angle) - spiralRadius;

        pos.setXYZ(j, sideX + dx, dy, dz);
      }
      pos.needsUpdate = true;
      geo.computeBoundingSphere();

      if (k === 0 && leftVtxRef.current) leftVtxRef.current.visible = true;
      if (k === 1 && rightVtxRef.current) rightVtxRef.current.visible = true;
    }

    onPhysics?.(p);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 10, 4]} intensity={1.1} />
      <gridHelper args={[20, 20, "#1a2535", "#0f1620"]} />

      {/* Wing surface */}
      <mesh ref={wingMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#335577" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Bird body */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ffaa44" roughness={0.45} />
      </mesh>

      {/* Circulation bars */}
      <instancedMesh ref={barsRef} args={[barsGeo, barsMat, TOTAL_BARS]}>
      </instancedMesh>

      {/* Tip vortex spirals */}
      <points ref={leftVtxRef} geometry={tipGeoL} material={tipMat} />
      <points ref={rightVtxRef} geometry={tipGeoR} material={tipMat} />

      <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0.5, 1]} />
    </>
  );
}

export default function SpanwiseCirculation3D(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 9, 7], fov: 52 }}
      style={{ background: "#05070a" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
