"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Procedural Generic Pirate Captain Mascot ────────────────────────────────
function PirateFigure({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const shipWheelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // 1. Bobbing like a boat on the ocean
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.15 - 0.2;
      groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.08;

      // 2. Look-at Mouse
      const targetRotY = mousePos.current.x * 0.5;
      const targetRotX = -mousePos.current.y * 0.3;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    }

    // 3. Head subtle individual movement
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 2) * 0.1;
      headRef.current.rotation.z = Math.cos(t * 1.8) * 0.05;
    }

    // 4. Ship Wheel slowly rotating nearby
    if (shipWheelRef.current) {
      shipWheelRef.current.position.x = Math.sin(t * 0.8) * 1.2 + 0.3;
      shipWheelRef.current.position.y = Math.cos(t * 1.2) * 0.3 + 0.2;
      shipWheelRef.current.position.z = Math.sin(t * 0.5) * 0.5 - 0.5;
      
      shipWheelRef.current.rotation.z -= 0.01; // Spin wheel
      shipWheelRef.current.rotation.y = Math.sin(t * 0.5) * 0.2; // Wobbly axis
      shipWheelRef.current.rotation.x = 0.2;
    }
  });

  // Theme Materials
  const skinMat = new THREE.MeshStandardMaterial({ color: '#f3cba8', roughness: 0.6 });
  const coatMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 }); // Dark navy/black coat
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: '#FFD700', metalness: 0.8, roughness: 0.2 });
  const redSashMat = new THREE.MeshStandardMaterial({ color: '#DC3545', roughness: 0.8 });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#5C4033', roughness: 0.9 });

  return (
    <group ref={groupRef} scale={1.2}>
      
      {/* ── Head & Hat Group ── */}
      <group ref={headRef} position={[0, 0.95, 0]}>
        {/* Face (Sphere) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        
        {/* Simple Eyes */}
        <mesh position={[-0.12, 0.05, 0.28]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[0.12, 0.05, 0.28]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#111" />
        </mesh>

        {/* Pirate Bicorne Hat (Base cylinder flattened + folded sides) */}
        <group position={[0, 0.28, 0]}>
          {/* Hat Core */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.35, 32]} />
            <primitive object={coatMat} attach="material" />
          </mesh>
          {/* Hat Brim (Wide and curled up) */}
          <mesh position={[0, -0.1, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.05, 32]} />
            <primitive object={coatMat} attach="material" />
          </mesh>
          <mesh position={[0, -0.1, 0]} scale={[1.02, 1.2, 1.02]}>
            <cylinderGeometry args={[0.55, 0.55, 0.01, 32]} />
            <primitive object={goldTrimMat} attach="material" />
          </mesh>
          {/* Folded wings of bicorne */}
          <mesh position={[-0.35, 0.15, 0]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[0.4, 0.4, 0.55]} />
            <primitive object={coatMat} attach="material" />
          </mesh>
          <mesh position={[0.35, 0.15, 0]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.4, 0.4, 0.55]} />
            <primitive object={coatMat} attach="material" />
          </mesh>
          {/* Gold skull decal (Abstract cross) */}
          <mesh position={[0, 0.05, 0.34]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.15, 0.04, 0.02]} />
            <primitive object={goldTrimMat} attach="material" />
          </mesh>
          <mesh position={[0, 0.05, 0.34]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.15, 0.04, 0.02]} />
            <primitive object={goldTrimMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ── Body (Coat / Cape) ── */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.25, 0.45, 0.8, 32]} />
        <primitive object={coatMat} attach="material" />
      </mesh>
      
      {/* Red Sash / Belt */}
      <mesh position={[0, 0.2, 0.02]} scale={[1.05, 1, 1.05]}>
        <cylinderGeometry args={[0.35, 0.36, 0.15, 32]} />
        <primitive object={redSashMat} attach="material" />
      </mesh>
      
      {/* Gold Belt Buckle */}
      <mesh position={[0, 0.2, 0.4]}>
        <boxGeometry args={[0.18, 0.12, 0.05]} />
        <primitive object={goldTrimMat} attach="material" />
      </mesh>

      {/* Coat Collar */}
      <mesh position={[0, 0.65, -0.1]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.2, 32, 1, true]} />
        <meshStandardMaterial color="#FFD700" side={THREE.DoubleSide} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* ── Ship Wheel Accessory ── */}
      <group ref={shipWheelRef} scale={0.45}>
        {/* Main Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.08, 16, 32]} />
          <primitive object={woodMat} attach="material" />
        </mesh>
        {/* Inner Hub */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
          <primitive object={goldTrimMat} attach="material" />
        </mesh>
        {/* Spokes */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <mesh key={i} rotation={[0, 0, (Math.PI / 4) * i]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
            <primitive object={woodMat} attach="material" />
          </mesh>
        ))}
      </group>
      
    </group>
  );
}

// ─── Wrapper Canvas Component ────────────────────────────────────────────────
export default function OnePieceMascot() {
  const mousePos = useRef({ x: 0, y: 0 });
  const [isTabActive, setIsTabActive] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      const isWide = window.innerWidth >= 768;
      const isPointerFine = !window.matchMedia('(pointer: coarse)').matches;
      setIsDesktop(isWide && isPointerFine);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);

    const handleVisibility = () => setIsTabActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mousePos.current = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', checkIsDesktop);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!isDesktop || !isTabActive) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-30 w-48 h-60 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="w-full h-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/15 to-transparent rounded-full blur-3xl -z-10" />

        <Canvas
          camera={{ position: [0, 0.5, 3.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={1.1} color="#fdf4e3" />
          <directionalLight position={[4, 5, 2]} intensity={1.5} color="#FFD700" />
          <directionalLight position={[-3, 0, -2]} intensity={0.6} color="#DC3545" />
          <pointLight position={[0, -1, 1]} intensity={0.4} color="#0a1628" />

          <PirateFigure mousePos={mousePos} />
        </Canvas>
      </div>
    </div>
  );
}
