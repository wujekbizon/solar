'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import type { EnergySystemState } from '@/types/energy';
import { PHYSICS_CONSTANTS } from '@/utils/physicsConstants';
import {
  calculateParticleRoutes,
  interpolatePosition,
  getEmissionRate,
  getParticleSpeed,
  calculateDistance,
  type ParticleRoute,
} from '@/utils/particleHelpers';

export interface ParticlesData {
  positions: Float32Array;
  colors: Float32Array;
  progress: Float32Array;
  routeIndex: Int32Array;
  active: boolean[];
  routes: ParticleRoute[];
  lastSpawnTime: number[];
}

interface ParticleSystemProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  particleSystemRef: React.RefObject<THREE.Points | null>;
  particlesRef: React.RefObject<ParticlesData | null>;
  energyState: EnergySystemState;
}

/**
 * ParticleSystem component managing energy flow visualization
 * - Creates 300 particles for visualizing energy transfer
 * - Color-coded: yellow (solar), blue (battery), red (grid)
 * - Updates routes based on energy flow changes
 */
export function ParticleSystem({
  sceneRef,
  particleSystemRef,
  particlesRef,
  energyState,
}: ParticleSystemProps) {
  // Initialize particle system on mount
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const MAX_PARTICLES = 300;

    // Particle data arrays
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const progress = new Float32Array(MAX_PARTICLES);
    const routeIndex = new Int32Array(MAX_PARTICLES);
    const active = new Array(MAX_PARTICLES).fill(false);
    const lastSpawnTime = new Array(10).fill(0); // Track last spawn per route

    // Create particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: PHYSICS_CONSTANTS.PARTICLE_SIZE,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    particlesRef.current = {
      positions,
      colors,
      progress,
      routeIndex,
      active,
      routes: [],
      lastSpawnTime,
    };

    return () => {
      scene.remove(particleSystem);
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  // Update particle routes when energy flow changes
  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.routes = calculateParticleRoutes(energyState);
    }
  }, [
    energyState.solar.currentPower,
    energyState.battery.chargingRate,
    energyState.grid.importing,
    energyState.consumption.appliances,
  ]);

  return null;
}

/**
 * Updates particle positions and spawns new particles
 * Exported for use in animation loop
 */
export function updateParticles(
  particles: ParticlesData,
  particleSystem: THREE.Points,
  deltaTime: number
) {
  const now = Date.now() / 1000; // Current time in seconds
  const MAX_PARTICLES = particles.active.length;

  // Update existing particles
  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (!particles.active[i]) continue;

    const rIdx = particles.routeIndex[i];
    if (rIdx < 0 || rIdx >= particles.routes.length) {
      particles.active[i] = false;
      continue;
    }

    const route = particles.routes[rIdx];
    const speed = getParticleSpeed(route.power);
    const distance = calculateDistance(route.source, route.destination);
    const progressIncrement = (speed / distance) * deltaTime;

    particles.progress[i] += progressIncrement;

    // Check if particle reached destination
    if (particles.progress[i] >= 1.0) {
      particles.active[i] = false;
      continue;
    }

    // Update position
    const pos = interpolatePosition(route.source, route.destination, particles.progress[i]);
    const idx = i * 3;
    particles.positions[idx] = pos.x;
    particles.positions[idx + 1] = pos.y;
    particles.positions[idx + 2] = pos.z;
  }

  // Spawn new particles for each active route
  particles.routes.forEach((route, routeIdx) => {
    const emissionRate = getEmissionRate(route.power);
    const spawnInterval = 1.0 / emissionRate; // Time between spawns

    if (now - particles.lastSpawnTime[routeIdx] >= spawnInterval) {
      // Find inactive particle slot
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (!particles.active[i]) {
          // Activate particle
          particles.active[i] = true;
          particles.routeIndex[i] = routeIdx;
          particles.progress[i] = 0;

          // Set initial position
          const idx = i * 3;
          particles.positions[idx] = route.source.x;
          particles.positions[idx + 1] = route.source.y;
          particles.positions[idx + 2] = route.source.z;

          // Set color (convert hex to RGB)
          const color = new THREE.Color(route.color);
          particles.colors[idx] = color.r;
          particles.colors[idx + 1] = color.g;
          particles.colors[idx + 2] = color.b;

          particles.lastSpawnTime[routeIdx] = now;
          break;
        }
      }
    }
  });

  // Update geometry attributes
  const geometry = particleSystem.geometry;
  const positionAttr = geometry.getAttribute('position');
  const colorAttr = geometry.getAttribute('color');

  positionAttr.needsUpdate = true;
  colorAttr.needsUpdate = true;
}
