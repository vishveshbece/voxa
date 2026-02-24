// src/components/SceneExtras.jsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function BeaconRing({ currentPos }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.x = currentPos.current.x
    ref.current.position.z = currentPos.current.z
    ref.current.material.opacity = 0.25 + 0.25 * Math.sin(clock.getElapsedTime() * 3)
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.62, 0.68, 64]} />
      <meshBasicMaterial color="#00fff7" side={THREE.DoubleSide} transparent opacity={0.4} />
    </mesh>
  )
}

export function StarField({ count = 700 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 180
      arr[i * 3 + 1] = Math.random() * 45 + 2
      arr[i * 3 + 2] = (Math.random() - 0.5) * 180
    }
    return arr
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.08} sizeAttenuation />
    </points>
  )
}

export function SceneLights() {
  const p1Ref = useRef()
  const p2Ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (p1Ref.current) p1Ref.current.intensity = 2.5 + Math.sin(t * 2) * 0.8
    if (p2Ref.current) p2Ref.current.intensity = 1.5 + Math.cos(t * 3) * 0.5
  })
  return (
    <>
      <ambientLight color="#001122" intensity={2.5} />
      <pointLight ref={p1Ref} color="#00fff7" intensity={3} distance={35} position={[0, 10, 0]} castShadow />
      <pointLight ref={p2Ref} color="#ff0080" intensity={2} distance={22} position={[-5, 4, 5]} />
    </>
  )
}
