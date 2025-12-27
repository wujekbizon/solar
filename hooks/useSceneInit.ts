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

    let animationFrameId: number | null = null;
    let isCleanedUp = false;

    try {
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
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // CRITICAL: Store reference to container element before appending
      const container = containerRef.current;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 10;
      controls.maxDistance = 50;
      controls.maxPolarAngle = Math.PI / 2;
      controls.enablePan = false;
      controlsRef.current = controls;

      // Fixed house center as orbit pivot point
      const HOUSE_CENTER = new THREE.Vector3(0, 0, 0);
      controls.target.copy(HOUSE_CENTER);

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

      // Mouse event handlers
      const handleMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
          orbitMode.current = true;
          controls.enabled = true;
        } else if (event.button === 2) {
          orbitMode.current = false;
          controls.enabled = false;
          rightMouseDown.current = true;
        }
      };

      const handleMouseUp = (event: MouseEvent) => {
        if (event.button === 2) {
          rightMouseDown.current = false;
          orbitMode.current = true;
          controls.enabled = true;
        }
      };

      // Window resize handler
      const handleResize = () => {
        if (!container || !camera || !renderer || isCleanedUp) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };

      // Add event listeners
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('resize', handleResize);

      // Animation loop
      let lastTime = Date.now();
      const animate = () => {
        if (isCleanedUp) return; // Stop animation if cleaned up

        animationFrameId = requestAnimationFrame(animate);
        const now = Date.now();
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        const currentState = energyStateRef.current;

        // Update sky color and sun light
        if (scene && !isCleanedUp) {
          updateSkyColor(scene, currentState.currentTime, currentState.weather);
          updateSunLight(scene, currentState.currentTime);
        }

        // Update particles
        if (particlesRef.current && particleSystemRef.current && !isCleanedUp) {
          updateParticles(particlesRef.current, particleSystemRef.current, deltaTime);
        }

        // WASD camera movement
        const isSprinting = keysPressed.current.has('shift');
        const speedMultiplier = isSprinting ? 2 : 1;
        const moveDistance = moveSpeed * speedMultiplier * deltaTime;
        const rotateSpeed = 2.0;

        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();

        // Camera rotation
        if (rightMouseDown.current) {
          const rotateAmount = rotateSpeed * deltaTime;

          if (keysPressed.current.has('a')) {
            const offset = camera.position.clone().sub(HOUSE_CENTER);
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotateAmount);
            camera.position.copy(HOUSE_CENTER.clone().add(offset));
            camera.lookAt(HOUSE_CENTER);
          }
          if (keysPressed.current.has('d')) {
            const offset = camera.position.clone().sub(HOUSE_CENTER);
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotateAmount);
            camera.position.copy(HOUSE_CENTER.clone().add(offset));
            camera.lookAt(HOUSE_CENTER);
          }
        }

        // Movement
        const movement = new THREE.Vector3();

        if (keysPressed.current.has('w')) {
          movement.add(forward.clone().multiplyScalar(moveDistance));
        }
        if (keysPressed.current.has('s')) {
          movement.add(forward.clone().multiplyScalar(-moveDistance));
        }

        if (!rightMouseDown.current) {
          if (keysPressed.current.has('d')) {
            movement.add(right.clone().multiplyScalar(moveDistance));
          }
          if (keysPressed.current.has('a')) {
            movement.add(right.clone().multiplyScalar(-moveDistance));
          }
        }

        if (movement.length() > 0) {
          camera.position.add(movement);

          if (camera.position.y < 1) {
            camera.position.y = 1;
          }

          if (orbitMode.current) {
            const distToHouse = camera.position.distanceTo(HOUSE_CENTER);
            const direction = camera.position.clone().sub(HOUSE_CENTER).normalize();
            const targetDist = Math.max(controls.minDistance, Math.min(controls.maxDistance, distToHouse));
            camera.position.copy(HOUSE_CENTER.clone().add(direction.multiplyScalar(targetDist)));
            camera.lookAt(HOUSE_CENTER);
          }
        }

        if (orbitMode.current && controls.enabled && !isCleanedUp) {
          controls.update();
        }
        
        if (!isCleanedUp) {
          renderer.render(scene, camera);
        }
      };
      
      animate();

      // CRITICAL CLEANUP FUNCTION
      return () => {
        console.log('Cleaning up Three.js scene...');
        isCleanedUp = true;

        // Cancel animation frame
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        // Remove event listeners
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);

        // Dispose controls
        if (controlsRef.current) {
          controlsRef.current.dispose();
          controlsRef.current = null;
        }

        // Dispose renderer and force context loss
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current.forceContextLoss();
          
          // Remove canvas from DOM
          if (container && rendererRef.current.domElement.parentNode === container) {
            container.removeChild(rendererRef.current.domElement);
          }
          rendererRef.current = null;
        }

        // Clear scene
        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry?.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach(material => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            }
          });
          sceneRef.current.clear();
          sceneRef.current = null;
        }

        // Clear camera
        cameraRef.current = null;

        console.log('Three.js scene cleanup complete');
      };
    } catch (error) {
      console.error('Error initializing Three.js scene:', error);
      isCleanedUp = true;
      
      // Attempt cleanup on error
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current = null;
      }
      if (sceneRef.current) {
        sceneRef.current = null;
      }
      
      throw error; // Re-throw to be caught by error boundary
    }
  }, []); // CRITICAL: Empty dependency array to run only once
}