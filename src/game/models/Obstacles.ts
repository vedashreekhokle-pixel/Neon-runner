import * as THREE from 'three';
import { GAME_CONSTANTS, laneToX } from '../constants';
import { createHazardTexture } from '../proceduralTextures';
import { ObstacleType } from '../../types/game';

// Shared reusable materials & geometries for optimal GPU draw performance
const sharedMaterials = {
  metal: new THREE.MeshStandardMaterial({
    color: 0x14161f,
    metalness: 0.85,
    roughness: 0.3,
  }),
  cyberFrame: new THREE.MeshStandardMaterial({
    color: 0x222436,
    metalness: 0.9,
    roughness: 0.2,
  }),
  cyanGlow: new THREE.MeshBasicMaterial({
    color: GAME_CONSTANTS.COLORS.CYAN,
  }),
  magentaGlow: new THREE.MeshBasicMaterial({
    color: GAME_CONSTANTS.COLORS.MAGENTA,
  }),
  orangeGlow: new THREE.MeshBasicMaterial({
    color: GAME_CONSTANTS.COLORS.HAZARD_ORANGE,
  }),
  laserBeam: new THREE.MeshBasicMaterial({
    color: 0xff0055,
    transparent: true,
    opacity: 0.85,
  }),
  crystalMat: new THREE.MeshPhysicalMaterial({
    color: 0x00ffff,
    emissive: 0x0088cc,
    emissiveIntensity: 1.2,
    metalness: 0.1,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  }),
};

let hazardTexture: THREE.CanvasTexture | null = null;
function getHazardMat(): THREE.MeshStandardMaterial {
  if (!hazardTexture) {
    hazardTexture = createHazardTexture();
  }
  return new THREE.MeshStandardMaterial({
    map: hazardTexture,
    metalness: 0.4,
    roughness: 0.5,
  });
}

/**
 * 1. Low Barrier: Cyber hurdle (Height ~ 0.85m)
 * Player can jump over it or switch lanes.
 */
export function createLowBarrier(lane: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(laneToX(lane), 0, z);

  const width = 2.8;
  const height = 0.85;

  // Base metal posts
  const postGeo = new THREE.BoxGeometry(0.25, height, 0.3);
  const leftPost = new THREE.Mesh(postGeo, sharedMaterials.cyberFrame);
  leftPost.position.set(-width / 2 + 0.15, height / 2, 0);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, sharedMaterials.cyberFrame);
  rightPost.position.set(width / 2 - 0.15, height / 2, 0);
  rightPost.castShadow = true;
  group.add(rightPost);

  // Horizontal striped hurdle bar
  const barGeo = new THREE.BoxGeometry(width - 0.2, 0.45, 0.2);
  const bar = new THREE.Mesh(barGeo, getHazardMat());
  bar.position.set(0, height * 0.65, 0);
  bar.castShadow = true;
  group.add(bar);

  // Glowing cyan neon strip across top
  const lightGeo = new THREE.BoxGeometry(width - 0.1, 0.06, 0.22);
  const light = new THREE.Mesh(lightGeo, sharedMaterials.cyanGlow);
  light.position.set(0, height + 0.02, 0);
  group.add(light);

  return group;
}

/**
 * 2. High Laser: Overhead cyber laser beam (Height ~ 2.4m, lower edge at 1.15m)
 * Player must slide under or switch lanes.
 */
