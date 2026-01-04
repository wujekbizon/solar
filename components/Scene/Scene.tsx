'use client';

import { useEffect, useRef, useState } from 'react';
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
import SceneControls from './SceneControls';

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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(25, 20, 25);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-red-900/20 to-red-950/20">
        <div className="text-center p-8 bg-red-900/30 rounded-lg backdrop-blur">
          <div className="text-red-400 text-xl font-bold mb-2">
            Error Loading 3D Scene
          </div>
          <div className="text-red-300 text-sm mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900/20 to-blue-950/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4" />
          <p className="text-blue-300 font-medium">Initializing 3D Scene...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {sceneRef.current && (
      <>
        <Environment
          sceneRef={sceneRef}
          currentTime={energyState.currentTime}
          weather={energyState.weather}
        />

        <Ground sceneRef={sceneRef} />
        <House sceneRef={sceneRef} houseGroupRef={houseGroupRef} />
        <Shed sceneRef={sceneRef} shedPositionRef={shedPositionRef} />
        <Battery sceneRef={sceneRef} batteries={energyState.batteries} />
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
      </>
    )}

      <SceneControls onResetCamera={resetCamera} />
    </div>
  );
}