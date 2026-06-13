/**
 * GLOBAL 3D FON — butun sayt ortida (fixed). "Observatoriya" uslubi.
 * Jonli, lekin jiddiy: markazda buzilgan wireframe yadro, atrofda suzuvchi
 * geometrik shakllar, chuqurlikli zarrachalar girdobi va sichqoncha parallaksi.
 */
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const TEAL = "#3b82f6";    // royal ko'k
const INDIGO = "#60a5fa";  // ochiq ko'k
const VIOLET = "#38bdf8";  // osmon ko'k

/* ---------- Zarrachalar girdobi (chuqurlik) ---------- */
function Swarm({ count = 2200 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 * (0.5 + Math.random() * 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y = t * 0.03;
    ref.current.rotation.x = Math.sin(t * 0.06) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={TEAL} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ---------- Markaziy buzilgan yadro (sahnaning "wow" qismi) ---------- */
function Core() {
  const mesh = useRef();
  useFrame((s) => {
    if (!mesh.current) return;
    const t = s.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.16;
    mesh.current.rotation.x = t * 0.09;
  });
  return (
    <Float speed={1.3} rotationIntensity={0.5} floatIntensity={0.9}>
      <mesh ref={mesh} position={[2.7, 0.3, -1]} scale={1.9}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial
          color={INDIGO}
          emissive={TEAL}
          emissiveIntensity={0.25}
          roughness={0.2}
          metalness={0.85}
          distort={0.42}
          speed={1.8}
          wireframe
        />
      </mesh>
    </Float>
  );
}

/* ---------- Suzuvchi geometrik shakl ---------- */
function makeGeo(type) {
  switch (type) {
    case "octa": return <octahedronGeometry args={[1, 0]} />;
    case "dodeca": return <dodecahedronGeometry args={[1, 0]} />;
    case "torus": return <torusGeometry args={[0.7, 0.25, 16, 44]} />;
    case "ico": return <icosahedronGeometry args={[1, 0]} />;
    default: return <tetrahedronGeometry args={[1, 0]} />;
  }
}

function Shape({ type, color, position, scale, speed }) {
  const mesh = useRef();
  useFrame((s) => {
    if (!mesh.current) return;
    const t = s.clock.elapsedTime;
    mesh.current.rotation.x = t * speed;
    mesh.current.rotation.y = t * speed * 0.7;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.7} floatIntensity={1.3}>
      <mesh ref={mesh} position={position} scale={scale}>
        {makeGeo(type)}
        <meshBasicMaterial color={color} wireframe transparent opacity={0.32} />
      </mesh>
    </Float>
  );
}

const SHAPES = [
  { type: "octa",   color: TEAL,   position: [-3.7, 1.5, -2],  scale: 0.8, speed: 0.3 },
  { type: "torus",  color: INDIGO, position: [-2.9, -1.9, -1], scale: 0.9, speed: 0.25 },
  { type: "dodeca", color: VIOLET, position: [3.4, 1.9, -3],   scale: 0.7, speed: 0.22 },
  { type: "ico",    color: TEAL,   position: [0.2, -2.4, -4],  scale: 0.6, speed: 0.35 },
  { type: "tetra",  color: INDIGO, position: [0.8, 2.6, -3],   scale: 0.55, speed: 0.4 },
  { type: "octa",   color: VIOLET, position: [-4.6, -0.3, -4], scale: 0.5, speed: 0.28 },
];

/* ---------- Sichqoncha parallaksi (butun sahna) ---------- */
function Rig({ children }) {
  const group = useRef();
  useFrame((s) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, s.pointer.x * 0.3, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -s.pointer.y * 0.2, 0.04);
  });
  return <group ref={group}>{children}</group>;
}

export default function Background3D() {
  return (
    <div className="bg3d" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={["#0b1020", 6, 24]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[6, 5, 5]} intensity={1.4} color={TEAL} />
        <pointLight position={[-6, -3, 2]} intensity={1.0} color={INDIGO} />

        <Rig>
          <Swarm />
          <Core />
          {SHAPES.map((sh, i) => (
            <Shape key={i} {...sh} />
          ))}
        </Rig>
      </Canvas>
    </div>
  );
}
