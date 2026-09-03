"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Procedural Generic Voxel Humanoid Mascot ────────────────────────────────
function VoxelFigure({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const diamondCubeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // 1. Idle Bobbing & Gentle Floating
      groupRef.current.position.y = Math.sin(t * 2) * 0.12 - 0.2;

      // 2. Smooth Look-at Mouse with soft damping
      const targetRotY = mousePos.current.x * 0.45;
      const targetRotX = -mousePos.current.y * 0.25;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    }

    // 3. Head subtle independent tilt
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
    }

    // 4. Arm wave and walking idle
    if (rightArmRef.current) {
      // Waving periodically
      const waveCycle = Math.sin(t * 3);
      const isWaving = Math.sin(t * 0.5) > 0.3;
      if (isWaving) {
        rightArmRef.current.rotation.x = -Math.PI * 0.8;
        rightArmRef.current.rotation.z = Math.sin(t * 8) * 0.3 + 0.3;
      } else {
        rightArmRef.current.rotation.x = Math.sin(t * 2) * 0.2;
        rightArmRef.current.rotation.z = 0.1;
      }
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -Math.sin(t * 2) * 0.2;
      leftArmRef.current.rotation.z = -0.1;
    }

    // 5. Floating Diamond Block orbiting mascot
    if (diamondCubeRef.current) {
      diamondCubeRef.current.position.x = Math.cos(t * 1.8) * 1.3;
      diamondCubeRef.current.position.z = Math.sin(t * 1.8) * 0.9;
      diamondCubeRef.current.position.y = Math.sin(t * 3.5) * 0.2 + 0.5;
      diamondCubeRef.current.rotation.x += 0.03;
      diamondCubeRef.current.rotation.y += 0.04;
    }
  });

  // Materials with clean solid theme colors (Generic moss adventurer)
  const skinMat = new THREE.MeshStandardMaterial({ color: '#c49a6c', roughness: 0.8 }); // warm tan
  const mossShirtMat = new THREE.MeshStandardMaterial({ color: '#4a7c33', roughness: 0.9 }); // moss green
  const darkTunicMat = new THREE.MeshStandardMaterial({ color: '#2d4a20', roughness: 0.9 }); // deep olive
  const stonePantsMat = new THREE.MeshStandardMaterial({ color: '#3b434c', roughness: 0.8 }); // slate stone
  const bootsMat = new THREE.MeshStandardMaterial({ color: '#1f2429', roughness: 0.9 }); // charcoal
  const hairMat = new THREE.MeshStandardMaterial({ color: '#3d2817', roughness: 0.9 }); // dark brown
  const diamondMat = new THREE.MeshStandardMaterial({
    color: '#4fc3f7',
    emissive: '#0288d1',
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  return (
    <group ref={groupRef} scale={1.1}>
      {/* ── Orbiting Floating Diamond Cube ── */}
      <mesh ref={diamondCubeRef}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <primitive object={diamondMat} attach="material" />
      </mesh>

      {/* ── Head Group ── */}
      <group ref={headRef} position={[0, 0.9, 0]}>
        {/* Head Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Hair Cap Top & Back */}
        <mesh position={[0, 0.15, -0.05]}>
          <boxGeometry args={[0.64, 0.38, 0.64]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
        {/* Eye Visor/Glasses (Generic pixel glasses) */}
        <mesh position={[0, 0.02, 0.31]}>
          <boxGeometry args={[0.48, 0.12, 0.04]} />
          <meshStandardMaterial color="#1a202c" roughness={0.5} />
        </mesh>
        {/* Cyan Lens Accents */}
        <mesh position={[-0.14, 0.02, 0.33]}>
          <boxGeometry args={[0.12, 0.08, 0.02]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#0288d1" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.14, 0.02, 0.33]}>
          <boxGeometry args={[0.12, 0.08, 0.02]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#0288d1" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* ── Torso / Body ── */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.65, 0.34]} />
        <primitive object={mossShirtMat} attach="material" />
      </mesh>
      {/* Chest belt detail */}
      <mesh position={[0, 0.08, 0.01]}>
        <boxGeometry args={[0.62, 0.12, 0.36]} />
        <primitive object={darkTunicMat} attach="material" />
      </mesh>
      {/* Gold Buckle */}
      <mesh position={[0, 0.08, 0.19]}>
        <boxGeometry args={[0.14, 0.1, 0.02]} />
        <meshStandardMaterial color="#f6c845" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* ── Right Arm ── */}
      <group ref={rightArmRef} position={[0.45, 0.55, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.26, 0.65, 0.28]} />
          <primitive object={mossShirtMat} attach="material" />
        </mesh>
        {/* Hand Block */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[0.24, 0.2, 0.26]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* ── Left Arm ── */}
      <group ref={leftArmRef} position={[-0.45, 0.55, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.26, 0.65, 0.28]} />
          <primitive object={mossShirtMat} attach="material" />
        </mesh>
        {/* Hand Block */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[0.24, 0.2, 0.26]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* ── Legs ── */}
      {/* Right Leg */}
      <group position={[0.16, -0.05, 0]}>
        <mesh ref={rightLegRef} position={[0, -0.3, 0]}>
          <boxGeometry args={[0.26, 0.6, 0.3]} />
          <primitive object={stonePantsMat} attach="material" />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.58, 0.02]}>
          <boxGeometry args={[0.28, 0.16, 0.34]} />
          <primitive object={bootsMat} attach="material" />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-0.16, -0.05, 0]}>
        <mesh ref={leftLegRef} position={[0, -0.3, 0]}>
          <boxGeometry args={[0.26, 0.6, 0.3]} />
          <primitive object={stonePantsMat} attach="material" />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.58, 0.02]}>
          <boxGeometry args={[0.28, 0.16, 0.34]} />
          <primitive object={bootsMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

// ─── Wrapper Canvas Component ────────────────────────────────────────────────
export default function MinecraftMascot() {
  const mousePos = useRef({ x: 0, y: 0 });
  const [isTabActive, setIsTabActive] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // 1. Mobile / Touch device skip (Guarantees zero mobile performance drop)
    const checkIsDesktop = () => {
      const isWide = window.innerWidth >= 768;
      const isPointerFine = !window.matchMedia('(pointer: coarse)').matches;
      setIsDesktop(isWide && isPointerFine);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);

    // 2. Tab visibility listener (Pauses 3D rendering when minimized)
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 3. Mouse tracking
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
      className="fixed bottom-6 right-6 z-30 w-44 h-56 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="w-full h-full relative">
        {/* Soft Ambient Underglow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#5D8C3F]/20 to-transparent rounded-full blur-2xl -z-10" />

        <Canvas
          camera={{ position: [0, 0.4, 3.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={0.9} color="#e8f5e9" />
          <directionalLight position={[3, 4, 3]} intensity={1.4} color="#ffffff" />
          <directionalLight position={[-3, -1, -2]} intensity={0.4} color="#4fc3f7" />
          <pointLight position={[0, 0.5, 1]} intensity={0.5} color="#81c784" />

          <VoxelFigure mousePos={mousePos} />
        </Canvas>
      </div>
    </div>
  );
}
