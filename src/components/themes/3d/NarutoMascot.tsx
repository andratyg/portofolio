"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Procedural Generic Ninja Shinobi Mascot ────────────────────────────────
function NinjaFigure({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const chakraRingRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // 1. Idle Breathing (Meditation pose float)
      groupRef.current.position.y = Math.sin(t * 1.8) * 0.1 - 0.3;
      
      // 2. Look-at Mouse
      const targetRotY = mousePos.current.x * 0.45;
      const targetRotX = -mousePos.current.y * 0.25;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    }

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.5) * 0.15;
      headRef.current.rotation.x = Math.cos(t * 1.2) * 0.05;
    }

    // 3. Chakra Swirl Ring Rotation
    if (chakraRingRef.current) {
      chakraRingRef.current.rotation.y += 0.02;
      chakraRingRef.current.rotation.x = Math.sin(t * 1.2) * 0.3 + 0.1;
      // Pulsing scale
      const s = 1 + Math.sin(t * 3) * 0.04;
      chakraRingRef.current.scale.set(s, s, s);
    }

    // 4. Hand Seal Brief Pose (Sparkling intermittently)
    const isSealPose = Math.sin(t * 0.7) > 0.85;
    if (rightArmRef.current && leftArmRef.current) {
      if (isSealPose) {
        // Brief Seal pose
        rightArmRef.current.rotation.x = -Math.PI * 0.5;
        rightArmRef.current.rotation.z = 0.4;
        leftArmRef.current.rotation.x = -Math.PI * 0.5;
        leftArmRef.current.rotation.z = -0.4;
      } else {
        // Meditation idle
        rightArmRef.current.rotation.x = -Math.PI * 0.3;
        rightArmRef.current.rotation.z = 0.2 + Math.sin(t * 2) * 0.05;
        leftArmRef.current.rotation.x = -Math.PI * 0.3;
        leftArmRef.current.rotation.z = -0.2 - Math.sin(t * 2) * 0.05;
      }
    }
  });

  const skinMat = new THREE.MeshStandardMaterial({ color: '#e8c9a6', roughness: 0.7 }); // skin
  const ninjaGarbMat = new THREE.MeshStandardMaterial({ color: '#0f1419', roughness: 0.8 }); // ninja black
  const vestMat = new THREE.MeshStandardMaterial({ color: '#2a323d', roughness: 0.85 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: '#FF6B2B', roughness: 0.7, side: THREE.DoubleSide }); // Chakra Orange Scarf
  const metalMat = new THREE.MeshStandardMaterial({ color: '#a0aebf', metalness: 0.9, roughness: 0.15 }); // shiny silver

  return (
    <group ref={groupRef} scale={1.15}>
      
      {/* ── Chakra Swirl Ring (Orbiting energy) ── */}
      <group ref={chakraRingRef} position={[0, 0.3, 0]}>
        {/* We use a dotted ring visual: inner circle + sparse toruses */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.04, 16, 64]} />
          <meshStandardMaterial color="#FF6B2B" emissive="#FF6B2B" emissiveIntensity={1.2} opacity={0.9} transparent />
        </mesh>
        {/* Rotating accent dots on the ring */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[
            Math.cos((Math.PI / 2) * i) * 0.95,
            0,
            Math.sin((Math.PI / 2) * i) * 0.95,
          ]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFEB3B" emissiveIntensity={2} />
          </mesh>
        ))}
        {/* Second inner fluttering ring */}
        <mesh rotation={[Math.PI/2, 0, Math.PI/4]}>
           <torusGeometry args={[0.7, 0.02, 16, 64]} />
           <meshBasicMaterial color="#f97316" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* ── Body / Vest ── */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.75, 32]} />
        <primitive object={vestMat} attach="material" />
      </mesh>
      {/* Lower Vest Flare */}
      <mesh position={[0, -0.15, 0.02]}>
        <cylinderGeometry args={[0.35, 0.38, 0.4, 32]} />
        <meshStandardMaterial color="#0f1419" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      
      {/* ── Pants (Black) ── */}
      <group position={[0.12, -0.45, 0]}>
        <mesh><cylinderGeometry args={[0.12, 0.1, 0.5, 16]} /><primitive object={ninjaGarbMat} attach="material" /></mesh>
      </group>
      <group position={[-0.12, -0.45, 0]}>
        <mesh><cylinderGeometry args={[0.12, 0.1, 0.5, 16]} /><primitive object={ninjaGarbMat} attach="material" /></mesh>
      </group>

      {/* ── Arms ── */}
      <group ref={rightArmRef} position={[0.32, 0.55, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
          <primitive object={ninjaGarbMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} /><primitive object={skinMat} attach="material" />
        </mesh>
      </group>
      <group ref={leftArmRef} position={[-0.32, 0.55, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
          <primitive object={ninjaGarbMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} /><primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* ── Head Group ── */}
      <group ref={headRef} position={[0, 0.85, 0]}>
        {/* Head Sphere */}
        <mesh>
          <sphereGeometry args={[0.28, 32, 32]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Dark Spiky Hair (Cone/Cylinder) */}
        <mesh position={[0, 0.2, -0.08]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.32, 0.55, 32]} />
          <meshStandardMaterial color="#0f1419" roughness={0.5} />
        </mesh>
        {/* Eyeband (Headband) - Plain Silver Plate without symbol */}
        <group position={[0, 0.05, 0.22]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 32]} />
            <meshStandardMaterial color="#1a2e22" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.18]} scale={[1, 1.1, 1]}>
             <boxGeometry args={[0.35, 0.14, 0.06]} />
             <primitive object={metalMat} attach="material" />
          </mesh>
        </group>
        {/* Simple Eye dots (closed/meditation - one straight line) */}
        <mesh position={[-0.08, 0, 0.23]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.01, 0.01]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[0.08, 0, 0.23]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.08, 0.01, 0.01]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        
        {/* Scarf flowing from Neck (Billows behind and slightly sideways) */}
        <mesh position={[0, -0.05, -0.28]} rotation={[0.5, 0, Math.sin(1) * 0.2 ]}>
           {/* We'll use useFrame to animate this rotation dynamically specific - simplified here */}
          <planeGeometry args={[0.5, 0.8]} />
          <primitive object={scarfMat} attach="material" />
        </mesh>
      </group>

    </group>
  );
}

// ─── Wrapper Canvas Component ────────────────────────────────────────────────
export default function NarutoMascot() {
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
      className="fixed bottom-6 right-6 z-30 w-52 h-64 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="w-full h-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B2B]/15 to-transparent rounded-full blur-3xl -z-10" />

        <Canvas
          camera={{ position: [0, 0.4, 3.2], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={1.0} color="#fff7ed" />
          <directionalLight position={[3, 4, 3]} intensity={1.5} color="#FF6B2B" />
          <directionalLight position={[-3, 0, 2]} intensity={0.6} color="#22C55E" />
          <pointLight position={[0, 0, 1]} intensity={0.4} color="#fbbf24" />

          <NinjaFigure mousePos={mousePos} />
        </Canvas>
      </div>
    </div>
  );
}
