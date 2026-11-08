'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function VoxelAntiGravityGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 64; // Restrained 4x4x4 floating server cluster
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute 4x4x4 grid positions with individual levitation speeds & phases
  const voxels = useMemo(() => {
    const temp = [];
    const size = 4;
    const spacing = 1.6;
    const offset = ((size - 1) * spacing) / 2;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          temp.push({
            baseX: x * spacing - offset,
            baseY: y * spacing - offset,
            baseZ: z * spacing - offset,
            speed: 0.5 + Math.random() * 0.5,
            offset: Math.random() * Math.PI * 2,
            scale: 0.65 + Math.random() * 0.25,
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
      // Subtle organic levitation
      const floatY = Math.sin(time * v.speed + v.offset) * 0.25;
      const floatX = Math.cos(time * 0.3 * v.speed + v.offset) * 0.1;
      const rotY = time * 0.15 + (v.baseX + v.baseZ) * 0.08;

      dummy.position.set(v.baseX + floatX, v.baseY + floatY, v.baseZ);
      dummy.rotation.set(time * 0.08, rotY, Math.sin(time * 0.1 + v.offset) * 0.15);
      dummy.scale.setScalar(v.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.04;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
    >
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {/* Restrained dark obsidian metal with very subtle #2DEB90 edge glow */}
      <meshStandardMaterial
        color="#0B0E14"
        emissive="#2DEB90"
        emissiveIntensity={0.16}
        wireframe={true}
        roughness={0.4}
        metalness={0.9}
        transparent={true}
        opacity={0.35}
      />
    </instancedMesh>
  );
}

function SceneCameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    // Subtle, restrained mouse parallax tilt
    const targetX = state.pointer.x * 1.2;
    const targetY = state.pointer.y * 0.8 + 0.3;

    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Hero3D() {
  return (
    <div
      id="hero-3d-canvas-wrap"
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-60"
    >
      <Canvas
        camera={{ position: [0, 0.8, 8.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} color="#2DEB90" />
        <pointLight position={[-10, -10, -5]} intensity={0.6} color="#06B6D4" />

        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <VoxelAntiGravityGrid />
        </Float>

        <SceneCameraRig />
      </Canvas>
    </div>
  );
}
