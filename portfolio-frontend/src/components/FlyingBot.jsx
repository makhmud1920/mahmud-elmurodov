/**
 * UCHUVCHI SKAUT-DRON — birinchi droiddan boshqacha, BUTUN EKRAN bo'ylab kezadi.
 * Olmos (octahedron) shaklli, porlovchi yadro + wireframe qobiq + halqa.
 *  - Lissajous egri chizig'i bo'ylab butun sahifani aylanib uchadi.
 *  - Doim sekin ag'darilib aylanadi.
 *  - Sichqonchaga qiziqadi: yaqin bo'lsa unga tomon suziladi va yorqinroq yonadi.
 */
import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Scout() {
  const g = useRef();
  const shell = useRef();
  const ring = useRef();
  const coreMat = useRef();
  const viewport = useThree((s) => s.viewport);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const st = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = ((e.clientX / window.innerWidth) * 2 - 1) * (viewport.width / 2);
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1) * (viewport.height / 2);
      pointer.current.active = true;
    };
    const onLeave = () => (pointer.current.active = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [viewport.width, viewport.height]);

  useFrame((state, delta) => {
    const o = g.current;
    if (!o) return;
    const s = st.current;
    const t = state.clock.elapsedTime;
    const W = viewport.width / 2 - 1.2;
    const H = viewport.height / 2 - 1.2;

    // butun ekranni qamrab oluvchi Lissajous wander
    let tx = Math.sin(t * 0.24) * W * 0.92 + Math.sin(t * 0.09 + 1.7) * W * 0.08;
    let ty = Math.sin(t * 0.31 + 1.2) * H * 0.78 + Math.cos(t * 0.13) * H * 0.12;

    // kursorga qiziqish — yaqin bo'lsa unga tomon suziladi
    let curious = false;
    if (pointer.current.active) {
      const dx = pointer.current.x - s.x;
      const dy = pointer.current.y - s.y;
      const d = Math.hypot(dx, dy);
      if (d < 3.2) {
        curious = true;
        tx = pointer.current.x - dx * 0.18; // kursor yonida hoy­natib turadi
        ty = pointer.current.y - dy * 0.18 + 0.4;
      }
    }

    // silliq harakat
    s.x = THREE.MathUtils.lerp(s.x, tx, curious ? 0.06 : 0.02);
    s.y = THREE.MathUtils.lerp(s.y, ty, curious ? 0.06 : 0.02);
    o.position.set(s.x, s.y, 0);

    // doimiy ag'darilish
    const spin = curious ? 3 : 1.2;
    o.rotation.y += delta * spin;
    o.rotation.x += delta * spin * 0.4;
    if (shell.current) shell.current.rotation.z -= delta * spin * 0.6;
    if (ring.current) ring.current.rotation.z += delta * (curious ? 3.5 : 1.6);

    // yadro porlashi
    if (coreMat.current) {
      const target = curious ? 3 : 1.4 + Math.sin(t * 3) * 0.4;
      coreMat.current.emissiveIntensity = THREE.MathUtils.lerp(
        coreMat.current.emissiveIntensity, target, 0.1
      );
    }
  });

  return (
    <group ref={g} scale={0.55}>
      {/* tashqi wireframe qobiq */}
      <mesh ref={shell} scale={1.5}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
      </mesh>

      {/* yadro — olmos */}
      <mesh>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#0e1c3a"
          emissive="#38bdf8"
          emissiveIntensity={1.4}
          metalness={0.7}
          roughness={0.2}
          flatShading
          toneMapped={false}
        />
      </mesh>

      {/* halo halqa */}
      <mesh ref={ring} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[0.95, 0.018, 8, 64]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export default function FlyingBot() {
  return (
    <div className="flybot" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 4]} intensity={1.3} color="#38bdf8" />
        <Scout />
      </Canvas>
    </div>
  );
}
