// src/components/CameraRig.jsx
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _lookTarget = new THREE.Vector3()

export function CameraRig({ currentPos }) {
  useFrame(({ camera }) => {
    const drone = currentPos.current

    // Smoothly follow drone X/Y, stay behind on Z
    camera.position.x += (drone.x * 0.3 - camera.position.x) * 0.04
    camera.position.y += (drone.y * 0.4 + 4 - camera.position.y) * 0.04

    _lookTarget.set(drone.x, drone.y, drone.z)
    camera.lookAt(_lookTarget)
  })
  return null
}
