// src/components/InfiniteGrid.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LERP_FACTOR } from '../lib/constants'

export function InfiniteGrid({ gridTargetZ, gridCurrentZ }) {
  const grid1Ref = useRef()
  const grid2Ref = useRef()

  useFrame(() => {
    // Lerp grid Z scroll
    gridCurrentZ.current += (gridTargetZ.current - gridCurrentZ.current) * LERP_FACTOR

    const z1 = ((gridCurrentZ.current % 1) + 1) % 1
    const z2 = ((gridCurrentZ.current % 5) + 5) % 5

    if (grid1Ref.current) grid1Ref.current.position.z = z1
    if (grid2Ref.current) grid2Ref.current.position.z = z2
  })

  return (
    <group>
      {/* Primary fine grid — cyan */}
      <gridHelper
        ref={grid1Ref}
        args={[100, 100, '#00fff7', '#00fff7']}
        position={[0, 0, 0]}
      >
        <primitive
          object={new THREE.LineBasicMaterial({ transparent: true, opacity: 0.18, color: '#00fff7' })}
          attach="material"
        />
      </gridHelper>

      {/* Secondary coarse grid — magenta accent */}
      <gridHelper
        ref={grid2Ref}
        args={[100, 20, '#ff0080', '#ff0080']}
        position={[0, 0, 0]}
      >
        <primitive
          object={new THREE.LineBasicMaterial({ transparent: true, opacity: 0.08, color: '#ff0080' })}
          attach="material"
        />
      </gridHelper>
    </group>
  )
}
