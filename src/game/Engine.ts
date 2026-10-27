import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GAME_CONSTANTS, laneToX } from './constants';
import { PlayerCharacter } from './models/PlayerCharacter';
import {
  createEnergyCrystal,
  createHighLaser,
  createHoverCar,
  createLowBarrier,
  createTallBarrier,
} from './models/Obstacles';
import { CityEnvironment } from './world/CityEnvironment';
import { soundManager } from '../audio/soundManager';
import { CrystalData, GameStats, Lane, ObstacleData, ObstacleType } from '../types/game';

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animationFrameId: number = 0;

  // Environment & Player
  private city: CityEnvironment;
  private player: PlayerCharacter;

  // Lights
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Player State
  public currentLane: Lane = 0;
  private targetX: number = 0;
  public playerX: number = 0;
  public playerY: number = 0;
  public playerZ: number = 0;
  private playerVy: number = 0;
  private isGrounded: boolean = true;
  public isSliding: boolean = false;
  private slideTimer: number = 0;
  private laneVelocity: number = 0;

  // Game Loop State
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public currentSpeed: number = GAME_CONSTANTS.INITIAL_SPEED;
  private timeScale: number = 1.0;
  private slowMoTimer: number = 0;

  // Camera Shake & Dynamic FOV
  private shakeIntensity: number = 0;
  private cameraTargetY: number = 2.4;
  private cameraOffsetZ: number = 5.2;

  // Obstacles & Crystals
  private obstacles: ObstacleData[] = [];
  private crystals: CrystalData[] = [];
  private nextObstacleZ: number = -40;
  private nextCrystalZ: number = -25;
  private nextId: number = 1;

  // Stats
  public stats: GameStats = {
    score: 0,
    distance: 0,
    crystals: 0,
    speed: GAME_CONSTANTS.INITIAL_SPEED,
    multiplier: 1,
    highScore: 0,
    nearMisses: 0,
  };

  // Spark burst particles for collision & crystals
  private sparkGroup: THREE.Group;
  private sparkParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

  // Callbacks for UI updates
  private onStatsUpdate?: (stats: GameStats) => void;
  private onGameOver?: (finalStats: GameStats) => void;
  private onNearMiss?: (text: string) => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onStatsUpdate?: (stats: GameStats) => void;
      onGameOver?: (finalStats: GameStats) => void;
      onNearMiss?: (text: string) => void;
    }
  ) {
    this.container = container;
    this.onStatsUpdate = callbacks.onStatsUpdate;
    this.onGameOver = callbacks.onGameOver;
    this.onNearMiss = callbacks.onNearMiss;

    // Load High Score
    const savedHighScore = localStorage.getItem('neon_runner_high_score');
    if (savedHighScore) {
      this.stats.highScore = parseInt(savedHighScore, 10) || 0;
    }

    // 1. Detect software WebGL per directives
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Horizon Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(GAME_CONSTANTS.COLORS.DARK_BG);
    this.scene.fog = new THREE.FogExp2(GAME_CONSTANTS.COLORS.FOG, 0.012);

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );
    this.camera.position.set(0, 3.2, 5.8);

    // 5. Lighting Setup
    // RoomEnvironment reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Key directional light with cool/warm contrast
    this.dirLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    this.dirLight.position.set(8, 22, 10);
    this.dirLight.castShadow = !isSoftwareGl;
    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 60;
      this.dirLight.shadow.camera.left = -12;
      this.dirLight.shadow.camera.right = 12;
      this.dirLight.shadow.camera.top = 12;
      this.dirLight.shadow.camera.bottom = -12;
      this.dirLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.dirLight);

    // Hemisphere cool sky / deep purple bounce
    this.hemiLight = new THREE.HemisphereLight(0x00f0ff, 0x4a0e4e, 1.4);
    this.scene.add(this.hemiLight);

    // Dynamic player neon point light
    const playerPointLight = new THREE.PointLight(0x00f0ff, 2.8, 12);
    playerPointLight.position.set(0, 1.5, 0);

    // 6. Build City & Player
    this.city = new CityEnvironment(this.scene);
    this.player = new PlayerCharacter();
    this.player.group.add(playerPointLight);
    this.scene.add(this.player.group);

    // 7. Spark burst container
    this.sparkGroup = new THREE.Group();
    this.scene.add(this.sparkGroup);

    // 8. Clock & Event Listeners
    this.clock = new THREE.Clock();
    this.setupListeners();

    // Initial compile pass
    this.renderer.compile(this.scene, this.camera);
    
    // Start render loop
    this.startLoop();
  }

  // --- Keyboard & Resize Setup ---

  private setupListeners() {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.isGameOver) return;

    if (e.code === 'KeyP' || e.code === 'Escape') {
      this.togglePause();
      return;
    }

    if (!this.isRunning || this.isPaused) return;

    switch (e.code) {
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft();
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight();
        break;
      case 'KeyW':
      case 'ArrowUp':
      case 'Space':
        this.jump();
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.slide();
        break;
    }
  };

  // --- Controls API ---

  public moveLeft() {
    if (this.currentLane > -1) {
      this.currentLane = (this.currentLane - 1) as Lane;
      this.targetX = laneToX(this.currentLane);
      soundManager.playLaneSwitch();
    }
  }

  public moveRight() {
    if (this.currentLane < 1) {
      this.currentLane = (this.currentLane + 1) as Lane;
      this.targetX = laneToX(this.currentLane);
      soundManager.playLaneSwitch();
    }
  }

  public jump() {
    if (this.isGrounded) {
      this.isGrounded = false;
      this.playerVy = GAME_CONSTANTS.JUMP_FORCE;
      this.isSliding = false; // Cancel slide when jumping
      soundManager.playJump();
      this.spawnSparks(this.playerX, 0.1, this.playerZ, 0x00f0ff, 12);
    }
  }

  public slide() {
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = GAME_CONSTANTS.SLIDE_DURATION;
      // If sliding in mid-air, drop down fast!
      if (!this.isGrounded) {
        this.playerVy = -18.0;
      }
      soundManager.playSlide();
      this.spawnSparks(this.playerX, 0.1, this.playerZ, 0xff007f, 15);
    }
  }

  public togglePause(): boolean {
    if (this.isGameOver) return false;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      soundManager.stopMusic();
    } else {
      soundManager.startMusic();
    }
    return this.isPaused;
  }

  public startRun() {
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    soundManager.startMusic();
  }

  public reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;

    this.currentLane = 0;
    this.targetX = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.playerVy = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.currentSpeed = GAME_CONSTANTS.INITIAL_SPEED;
    this.timeScale = 1.0;
    this.slowMoTimer = 0;
    this.shakeIntensity = 0;

    // Clear obstacles & crystals
    for (const obs of this.obstacles) {
      this.scene.remove(obs.mesh);
    }
    this.obstacles = [];

    for (const cry of this.crystals) {
      this.scene.remove(cry.mesh);
    }
    this.crystals = [];

    this.nextObstacleZ = -45;
    this.nextCrystalZ = -25;

    // Reset stats
    this.stats.score = 0;
    this.stats.distance = 0;
    this.stats.crystals = 0;
    this.stats.multiplier = 1;
    this.stats.nearMisses = 0;
    this.stats.speed = GAME_CONSTANTS.INITIAL_SPEED;

    this.player.reset();
    this.player.group.position.set(0, 0, 0);

    this.city.reset(0);
    this.onStatsUpdate?.(this.stats);
  }

  // --- Procedural Generation with Guaranteed Solvability ---

  private spawnObstaclesAndCrystals() {
    // 1. Spawn Obstacles ahead
    while (this.nextObstacleZ > this.playerZ - 260) {
      this.generateObstacleRow(this.nextObstacleZ);
      // Spacing shrinks slightly as speed increases, but stays fair
      const spacing = Math.max(22, 38 - (this.currentSpeed / GAME_CONSTANTS.MAX_SPEED) * 12);
      this.nextObstacleZ -= spacing;
    }

    // 2. Spawn Crystal Chains
    while (this.nextCrystalZ > this.playerZ - 240) {
      this.generateCrystalPattern(this.nextCrystalZ);
      this.nextCrystalZ -= 32 + Math.random() * 20;
    }
  }

  private generateObstacleRow(z: number) {
    const obstacleTypes: ObstacleType[] = ['LOW_BARRIER', 'HIGH_LASER', 'HOVER_CAR', 'TALL_BARRIER'];
    
    // Decide pattern: 1 lane blocked (common), or 2 lanes blocked (challenging)
    const blockedLaneCount = Math.random() < 0.35 + (this.currentSpeed / GAME_CONSTANTS.MAX_SPEED) * 0.3 ? 2 : 1;
    
    const lanes: Lane[] = [-1, 0, 1];
    // Shuffle lanes
    lanes.sort(() => Math.random() - 0.5);

    for (let i = 0; i < blockedLaneCount; i++) {
      const lane = lanes[i];
      let type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

      // FAIRNESS RULE: Never put two TALL_BARRIERs adjacent if it leaves an impossible escape
      if (i === 1 && type === 'TALL_BARRIER') {
        type = Math.random() > 0.5 ? 'LOW_BARRIER' : 'HIGH_LASER';
      }

      let mesh: THREE.Group;
      let width = 2.4;
      let height = 1.0;
      let depth = 0.8;
      let speedZ = 0;

      switch (type) {
        case 'LOW_BARRIER':
          mesh = createLowBarrier(lane, z);
          height = 0.85;
          break;
        case 'HIGH_LASER':
          mesh = createHighLaser(lane, z);
          height = 3.2;
          break;
        case 'HOVER_CAR':
          mesh = createHoverCar(lane, z);
          width = 1.8;
          height = 1.4;
          depth = 3.6;
          speedZ = 10.0; // Cruises toward player
          break;
        case 'TALL_BARRIER':
        default:
          mesh = createTallBarrier(lane, z);
          width = 2.6;
          height = 3.6;
          break;
      }

      this.scene.add(mesh);
      this.obstacles.push({
        id: this.nextId++,
        type,
        lane,
        z,
        width,
        height,
        depth,
        speedZ,
        mesh,
        passed: false,
        nearMissChecked: false,
      });
    }
  }

  private generateCrystalPattern(startZ: number) {
    const lane = (Math.floor(Math.random() * 3) - 1) as Lane;
    const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 crystals
    const isArc = Math.random() > 0.6; // Sometimes creates an arc for jump reward

    for (let i = 0; i < count; i++) {
      const cz = startZ - i * 4.5;
      let cy = 1.2;
      if (isArc) {
        const mid = (count - 1) / 2;
        cy = 1.2 + (1 - Math.pow((i - mid) / mid, 2)) * 1.8; // Arc up to 3m
      }

      const mesh = createEnergyCrystal(lane, cz, cy);
      this.scene.add(mesh);
      this.crystals.push({
        id: this.nextId++,
        lane,
        z: cz,
        y: cy,
        mesh,
        collected: false,
        value: GAME_CONSTANTS.CRYSTAL_SCORE,
      });
    }
  }

  // --- Sparks & Particles ---

  private spawnSparks(x: number, y: number, z: number, color: number, count: number = 10) {
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.sparkGroup.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 6
      );
      this.sparkParticles.push({ mesh, vel, life: 0.4 + Math.random() * 0.3 });
    }
  }

  // --- Collision & Near-Miss Detection ---

  private checkCollisions() {
    const playerWidth = GAME_CONSTANTS.PLAYER_WIDTH;
    const playerHeight = this.isSliding ? GAME_CONSTANTS.PLAYER_HEIGHT_SLIDE : GAME_CONSTANTS.PLAYER_HEIGHT_STAND;
    const playerMinY = this.playerY;
    const playerMaxY = this.playerY + playerHeight;
    const playerMinX = this.playerX - playerWidth / 2;
    const playerMaxX = this.playerX + playerWidth / 2;
    const playerMinZ = this.playerZ - 0.4;
    const playerMaxZ = this.playerZ + 0.4;

    for (const obs of this.obstacles) {
      if (obs.passed) continue;

      const obsX = laneToX(obs.lane);
      const obsZ = obs.mesh.position.z;
      const obsHalfW = obs.width / 2;
      const obsHalfD = obs.depth / 2;

      // Z-overlap check
      const zOverlap = playerMinZ <= obsZ + obsHalfD && playerMaxZ >= obsZ - obsHalfD;
      const xOverlap = playerMinX <= obsX + obsHalfW && playerMaxX >= obsX - obsHalfW;

      if (zOverlap && xOverlap) {
        // Y clearance checks per obstacle type
        let hit = false;

        if (obs.type === 'LOW_BARRIER') {
          // Cleared if jumping above hurdle height (0.85m)
          if (playerMinY < 0.85) {
            hit = true;
          }
        } else if (obs.type === 'HIGH_LASER') {
          // Overhead beam starts at Y = 1.25m. Cleared if sliding (height 0.65m) and on ground
          if (playerMaxY > 1.2) {
            hit = true;
          }
        } else if (obs.type === 'HOVER_CAR') {
          // Requires jumping very high (over 1.5m) or lane dodging
          if (playerMinY < 1.4) {
            hit = true;
          }
        } else if (obs.type === 'TALL_BARRIER') {
          // Cannot be jumped or slid under
          hit = true;
        }

        if (hit) {
          this.triggerGameOver();
          return;
        }
      }

      // Check Near-Miss (narrowly dodging within 1.2m without collision)
      if (!obs.nearMissChecked && obsZ > this.playerZ && obsZ < this.playerZ + 2.5) {
        obs.nearMissChecked = true;
        const xDist = Math.abs(this.playerX - obsX);
        if (xDist < 3.8 && xDist > 1.4) {
          // Trigger Bullet-time slow motion!
          this.triggerNearMiss();
        }
      }

      // Mark passed
      if (obsZ > this.playerZ + 5) {
        obs.passed = true;
      }
    }

    // Check Energy Crystals
    for (const cry of this.crystals) {
      if (cry.collected) continue;
      const cryX = laneToX(cry.lane);
      const cryZ = cry.mesh.position.z;

      const dist = Math.hypot(this.playerX - cryX, this.playerY + 0.9 - cry.y, this.playerZ - cryZ);
      
      // Magnetism attraction when close
      if (dist < 3.2) {
        cry.mesh.position.x = THREE.MathUtils.damp(cry.mesh.position.x, this.playerX, 16, 0.016);
        cry.mesh.position.y = THREE.MathUtils.damp(cry.mesh.position.y, this.playerY + 0.9, 16, 0.016);
      }

      if (dist < 1.4) {
        cry.collected = true;
        this.scene.remove(cry.mesh);
        this.stats.crystals += 1;
        this.stats.score += cry.value * this.stats.multiplier;
        soundManager.playCrystal(this.stats.crystals);
        this.spawnSparks(cryX, cry.y, cryZ, 0x00f0ff, 14);
      }
    }
  }

  private triggerNearMiss() {
    this.timeScale = 0.38; // Bullet-time slow motion
    this.slowMoTimer = 0.42;
    this.stats.nearMisses += 1;
    this.stats.score += GAME_CONSTANTS.NEAR_MISS_SCORE * this.stats.multiplier;
    this.stats.multiplier = Math.min(8, this.stats.multiplier + 1);
    soundManager.playNearMiss();
    this.onNearMiss?.(`NEAR MISS! +${GAME_CONSTANTS.NEAR_MISS_SCORE * this.stats.multiplier} [${this.stats.multiplier}X]`);
  }

  private triggerGameOver() {
    this.isGameOver = true;
    this.isRunning = false;
    soundManager.stopMusic();
    soundManager.playCrash();

    // Camera impact shake
    this.shakeIntensity = 0.65;
    this.spawnSparks(this.playerX, this.playerY + 0.8, this.playerZ, 0xff0044, 45);

    // Update High Score
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('neon_runner_high_score', this.stats.highScore.toString());
    }

    this.onGameOver?.(this.stats);
  }

  // --- Main Tick Update ---

  private update(delta: number) {
    // Handle Slow-Mo Timer
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= delta;
      if (this.slowMoTimer <= 0) {
        this.timeScale = 1.0;
      }
    }

    const effectiveDelta = delta * this.timeScale;

    if (this.isRunning && !this.isPaused && !this.isGameOver) {
      // 1. Accelerate speed smoothly over time
      this.currentSpeed = Math.min(
        GAME_CONSTANTS.MAX_SPEED,
        this.currentSpeed + GAME_CONSTANTS.ACCELERATION * effectiveDelta
      );
      this.stats.speed = Math.round(this.currentSpeed * 3.6); // km/h representation

      // 2. Advance player forward (Z decreases)
      const forwardDistance = this.currentSpeed * effectiveDelta;
      this.playerZ -= forwardDistance;
      this.stats.distance = Math.floor(Math.abs(this.playerZ));
      this.stats.score += Math.floor(forwardDistance * GAME_CONSTANTS.DISTANCE_SCORE_RATE * (this.stats.multiplier * 0.5));

      // 3. Lateral Lane Movement (exponential damping for silky physics)
      const prevX = this.playerX;
      this.playerX = THREE.MathUtils.damp(
        this.playerX,
        this.targetX,
        GAME_CONSTANTS.LANE_SWITCH_SPEED,
        effectiveDelta
      );
      this.laneVelocity = (this.playerX - prevX) / effectiveDelta;

      // 4. Vertical Jump Physics
      if (!this.isGrounded) {
        this.playerVy += GAME_CONSTANTS.GRAVITY * effectiveDelta;
        this.playerY += this.playerVy * effectiveDelta;

        if (this.playerY <= GAME_CONSTANTS.PLAYER_GROUND_Y) {
          this.playerY = GAME_CONSTANTS.PLAYER_GROUND_Y;
          this.playerVy = 0;
          this.isGrounded = true;
          this.spawnSparks(this.playerX, 0.05, this.playerZ, 0x00f0ff, 6);
        }
      }

      // 5. Slide crouch timer
      if (this.isSliding) {
        this.slideTimer -= effectiveDelta;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      // 6. Update Player Character Position & Procedural Pose
      this.player.group.position.set(this.playerX, this.playerY, this.playerZ);
      this.player.update(
        effectiveDelta,
        this.currentSpeed,
        !this.isGrounded,
        this.isSliding,
        this.laneVelocity
      );

      // 7. Update Moving Obstacles & Recycle Behind
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        if (obs.speedZ) {
          obs.mesh.position.z += obs.speedZ * effectiveDelta; // Cruise forward
        }
        // Remove old obstacles far behind player
        if (obs.mesh.position.z > this.playerZ + 40) {
          this.scene.remove(obs.mesh);
          this.obstacles.splice(i, 1);
        }
      }

      // 8. Update Energy Crystals (Spin & pulse)
      for (let i = this.crystals.length - 1; i >= 0; i--) {
        const cry = this.crystals[i];
        cry.mesh.rotation.y += effectiveDelta * 3.5;
        cry.mesh.position.y = cry.y + Math.sin(Date.now() * 0.005 + cry.id) * 0.12;

        if (cry.mesh.position.z > this.playerZ + 30) {
          this.scene.remove(cry.mesh);
          this.crystals.splice(i, 1);
        }
      }

      // 9. Procedural Spawner
      this.spawnObstaclesAndCrystals();

      // 10. City Environment Update
      this.city.update(this.playerZ, effectiveDelta, this.currentSpeed);

      // 11. Collision & Pickups
      this.checkCollisions();

      // 12. Update directional light shadow focus
      this.dirLight.position.set(this.playerX + 8, 22, this.playerZ + 10);
      this.dirLight.target.position.set(this.playerX, 0, this.playerZ - 10);
      this.dirLight.target.updateMatrixWorld();

      // Stats callback to UI HUD
      this.onStatsUpdate?.(this.stats);
    } else if (!this.isRunning && !this.isGameOver) {
      // Intro camera idle orbit
      const t = Date.now() * 0.0008;
      this.player.update(effectiveDelta, 0, false, false, 0);
      this.camera.position.x = Math.sin(t) * 4.5;
      this.camera.position.z = Math.cos(t) * 5.5;
      this.camera.position.y = 2.8;
      this.camera.lookAt(0, 1.2, 0);
    }

    // Update Spark Particles
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      const p = this.sparkParticles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= 12 * delta; // Gravity on sparks
      p.mesh.scale.multiplyScalar(0.94);

      if (p.life <= 0) {
        this.sparkGroup.remove(p.mesh);
        this.sparkParticles.splice(i, 1);
      }
    }

    // 13. Smooth Dynamic Camera Follow during gameplay
    if (this.isRunning || this.isGameOver) {
      // Dynamic FOV stretching as speed surges!
      const targetFOV = 62 + ((this.currentSpeed - GAME_CONSTANTS.INITIAL_SPEED) / 32) * 14;
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFOV, 6, delta);
      this.camera.updateProjectionMatrix();

      // Smooth camera position damping
      const camTargetX = this.playerX * 0.55;
      const camTargetY = Math.max(2.4, this.playerY * 0.6 + this.cameraTargetY);
      const camTargetZ = this.playerZ + this.cameraOffsetZ;

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, camTargetX, 10, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, camTargetY, 8, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, camTargetZ, 12, delta);

      // Camera shake decay
      if (this.shakeIntensity > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 1.8);
      }

      // Look slightly ahead of the runner
      this.camera.lookAt(this.playerX * 0.3, this.playerY * 0.4 + 1.2, this.playerZ - 12);
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  private startLoop() {
    const tick = () => {
      const delta = Math.min(0.1, this.clock.getDelta());
      this.update(delta);
      this.animationFrameId = requestAnimationFrame(tick);
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDown);
    soundManager.stopMusic();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
