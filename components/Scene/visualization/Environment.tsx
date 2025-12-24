'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { PHYSICS_CONSTANTS } from '@/utils/physicsConstants';

interface EnvironmentProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  currentTime: number;
  weather: 'sunny' | 'cloudy' | 'night';
}

/**
 * Environment component managing scene lighting and atmosphere
 * - Ambient, directional (sun), and hemisphere lights
 * - Dynamic sky color based on time of day and weather
 * - Sun position and intensity following day/night cycle
 */
export function Environment({ sceneRef, currentTime, weather }: EnvironmentProps) {
  // Setup lighting on mount
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.name = 'sunLight';
    scene.add(sunLight);

    // Hemisphere light for realistic sky/ground
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.5);
    scene.add(hemiLight);

    return () => {
      scene.remove(ambientLight);
      scene.remove(sunLight);
      scene.remove(hemiLight);
    };
  }, []);

  return null;
}

/**
 * Updates scene background color based on time of day and weather
 * Exported for use in animation loop
 */
export function updateSkyColor(scene: THREE.Scene, time: number, weather: 'sunny' | 'cloudy' | 'night') {
  const { SUNRISE_HOUR, SUNSET_HOUR } = PHYSICS_CONSTANTS;

  let baseColor: THREE.Color;

  // 1. Get base color from time of day
  if (time < SUNRISE_HOUR || time > SUNSET_HOUR) {
    // Night
    baseColor = new THREE.Color('#0a0a1a'); // Darker night
  } else if (time < SUNRISE_HOUR + 1) {
    // Dawn
    const t = (time - SUNRISE_HOUR) / 1;
    baseColor = new THREE.Color('#191970').lerp(
      new THREE.Color('#87CEEB'),
      t
    );
  } else if (time > SUNSET_HOUR - 1) {
    // Dusk
    const t = (time - (SUNSET_HOUR - 1)) / 1;
    baseColor = new THREE.Color('#87CEEB').lerp(
      new THREE.Color('#191970'),
      t
    );
  } else {
    // Day
    baseColor = new THREE.Color('#87CEEB'); // Sky blue
  }

  // 2. Apply weather modifier
  let finalColor = baseColor;

  if (weather === 'cloudy' && time >= SUNRISE_HOUR && time <= SUNSET_HOUR) {
    // Darken for clouds (40% darker)
    finalColor = baseColor.clone();
    finalColor.multiplyScalar(0.6);
  } else if (weather === 'night') {
    // Force dark regardless of time
    finalColor = new THREE.Color('#0a0a1a');
  }
  // sunny - use base time color

  scene.background = finalColor;
}

/**
 * Updates sun light intensity and position based on time of day
 * Exported for use in animation loop
 */
export function updateSunLight(scene: THREE.Scene, time: number) {
  const sunLight = scene.getObjectByName('sunLight') as THREE.DirectionalLight;
  if (!sunLight) return;

  const { SUNRISE_HOUR, SUNSET_HOUR } = PHYSICS_CONSTANTS;

  if (time < SUNRISE_HOUR || time > SUNSET_HOUR) {
    sunLight.intensity = 0.1;
  } else {
    const dayProgress = (time - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR);
    const intensity = Math.sin(Math.PI * dayProgress) * 0.8 + 0.3;
    sunLight.intensity = intensity;
  }

  // Update sun position
  const angle = ((time - 6) / 12) * Math.PI;
  sunLight.position.set(
    Math.cos(angle) * 20,
    Math.sin(angle) * 20,
    10
  );
}
