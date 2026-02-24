// src/hooks/useWakeLock.js
import { useCallback, useRef } from 'react'

export function useWakeLock() {
  const lockRef = useRef(null)

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      console.warn('[VOXA] Wake Lock API not supported on this device.')
      return
    }
    try {
      lockRef.current = await navigator.wakeLock.request('screen')
      console.log('[VOXA] Wake Lock acquired')

      // Re-acquire if browser tab regains visibility
      document.addEventListener('visibilitychange', async () => {
        if (lockRef.current !== null && document.visibilityState === 'visible') {
          lockRef.current = await navigator.wakeLock.request('screen')
          console.log('[VOXA] Wake Lock re-acquired after visibility change')
        }
      }, { once: false })
    } catch (err) {
      console.warn('[VOXA] Wake Lock request failed:', err.message)
    }
  }, [])

  const release = useCallback(async () => {
    if (lockRef.current) {
      await lockRef.current.release()
      lockRef.current = null
      console.log('[VOXA] Wake Lock released')
    }
  }, [])

  return { acquire, release }
}
