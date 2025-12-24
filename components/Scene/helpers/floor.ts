import * as THREE from 'three';

let cachedWoodTexture: THREE.CanvasTexture | null = null;

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