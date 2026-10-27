import * as THREE from 'three';
import { GAME_CONSTANTS } from '../constants';
import { createBuildingTexture, createHoloBillboardTexture, createRoadTexture } from '../proceduralTextures';

export interface TrackChunk {
  group: THREE.Group;
  z: number;
}

export class CityEnvironment {
  public scene: THREE.Scene;
  private roadTexture: THREE.CanvasTexture;
  private roadMaterial: THREE.MeshStandardMaterial;

  // Track chunks
  public chunks: TrackChunk[] = [];

  // Atmospheric rain system
  private rainGeometry: THREE.BufferGeometry;
  private rainPoints: THREE.Points;
  private rainCount: number = 1200;
  private rainVelocities: Float32Array;

  // Speed lines system
  private speedLinesGeometry: THREE.BufferGeometry;
  private speedLines: THREE.LineSegments;
  private speedLineCount: number = 180;

  // Background flying cars
  private flyingCars: THREE.Group[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Road texture & material
    this.roadTexture = createRoadTexture();
    this.roadTexture.repeat.set(1, 4);

    this.roadMaterial = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: 0.25,
      metalness: 0.8,
    });

    // Initialize track chunks
    for (let i = 0; i < GAME_CONSTANTS.VISIBLE_CHUNKS + 1; i++) {
      const chunkZ = -i * GAME_CONSTANTS.CHUNK_LENGTH;
      const chunk = this.createTrackChunk(chunkZ, i);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
    }

    // Initialize rain system
    const { points, vels, geo } = this.initRain();
    this.rainPoints = points;
    this.rainVelocities = vels;
    this.rainGeometry = geo;
    this.scene.add(this.rainPoints);

    // Initialize speed lines
    const { lines, geo: lineGeo } = this.initSpeedLines();
    this.speedLines = lines;
    this.speedLinesGeometry = lineGeo;
    this.scene.add(this.speedLines);

    // Initialize flying skyway traffic
    this.initFlyingCars();
  }

  private createTrackChunk(z: number, chunkIndex: number): TrackChunk {
    const group = new THREE.Group();
    group.position.z = z;

    // 1. Road deck surface
    const roadGeo = new THREE.PlaneGeometry(GAME_CONSTANTS.TRACK_WIDTH, GAME_CONSTANTS.CHUNK_LENGTH);
    const road = new THREE.Mesh(roadGeo, this.roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -GAME_CONSTANTS.CHUNK_LENGTH / 2);
    road.receiveShadow = true;
    group.add(road);

    // 2. Neon roadside barriers & safety railings
    const railingGeo = new THREE.BoxGeometry(0.35, 0.7, GAME_CONSTANTS.CHUNK_LENGTH);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c29,
      metalness: 0.9,
      roughness: 0.2,
    });

    const railGlowMat = new THREE.MeshBasicMaterial({
      color: GAME_CONSTANTS.COLORS.CYAN,
    });

    // Left barrier
    const railLeft = new THREE.Mesh(railingGeo, railMat);
    railLeft.position.set(-GAME_CONSTANTS.TRACK_WIDTH / 2 - 0.15, 0.35, -GAME_CONSTANTS.CHUNK_LENGTH / 2);
    group.add(railLeft);

    const railGlowL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, GAME_CONSTANTS.CHUNK_LENGTH), railGlowMat);
    railGlowL.position.set(-GAME_CONSTANTS.TRACK_WIDTH / 2, 0.7, -GAME_CONSTANTS.CHUNK_LENGTH / 2);
    group.add(railGlowL);

    // Right barrier
    const railRight = new THREE.Mesh(railingGeo, railMat);
    railRight.position.set(GAME_CONSTANTS.TRACK_WIDTH / 2 + 0.15, 0.35, -GAME_CONSTANTS.CHUNK_LENGTH / 2);
    group.add(railRight);

    const railGlowR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, GAME_CONSTANTS.CHUNK_LENGTH), railGlowMat);
    railGlowR.position.set(GAME_CONSTANTS.TRACK_WIDTH / 2, 0.7, -GAME_CONSTANTS.CHUNK_LENGTH / 2);
    group.add(railGlowR);

    // 3. Under-deck structural truss beams
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x0d0e15, metalness: 0.8, roughness: 0.5 });
    const truss = new THREE.Mesh(
      new THREE.BoxGeometry(GAME_CONSTANTS.TRACK_WIDTH + 1, 1.2, GAME_CONSTANTS.CHUNK_LENGTH),
      trussMat
    );
    truss.position.set(0, -0.6, -GAME_CONSTANTS.CHUNK_LENGTH / 2);
    group.add(truss);

    // 4. Skyscraper cluster flanking left & right
    this.addBuildingsToChunk(group, chunkIndex);

    // 5. Holographic billboards on certain chunks
    if (chunkIndex % 2 === 1) {
      this.addBillboardToChunk(group);
    }

    return { group, z };
  }

  private addBuildingsToChunk(chunkGroup: THREE.Group, chunkIndex: number) {
    const buildingTex = createBuildingTexture(chunkIndex);
    const buildingMat = new THREE.MeshStandardMaterial({
      map: buildingTex,
      metalness: 0.6,
      roughness: 0.4,
    });

    const buildingCounts = 4;
    for (let i = 0; i < buildingCounts; i++) {
      const zOffset = -(i * 20 + 10);
      
      // Left side skyscraper
      const hLeft = 45 + ((chunkIndex * 17 + i * 23) % 55);
      const wLeft = 14 + (i % 3) * 5;
      const dLeft = 16 + (i % 2) * 6;
      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(wLeft, hLeft, dLeft), buildingMat);
      bLeft.position.set(-GAME_CONSTANTS.TRACK_WIDTH / 2 - 14 - (i % 2) * 8, hLeft / 2 - 15, zOffset);
      chunkGroup.add(bLeft);

      // Rooftop antenna with blinking light
      const antLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 8, 6), buildingMat);
      antLeft.position.set(-GAME_CONSTANTS.TRACK_WIDTH / 2 - 14 - (i % 2) * 8, hLeft - 11, zOffset);
      chunkGroup.add(antLeft);

      const antLight = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
      antLight.position.set(-GAME_CONSTANTS.TRACK_WIDTH / 2 - 14 - (i % 2) * 8, hLeft - 7, zOffset);
      chunkGroup.add(antLight);

      // Right side skyscraper
      const hRight = 40 + ((chunkIndex * 29 + i * 31) % 65);
      const wRight = 15 + (i % 3) * 4;
      const dRight = 18 + (i % 2) * 5;
      const bRight = new THREE.Mesh(new THREE.BoxGeometry(wRight, hRight, dRight), buildingMat);
      bRight.position.set(GAME_CONSTANTS.TRACK_WIDTH / 2 + 15 + (i % 2) * 7, hRight / 2 - 15, zOffset);
      chunkGroup.add(bRight);
    }
  }

  private addBillboardToChunk(chunkGroup: THREE.Group) {
    const ads = [
      { title: 'NEON RUNNER', sub: 'CYBERCITY PROTOCOL // 2099', color: '#00f0ff' },
      { title: 'QUANTUM AI', sub: 'NEURAL LINK INTERFACE', color: '#ff007f' },
      { title: 'NEXUS SPEED', sub: 'MAXIMUM OVERDRIVE ENGINE', color: '#ffea00' },
      { title: 'SYNTH-CORP', sub: 'AUGMENT YOUR REALITY', color: '#a855f7' },
    ];
    const ad = ads[Math.floor(Math.random() * ads.length)];
    const tex = createHoloBillboardTexture(ad.title, ad.sub, ad.color);

    const side = Math.random() > 0.5 ? 1 : -1;
    const holoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 7),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      })
    );
    holoMesh.position.set(side * (GAME_CONSTANTS.TRACK_WIDTH / 2 + 5.5), 6.5, -GAME_CONSTANTS.CHUNK_LENGTH / 2);
    holoMesh.rotation.y = side > 0 ? -0.35 : 0.35;
    chunkGroup.add(holoMesh);
  }

  private initRain() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.rainCount * 3);
    const vels = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 50; // X
      pos[i * 3 + 1] = Math.random() * 35;        // Y
      pos[i * 3 + 2] = -Math.random() * 200;      // Z
      vels[i] = 25 + Math.random() * 20;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x66ccff,
      size: 0.14,
      transparent: true,
      opacity: 0.65,
    });

    const points = new THREE.Points(geo, mat);
    return { points, vels, geo };
  }

  private initSpeedLines() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.speedLineCount * 6); // 2 vertices per line

    for (let i = 0; i < this.speedLineCount; i++) {
      const x = (Math.random() - 0.5) * 22;
      const y = Math.random() * 14 + 0.5;
      const z = -Math.random() * 120;
      const length = 4 + Math.random() * 8;

      pos[i * 6 + 0] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;

      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z - length;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.LineBasicMaterial({
      color: GAME_CONSTANTS.COLORS.CYAN,
      transparent: true,
      opacity: 0.45,
    });

    const lines = new THREE.LineSegments(geo, mat);
    return { lines, geo };
  }

  private initFlyingCars() {
    const carMatCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const carMatRed = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x111122 });

    for (let i = 0; i < 8; i++) {
      const car = new THREE.Group();
      
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 3.2), bodyMat);
      car.add(body);

      const lightF = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.1), carMatCyan);
      lightF.position.set(0, 0, -1.6);
      car.add(lightF);

      const lightB = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.1), carMatRed);
      lightB.position.set(0, 0, 1.6);
      car.add(lightB);

      const side = i % 2 === 0 ? 1 : -1;
      car.position.set(
        side * (18 + (i * 7) % 20),
        12 + (i * 4) % 18,
        -((i * 35) % 240)
      );

      (car as any).speed = (20 + (i * 5) % 25) * (side > 0 ? -1 : 1);
      this.flyingCars.push(car);
      this.scene.add(car);
    }
  }

  /**
   * Recycle chunks as player advances forward (Z is negative)
   */
  public update(playerZ: number, delta: number, speed: number) {
    // 1. Shift track chunks seamlessly ahead of player
    const threshold = playerZ - GAME_CONSTANTS.CHUNK_LENGTH;
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.z > playerZ + GAME_CONSTANTS.CHUNK_LENGTH * 0.5) {
        // Find current furthest forward chunk
        let minZ = 0;
        for (const c of this.chunks) {
          if (c.z < minZ) minZ = c.z;
        }
        chunk.z = minZ - GAME_CONSTANTS.CHUNK_LENGTH;
        chunk.group.position.z = chunk.z;
      }
    }

    // 2. Animate rain
    const pos = this.rainGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < this.rainCount; i++) {
      pos[i * 3 + 1] -= this.rainVelocities[i] * delta; // Fall down
      pos[i * 3 + 2] += (speed * 0.4) * delta;          // Streak backwards relative to player

      // Reset rain bounds
      if (pos[i * 3 + 1] < 0 || pos[i * 3 + 2] > playerZ + 15) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * 45;
        pos[i * 3 + 1] = 25 + Math.random() * 15;
        pos[i * 3 + 2] = playerZ - 20 - Math.random() * 180;
      }
    }
    this.rainGeometry.attributes.position.needsUpdate = true;

    // 3. Animate speed lines (intensify with speed)
    const linePos = this.speedLinesGeometry.attributes.position.array as Float32Array;
    const speedRatio = Math.min(1.5, speed / GAME_CONSTANTS.INITIAL_SPEED);
    for (let i = 0; i < this.speedLineCount; i++) {
      const lineLen = 4 * speedRatio;
      linePos[i * 6 + 2] += speed * 1.5 * delta;
      linePos[i * 6 + 5] = linePos[i * 6 + 2] - lineLen;

      if (linePos[i * 6 + 2] > playerZ + 10) {
        const x = (Math.random() - 0.5) * 22;
        const y = Math.random() * 14 + 0.5;
        const z = playerZ - 40 - Math.random() * 100;
        linePos[i * 6 + 0] = x;
        linePos[i * 6 + 1] = y;
        linePos[i * 6 + 2] = z;
        linePos[i * 6 + 3] = x;
        linePos[i * 6 + 4] = y;
        linePos[i * 6 + 5] = z - lineLen;
      }
    }
    this.speedLinesGeometry.attributes.position.needsUpdate = true;

    // 4. Update flying cars
    for (const car of this.flyingCars) {
      car.position.z += (car as any).speed * delta;
      if (car.position.z > playerZ + 40) {
        car.position.z = playerZ - 260;
      } else if (car.position.z < playerZ - 280) {
        car.position.z = playerZ + 30;
      }
    }
  }

  public reset(initialZ: number = 0) {
    for (let i = 0; i < this.chunks.length; i++) {
      this.chunks[i].z = initialZ - i * GAME_CONSTANTS.CHUNK_LENGTH;
      this.chunks[i].group.position.z = this.chunks[i].z;
    }
  }
}
