// src/components/Drone.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LERP_FACTOR } from '../lib/constants'

const ROTOR_POSITIONS = [
  [  0.9,  0, -0.9 ],
  [ -0.9,  0, -0.9 ],
  [  0.9,  0,  0.9 ],
  [ -0.9,  0,  0.9 ],
]

function Rotor({ position, spin }) {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += spin
  })
  return (
    <mesh ref={ref} position={position} castShadow>
      <cylinderGeometry args={[0.22, 0.22, 0.015, 32]} />
      <meshStandardMaterial
        color="#00fff7"
        metalness={0.5}
        roughness={0.1}
        transparent
        opacity={0.18}
        emissive="#00fff7"
        emissiveIntensity={0.6}
      />
    </mesh>
  )
}

function Arm({ angle }) {
  const x = Math.cos(angle) * 0.72
  const z = Math.sin(angle) * 0.72
  return (
    <mesh position={[x, 0, z]} rotation={[0, angle, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.022, 0.022, 0.9, 6]} />
      <meshStandardMaterial color="#1a2a3a" metalness={0.8} roughness={0.3} />
    </mesh>
  )
}

export function Drone({ targetPos, currentPos }) {
  const groupRef = useRef()
  const clock    = useRef(0)

  useFrame((_, delta) => {
    clock.current += delta

    // Lerp current → target
    currentPos.current.lerp(targetPos.current, LERP_FACTOR)

    if (!groupRef.current) return
    const g = groupRef.current

    // Apply position + hover bob
    g.position.x = currentPos.current.x
    g.position.z = currentPos.current.z
    g.position.y = currentPos.current.y + Math.sin(clock.current * 1.8) * 0.06

    // Tilt based on velocity
    const vx = targetPos.current.x - currentPos.current.x
    const vz = targetPos.current.z - currentPos.current.z
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -vx * 1.4, 0.1)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x,  vz * 1.4, 0.1)
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.18, 0.7]} />
        <meshStandardMaterial
          color="#0d1a2a"
          metalness={0.92}
          roughness={0.18}
          emissive="#002244"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Visor strip */}
      <mesh position={[0, 0.08, 0.3]}>
        <boxGeometry args={[0.48, 0.04, 0.1]} />
        <meshStandardMaterial
          color="#00fff7"
          emissive="#00fff7"
          emissiveIntensity={4}
        />
      </mesh>

      {/* Tail light */}
      <mesh position={[0, 0.02, -0.36]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color="#ff0080"
          emissive="#ff0080"
          emissiveIntensity={5}
        />
      </mesh>

      {/* 4 Arms */}
      {[45, 135, 225, 315].map(deg => (
        <Arm key={deg} angle={(deg * Math.PI) / 180} />
      ))}

      {/* 4 Rotors */}
      {ROTOR_POSITIONS.map((pos, i) => (
        <Rotor key={i} position={pos} spin={i % 2 === 0 ? 0.22 : -0.22} />
      ))}
    </group>
  )
}
