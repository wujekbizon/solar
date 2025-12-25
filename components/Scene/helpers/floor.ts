import * as THREE from 'three';

let cachedWoodTexture: THREE.CanvasTexture | null = null;
let cachedConcreteTexture: THREE.CanvasTexture | null = null;

export const createWoodTexture = () => {
    if (cachedWoodTexture) {
        return cachedWoodTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = '#8B5A2B';
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 2000; i++) {
      context.fillStyle = `rgba(60, 40, 20, ${Math.random() * 0.1})`;
      context.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 100, 1);
    }

    context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    context.lineWidth = 2;
    const boardWidth = 64;
    for (let x = 0; x <= 512; x += boardWidth) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 512);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);


    cachedWoodTexture = texture;
    return texture;
  };

export const createConcreteTexture = () => {
  if (cachedConcreteTexture) {
    return cachedConcreteTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return null;

  // Base concrete gray
  context.fillStyle = '#6B7280';
  context.fillRect(0, 0, 512, 512);

  // Add random speckles and noise for texture
  for (let i = 0; i < 3000; i++) {
    const alpha = Math.random() * 0.15;
    const brightness = Math.random() > 0.5 ? 255 : 0;
    context.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
    context.fillRect(
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 3,
      Math.random() * 3
    );
  }

  // Add larger color variations (patches)
  for (let i = 0; i < 50; i++) {
    const size = 20 + Math.random() * 40;
    const alpha = Math.random() * 0.08;
    context.fillStyle = `rgba(100, 100, 100, ${alpha})`;
    context.beginPath();
    context.arc(
      Math.random() * 512,
      Math.random() * 512,
      size,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  // Add subtle cracks
  for (let i = 0; i < 8; i++) {
    context.strokeStyle = `rgba(40, 40, 40, ${0.2 + Math.random() * 0.2})`;
    context.lineWidth = 0.5 + Math.random() * 1;
    context.beginPath();
    const startX = Math.random() * 512;
    const startY = Math.random() * 512;
    context.moveTo(startX, startY);

    // Jagged crack line
    let x = startX;
    let y = startY;
    for (let j = 0; j < 5 + Math.random() * 10; j++) {
      x += (Math.random() - 0.5) * 80;
      y += (Math.random() - 0.5) * 80;
      context.lineTo(x, y);
    }
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);

  cachedConcreteTexture = texture;
  return texture;
};