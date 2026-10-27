import * as THREE from 'three';
import { GAME_CONSTANTS } from '../constants';

export class PlayerCharacter {
  public group: THREE.Group;
  
  // Articulated parts
  private root: THREE.Group;
  private hips: THREE.Group;
  private torso: THREE.Group;
  private chest: THREE.Mesh;
  private reactorCore: THREE.Mesh;
  private head: THREE.Group;
  private visor: THREE.Mesh;
  private jetpack: THREE.Group;
  private thrusterL: THREE.Mesh;
  private thrusterR: THREE.Mesh;
  private flameL: THREE.Mesh;
  private flameR: THREE.Mesh;

  // Limbs
  private leftUpperLeg: THREE.Group;
  private leftLowerLeg: THREE.Group;
  private rightUpperLeg: THREE.Group;
  private rightLowerLeg: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;

  // Materials for animation/glow
  private armorMat: THREE.MeshStandardMaterial;
  private neonMat: THREE.MeshStandardMaterial;
  private flameMat: THREE.MeshBasicMaterial;

  // Animation cycle state
  private runCycle: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.root = new THREE.Group();
    this.group.add(this.root);

    // Materials
    this.armorMat = new THREE.MeshStandardMaterial({
      color: 0x11131a,
      roughness: 0.25,
      metalness: 0.85,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.5,
      metalness: 0.6,
    });

    this.neonMat = new THREE.MeshStandardMaterial({
      color: GAME_CONSTANTS.COLORS.CYAN,
      emissive: GAME_CONSTANTS.COLORS.CYAN,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });

    const magentaNeonMat = new THREE.MeshStandardMaterial({
      color: GAME_CONSTANTS.COLORS.MAGENTA,
      emissive: GAME_CONSTANTS.COLORS.MAGENTA,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });

