/**
 * Label Helper Functions
 * Canvas-based sprite labels for 3D appliances
 */

import * as THREE from 'three';

interface ApplianceLabelData {
  id?: string;
  name: string;
  powerRating: number;
  isOn: boolean;
}

/**
 * Create a canvas-based sprite label for an appliance
 * Shows name, power rating, and on/off status with color coding
 */
export function createLabel(appliance: ApplianceLabelData): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 512;
  canvas.height = 128;

  // Background color based on state
  context.fillStyle = appliance.isOn ? '#FF6B6B' : '#90EE90'; // Red if ON, green if OFF
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  context.strokeStyle = '#000000';
  context.lineWidth = 4;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  // Name (top line)
  context.fillStyle = '#000000';
  context.font = 'Bold 32px monospace';
  context.textAlign = 'center';
  context.fillText(appliance.name.toUpperCase(), 256, 45);

  // Power (bottom line)
  context.font = 'Bold 28px monospace';
  context.fillText(`${appliance.powerRating.toFixed(2)} kW`, 256, 85);

  // Status indicator
  context.fillStyle = appliance.isOn ? '#FFFFFF' : '#004400';
  context.fillText(appliance.isOn ? '●' : '○', 450, 85);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3, 0.75, 1); // Wider for more info

  // Store appliance ID for click detection
  if (appliance.id) {
    sprite.userData.applianceId = appliance.id;
  }

  return sprite;
}

/**
 * Update all labels when appliance states change
 * Recreates canvas textures to reflect new on/off states
 */
export function updateLabels(
  labelsMap: Map<string, THREE.Sprite>,
  appliances: ApplianceLabelData[]
) {
  appliances.forEach((appliance) => {
    const label = labelsMap.get(appliance.id ?? '');
    if (!label) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = appliance.isOn ? '#FF6B6B' : '#90EE90';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    context.font = 'Bold 32px monospace';
    context.textAlign = 'center';
    context.fillText(appliance.name.toUpperCase(), 256, 45);
    context.font = 'Bold 28px monospace';
    context.fillText(`${appliance.powerRating.toFixed(2)} kW`, 256, 85);
    context.fillStyle = appliance.isOn ? '#FFFFFF' : '#004400';
    context.fillText(appliance.isOn ? '●' : '○', 450, 85);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Dispose old material and texture to prevent memory leak
    if (label.material.map) {
      label.material.map.dispose();
    }
    const oldMaterial = label.material;

    // Recreate material to force Three.js to recognize the change
    label.material = new THREE.SpriteMaterial({ map: texture });
    oldMaterial.dispose();
  });
}
