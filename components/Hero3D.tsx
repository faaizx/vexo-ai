'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function VoxelAntiGravityGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 125; // 5x5x5 floating server/voxel cluster
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute 5x5x5 grid positions with individual levitation speeds & phases
  const voxels = useMemo(() => {
    const temp = [];
    const size = 5;
    const spacing = 1.35;
    const offset = ((size - 1) * spacing) / 2;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          temp.push({
            baseX: x * spacing - offset,
            baseY: y * spacing - offset,
            baseZ: z * spacing - offset,
            speed: 0.6 + Math.random() * 0.8,
            offset: Math.random() * Math.PI * 2,
            scale: 0.72 + Math.random() * 0.28,
          });
        }
      }
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    voxels.forEach((v, i) => {
      // Harmonic anti-gravity levitation
      const floatY = Math.sin(time * v.speed + v.offset) * 0.35;
      const floatX = Math.cos(time * 0.4 * v.speed + v.offset) * 0.15;
      const rotY = time * 0.25 + (v.baseX + v.baseZ) * 0.1;

      dummy.position.set(v.baseX + floatX, v.baseY + floatY, v.baseZ);
      dummy.rotation.set(time * 0.1, rotY, Math.sin(time * 0.15 + v.offset) * 0.2);
      dummy.scale.setScalar(v.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.08;
    meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.15;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      {/* Dark metallic core with #00FF9D neon green emissive glow */}
      <meshStandardMaterial
        color="#080C14"
        emissive="#00FF9D"
        emissiveIntensity={0.65}
        wireframe={true}
        roughness={0.25}
        metalness={0.85}
      />
    </instancedMesh>
  );
}

function SceneCameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    // Subtle mouse parallax tilt
    const targetX = state.pointer.x * 2.2;
    const targetY = state.pointer.y * 1.4 + 0.5;

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Hero3D() {
  return (
    <div
      id="hero-3d-canvas-wrap"
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 1.2, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00FF9D" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#06B6D4" />

        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
          <VoxelAntiGravityGrid />
        </Float>

        <SceneCameraRig />
      </Canvas>
    </div>
  );
}
