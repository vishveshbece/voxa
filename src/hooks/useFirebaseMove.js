// src/hooks/useFirebaseMove.js
//
// All communication is via Firebase WebSockets — zero HTTP polling.
// set()   → write a command char to /move  (sub-50ms publish)
// onValue → subscribe to /move changes      (real-time push)
import { useEffect, useCallback } from 'react'
import { database, ref, set, onValue, isConfigured } from '../lib/firebase'

/**
 * @param {(charCmd: string) => void} onRemoteCommand - called when /move changes remotely
 * @returns {{ publishCommand: (charCmd: string) => void, connected: boolean }}
 */
export function useFirebaseMove(onRemoteCommand) {
  const connected = isConfigured && database !== null

  // Subscribe to /move  (runs once on mount)
  useEffect(() => {
    if (!connected) return

    const moveRef = ref(database, 'move')
    const unsubscribe = onValue(moveRef, snapshot => {
      const val = snapshot.val()
      if (val) onRemoteCommand(val)
    })

    return () => unsubscribe()
  }, [connected, onRemoteCommand])

  // Publish a command char to /move via WebSocket (no fetch / no axios)
  const publishCommand = useCallback((charCmd) => {
    if (!connected) return
    const moveRef = ref(database, 'move')
    set(moveRef, charCmd).catch(err => {
      console.error('[VOXA] Firebase set error:', err)
    })
  }, [connected])

  return { publishCommand, connected }
}
