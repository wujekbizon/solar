'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

  // Particle system refs
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particlesRef = useRef<{
    positions: Float32Array;
    colors: Float32Array;
    progress: Float32Array;
    routeIndex: Int32Array;
    active: boolean[];
    routes: ParticleRoute[];
    lastSpawnTime: number[];
  } | null>(null);

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
    camera.position.set(25, 20, 25);
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
    solarPanelsRef.current = createSolarPanels(scene, energyState.solar.panelCount ?? 56);
    createBattery(scene);
    appliancesRef.current = createAppliances(scene, energyState.consumption.appliances);
    powerLinesRef.current = createPowerLines(scene);
    createGround(scene);

    // Create particle system
    const MAX_PARTICLES = 300;
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const progress = new Float32Array(MAX_PARTICLES);
    const routeIndex = new Int32Array(MAX_PARTICLES);
    const active = new Array(MAX_PARTICLES).fill(false);
    const lastSpawnTime = new Array(10).fill(0); // Track last spawn per route

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

    // Animation loop
    let lastTime = Date.now();
    const animate = () => {
      requestAnimationFrame(animate);
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      // Update particles
      if (particlesRef.current && particleSystemRef.current) {
        updateParticles(particlesRef.current, particleSystemRef.current, deltaTime);
      }

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

    // Update particle routes
    if (particlesRef.current) {
      particlesRef.current.routes = calculateParticleRoutes(energyState);
    }

    // Update power lines
    if (powerLinesRef.current) {
      updatePowerLines(
        powerLinesRef.current,
        energyState.consumption.appliances,
        { x: -5, y: 0.75, z: -4 },
        { x: 10, y: 0, z: 0 },
        energyState.grid.importing,
        energyState.battery.chargingRate
      );
    }
  }, [energyState]);

  // Dark mode support
  useEffect(() => {
    if (!sceneRef.current) return;

    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (sceneRef.current) {
        if (isDark) {
          // Dark mode: use dark background
          sceneRef.current.background = new THREE.Color(0x0a0a0a);
        } else {
          // Light mode: restore time-based sky color
          updateSkyColor(sceneRef.current, energyState.currentTime);
        }
      }
    };

    // Initial theme check
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [energyState.currentTime]);

  // Update solar panels when count changes
  useEffect(() => {
    if (!sceneRef.current || !solarPanelsRef.current) return;

    // Remove old panels
    sceneRef.current.remove(solarPanelsRef.current);

    // Create new panels with updated count
    solarPanelsRef.current = createSolarPanels(sceneRef.current, energyState.solar.panelCount ?? 56);
  }, [energyState.solar.panelCount]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
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

  // Main house structure - taller walls
  const houseWidth = 16;
  const houseHeight = 12; // Raised from 8 to 12
  const houseDepth = 10;

  const houseGeometry = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
  const houseMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    roughness: 0.1,
    metalness: 0.5,
  });
  const house = new THREE.Mesh(houseGeometry, houseMaterial);
  house.position.y = houseHeight / 2; // 6 (half of 12)
  house.castShadow = true;
  house.receiveShadow = true;
  houseGroup.add(house);

  // Flat roof on top
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const roofWidth = 17; // Slightly larger than house for overhang
  const roofDepth = 11;
  const roofThickness = 0.3;

  const roofGeometry = new THREE.BoxGeometry(roofWidth, roofThickness, roofDepth);
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = houseHeight + roofThickness / 2; // Top of house
  roof.castShadow = true;
  roof.receiveShadow = true;
  houseGroup.add(roof);

  scene.add(houseGroup);
}

