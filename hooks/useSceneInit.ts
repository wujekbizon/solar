import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { EnergySystemState } from '@/types/energy';
import { PHYSICS_CONSTANTS } from '@/utils/physicsConstants';
import { updateSkyColor, updateSunLight } from '@/components/Scene/visualization/Environment';
import { updateParticles, type ParticlesData } from '@/components/Scene/visualization/ParticleSystem';

interface UseSceneInitProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  sceneRef: React.RefObject<THREE.Scene | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
  energyStateRef: React.RefObject<EnergySystemState>;
  particlesRef: React.RefObject<ParticlesData | null>;
  particleSystemRef: React.RefObject<THREE.Points | null>;
  keysPressed: React.RefObject<Set<string>>;
  rightMouseDown: React.RefObject<boolean>;
  moveSpeed?: number;
}

/**
 * Custom hook to initialize Three.js scene with camera, renderer, controls, and animation loop
 * Handles WASD camera movement, mouse controls, and frame-by-frame updates
 */
export function useSceneInit({
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
  moveSpeed = 10,
}: UseSceneInitProps) {
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
    controls.enablePan = false; // Disable pan - using right-click for camera rotation instead
    controlsRef.current = controls;

    // Fixed house center as orbit pivot point
    const HOUSE_CENTER = new THREE.Vector3(0, 0, 0);
    controls.target.copy(HOUSE_CENTER); // Set once, never change

    // Track orbit vs free view mode
    const orbitMode = { current: true };

    // Keyboard event handlers for WASD movement
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'shift'].includes(key)) {
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    // Mouse event handlers for orbit/free view switching
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left button - orbit mode
        orbitMode.current = true;
        controls.enabled = true;
      } else if (event.button === 2) { // Right button - free view
        orbitMode.current = false;
        controls.enabled = false; // Disable OrbitControls for free view
        rightMouseDown.current = true;
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        rightMouseDown.current = false;
        // Re-enable orbit after right-click released
        orbitMode.current = true;
        controls.enabled = true;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation loop
    let lastTime = Date.now();
    const animate = () => {
      requestAnimationFrame(animate);
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      const currentState = energyStateRef.current;

      // Update sky color and sun light EVERY frame
      if (scene) {
        updateSkyColor(scene, currentState.currentTime, currentState.weather);
        updateSunLight(scene, currentState.currentTime);
      }

      // Update particles
      if (particlesRef.current && particleSystemRef.current) {
        updateParticles(particlesRef.current, particleSystemRef.current, deltaTime);
      }

      // WASD camera movement (FPS-style)
      const isSprinting = keysPressed.current.has('shift');
      const speedMultiplier = isSprinting ? 2 : 1;
      const moveDistance = moveSpeed * speedMultiplier * deltaTime;
      const rotateSpeed = 2.0; // radians per second

      // Get camera direction vectors
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0; // Keep movement horizontal
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, camera.up).normalize();

      // Camera rotation (when right mouse + A/D)
      if (rightMouseDown.current) {
        const rotateAmount = rotateSpeed * deltaTime;

        if (keysPressed.current.has('a')) {
          // Rotate camera left around house center
          const offset = camera.position.clone().sub(HOUSE_CENTER);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotateAmount);
          camera.position.copy(HOUSE_CENTER.clone().add(offset));
          camera.lookAt(HOUSE_CENTER); // Always look at house
        }
        if (keysPressed.current.has('d')) {
          // Rotate camera right around house center
          const offset = camera.position.clone().sub(HOUSE_CENTER);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotateAmount);
          camera.position.copy(HOUSE_CENTER.clone().add(offset));
          camera.lookAt(HOUSE_CENTER); // Always look at house
        }
      }

      // Calculate movement vector (strafing only when NOT rotating)
      const movement = new THREE.Vector3();

      if (keysPressed.current.has('w')) {
        movement.add(forward.clone().multiplyScalar(moveDistance));
      }
      if (keysPressed.current.has('s')) {
        movement.add(forward.clone().multiplyScalar(-moveDistance));
      }

      // Strafe only if right mouse is NOT down
      if (!rightMouseDown.current) {
        if (keysPressed.current.has('d')) {
          movement.add(right.clone().multiplyScalar(moveDistance));
        }
        if (keysPressed.current.has('a')) {
          movement.add(right.clone().multiplyScalar(-moveDistance));
        }
      }

      // Apply movement to camera only (NOT target)
      if (movement.length() > 0) {
        camera.position.add(movement);

        // Prevent going underground (user wants to enter house but not go below ground)
        if (camera.position.y < 1) {
          camera.position.y = 1;
        }

        // In orbit mode, maintain distance to house center
        if (orbitMode.current) {
          const distToHouse = camera.position.distanceTo(HOUSE_CENTER);
          const direction = camera.position.clone().sub(HOUSE_CENTER).normalize();

          // Clamp distance to OrbitControls min/max
          const targetDist = Math.max(controls.minDistance, Math.min(controls.maxDistance, distToHouse));
          camera.position.copy(HOUSE_CENTER.clone().add(direction.multiplyScalar(targetDist)));
          camera.lookAt(HOUSE_CENTER);
        }
      }

      // Only update OrbitControls when in orbit mode
      if (orbitMode.current && controls.enabled) {
        controls.update();
      }
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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);
}