export function createHighLaser(lane: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(laneToX(lane), 0, z);

  const width = 3.0;
  const totalHeight = 3.2;

  // Tall vertical pylons on both sides
  const pylonGeo = new THREE.BoxGeometry(0.28, totalHeight, 0.35);
  const pylonL = new THREE.Mesh(pylonGeo, sharedMaterials.cyberFrame);
  pylonL.position.set(-width / 2, totalHeight / 2, 0);
  pylonL.castShadow = true;
  group.add(pylonL);

  const pylonR = new THREE.Mesh(pylonGeo, sharedMaterials.cyberFrame);
  pylonR.position.set(width / 2, totalHeight / 2, 0);
  pylonR.castShadow = true;
  group.add(pylonR);

  // Overhead crossbar
  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.4, 0.4),
    sharedMaterials.cyberFrame
  );
  crossbar.position.set(0, totalHeight - 0.2, 0);
  group.add(crossbar);

  // Dangerous Laser Grid (beams at Y = 1.35m to 2.8m, clearance underneath = 1.25m)
  const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, width, 8);
  beamGeo.rotateZ(Math.PI / 2);

  const beam1 = new THREE.Mesh(beamGeo, sharedMaterials.laserBeam);
  beam1.position.set(0, 1.4, 0);
  group.add(beam1);

  const beam2 = new THREE.Mesh(beamGeo, sharedMaterials.laserBeam);
  beam2.position.set(0, 2.0, 0);
  group.add(beam2);

  // Laser warning hologram plane
  const holoGeo = new THREE.PlaneGeometry(width - 0.4, 0.9);
  const holoMat = new THREE.MeshBasicMaterial({
    color: 0xff0044,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const holo = new THREE.Mesh(holoGeo, holoMat);
  holo.position.set(0, 1.7, 0);
  group.add(holo);

  return group;
}

/**
 * 3. Hover Car: Futuristic Police/Civilian Flying Spinner
 * Moves towards the player or hovers menacingly.
 */
export function createHoverCar(lane: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(laneToX(lane), 0.6, z);

  // 1. Aerodynamic chassis hull
  const bodyGeo = new THREE.BoxGeometry(1.8, 0.7, 3.8);
  const body = new THREE.Mesh(bodyGeo, sharedMaterials.cyberFrame);
  body.castShadow = true;
  group.add(body);

  // 2. Cockpit canopy
  const canopyGeo = new THREE.BoxGeometry(1.3, 0.45, 1.8);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x05101a,
    metalness: 0.95,
    roughness: 0.1,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.5, -0.2);
  group.add(canopy);

  // 3. Headlights (Bright cyan/white facing player)
  const headlightGeo = new THREE.BoxGeometry(0.35, 0.12, 0.08);
  const hlLeft = new THREE.Mesh(headlightGeo, sharedMaterials.cyanGlow);
  hlLeft.position.set(-0.6, 0.05, 1.91);
  group.add(hlLeft);

  const hlRight = new THREE.Mesh(headlightGeo, sharedMaterials.cyanGlow);
  hlRight.position.set(0.6, 0.05, 1.91);
  group.add(hlRight);

  // 4. Police lightbar (Flashing Red & Blue)
  const sirenRed = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.12), sharedMaterials.laserBeam);
  sirenRed.position.set(-0.25, 0.78, -0.2);
  group.add(sirenRed);

  const sirenBlue = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.12), sharedMaterials.cyanGlow);
  sirenBlue.position.set(0.25, 0.78, -0.2);
  group.add(sirenBlue);

  // 5. Thruster repulsors underneath
  const repulsorGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.15, 12);
  const repL = new THREE.Mesh(repulsorGeo, sharedMaterials.cyanGlow);
  repL.position.set(-0.65, -0.35, 0);
  group.add(repL);

  const repR = new THREE.Mesh(repulsorGeo, sharedMaterials.cyanGlow);
  repR.position.set(0.65, -0.35, 0);
  group.add(repR);

  return group;
}

/**
 * 4. Tall Barrier: Full-lane Cyber Firewall (Height ~ 3.6m)
 * Cannot be jumped or slid under. Player must switch lanes!
 */
export function createTallBarrier(lane: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(laneToX(lane), 0, z);

  const width = 2.8;
  const height = 3.6;

  // Solid armored wall
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.4),
    sharedMaterials.cyberFrame
  );
  wall.position.y = height / 2;
  wall.castShadow = true;
  group.add(wall);

  // Hazard diagonal stripe face
  const hazardFace = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.2, height - 0.4),
    getHazardMat()
  );
  hazardFace.position.set(0, height / 2, 0.21);
  group.add(hazardFace);

  // Glowing boundary frame
  const topGlow = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.1, 0.44),
    sharedMaterials.magentaGlow
  );
  topGlow.position.set(0, height, 0);
  group.add(topGlow);

  return group;
}

/**
 * 5. Energy Crystal: Floating, rotating collectible
 */
export function createEnergyCrystal(lane: number, z: number, y: number = 1.2): THREE.Group {
  const group = new THREE.Group();
  group.position.set(laneToX(lane), y, z);

  // Octahedron crystal gem
  const crystalGeo = new THREE.OctahedronGeometry(0.42, 0);
  const crystal = new THREE.Mesh(crystalGeo, sharedMaterials.crystalMat);
  crystal.scale.set(1.0, 1.45, 1.0);
  group.add(crystal);

  // Inner pulsing core
  const coreGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const core = new THREE.Mesh(coreGeo, sharedMaterials.cyanGlow);
  group.add(core);

  // Ambient rotating ring
  const ringGeo = new THREE.TorusGeometry(0.55, 0.02, 8, 24);
  const ring = new THREE.Mesh(ringGeo, sharedMaterials.magentaGlow);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  return group;
}
