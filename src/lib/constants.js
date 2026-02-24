// src/lib/constants.js

export const CONFIDENCE_THRESHOLD = 0.85

export const WORD_MAP = {
  forward : 'F',
  back    : 'B',
  left    : 'L',
  right   : 'R',
  up      : 'U',
  down    : 'D',
}

export const CHAR_TO_WORD = {
  F: 'FORWARD',
  B: 'BACK',
  L: 'LEFT',
  R: 'RIGHT',
  U: 'UP',
  D: 'DOWN',
}

export const MONITORED_WORDS = Object.keys(WORD_MAP)

// Movement physics
export const MOVE_STEP    = 0.28   // world units per command
export const LERP_FACTOR  = 0.08   // position smoothing (0=instant, 1=frozen)
export const GRID_SPEED   = 0.4    // Z-scroll per forward/back command
export const MAX_X        = 14
export const MIN_Y        = 0.4
export const MAX_Y        = 12
