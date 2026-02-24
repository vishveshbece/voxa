// src/hooks/useDroneState.js
import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { MOVE_STEP, MAX_X, MIN_Y, MAX_Y, GRID_SPEED } from '../lib/constants'

/**
 * Holds mutable ref state for the drone (not React state — avoids re-renders per frame).
 * Returns a dispatchCommand fn used by both voice and Firebase listeners.
 */
export function useDroneState() {
  // Three.js vectors stored in refs — mutated directly inside useFrame
  const targetPos    = useRef(new THREE.Vector3(0, 1.4, 0))
  const currentPos   = useRef(new THREE.Vector3(0, 1.4, 0))
  const gridTargetZ  = useRef(0)
  const gridCurrentZ = useRef(0)

  const dispatchCommand = useCallback((charCmd) => {
    const t = targetPos.current
    switch (charCmd) {
      case 'F': gridTargetZ.current  += GRID_SPEED;   break
      case 'B': gridTargetZ.current  -= GRID_SPEED;   break
      case 'L': t.x                  -= MOVE_STEP;    break
      case 'R': t.x                  += MOVE_STEP;    break
      case 'U': t.y                  += MOVE_STEP;    break
      case 'D': t.y                  -= MOVE_STEP;    break
      default:  break
    }
    // Clamp
    t.x = Math.max(-MAX_X, Math.min(MAX_X, t.x))
    t.y = Math.max(MIN_Y,  Math.min(MAX_Y, t.y))
  }, [])

  return { targetPos, currentPos, gridTargetZ, gridCurrentZ, dispatchCommand }
}
