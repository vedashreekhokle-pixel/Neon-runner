import * as THREE from 'three';

export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a0914';
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const s = Math.random() * 2 + 1;
    ctx.fillRect(rx, ry, s, s);
  }

  ctx.strokeStyle = '#161426';
  ctx.lineWidth = 3;
  for (let y = 0; y < 1024; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#00f0ff';

  const dashLength = 80;
  const gapLength = 60;
  const lane1X = 1024 * (1 / 3);
  const lane2X = 1024 * (2 / 3);

  for (let y = 0; y < 1024; y += dashLength + gapLength) {
    ctx.fillRect(lane1X - 4, y, 8, dashLength);
    ctx.fillRect(lane2X - 4, y, 8, dashLength);
  }

  ctx.shadowColor = '#ff007f';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ff007f';
  ctx.fillRect(0, 0, 24, 1024);
  ctx.fillRect(1000, 0, 24, 1024);

  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBuildingTexture(seed: number = 0): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#06050b';
  ctx.fillRect(0, 0, 512, 1024);

  ctx.strokeStyle = '#121020';
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  const windowColors = [
    'rgba(0, 240, 255, 0.85)',
    'rgba(255, 0, 128, 0.75)',
    'rgba(255, 200, 50, 0.8)',
    'rgba(140, 50, 255, 0.85)',
    'rgba(20, 25, 45, 0.3)',
  ];

  for (let y = 16; y < 1000; y += 24) {
    for (let x = 8; x < 500; x += 32) {
      const rand = Math.sin(x * 12.3 + y * 45.6 + seed * 78.9) * 10000;
      const frac = rand - Math.floor(rand);
      
      if (frac < 0.45) {
        const colorIdx = Math.floor(frac * 10) % windowColors.length;
        ctx.fillStyle = windowColors[colorIdx];
        ctx.fillRect(x + 2, y + 2, 22, 14);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createHoloBillboardTexture(title: string, sub: string, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(6, 4, 18, 0.9)';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 18;
  ctx.strokeRect(8, 8, 496, 240);

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 40); ctx.lineTo(20, 20); ctx.lineTo(40, 20);
  ctx.moveTo(472, 20); ctx.lineTo(492, 20); ctx.lineTo(492, 40);
  ctx.moveTo(20, 216); ctx.lineTo(20, 236); ctx.lineTo(40, 236);
  ctx.moveTo(472, 236); ctx.lineTo(492, 236); ctx.lineTo(492, 216);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = 0; y < 256; y += 4) {
    ctx.fillRect(0, y, 512, 1);
  }

  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Orbitron", monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, 110);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 20px "Chakra Petch", sans-serif';
  ctx.fillText(sub, 256, 170);

  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('SYS.CORP // 2099 // ONLINE', 256, 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffaa00';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#111116';
  const stripeW = 32;
  for (let i = -256; i < 512; i += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeW, 0);
    ctx.lineTo(i + stripeW + 256, 256);
    ctx.lineTo(i + 256, 256);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
