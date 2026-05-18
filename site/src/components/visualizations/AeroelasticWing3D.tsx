"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const RHO = 1.225;
const L_SEMI = 0.375; // semi-chord (m)
const SPAN_VIS = 6.0;
const CHORD_VIS = 1.4;
const N_SPAN = 24;
const N_CHORD = 8;
const HALF_SPAN = SPAN_VIS / 2;

export function computePhysics(
  speed: number,
  stiffness: number,
  freq: number,
  damping: number
) {
  // Cauchy number Ca = ρU²L/E, with E_ref chosen so Ca=1 at U=8, stiffness=1
  const E_ref = RHO * 64 * L_SEMI;
  const E = stiffness * E_ref;
  const Ca = (RHO * speed * speed * L_SEMI) / E;

  // Reduced velocity Ur = U/(f*L_semi)
  const Ur = speed / (Math.max(0.1, freq) * L_SEMI);

  // Simplified flutter boundary: Ur_flutter rises with damping
  const Ur_flutter = 5.8 + 18 * damping;
  const flutter_margin = (Ur_flutter - Ur) / Ur_flutter;
  const is_flutter = Ur > Ur_flutter;

  // Tip deflection (normalized by half-span): δ/b ≈ 0.3 Ca
  const delta_tip_norm = Math.min(0.45, 0.3 * Ca);

  // Elastic tip twist (passive pitch-up adaptation)
  const theta_tip = Math.min(0.38, 0.22 * Ca);

  // Effective angle of attack enhanced by twist
  const alpha_geom = 0.10;
  const alpha_eff = alpha_geom + theta_tip * 0.55;

  // Simplified thrust including passive adaptation benefit
  const C_L_eff = 2 * Math.PI * alpha_eff;
  const thrust = 0.5 * RHO * speed * speed * 0.6 * C_L_eff * freq * 0.12;

  // Flutter margin descriptor
  const flutter_label = is_flutter
    ? "FLUTTER — unstable"
    : flutter_margin < 0.15
    ? "Near flutter boundary"
    : "Stable";

  void damping;
  return { Ca, Ur, Ur_flutter, flutter_margin, is_flutter, delta_tip_norm, theta_tip, alpha_eff, thrust, flutter_label };
}

export interface AeroelasticSceneProps {
  speed: number;
  stiffness: number;
  freq: number;
  damping: number;
  onPhysics?: (p: ReturnType<typeof computePhysics>) => void;
}

function Scene({ speed, stiffness, freq, damping, onPhysics }: AeroelasticSceneProps) {
  const flutterAmp = useRef(1.0);

  const wingGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(SPAN_VIS, CHORD_VIS, N_SPAN, N_CHORD);
    const nVerts = geo.attributes.position.count;
    const colors = new Float32Array(nVerts * 3).fill(0.4);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const origPos = useMemo(
    () => (wingGeo.attributes.position.array as Float32Array).slice(),
    [wingGeo]
  );

  const thrustArrow = useMemo(
    () =>
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0.1, 0),
        1.0,
        0x00ff77,
        0.3,
        0.2
      ),
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const p = computePhysics(speed, stiffness, freq, damping);

    // Flutter amplitude: grows above boundary, decays below
    if (p.is_flutter) {
      flutterAmp.current = Math.min(3.5, flutterAmp.current + delta * 1.2);
    } else {
      flutterAmp.current = Math.max(1.0, flutterAmp.current - delta * 0.9);
    }
    const fa = flutterAmp.current;

    const flapPhase = Math.sin(2 * Math.PI * freq * t);
    const flapAmp = 0.75;

    const posAttr = wingGeo.attributes.position as THREE.BufferAttribute;
    const colorAttr = wingGeo.attributes.color as THREE.BufferAttribute;
    const nVerts = posAttr.count;

    for (let i = 0; i < nVerts; i++) {
      const ox = origPos[i * 3];      // spanwise (−HALF_SPAN … +HALF_SPAN)
      const oy = origPos[i * 3 + 1]; // chordwise (−CHORD/2 … +CHORD/2)

      const eta = Math.abs(ox) / HALF_SPAN; // 0 (root) … 1 (tip)

      // Elastic bend: cantilever quadratic (UDL)
      const elastic = p.delta_tip_norm * HALF_SPAN * eta * eta;
      const total_z = (flapPhase * flapAmp + elastic) * fa;

      // Elastic twist: linear spanwise
      const theta = p.theta_tip * eta * fa;
      const new_y = oy * Math.cos(theta);
      const twist_z = oy * Math.sin(theta);

      posAttr.setXYZ(i, ox, new_y, total_z + twist_z);

      // Color: blue (low stress at tip) → orange (high stress at root)
      const stress = Math.max(0, (1 - eta * 0.8) * Math.min(2, p.Ca));
      const flutterHeat = p.is_flutter ? 0.4 : 0;
      colorAttr.setXYZ(
        i,
        Math.min(1, 0.2 + stress * 0.5 + flutterHeat),
        Math.max(0, 0.55 - stress * 0.3),
        Math.max(0, 0.85 - stress * 0.6 - flutterHeat)
      );
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    wingGeo.computeVertexNormals();

    thrustArrow.setLength(
      Math.max(0.2, Math.min(5, p.thrust * 0.06)),
      0.3,
      0.2
    );

    onPhysics?.(p);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 10, 6]} intensity={1.1} />
      <gridHelper args={[16, 16, "#1a2535", "#0f1620"]} />

      {/* Deforming wing */}
      <mesh geometry={wingGeo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Bird body */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#ffaa44" roughness={0.45} />
      </mesh>

      {/* Thrust arrow */}
      <primitive object={thrustArrow} />

      <OrbitControls enableDamping dampingFactor={0.08} />
    </>
  );
}

export default function AeroelasticWing3D(props: AeroelasticSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 8, 8], fov: 52 }}
      style={{ background: "#05070a" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
