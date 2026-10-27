export type GameState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type Lane = -1 | 0 | 1; // Left (-3m), Center (0m), Right (+3m)

export type ObstacleType = 
  | 'LOW_BARRIER'       // Jump over or switch lanes
  | 'HIGH_LASER'        // Slide under or switch lanes
  | 'HOVER_CAR'         // Moving vehicle in lane, jump or dodge
  | 'TALL_BARRIER'      // Full height, must switch lanes
  | 'ROAD_GAP';         // Gap in track, must jump

export interface ObstacleData {
  id: number;
  type: ObstacleType;
  lane: Lane;
  z: number;
  width: number;
  height: number;
  depth: number;
  speedZ?: number; // For moving hover cars
  mesh: any;
  passed: boolean;
  nearMissChecked: boolean;
}

export interface CrystalData {
  id: number;
  lane: Lane;
  z: number;
  y: number;
  mesh: any;
  collected: boolean;
  value: number;
}

export interface GameStats {
  score: number;
  distance: number;
  crystals: number;
  speed: number;
  multiplier: number;
  highScore: number;
  nearMisses: number;
}

export interface GameSettings {
  musicVolume: number; // 0 to 1
  sfxVolume: number;   // 0 to 1
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  showTouchControls: boolean;
  reducedMotion: boolean;
}
