"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, MeshReflectorMaterial, Float, Text } from "@react-three/drei";
import * as THREE from "three";

// ── Material constants — exported for unit tests ──────────────────────────────
export const BALLOT_UNIT_MATERIAL = {
  color: "#d1d5db",
  metalness: 0.88,  // >= 0.85 ✓
  roughness: 0.38,  // 0.3–0.5 ✓ brushed finish
} as const;

export const VVPAT_WINDOW_MATERIAL = {
  color: "#2a2a30",
  transmission: 0.45, // <= 0.5 ✓ aged, not clear
  thickness: 0.15,
  roughness: 0.6,     // >= 0.55 ✓ scratched surface
  clearcoat: 0.1,     // <= 0.15 ✓ minimal specular
  opacity: 0.85,
} as const;

// ── Spring-loaded Button ──────────────────────────────────────────────────────
function TactileButton({ position, color = "#E63946", onClick }: { position: [number, number, number], color?: string, onClick?: () => void }) {
  const [pressed, setPressed] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      const targetY = pressed ? -0.05 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.2);
    }
  });

  return (
    <group position={position}>
      {/* Button Base */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Interactive Button Top */}
      <mesh
        ref={meshRef}
        onPointerDown={() => { setPressed(true); onClick?.(); }}
        onPointerUp={() => setPressed(false)}
        onPointerOut={() => setPressed(false)}
      >
        <cylinderGeometry args={[0.07, 0.07, 0.06, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={pressed ? 2 : 0.5}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function BallotUnit() {
  return (
    <group position={[-1.2, 0, 0]}>
      {/* Brushed Metal Body — metalness >= 0.85, roughness 0.3–0.5 (Req 8.1, 8.2) */}
      <RoundedBox args={[2, 2.8, 0.4]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#d1d5db"
          metalness={0.88}
          roughness={0.38}
        />
      </RoundedBox>
      
      {/* Button Panel Face */}
      <mesh position={[0, 0, 0.21]}>
        <planeGeometry args={[1.8, 2.6]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Grid of buttons and labels */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[0, 1.0 - i * 0.5, 0.22]}>
          <mesh position={[-0.4, 0, 0]}>
            <planeGeometry args={[0.8, 0.35]} />
            <meshStandardMaterial color="#f3f4f6" />
          </mesh>
          <TactileButton position={[0.5, 0, 0]} color="#E63946" />
        </group>
      ))}

      <Text position={[0, 1.3, 0.23]} fontSize={0.1} color="white" font="/fonts/Inter-Bold.woff">
        BALLOT UNIT - M3
      </Text>
    </group>
  );
}

function VVPATUnit() {
  return (
    <group position={[1.2, 0, 0]}>
      <RoundedBox args={[1.6, 2.2, 0.6]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color="#1a1a1f" metalness={0.7} roughness={0.3} />
      </RoundedBox>

      {/* Scratched Plastic Window — roughness >= 0.55, transmission <= 0.5, clearcoat <= 0.15 (Req 9.1, 9.2) */}
      <mesh position={[0, 0.2, 0.31]}>
        <planeGeometry args={[1.2, 1.4]} />
        <meshPhysicalMaterial
          color="#2a2a30"
          transmission={0.45}
          thickness={0.15}
          roughness={0.6}
          clearcoat={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Status Lights */}
      <mesh position={[-0.4, -0.8, 0.31]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, -0.8, 0.31]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
      </mesh>

      <Text position={[0, 1.0, 0.31]} fontSize={0.08} color="#E63946" font="/fonts/Inter-Bold.woff">
        VVPAT SYSTEM
      </Text>
    </group>
  );
}

export default function EVMScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-2, 2, 2]} color="#E63946" intensity={2} />
      <pointLight position={[2, -2, 2]} color="#3b82f6" intensity={1} />
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group rotation={[0.1, -0.2, 0]}>
          <BallotUnit />
          <VVPATUnit />
        </group>
      </Float>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </mesh>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
