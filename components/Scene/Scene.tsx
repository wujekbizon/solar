'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { EnergySystemState } from '@/types/energy';
import { PHYSICS_CONSTANTS } from '@/utils/physicsConstants';

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

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PHYSICS_CONSTANTS.COLORS.SKY_DAY);
    sceneRef.current = scene;

    // Camera setup - isometric view
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Lighting
    setupLighting(scene);

    // Create 3D objects
    createHouse(scene);
    createSolarPanels(scene);
    createBattery(scene);
    createAppliances(scene, energyState.consumption.appliances);
    createGround(scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update scene based on energy state
  useEffect(() => {
    if (!sceneRef.current) return;

    // Update sky color based on time of day
    updateSkyColor(sceneRef.current, energyState.currentTime);

    // Update appliance states
    updateAppliances(appliancesRef.current, energyState.consumption.appliances);

    // Update sun light intensity
    updateSunLight(sceneRef.current, energyState.currentTime);
  }, [energyState]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
}

// Helper functions

function setupLighting(scene: THREE.Scene) {
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
}

function createHouse(scene: THREE.Scene) {
  const houseGroup = new THREE.Group();

  // Main house structure
  const houseGeometry = new THREE.BoxGeometry(8, 4, 6);
  const houseMaterial = new THREE.MeshStandardMaterial({
    color: PHYSICS_CONSTANTS.COLORS.HOUSE,
  });
  const house = new THREE.Mesh(houseGeometry, houseMaterial);
  house.position.y = 2;
  house.castShadow = true;
  house.receiveShadow = true;
  houseGroup.add(house);

  // Roof
  const roofGeometry = new THREE.ConeGeometry(6, 3, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 5.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  houseGroup.add(roof);

  scene.add(houseGroup);
}

function createSolarPanels(scene: THREE.Scene) {
  const panelGroup = new THREE.Group();

  // Create solar panels on the roof
  const panelGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.8,
    roughness: 0.2,
  });

  // Array of 4x4 panels
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.set(
        -3 + i * 2.1,
        4.8,
        -2.5 + j * 1.6
      );
      panel.rotation.x = -Math.PI / 6; // 30 degree tilt
      panel.castShadow = true;
      panelGroup.add(panel);
    }
  }

  panelGroup.position.y = 0;
  scene.add(panelGroup);
}

function createBattery(scene: THREE.Scene) {
  const batteryGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
  const batteryMaterial = new THREE.MeshStandardMaterial({
    color: 0x404040,
    metalness: 0.6,
    roughness: 0.4,
  });
  const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
  battery.position.set(-5, 0.75, -4);
  battery.castShadow = true;
  battery.receiveShadow = true;
  scene.add(battery);
}

function createAppliances(scene: THREE.Scene, appliances: any[]) {
  const applianceMap = new Map();

  appliances.forEach((appliance) => {
    let geometry: THREE.BufferGeometry;
    let color: number;

    switch (appliance.type) {
      case 'light':
        geometry = new THREE.SphereGeometry(0.2);
        color = 0xFFFF00;
        break;
      case 'refrigerator':
        geometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
        color = 0xC0C0C0;
        break;
      case 'ac':
        geometry = new THREE.BoxGeometry(1, 0.5, 0.3);
        color = 0xF0F0F0;
        break;
      case 'tv':
        geometry = new THREE.BoxGeometry(1.2, 0.7, 0.1);
        color = 0x000000;
        break;
      case 'computer':
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        color = 0x1E1E1E;
        break;
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        color = 0x808080;
    }

    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: appliance.isOn ? color : 0x000000,
      emissiveIntensity: appliance.isOn ? 0.5 : 0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(appliance.position.x, appliance.position.y, appliance.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { applianceId: appliance.id };

    scene.add(mesh);
    applianceMap.set(appliance.id, mesh);
  });

  appliancesRef.current = applianceMap;
}

function createGround(scene: THREE.Scene) {
  const groundGeometry = new THREE.PlaneGeometry(40, 40);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x7CFC00,
    roughness: 0.8,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function updateSkyColor(scene: THREE.Scene, time: number) {
  const { SUNRISE_HOUR, SUNSET_HOUR } = PHYSICS_CONSTANTS;

  let color: THREE.Color;

  if (time < SUNRISE_HOUR || time > SUNSET_HOUR) {
    // Night
    color = new THREE.Color(PHYSICS_CONSTANTS.COLORS.SKY_NIGHT);
  } else if (time < SUNRISE_HOUR + 1) {
    // Dawn
    const t = (time - SUNRISE_HOUR) / 1;
    color = new THREE.Color(PHYSICS_CONSTANTS.COLORS.SKY_NIGHT).lerp(
      new THREE.Color(PHYSICS_CONSTANTS.COLORS.SKY_DAY),
      t
    );
  } else if (time > SUNSET_HOUR - 1) {
    // Dusk
    const t = (time - (SUNSET_HOUR - 1)) / 1;
    color = new THREE.Color(PHYSICS_CONSTANTS.COLORS.SKY_DAY).lerp(
      new THREE.Color(PHYSICS_CONSTANTS.COLORS.SKY_NIGHT),
      t
    );
  } else {
    // Day
    color = new THREE.Color(PHYSICS_CONSTANTS.COLORS.SKY_DAY);
  }

  scene.background = color;
}

function updateAppliances(applianceMap: Map<string, THREE.Mesh>, appliances: any[]) {
  appliances.forEach((appliance) => {
    const mesh = applianceMap.get(appliance.id);
    if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.emissive.setHex(appliance.isOn ? mesh.material.color.getHex() : 0x000000);
      mesh.material.emissiveIntensity = appliance.isOn ? 0.5 : 0;
    }
  });
}

function updateSunLight(scene: THREE.Scene, time: number) {
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
