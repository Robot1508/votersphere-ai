"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Float, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// ── Pure helper — exported for property tests ─────────────────────────────────
export function computeScrollT(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): number {
  const max = scrollHeight - clientHeight;
  return max > 0 ? Math.min(Math.max(scrollTop / max, 0), 1) : 0;
}

// ── Milestone definitions ─────────────────────────────────────────────────────
const milestones = [
  { label: "Form 6\nRegister",  position: [-8,   0.5,  0  ] as [number, number, number], icon: "pen"     },
  { label: "NVSP\nVerify",      position: [-4.5,  1.2,  1.5] as [number, number, number], icon: "search"  },
  { label: "EPIC\nCard",        position: [-1,   -0.5,  0  ] as [number, number, number], icon: "card"    },
  { label: "Polling\nBooth",    position: [ 2.5,  0.8, -1  ] as [number, number, number], icon: "booth"   },
  { label: "Cast\nVote",        position: [ 5.5, -0.2,  0.5] as [number, number, number], icon: "finger"  },
  { label: "VVPAT\nReceipt",    position: [ 9.0,  0.4,  0  ] as [number, number, number], icon: "receipt" },
];

const TOTAL = milestones.length; // 6

// ── Milestone activation threshold ───────────────────────────────────────────
export function getMilestoneThreshold(index: number): number {
  return index / (TOTAL - 1); // 0, 0.2, 0.4, 0.6, 0.8, 1.0
}

// ── Frosted-glass material config (exported for unit tests) ───────────────────
export const FROSTED_MATERIAL = {
  transmission: 0.9,   // >= 0.85 ✓
  thickness: 0.5,
  roughness: 0.1,      // <= 0.15 ✓
  clearcoat: 1,        // = 1 ✓
  ior: 1.5,            // = 1.5 ✓
  transparent: true,
  opacity: 0.65,
};

