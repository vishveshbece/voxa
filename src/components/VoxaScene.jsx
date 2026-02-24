// src/components/VoxaScene.jsx
import { Canvas } from '@react-three/fiber'
import { Fog } from 'three'
import { Drone } from './Drone'
import { InfiniteGrid } from './InfiniteGrid'
import { BeaconRing, StarField, SceneLights } from './SceneExtras'
import { CameraRig } from './CameraRig'

export function VoxaScene({ targetPos, currentPos, gridTargetZ, gridCurrentZ }) {
  return (
    <Canvas
      shadows
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 4, 10] }}
      gl={{ antialias: true, toneMapping: 4 /* ACESFilmic */, toneMappingExposure: 1.1 }}
      dpr={[1, 2]}
      style={{ position: 'fixed', inset: 0 }}
      onCreated={({ scene }) => {
        scene.background = { r: 0.012, g: 0.031, b: 0.063 } // set via fog
        scene.fog = new Fog(0x030810, 40, 120)
      }}
    >
      <color attach="background" args={['#030810']} />
      <fog attach="fog" args={['#030810', 40, 130]} />

      <SceneLights />

      <InfiniteGrid gridTargetZ={gridTargetZ} gridCurrentZ={gridCurrentZ} />

      {/* Ground shadow catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      <BeaconRing currentPos={currentPos} />
      <StarField count={700} />
      <Drone targetPos={targetPos} currentPos={currentPos} />
      <CameraRig currentPos={currentPos} />
    </Canvas>
  )
}