function createSolarPanels(scene: THREE.Scene, panelCount: number): THREE.Group {
  const panelGroup = new THREE.Group();
  panelGroup.name = 'solarPanels';

  // Panel dimensions
  const panelWidth = 2;
  const panelDepth = 1.5;
  const panelGeometry = new THREE.BoxGeometry(panelWidth, 0.1, panelDepth);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.8,
    roughness: 0.2,
  });

  // Roof parameters (match createHouse flat roof)
  const houseHeight = 12;
  const roofThickness = 0.3;
  const roofY = houseHeight + roofThickness; // Top of flat roof
  const roofWidth = 17;
  const roofDepth = 11;

  // Grid calculation - dynamic based on panel count
  const panelSpacing = 0.1;
  const panelPitchX = panelWidth + panelSpacing;  // 2.1
  const panelPitchZ = panelDepth + panelSpacing;  // 1.6

  // Calculate grid dimensions from panel count
  const maxCols = 8; // Max panels across roof width
  const cols = Math.min(maxCols, panelCount);
  const rows = Math.ceil(panelCount / cols);

  // Panel Y position - slightly above flat roof
  const panelY = roofY + 0.1; // 0.1 units above roof surface

  // Create panels in grid on flat roof
  let panelsPlaced = 0;
  for (let row = 0; row < rows && panelsPlaced < panelCount; row++) {
    for (let col = 0; col < cols && panelsPlaced < panelCount; col++) {
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);

      // X: distribute across roof width
      const xOffset = -roofWidth/2 + panelWidth/2 + 0.5 + col * panelPitchX;

      // Z: distribute along roof depth
      const zOffset = -roofDepth/2 + panelDepth/2 + row * panelPitchZ;

      panel.position.set(xOffset, panelY, zOffset);
      // No rotation - flat panels on flat roof
      panel.castShadow = true;
      panelGroup.add(panel);

      panelsPlaced++;
    }
  }

  scene.add(panelGroup);
  return panelGroup;
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

function createAppliances(scene: THREE.Scene, appliances: any[]): Map<string, THREE.Mesh> {
  const applianceMap = new Map<string, THREE.Mesh>();

  appliances.forEach((appliance) => {
    let geometry: THREE.BufferGeometry;
    let color: number;

    // Increased sizes (0.8x multiplier from original)
    switch (appliance.type) {
      case 'light':
        geometry = new THREE.SphereGeometry(0.32); // Was 0.2
        color = 0xFFFF00;
        break;
      case 'refrigerator':
        geometry = new THREE.BoxGeometry(1.28, 2.4, 1.28); // Was 0.8, 1.5, 0.8
        color = 0xC0C0C0;
        break;
      case 'ac':
        geometry = new THREE.BoxGeometry(1.6, 0.8, 0.48); // Was 1, 0.5, 0.3
        color = 0xF0F0F0;
        break;
      case 'tv':
        geometry = new THREE.BoxGeometry(1.92, 1.12, 0.16); // Was 1.2, 0.7, 0.1
        color = 0x000000;
        break;
      case 'computer':
        geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8); // Was 0.5, 0.5, 0.5
        color = 0x1E1E1E;
        break;
      default:
        geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8); // Was 0.5, 0.5, 0.5
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

    // Add text label above appliance
    const label = createLabel(appliance.name);
    label.position.set(
      appliance.position.x,
      appliance.position.y + 2,
      appliance.position.z
    );
    scene.add(label);
  });

  return applianceMap;
}

// Helper function to create text labels
function createLabel(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 256;
  canvas.height = 64;

  context.fillStyle = '#00ff88';
  context.font = 'Bold 32px monospace';
  context.textAlign = 'center';
  context.fillText(text.toUpperCase(), 128, 40);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2, 0.5, 1);

  return sprite;
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
      mesh.material.needsUpdate = true;
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

function updateParticles(
  particles: {
    positions: Float32Array;
    colors: Float32Array;
    progress: Float32Array;
    routeIndex: Int32Array;
    active: boolean[];
    routes: ParticleRoute[];
    lastSpawnTime: number[];
  },
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

function createPowerLines(scene: THREE.Scene): THREE.Group {
  const linesGroup = new THREE.Group();
  linesGroup.name = 'powerLines';
  scene.add(linesGroup);
  return linesGroup;
}

function updatePowerLines(
  linesGroup: THREE.Group,
  appliances: any[],
  battery: { x: number; y: number; z: number },
  grid: { x: number; y: number; z: number },
  importing: boolean,
  batteryChargingRate: number
) {
  // Clear existing lines
  linesGroup.clear();

  // Only show lines when power is being drawn from battery or grid
  const batteryDischarging = batteryChargingRate > 0; // chargingRate > 0 means discharging
  const showLines = importing || batteryDischarging;

  if (!showLines) return;

  // For each ON appliance, create line from power source
  appliances.forEach((appliance) => {
    if (!appliance.isOn) return;

    // Determine source: grid if importing, else battery when discharging
    const source = importing ? grid : battery;
    const color = importing ? 0xff6347 : 0x00bfff;

    // Create tube for wire
    const points = [
      new THREE.Vector3(source.x, source.y, source.z),
      new THREE.Vector3(appliance.position.x, appliance.position.y, appliance.position.z),
    ];

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);

    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
    });

    const line = new THREE.Mesh(geometry, material);
    line.renderOrder = 999; // Render on top
    linesGroup.add(line);
  });
}
