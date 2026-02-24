// src/components/HUD.jsx
import { useEffect, useRef } from 'react'
import { CHAR_TO_WORD } from '../lib/constants'
import styles from '../styles/hud.module.css'

export function HUD({
  status,          // 'idle' | 'loading' | 'listening' | 'error'
  lastCommand,     // { char, confidence, ts }
  currentPos,      // ref to THREE.Vector3
  gridCurrentZ,    // ref to number
  onStartStop,
  firebaseConnected,
}) {
  const cmdRef     = useRef()
  const xRef       = useRef()
  const yRef       = useRef()
  const zRef       = useRef()
  const confRef    = useRef()
  const rafRef     = useRef()

  // Update coord display in rAF to avoid React re-renders every frame
  useEffect(() => {
    function tick() {
      if (xRef.current) xRef.current.textContent = currentPos.current.x.toFixed(2)
      if (yRef.current) yRef.current.textContent = currentPos.current.y.toFixed(2)
      if (zRef.current) zRef.current.textContent = (-gridCurrentZ.current * 0.4).toFixed(2)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [currentPos, gridCurrentZ])

  // Flash command word
  useEffect(() => {
    if (!lastCommand || !cmdRef.current) return
    const el = cmdRef.current
    el.textContent = CHAR_TO_WORD[lastCommand.char] || '—'
    el.classList.remove(styles.cmdShow)
    void el.offsetWidth // reflow to re-trigger animation
    el.classList.add(styles.cmdShow)

    if (confRef.current) {
      confRef.current.style.width = (lastCommand.confidence * 100).toFixed(1) + '%'
    }
  }, [lastCommand])

  const isListening = status === 'listening'
  const isLoading   = status === 'loading'

  return (
    <div className={styles.hud}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.logo}>VOXA</div>
        <div className={styles.statusBar}>
          <div className={`${styles.dot} ${isListening ? styles.dotActive : ''}`} />
          <span className={styles.statusText}>
            {status === 'idle'      && 'STANDBY'}
            {status === 'loading'   && 'LOADING AI…'}
            {status === 'listening' && 'LISTENING'}
            {status === 'error'     && 'ERROR'}
          </span>
          {firebaseConnected && (
            <span className={styles.fbBadge}>⬢ FB</span>
          )}
        </div>
      </div>

      {/* ── Center command flash ── */}
      <div className={styles.commandArea}>
        <div ref={cmdRef} className={`${styles.cmdWord}`}>—</div>
        <div className={styles.confWrap}>
          <span className={styles.confLabel}>CONF</span>
          <div className={styles.confBar}>
            <div ref={confRef} className={styles.confFill} />
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className={styles.bottomRow}>
        <div className={styles.coordsPanel}>
          <div><span className={styles.axis}>X </span><span ref={xRef}>0.00</span></div>
          <div><span className={styles.axis}>Y </span><span ref={yRef}>0.00</span></div>
          <div><span className={styles.axis}>Z </span><span ref={zRef}>0.00</span></div>
        </div>

        <button
          className={`${styles.startBtn} ${isListening ? styles.startBtnActive : ''}`}
          onClick={onStartStop}
          disabled={isLoading}
        >
          {isLoading ? 'INITIALIZING…' : isListening ? 'STOP ENGINE' : 'START ENGINE'}
        </button>
      </div>

      {/* ── Firebase warning ── */}
      {!firebaseConnected && (
        <div className={styles.fbWarning}>
          ⚠ Firebase not configured — local-only mode. Edit <code>src/lib/firebase.js</code>
        </div>
      )}
    </div>
  )
}
