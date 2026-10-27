export const LANES = {
  LEFT: -3.2,
  CENTER: 0.0,
  RIGHT: 3.2,
} as const;

export const LANE_VALUES = [-1, 0, 1] as const;

export function laneToX(lane: number): number {
  if (lane <= -1) return LANES.LEFT;
  if (lane >= 1) return LANES.RIGHT;
  return LANES.CENTER;
}

export const GAME_CONSTANTS = {
  // Speed & progression
  INITIAL_SPEED: 26.0,      // Starting speed (units/sec)
  MAX_SPEED: 58.0,          // Terminal velocity
  ACCELERATION: 0.35,       // Speed increment per second
  
  // Track geometry
  TRACK_WIDTH: 10.5,
  CHUNK_LENGTH: 80.0,
  VISIBLE_CHUNKS: 5,        // 400m view distance
  LANE_WIDTH: 3.2,
  
  // Player physics
  GRAVITY: -46.0,
  JUMP_FORCE: 16.5,
  DOUBLE_JUMP_FORCE: 14.0,
  PLAYER_GROUND_Y: 0.0,
  PLAYER_HEIGHT_STAND: 1.8,
  PLAYER_HEIGHT_SLIDE: 0.65,
  PLAYER_WIDTH: 0.8,
  SLIDE_DURATION: 0.75,     // Seconds for slide crouch
  LANE_SWITCH_SPEED: 18.0,  // Lateral lerp rate
  
  // Scoring
  DISTANCE_SCORE_RATE: 10,  // Points per meter
  CRYSTAL_SCORE: 150,       // Points per crystal
  NEAR_MISS_SCORE: 250,     // Points per close shave
  
  // Cyberpunk Palette
  COLORS: {
    CYAN: 0x00f0ff,
    MAGENTA: 0xff007f,
    VIOLET: 0x8a2be2,
    NEON_YELLOW: 0xfff700,
    DARK_BG: 0x05040a,
    FOG: 0x0a0518,
    ROAD: 0x0e0e18,
    ROAD_EDGE: 0x00f0ff,
    HAZARD_ORANGE: 0xff6600,
  }
};
