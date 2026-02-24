// src/App.jsx
import { useState, useCallback, useRef, useEffect } from 'react'
import { VoxaScene }          from './components/VoxaScene'
import { HUD }                from './components/HUD'
import { useVoiceRecognizer } from './hooks/useVoiceRecognizer'
import { useWakeLock }        from './hooks/useWakeLock'
import { useFirebaseMove }    from './hooks/useFirebaseMove'
import { useDroneState }      from './hooks/useDroneState'
import { isConfigured }       from './lib/firebase'
import './styles/global.css'

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [loadPct,  setLoadPct]  = useState(0)
  const [loadMsg,  setLoadMsg]  = useState('Booting renderer…')
  const [lastCmd,  setLastCmd]  = useState(null)

  const { acquire: wlAcquire, release: wlRelease } = useWakeLock()

  // Drone position state (mutable refs, no re-renders per frame)
  const { targetPos, currentPos, gridTargetZ, gridCurrentZ, dispatchCommand } = useDroneState()

  // Called by BOTH voice recognizer AND Firebase listener
  const handleCommand = useCallback((charCmd, confidence = 0, fromVoice = false) => {
    dispatchCommand(charCmd)
    setLastCmd({ char: charCmd, confidence, ts: Date.now() })
    if (fromVoice) {
      publishCommand(charCmd)
    }
  }, [dispatchCommand]) // eslint-disable-line

  // Firebase WebSocket — subscribe to remote /move, expose publish fn
  const { publishCommand, connected: fbConnected } = useFirebaseMove(
    useCallback((char) => handleCommand(char, 0, false), [handleCommand])
  )

  // TF.js voice recognizer
  const { status, error, start, stop } = useVoiceRecognizer({
    onCommand: useCallback((charCmd, confidence) => {
      handleCommand(charCmd, confidence, true)
    }, [handleCommand]),
  })

  // ── Wake Lock management tied to listening state ──
  const prevStatus = useRef('idle')
  useEffect(() => {
    if (prevStatus.current !== 'listening' && status === 'listening') {
      wlAcquire()
    }
    if (prevStatus.current === 'listening' && status !== 'listening') {
      wlRelease()
    }
    prevStatus.current = status
  }, [status, wlAcquire, wlRelease])

  // ── Start / Stop button handler ──
  const handleStartStop = useCallback(async () => {
    if (status === 'listening') {
      await stop()
    } else {
      await start()
    }
  }, [status, start, stop])

  // ── Boot splash sequence ──
  useEffect(() => {
    async function boot() {
      setLoadPct(15);  setLoadMsg('Booting renderer…')
      await delay(300)
      setLoadPct(40);  setLoadMsg('Connecting Firebase…')
      await delay(350)
      setLoadPct(70);  setLoadMsg('Warming up TensorFlow…')
      await delay(400)
      setLoadPct(100); setLoadMsg('Ready!')
      await delay(700)
      setSplashVisible(false)
    }
    boot()
  }, [])

  return (
    <>
      {/* 3D Canvas — full screen, no pointer events from HUD */}
      <VoxaScene
        targetPos={targetPos}
        currentPos={currentPos}
        gridTargetZ={gridTargetZ}
        gridCurrentZ={gridCurrentZ}
      />

      {/* HUD overlay */}
      <HUD
        status={status}
        lastCommand={lastCmd}
        currentPos={currentPos}
        gridCurrentZ={gridCurrentZ}
        onStartStop={handleStartStop}
        firebaseConnected={fbConnected}
      />

      {/* Error toast */}
      {error && (
        <div style={errorStyle}>
          ⚠ {error} — Check mic permissions & reload
        </div>
      )}

      {/* Splash */}
      <div className={`splash ${splashVisible ? '' : 'hidden'}`}>
        <div className="splashTitle">VOXA</div>
        <div className="splashSub">Zero-Latency Voice 3D Controller</div>
        <div className="loadingBarWrap">
          <div className="loadingBar" style={{ width: `${loadPct}%` }} />
        </div>
        <div className="loadingLabel">{loadMsg}</div>
      </div>
    </>
  )
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

const errorStyle = {
  position: 'fixed',
  top: 70,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255,30,30,0.15)',
  border: '1px solid rgba(255,80,80,0.4)',
  borderRadius: 8,
  padding: '10px 18px',
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.1em',
  color: 'rgba(255,160,160,0.9)',
  zIndex: 20,
  backdropFilter: 'blur(8px)',
  maxWidth: '90vw',
  textAlign: 'center',
}
