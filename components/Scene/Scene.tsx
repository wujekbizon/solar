'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { EnergySystemState } from '@/types/energy';
import { POSITIONS } from './constants';
import { Ground } from './models/Ground';
import { Battery } from './models/Battery';
import { Shed } from './models/Shed';
import { House } from './models/House';
import { SolarPanels } from './models/SolarPanels';
import { Appliances } from './models/Appliances';
import { GridConnection } from './models/GridConnection';
import { Car } from './models/Car';
import { Environment } from './visualization/Environment';
import { PowerLines } from './visualization/PowerLines';
import { ParticleSystem, type ParticlesData } from './visualization/ParticleSystem';
import { useSceneInit } from '@/hooks/useSceneInit';

interface SceneProps {
  energyState: EnergySystemState;
  onApplianceClick?: (applianceId: string) => void;
}

export default function Scene({ energyState, onApplianceClick }: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const houseGroupRef = useRef<THREE.Group | null>(null);
  const solarPanelsRef = useRef<THREE.Group | null>(null);
  const batteryRef = useRef<THREE.Mesh | null>(null);
  const appliancesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const powerLinesRef = useRef<THREE.Group | null>(null);
  const shedPositionRef = useRef<{ x: number; y: number; z: number }>(POSITIONS.inverter);
  const labelsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const energyStateRef = useRef(energyState);
  const keysPressed = useRef<Set<string>>(new Set());
  const moveSpeed = 10;
  const rightMouseDown = useRef<boolean>(false);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particlesRef = useRef<ParticlesData | null>(null);

  // Determine battery scale based on capacity
  const getBatteryScale = (capacity: number): number => {
    if (capacity <= 13.5) return 1; // Small
    if (capacity <= 40) return 1.5; // Medium
    return 2; // Large
  };

  useEffect(() => {
    energyStateRef.current = energyState;
  }, [energyState]);

  useSceneInit({
    containerRef,
    sceneRef,
    cameraRef,
    rendererRef,
    controlsRef,
    energyStateRef,
    particlesRef,
    particleSystemRef,
    keysPressed,
    rightMouseDown,
    moveSpeed,
  });

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Environment (lighting, sky, sun) */}
      <Environment
        sceneRef={sceneRef}
        currentTime={energyState.currentTime}
        weather={energyState.weather}
      />

      {/* 3D Model Components */}
      <Ground sceneRef={sceneRef} />
      <House sceneRef={sceneRef} houseGroupRef={houseGroupRef} />
      <Shed sceneRef={sceneRef} shedPositionRef={shedPositionRef} />
      <Battery
        sceneRef={sceneRef}
        batteryRef={batteryRef}
        scale={getBatteryScale(energyState.battery.capacity)}
      />
      <GridConnection sceneRef={sceneRef} />
      <Car sceneRef={sceneRef} position={POSITIONS.car} />
      <SolarPanels
        sceneRef={sceneRef}
        solarPanelsRef={solarPanelsRef}
        panelCount={energyState.solar.panelCount ?? 56}
        panelAngle={energyState.solar.panelAngle ?? 30}
      />
      <Appliances
        sceneRef={sceneRef}
        appliancesRef={appliancesRef}
        labelsRef={labelsRef}
        appliances={energyState.consumption.appliances}
      />

      {/* Visualization Components */}
      <PowerLines
        sceneRef={sceneRef}
        powerLinesRef={powerLinesRef}
        appliances={energyState.consumption.appliances}
        batteryPosition={POSITIONS.battery}
        gridPosition={POSITIONS.grid}
        shedPosition={POSITIONS.inverter}
        importing={energyState.grid.importing}
        batteryChargingRate={energyState.battery.chargingRate}
        solarPower={energyState.solar.currentPower}
      />
      <ParticleSystem
        sceneRef={sceneRef}
        particleSystemRef={particleSystemRef}
        particlesRef={particlesRef}
        energyState={energyState}
      />

      <div className="absolute top-4 left-4 bg-black/50 text-white p-2 text-xs font-mono rounded">
        <div className="font-bold mb-1">Controls</div>
        <div>W/S: Move forward/back</div>
        <div>A/D: Strafe left/right</div>
        <div>Right-click + A/D: Turn camera</div>
        <div>Shift: Sprint (2x speed)</div>
        <div>Left-click drag: Rotate view</div>
        <div>Mouse wheel: Zoom</div>
      </div>
    </div>
  );
}
