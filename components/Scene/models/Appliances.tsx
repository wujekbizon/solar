'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import type { ApplianceState } from '@/types/energy';
import { createLabel, updateLabels } from '../helpers/labels';

interface AppliancesProps {
  sceneRef: React.RefObject<THREE.Scene | null>;
  appliancesRef: React.RefObject<Map<string, THREE.Mesh>>;
  labelsRef: React.RefObject<Map<string, THREE.Sprite>>;
  appliances: ApplianceState[];
}

/**
 * All household appliances with 3D models and labels
 * Types: light, refrigerator, AC, TV, computer
 * Dynamic: updates emissive glow and labels when state changes
 */
export function Appliances({ sceneRef, appliancesRef, labelsRef, appliances }: AppliancesProps) {
  // Initial creation
  useEffect(() => {
    if (!sceneRef.current) return;

    const applianceMap = createAppliances(
      sceneRef.current,
      appliances,
      labelsRef.current ?? undefined
    );
    appliancesRef.current = applianceMap;

    return () => {
      // Cleanup all meshes and labels
      applianceMap.forEach(mesh => {
        sceneRef.current?.remove(mesh);
        // Dispose geometries and materials
        if (mesh instanceof THREE.Group) {
          mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (child.material instanceof THREE.Material) {
                child.material.dispose();
              }
            }
          });
        } else {
          mesh.geometry.dispose();
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose();
          }
        }
      });
      labelsRef.current?.forEach(label => {
        sceneRef.current?.remove(label);
        if (label.material.map) {
          label.material.map.dispose();
        }
        label.material.dispose();
      });
    };
  }, []); // Only on mount

  // Update when appliances change (emissive glow + labels)
  useEffect(() => {
    if (appliancesRef.current && labelsRef.current) {
      updateAppliances(appliancesRef.current, labelsRef.current, appliances);
    }
  }, [appliances]);

  return null;
}

/**
 * Internal helper to create all appliance 3D models
 */
