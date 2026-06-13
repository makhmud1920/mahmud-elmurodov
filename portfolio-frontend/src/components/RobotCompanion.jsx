/**
 * 3D DROID HAMROH — sayt dizayniga mos (geometrik, ko'k, hi-tech).
 * Primitivlardan qurilgan: ko'k emissive yadro + wireframe qobiq (fondagi shakllarga uyg'un),
 * aylanuvchi halqa, antenna va sizni kuzatadigan porlovchi ko'z.
 *  - Suzib yuradi; trajektoriya DETERMINISTIK, aniq 30 daqiqada takrorlanadi.
 *  - Har xil harakat: sekin suzish / tezroq uchish / joyida aylanish.
 *  - Sichqonchani yaqinlashtirsangiz — sizga buriladi, ko'zi yonadi, sakraydi.
 */
import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PERIOD = 1800;   // 30 daqiqa
const SEED = 20051920; // qat'iy urug' — jadval har doim bir xil

/* Deterministik PRNG */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 30 daqiqalik harakat jadvali — x normalizatsiyalangan (-1..1) */
function buildSchedule() {
  const rnd = mulberry32(SEED);
  const moves = ["glide", "glide", "dash"]; // turli tezliklar
  const idles = ["hover", "spin", "hover", "lookaround"];
  const segs = [];
  let x = 0, total = 0;
  while (total < PERIOD) {
    const kind = moves[Math.floor(rnd() * moves.length)];
    const toX = rnd() * 2 - 1;
    const dist = Math.abs(toX - x);
    const speed = kind === "dash" ? 0.45 : 0.2; // norm birlik/sek
    const dur = Math.max(2, dist / speed);
    segs.push({ type: "move", kind, fromX: x, toX, dur, start: total });
    x = toX; total += dur;
    if (total >= PERIOD) break;
    const idle = idles[Math.floor(rnd() * idles.length)];
    const idur = 2.5 + rnd() * 4.5;
    segs.push({ type: "idle", kind: idle, x, dur: idur, start: total });
    total += idur;
  }
  return { segs, loop: total };
}

const SCHEDULE = buildSchedule();

function Droid() {
  const group = useRef();
  const ring = useRef();
  const ring2 = useRef();
  const eye = useRef();
  const eyeMat = useRef();
  const viewport = useThree((s) => s.viewport);

  const st = useRef({ seg: -1, reactUntil: 0, reactCooldown: 0, spin: 0, rotY: 0, bob: 0 });
  const pointer = useRef({ x: 0, near: false });

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.x = nx * (viewport.width / 2);
      pointer.current.near = e.clientY > window.innerHeight * 0.5;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [viewport.width]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const s = st.current;
    const t = state.clock.elapsedTime;
    const tt = t % SCHEDULE.loop;
    const halfW = viewport.width / 2 - 0.9;

    // joriy segment
    let idx = 0;
    for (let i = 0; i < SCHEDULE.segs.length; i++) {
      if (tt >= SCHEDULE.segs[i].start) idx = i; else break;
    }
    const seg = SCHEDULE.segs[idx];

    // pozitsiya (x)
    let nx;
    if (seg.type === "move") {
      const p = Math.min(1, (tt - seg.start) / seg.dur);
      nx = THREE.MathUtils.lerp(seg.fromX, seg.toX, p);
    } else {
      nx = seg.x;
    }
    g.position.x = nx * halfW;

    // suzish — yumshoq tebranish (bob)
    g.position.y = -0.15 + Math.sin(t * 1.8) * 0.12;

    // --- sichqoncha reaksiyasi ---
    const dist = Math.abs(pointer.current.x - g.position.x);
    if (pointer.current.near && dist < 1.6 && t > s.reactCooldown) {
      s.reactUntil = t + 2.0;
      s.reactCooldown = t + 6;
    }
    const reacting = t < s.reactUntil;

    // yo'nalish / burilish
    let targetRotY;
    if (reacting) {
      targetRotY = THREE.MathUtils.clamp((pointer.current.x - g.position.x) * 0.12, -0.7, 0.7);
      g.position.y += Math.abs(Math.sin(t * 9)) * 0.12; // sakrash
    } else if (seg.type === "move") {
      const dir = seg.toX - seg.fromX;
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, dir >= 0 ? -0.18 : 0.18, 0.06); // suzishga egilish
      targetRotY = THREE.MathUtils.clamp((pointer.current.x - g.position.x) * 0.05, -0.4, 0.4);
    } else {
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 0.06);
      // bo'shda foydalanuvchini kuzatadi
      targetRotY = THREE.MathUtils.clamp((pointer.current.x - g.position.x) * 0.06, -0.5, 0.5);
      if (seg.kind === "spin") targetRotY = t * 1.6; // joyida aylanish
    }
    s.rotY = THREE.MathUtils.lerp(s.rotY, targetRotY, 0.1);
    g.rotation.y = seg.kind === "spin" && !reacting ? targetRotY : s.rotY;

    // halqalar aylanishi
    const ringSpeed = reacting ? 4 : seg.kind === "dash" ? 2.2 : 1;
    if (ring.current) ring.current.rotation.z += delta * ringSpeed;
    if (ring2.current) ring2.current.rotation.y += delta * ringSpeed * 0.8;

    // ko'z porlashi (reaksiyada kuchayadi)
    if (eyeMat.current) {
      const target = reacting ? 2.6 : 1.2 + Math.sin(t * 2) * 0.3;
      eyeMat.current.emissiveIntensity = THREE.MathUtils.lerp(
        eyeMat.current.emissiveIntensity, target, 0.1
      );
    }
  });

  return (
    <group ref={group} scale={0.95}>
      {/* tashqi wireframe qobiq — fondagi shakllarga uyg'un */}
      <mesh scale={1.18}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
      </mesh>

      {/* metall yadro */}
      <mesh>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color="#101a33"
          metalness={0.85}
          roughness={0.25}
          emissive="#1e3a8a"
          emissiveIntensity={0.35}
          flatShading
        />
      </mesh>

      {/* porlovchi ko'z (kameraga qaragan tomonda) */}
      <group position={[0, 0.06, 0.6]}>
        <mesh>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#0a0e1a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh ref={eye} position={[0, 0, 0.12]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial
            ref={eyeMat}
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* aylanuvchi halqalar */}
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.025, 10, 64]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring2} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.92, 0.02, 10, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>

      {/* antenna */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.34, 8]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function RobotCompanion() {
  return (
    <div className="robot" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.4, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={1.1} />
        <pointLight position={[0, 0, 4]} intensity={1.2} color="#3b82f6" />
        <Droid />
      </Canvas>
    </div>
  );
}