// ── 3D Milestone Icons ────────────────────────────────────────────────────────
function MilestoneIcon({ type }: { type: string }) {
  const gold = "#fcd34d";

  if (type === "pen") {
    // Pen: cylinder body + cone tip
    return (
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.38, 8]} />
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.23, 0]}>
          <coneGeometry args={[0.025, 0.09, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    );
  }

  if (type === "search") {
    // Magnifier: torus ring + cylinder handle
    return (
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.025, 8, 24]} />
          <meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, -0.12, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.018, 0.018, 0.18, 8]} />
          <meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === "card") {
    // EPIC Card: flat box + stripe
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.32, 0.22, 0.025]} />
          <meshStandardMaterial color={gold} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.05, 0.014]}>
          <planeGeometry args={[0.28, 0.04]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0, -0.04, 0.014]}>
          <planeGeometry args={[0.14, 0.03]} />
          <meshStandardMaterial color="#1a1a2e" opacity={0.6} transparent />
        </mesh>
      </group>
    );
  }

  if (type === "booth") {
    // Polling Booth: arch (half-torus) + two pillars
    return (
      <group>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.12, -0.07, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.03]} />
          <meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.12, -0.07, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.03]} />
          <meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === "finger") {
    // Finger: capsule + ink mark
    return (
      <group>
        <mesh>
          <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
          <meshStandardMaterial color={gold} />
        </mesh>
        <mesh position={[0, 0.1, 0.05]}>
          <boxGeometry args={[0.04, 0.08, 0.01]} />
          <meshStandardMaterial color="#4c1d95" emissive="#4c1d95" emissiveIntensity={0.6} />
        </mesh>
      </group>
    );
  }

  if (type === "receipt") {
    // VVPAT Receipt: plane + dashed lines
    return (
      <group>
        <mesh>
          <planeGeometry args={[0.22, 0.3]} />
          <meshStandardMaterial color={gold} side={THREE.DoubleSide} />
        </mesh>
        {[-0.08, -0.02, 0.04, 0.1].map((y, i) => (
          <mesh key={i} position={[0, y, 0.002]}>
            <planeGeometry args={[0.16, 0.012]} />
            <meshStandardMaterial color="#1a1a2e" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>
    );
  }

  // Fallback
  return (
    <mesh>
      <octahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color={gold} wireframe />
    </mesh>
  );
}

// ── Scroll-driven camera controller ──────────────────────────────────────────
function ScrollCamera({ scrollT }: { scrollT: number }) {
  const { camera } = useThree();
  const targetPos  = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  // Camera flight path — offset above and behind each milestone
  const cameraPathCurve = useMemo(() => {
    const pts = milestones.map(
      m => new THREE.Vector3(m.position[0], m.position[1] + 1.2, m.position[2] + 4.5)
    );
    const entry = pts[0].clone().add(new THREE.Vector3(-3, 0.5, 0));
    const exit  = pts[pts.length - 1].clone().add(new THREE.Vector3(3, 0.5, 0));
    return new THREE.CatmullRomCurve3([entry, ...pts, exit], false, "catmullrom", 0.5);
  }, []);

  // Look-at path — raw milestone world positions only (6 control points)
  const lookAtCurve = useMemo(() => {
    const pts = milestones.map(m => new THREE.Vector3(...m.position));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  }, []);

  useFrame(() => {
    // Defensive clamp — never call getPointAt outside [0, 1]
    const t = Math.max(0, Math.min(1, scrollT));
    cameraPathCurve.getPointAt(t, targetPos.current);
    lookAtCurve.getPointAt(t, targetLook.current);

    // Lerp smoothing factor = 0.08 (covers ~8% of remaining distance per frame)
    camera.position.lerp(targetPos.current, 0.08);
    camera.lookAt(targetLook.current);
  });

  return null;
}

// ── Frosted Glass Milestone Node ──────────────────────────────────────────────
function FrostedMilestone({
  position, label, index, scrollT, icon,
}: {
  position: [number, number, number];
  label: string;
  index: number;
  scrollT: number;
  icon: string;
}) {
  const threshold = getMilestoneThreshold(index);
  const isActive  = scrollT >= threshold;

  return (
    <group position={position}>
      {/* Float handles levitation — no manual useFrame position.y mutation */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          {/* MeshPhysicalMaterial for frosted-glass effect */}
          <meshPhysicalMaterial
            transmission={FROSTED_MATERIAL.transmission}
            thickness={FROSTED_MATERIAL.thickness}
            roughness={FROSTED_MATERIAL.roughness}
            clearcoat={FROSTED_MATERIAL.clearcoat}
            ior={FROSTED_MATERIAL.ior}
            color={isActive ? "#E63946" : "#ffffff"}
            transparent={FROSTED_MATERIAL.transparent}
            opacity={FROSTED_MATERIAL.opacity}
          />
        </mesh>

        {/* Floating 3D icon centred inside the orb */}
        <group position={[0, 0, 0]}>
          <MilestoneIcon type={icon} />
        </group>
      </Float>

      {/* Milestone label */}
      <Text
        position={[0, -0.75, 0]}
        fontSize={0.18}
        color={isActive ? "#ffffff" : "#444455"}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Active glow light */}
      {isActive && (
        <pointLight color="#E63946" intensity={2} distance={2.5} decay={2} />
      )}
    </group>
  );
}

// ── Progressive Neon Path ─────────────────────────────────────────────────────
function NeonPath({ scrollT }: { scrollT: number }) {
  const pathCurve = useMemo(() => {
    const pts = milestones.map(m => new THREE.Vector3(...m.position));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  }, []);

  // 120 points for smooth visual resolution
  const allPoints   = useMemo(() => pathCurve.getPoints(120), [pathCurve]);
  const activeCount = Math.floor(scrollT * allPoints.length);
  const activePoints = allPoints.slice(0, activeCount + 1);

  // Point lights every 20 points along the active segment (bloom substitute)
  const lightPositions = activePoints.filter((_, i) => i % 20 === 0);

  const allGeo    = useMemo(() => new THREE.BufferGeometry().setFromPoints(allPoints),    [allPoints]);
  const activeGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(activePoints), [activePoints]);

  return (
    <group>
      {/* Dim base path — always visible */}
      <primitive object={new THREE.Line(allGeo, new THREE.LineBasicMaterial({ color: "#1a1a2e", opacity: 0.35, transparent: true }))} />

      {/* Active red segment — only when scrollT > 0 */}
      {activeCount > 0 && (
        <primitive object={new THREE.Line(activeGeo, new THREE.LineBasicMaterial({ color: "#E63946" }))} />
      )}

      {/* Bloom-substitute point lights along active path */}
      {lightPositions.map((p, i) => (
        <pointLight key={i} position={[p.x, p.y, p.z]} color="#E63946" intensity={0.6} distance={1.5} decay={2} />
      ))}
    </group>
  );
}

// ── Main Scene ────────────────────────────────────────────────────────────────
export default function JourneyScene() {
  const [scrollT, setScrollT] = useState(0);

  useEffect(() => {
    const container = document.getElementById("journey-scroll-container");
    if (!container) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setScrollT(computeScrollT(scrollTop, scrollHeight, clientHeight));
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, stencil: false, depth: true }}
      >
        <PerspectiveCamera makeDefault position={[-11, 1.7, 4.5]} fov={50} />

        {/* Near-black void background */}
        <color attach="background" args={["#050505"]} />

        {/* Fog — distant milestones fade into the void */}
        <fog attach="fog" args={["#050505", 8, 22]} />

        {/* Starfield — spatial premium feel */}
        <Stars radius={120} depth={60} count={5500} factor={4} saturation={0} fade speed={0.8} />

        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#E63946" />

        <ScrollCamera scrollT={scrollT} />
        <NeonPath scrollT={scrollT} />

        {milestones.map((m, i) => (
          <FrostedMilestone
            key={m.label}
            position={m.position}
            label={m.label}
            index={i}
            scrollT={scrollT}
            icon={m.icon}
          />
        ))}
      </Canvas>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-50">
        <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Scroll to Explore</div>
        <div className="w-px h-12 bg-gradient-to-b from-red-500 to-transparent" />
      </div>
    </div>
  );
}