function createAppliances(
  scene: THREE.Scene,
  appliances: ApplianceState[],
  labelsMap?: Map<string, THREE.Sprite>
): Map<string, THREE.Mesh> {
  const applianceMap = new Map<string, THREE.Mesh>();

  appliances.forEach((appliance) => {
    let geometry: THREE.BufferGeometry | THREE.Group;
    let color: number;

    switch (appliance.type) {
      case 'light': {
        const lightGroup = new THREE.Group();
        // Bulb
        const bulbGeom = new THREE.SphereGeometry(0.32);
        const bulbMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });
        const bulb = new THREE.Mesh(bulbGeom, bulbMat);
        lightGroup.add(bulb);
        // Socket base
        const socketGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.2);
        const socketMat = new THREE.MeshStandardMaterial({ color: 0xE0E0E0 });
        const socket = new THREE.Mesh(socketGeom, socketMat);
        socket.position.y = 0.42;
        lightGroup.add(socket);
        geometry = lightGroup;
        color = 0xFFFF00;
        break;
      }
      case 'refrigerator': {
        const fridgeGroup = new THREE.Group();
        // Main body
        const bodyGeom = new THREE.BoxGeometry(1.28, 2.4, 1.28);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.4 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        fridgeGroup.add(body);
        // Handle
        const handleGeom = new THREE.BoxGeometry(0.05, 0.6, 0.08);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.8 });
        const handle = new THREE.Mesh(handleGeom, handleMat);
        handle.position.set(0.5, 0, 0.64);
        fridgeGroup.add(handle);
        geometry = fridgeGroup;
        color = 0xC0C0C0;
        break;
      }
      case 'ac': {
        const acGroup = new THREE.Group();
        // Main box
        const acBodyGeom = new THREE.BoxGeometry(1.6, 0.8, 0.48);
        const acBodyMat = new THREE.MeshStandardMaterial({ color: 0xF0F0F0 });
        const acBody = new THREE.Mesh(acBodyGeom, acBodyMat);
        acGroup.add(acBody);
        // Vents
        for (let i = 0; i < 5; i++) {
          const ventGeom = new THREE.BoxGeometry(1.4, 0.05, 0.02);
          const ventMat = new THREE.MeshStandardMaterial({ color: 0x404040 });
          const vent = new THREE.Mesh(ventGeom, ventMat);
          vent.position.set(0, -0.25 + i * 0.12, 0.24);
          acGroup.add(vent);
        }
        geometry = acGroup;
        color = 0xF0F0F0;
        break;
      }
      case 'tv': {
        const tvGroup = new THREE.Group();
        // Screen
        const screenGeom = new THREE.BoxGeometry(1.92, 1.12, 0.16);
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        tvGroup.add(screen);
        // Bezel
        const bezelGeom = new THREE.BoxGeometry(2.0, 1.2, 0.1);
        const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const bezel = new THREE.Mesh(bezelGeom, bezelMat);
        bezel.position.z = -0.05;
        tvGroup.add(bezel);
        // Stand
        const standGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.5);
        const standMat = new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.7 });
        const stand = new THREE.Mesh(standGeom, standMat);
        stand.position.set(0, -0.8, 0);
        tvGroup.add(stand);
        geometry = tvGroup;
        color = 0x000000;
        break;
      }
      case 'computer': {
        const compGroup = new THREE.Group();
        // Tower
        const towerGeom = new THREE.BoxGeometry(0.4, 0.8, 0.8);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x1E1E1E });
        const tower = new THREE.Mesh(towerGeom, towerMat);
        tower.position.x = -0.3;
        compGroup.add(tower);
        // Monitor
        const monitorGeom = new THREE.BoxGeometry(0.8, 0.45, 0.05);
        const monitorMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const monitor = new THREE.Mesh(monitorGeom, monitorMat);
        monitor.position.set(0.3, 0.2, 0);
        compGroup.add(monitor);
        // Power button
        const buttonGeom = new THREE.SphereGeometry(0.03);
        const buttonMat = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.5
        });
        const button = new THREE.Mesh(buttonGeom, buttonMat);
        button.position.set(-0.1, 0.3, 0.4);
        compGroup.add(button);
        geometry = compGroup;
        color = 0x1E1E1E;
        break;
      }
      case 'electric_car': {
        // No mesh - using dedicated Car model from Car.tsx
        // Create label only
        if (labelsMap) {
          const label = createLabel({
            id: appliance.id,
            name: appliance.name,
            powerRating: appliance.powerRating,
            isOn: appliance.isOn
          });
          label.position.set(
            appliance.position.x,
            appliance.position.y + 3.5, // Higher above car
            appliance.position.z
          );
          label.userData = { applianceId: appliance.id };
          scene.add(label);
          labelsMap.set(appliance.id, label);
        }
        return; // Skip mesh creation for electric_car
      }
      default:
        geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        color = 0x808080;
    }

    let mesh: THREE.Mesh | THREE.Group;
    if (geometry instanceof THREE.Group) {
      mesh = geometry;
      mesh.position.set(appliance.position.x, appliance.position.y, appliance.position.z);
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.setHex(appliance.isOn ? child.material.color.getHex() : 0x000000);
            child.material.emissiveIntensity = appliance.isOn ? 0.5 : 0;
          }
        }
      });
    } else {
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: appliance.isOn ? color : 0x000000,
        emissiveIntensity: appliance.isOn ? 0.5 : 0,
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(appliance.position.x, appliance.position.y, appliance.position.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    mesh.userData = { applianceId: appliance.id };

    scene.add(mesh);
    applianceMap.set(appliance.id, mesh as THREE.Mesh);

    // Create and add label
    if (labelsMap) {
      const label = createLabel({
        id: appliance.id,
        name: appliance.name,
        powerRating: appliance.powerRating,
        isOn: appliance.isOn
      });
      label.position.set(
        appliance.position.x,
        appliance.position.y + 2.5, // Higher for visibility
        appliance.position.z
      );
      label.userData = { applianceId: appliance.id };
      scene.add(label);
      labelsMap.set(appliance.id, label);
    }
  });

  return applianceMap;
}

/**
 * Internal helper to update appliance emissive state and labels
 */
function updateAppliances(
  applianceMap: Map<string, THREE.Mesh>,
  labelsMap: Map<string, THREE.Sprite>,
  appliances: ApplianceState[]
) {
  appliances.forEach((appliance) => {
    const mesh = applianceMap.get(appliance.id);
    if (mesh) {
      // Handle both simple meshes and Groups
      if (mesh instanceof THREE.Group) {
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.setHex(appliance.isOn ? child.material.color.getHex() : 0x000000);
            child.material.emissiveIntensity = appliance.isOn ? 0.5 : 0;
            child.material.needsUpdate = true;
          }
        });
      } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.emissive.setHex(appliance.isOn ? mesh.material.color.getHex() : 0x000000);
        mesh.material.emissiveIntensity = appliance.isOn ? 0.5 : 0;
        mesh.material.needsUpdate = true;
      }
    }
  });

  // Update labels
  updateLabels(labelsMap, appliances);
}
