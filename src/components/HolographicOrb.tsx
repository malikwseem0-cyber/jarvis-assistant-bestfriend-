import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AssistantState } from '../types';

interface HolographicOrbProps {
  state: AssistantState;
  audioLevel?: number; // 0 to 1
  size?: number;
}

// Module-scope reusable math helpers to prevent GC pauses
const _targetColor = new THREE.Color();
const _currentColor = new THREE.Color();

export const HolographicOrb: React.FC<HolographicOrbProps> = ({ state, audioLevel = 0, size = 320 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AssistantState>(state);
  const audioLevelRef = useRef<number>(audioLevel);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 7;

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 3. Composite 3D Hierarchy
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // Inner glowing sphere (Icosahedron wireframe)
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    orbGroup.add(coreMesh);

    // Central solid pulsating kernel
    const kernelGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const kernelMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
    });
    const kernelMesh = new THREE.Mesh(kernelGeo, kernelMat);
    orbGroup.add(kernelMesh);

    // Outer Gyroscope Rings (Torus)
    const ring1Geo = new THREE.TorusGeometry(2.2, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    orbGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.4, 0.015, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat.clone());
    ring2.rotation.x = Math.PI / 2.5;
    orbGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(2.6, 0.015, 16, 100);
    const ring3 = new THREE.Mesh(ring3Geo, ringMat.clone());
    ring3.rotation.y = Math.PI / 3;
    orbGroup.add(ring3);

    // Orbital Particle Swarm
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    orbGroup.add(particleSystem);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const stateColors: Record<AssistantState, number> = {
      idle: 0x00f0ff,        // Cyan electric
      listening: 0x0088ff,   // Deep pulse blue
      thinking: 0xffb700,    // Amber cognitive
      speaking: 0x00ff88,    // Emerald harmonic
      working: 0xb700ff,     // Violet processing
      error: 0xff0044,       // Crimson critical
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const currentSt = stateRef.current;
      const audio = audioLevelRef.current;

      // Color interpolation
      const targetHex = stateColors[currentSt] || 0x00f0ff;
      _targetColor.setHex(targetHex);
      _currentColor.lerp(_targetColor, 0.08);

      coreMat.color.copy(_currentColor);
      kernelMat.color.copy(_currentColor);
      ringMat.color.copy(_currentColor);
      particleMat.color.copy(_currentColor);

      // Rotations based on state
      const speedMultiplier = currentSt === 'thinking' ? 2.5 : currentSt === 'speaking' ? 1.6 : 1.0;

      orbGroup.rotation.y += delta * 0.4 * speedMultiplier;
      orbGroup.rotation.x += delta * 0.2 * speedMultiplier;

      ring1.rotation.x += delta * 0.8 * speedMultiplier;
      ring2.rotation.y += delta * 0.7 * speedMultiplier;
      ring3.rotation.z += delta * 0.6 * speedMultiplier;
      particleSystem.rotation.y -= delta * 0.15;

      // Audio & state reactive pulsation
      const audioPulse = 1 + audio * 0.45;
      const idlePulse = 1 + Math.sin(time * 3) * 0.04;
      const scale = audioPulse * idlePulse;

      coreMesh.scale.set(scale, scale, scale);
      kernelMesh.scale.set(scale * 1.1, scale * 1.1, scale * 1.1);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      kernelGeo.dispose();
      kernelMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        style={{ width: size, height: size }}
        className="cursor-pointer transition-transform hover:scale-105 duration-300"
      />

      {/* Reactive Glow Aura behind Orb */}
      <div
        className={`absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-700 opacity-30 ${
          state === 'speaking'
            ? 'bg-emerald-500 scale-110'
            : state === 'thinking'
            ? 'bg-amber-500 scale-105'
            : state === 'listening'
            ? 'bg-blue-600 scale-110'
            : state === 'working'
            ? 'bg-purple-600 scale-105'
            : state === 'error'
            ? 'bg-red-600 scale-110'
            : 'bg-cyan-500 scale-100'
        }`}
      />
    </div>
  );
};
