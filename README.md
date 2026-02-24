# VOXA — Zero-Latency Mobile-First 3D Voice Controller

> React · @react-three/fiber · TensorFlow.js · Firebase Realtime Database

## Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + Vite |
| 3D Engine | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Local AI | `@tensorflow-models/speech-commands` + `tfjs-backend-webgl` |
| Real-time sync | Firebase Realtime Database JS SDK (WebSocket only) |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure Firebase (copy example, fill in values)
cp .env.example .env.local
# → Edit .env.local with your Firebase project credentials

# 3. Run dev server
npm run dev

# 4. Open on Android Chrome
# → Navigate to your local IP on port 5173
# → Tap START ENGINE (required to init microphone on mobile)
# → Speak: "forward" "back" "left" "right" "up" "down"
```

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database** (not Firestore)
3. Set rules to allow read/write (dev only):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
4. Copy credentials into `.env.local`

## Architecture

```
src/
├── lib/
│   ├── firebase.js       # Firebase init + re-exports (WebSocket, no fetch/axios)
│   └── constants.js      # Commands, physics constants
├── hooks/
│   ├── useVoiceRecognizer.js  # TF.js speech model, WebGL backend, 85% threshold
│   ├── useFirebaseMove.js     # set(ref, char) publish + onValue subscribe
│   ├── useWakeLock.js         # Screen wake lock (prevents Android sleep)
│   └── useDroneState.js       # Mutable ref state for drone (no per-frame re-renders)
├── components/
│   ├── VoxaScene.jsx      # <Canvas> root, fog, camera
│   ├── Drone.jsx          # 3D drone mesh + useFrame lerp loop
│   ├── InfiniteGrid.jsx   # Dual grid with Z-scroll illusion
│   ├── SceneExtras.jsx    # Beacon ring, star field, lights
│   ├── CameraRig.jsx      # Smooth camera follow
│   └── HUD.jsx            # Transparent overlay (coords, command flash, button)
└── App.jsx                # Wires hooks → scene + HUD
```

## Mobile Optimizations

- **Wake Lock API** — `navigator.wakeLock.request('screen')` prevents Android screen sleep
- **AudioContext resume** — "START ENGINE" button gates microphone init (mandatory on mobile browsers)  
- **WebGL backend** — `tf.setBackend('webgl')` uses the GPU for inference
- **No re-renders in animation loop** — drone state is mutable refs, coords update via direct DOM manipulation in `rAF`
- **dpr capped at 2** — prevents GPU overload on high-DPI screens
- `user-scalable=no`, `touch-action: none` — full-screen, no accidental zoom

## Performance Notes

- Zero `fetch` / `axios` calls — all Firebase comms are WebSocket (`onValue` / `set`)
- `useFrame` lerp runs at display refresh rate (60-120fps)
- `overlapFactor: 0.75` on speech listener for fast detection without gaps
- TF model is cached after first load — subsequent starts are instant