    this.flameMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
    });

    // 1. Hips / Pelvis (pivot around Y = 0.9m)
    this.hips = new THREE.Group();
    this.hips.position.y = 0.95;
    this.root.add(this.hips);

    const pelvisMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.2, 0.26),
      this.armorMat
    );
    pelvisMesh.castShadow = true;
    this.hips.add(pelvisMesh);

    // Neon waist belt
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.05, 0.28),
      this.neonMat
    );
    this.hips.add(belt);

    // 2. Torso & Chest
    this.torso = new THREE.Group();
    this.torso.position.y = 0.15;
    this.hips.add(this.torso);

    this.chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.45, 0.3),
      this.armorMat
    );
    this.chest.position.y = 0.22;
    this.chest.castShadow = true;
    this.torso.add(this.chest);

    // Glowing Chest Reactor
    this.reactorCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
      this.neonMat
    );
    this.reactorCore.rotation.x = Math.PI / 2;
    this.reactorCore.position.set(0, 0.24, 0.16);
    this.torso.add(this.reactorCore);

    // 3. Head & Cyber Visor
    this.head = new THREE.Group();
    this.head.position.y = 0.52;
    this.torso.add(this.head);

    const helmet = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.26, 0.26),
      darkMat
    );
    helmet.castShadow = true;
    this.head.add(helmet);

    // Glowing horizontal visor band
    this.visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.07, 0.1),
      this.neonMat
    );
    this.visor.position.set(0, 0.02, 0.1);
    this.head.add(this.visor);

    // 4. Jetpack & Exhaust Thrusters (on back)
    this.jetpack = new THREE.Group();
    this.jetpack.position.set(0, 0.22, -0.2);
    this.torso.add(this.jetpack);

    const packBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.35, 0.14),
      this.armorMat
    );
    this.jetpack.add(packBody);

    const thrusterGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.2, 12);
    this.thrusterL = new THREE.Mesh(thrusterGeo, darkMat);
    this.thrusterL.position.set(-0.12, -0.15, 0);
    this.jetpack.add(this.thrusterL);

    this.thrusterR = new THREE.Mesh(thrusterGeo, darkMat);
    this.thrusterR.position.set(0.12, -0.15, 0);
    this.jetpack.add(this.thrusterR);

    // Exhaust particle cones / flames
    const flameGeo = new THREE.ConeGeometry(0.06, 0.35, 8);
    flameGeo.rotateX(Math.PI);
    this.flameL = new THREE.Mesh(flameGeo, this.flameMat);
    this.flameL.position.set(0, -0.2, 0);
    this.thrusterL.add(this.flameL);

    this.flameR = new THREE.Mesh(flameGeo, this.flameMat);
    this.flameR.position.set(0, -0.2, 0);
    this.thrusterR.add(this.flameR);

    // 5. Arms
    this.leftArm = this.createArm(-0.28, darkMat, magentaNeonMat);
    this.torso.add(this.leftArm);

    this.rightArm = this.createArm(0.28, darkMat, magentaNeonMat);
    this.torso.add(this.rightArm);

    // 6. Legs
    this.leftUpperLeg = this.createLeg(-0.14, darkMat);
    this.hips.add(this.leftUpperLeg);

    this.rightUpperLeg = this.createLeg(0.14, darkMat);
    this.hips.add(this.rightUpperLeg);

    this.leftLowerLeg = this.leftUpperLeg.children[1] as THREE.Group;
    this.rightLowerLeg = this.rightUpperLeg.children[1] as THREE.Group;

    // Contact shadow beneath player
    const shadowGeo = new THREE.PlaneGeometry(0.9, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.group.add(shadow);
  }

  private createArm(xOffset: number, armorMat: THREE.Material, accentMat: THREE.Material): THREE.Group {
    const armGroup = new THREE.Group();
    armGroup.position.set(xOffset, 0.4, 0);

    // Shoulder pauldron
    const pauldron = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.16, 0.18),
      this.armorMat
    );
    pauldron.position.y = -0.05;
    armGroup.add(pauldron);

    // Upper arm
    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.24, 0.11),
      armorMat
    );
    upper.position.y = -0.18;
    upper.castShadow = true;
    armGroup.add(upper);

    // Forearm & Cyber Gauntlet
    const forearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.26, 0.12),
      this.armorMat
    );
    forearm.position.set(0, -0.4, 0.05);
    forearm.castShadow = true;
    armGroup.add(forearm);

    // Gauntlet neon strip
    const gauntletStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.04, 0.13),
      accentMat
    );
    gauntletStripe.position.set(0, -0.4, 0.05);
    armGroup.add(gauntletStripe);

    return armGroup;
  }

  private createLeg(xOffset: number, mat: THREE.Material): THREE.Group {
    const upperLegGroup = new THREE.Group();
    upperLegGroup.position.set(xOffset, -0.08, 0);

    // Thigh armor
    const thigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.4, 0.18),
      this.armorMat
    );
    thigh.position.y = -0.2;
    thigh.castShadow = true;
    upperLegGroup.add(thigh);

    // Knee joint / lower leg
    const lowerLegGroup = new THREE.Group();
    lowerLegGroup.position.set(0, -0.4, 0);
    upperLegGroup.add(lowerLegGroup);

    // Shin & Cyber Boot
    const calf = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.42, 0.16),
      mat
    );
    calf.position.y = -0.2;
    calf.castShadow = true;
    lowerLegGroup.add(calf);

    // Cyber boot foot
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.1, 0.26),
      this.armorMat
    );
    foot.position.set(0, -0.42, 0.05);
    lowerLegGroup.add(foot);

    // Knee light
    const kneeLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.04, 0.04),
      this.neonMat
    );
    kneeLight.position.set(0, -0.05, 0.1);
    lowerLegGroup.add(kneeLight);

    return upperLegGroup;
  }

  /**
   * Procedural animation updates per frame.
   */
  public update(
    delta: number,
    speed: number,
    isJumping: boolean,
    isSliding: boolean,
    laneVelocity: number // sideways motion speed for banking
  ) {
    // Increase running stride frequency based on game speed
    const runFreq = (speed / 20) * 16;
    this.runCycle += delta * runFreq;

    // Lateral banking into lane changes
    const targetRoll = -laneVelocity * 0.05;
    this.root.rotation.z = THREE.MathUtils.damp(this.root.rotation.z, targetRoll, 14, delta);
    this.root.rotation.y = THREE.MathUtils.damp(this.root.rotation.y, -laneVelocity * 0.03, 14, delta);

    if (isSliding) {
      // Crouch / slide pose
      this.root.position.y = -0.55;
      this.root.rotation.x = THREE.MathUtils.damp(this.root.rotation.x, -0.85, 20, delta);
      this.torso.rotation.x = 0.4;
      this.head.rotation.x = -0.6; // Keep looking forward

      // Extend legs forward
      this.leftUpperLeg.rotation.x = -1.3;
      this.rightUpperLeg.rotation.x = -1.2;
      this.leftLowerLeg.rotation.x = 0.2;
      this.rightLowerLeg.rotation.x = 0.1;

      // Arms back / stabilizer pose
      this.leftArm.rotation.x = 1.0;
      this.rightArm.rotation.x = 1.0;

      // Thruster flame pulses
      const flameScale = 1.5 + Math.random() * 0.4;
      this.flameL.scale.set(1.2, flameScale, 1.2);
      this.flameR.scale.set(1.2, flameScale, 1.2);

    } else if (isJumping) {
      // Jump pose: legs tucked, arms spread for balance
      this.root.position.y = 0;
      this.root.rotation.x = THREE.MathUtils.damp(this.root.rotation.x, 0.2, 10, delta);
      this.torso.rotation.x = -0.15;
      this.head.rotation.x = 0.1;

      this.leftUpperLeg.rotation.x = -0.6;
      this.rightUpperLeg.rotation.x = -0.8;
      this.leftLowerLeg.rotation.x = 1.1;
      this.rightLowerLeg.rotation.x = 1.2;

      this.leftArm.rotation.x = -0.8;
      this.rightArm.rotation.x = -0.8;
      this.leftArm.rotation.z = -0.4;
      this.rightArm.rotation.z = 0.4;

      // Full booster thruster burn
      const flameScale = 2.4 + Math.sin(Date.now() * 0.03) * 0.5;
      this.flameL.scale.set(1.4, flameScale, 1.4);
      this.flameR.scale.set(1.4, flameScale, 1.4);
      this.flameMat.color.setHex(0x00f0ff);

    } else {
      // Running animation
      this.root.position.y = Math.abs(Math.sin(this.runCycle)) * 0.08;
      this.root.rotation.x = THREE.MathUtils.damp(this.root.rotation.x, 0.18, 15, delta); // Forward sprint lean
      this.torso.rotation.x = 0.05;
      this.head.rotation.x = -0.05;

      const legAngle = Math.sin(this.runCycle) * 0.85;
      this.leftUpperLeg.rotation.x = legAngle;
      this.rightUpperLeg.rotation.x = -legAngle;

      // Knee bending during backstride
      this.leftLowerLeg.rotation.x = legAngle > 0 ? 0.2 : 0.9;
      this.rightLowerLeg.rotation.x = -legAngle > 0 ? 0.2 : 0.9;

      // Arm swing opposing legs
      this.leftArm.rotation.x = -legAngle * 0.9;
      this.rightArm.rotation.x = legAngle * 0.9;
      this.leftArm.rotation.z = 0.1;
      this.rightArm.rotation.z = -0.1;

      // Idle thruster trail
      const flameScale = 0.5 + Math.random() * 0.2;
      this.flameL.scale.set(0.8, flameScale, 0.8);
      this.flameR.scale.set(0.8, flameScale, 0.8);
    }
  }

  public reset() {
    this.runCycle = 0;
    this.root.position.set(0, 0, 0);
    this.root.rotation.set(0, 0, 0);
  }
}
