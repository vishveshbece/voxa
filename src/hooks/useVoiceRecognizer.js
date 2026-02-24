// src/hooks/useVoiceRecognizer.js
import { useCallback, useRef, useState } from 'react'
import { CONFIDENCE_THRESHOLD, WORD_MAP, MONITORED_WORDS } from '../lib/constants'

// TF.js and speech-commands are loaded lazily to avoid
// the CJS/ESM conflict at module parse time in Vite dev mode.
let tfModule = null
let scModule = null

async function loadTF() {
  if (tfModule && scModule) return { tf: tfModule, speechCommands: scModule }
  tfModule = await import('@tensorflow/tfjs')
  await import('@tensorflow/tfjs-backend-webgl')
  scModule = await import('@tensorflow-models/speech-commands')
  return { tf: tfModule, speechCommands: scModule }
}

export function useVoiceRecognizer({ onCommand }) {
  const recognizerRef = useRef(null)
  const [status, setStatus]   = useState('idle')   // idle | loading | listening | error
  const [error, setError]     = useState(null)

  const resumeAudioContext = useCallback(async () => {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const tmp = new Ctx()
    if (tmp.state === 'suspended') await tmp.resume()
    await tmp.close()
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setStatus('loading')

    try {
      await resumeAudioContext()

      const { tf, speechCommands } = await loadTF()

      // Try WebGL backend, fall back to CPU
      try {
        await tf.setBackend('webgl')
        await tf.ready()
      } catch {
        await tf.setBackend('cpu')
        await tf.ready()
        console.warn('[VOXA] WebGL unavailable, using CPU backend')
      }
      console.log('[VOXA] TF backend:', tf.getBackend())

      if (!recognizerRef.current) {
        recognizerRef.current = speechCommands.create('BROWSER_FFT')
        await recognizerRef.current.ensureModelLoaded()
        console.log('[VOXA] Model loaded. Labels:', recognizerRef.current.wordLabels())
      }

      await recognizerRef.current.listen(
        result => {
          const scores = result.scores
          const labels = recognizerRef.current.wordLabels()

          let bestWord  = null
          let bestScore = 0

          labels.forEach((label, i) => {
            if (MONITORED_WORDS.includes(label) && scores[i] > bestScore) {
              bestScore = scores[i]
              bestWord  = label
            }
          })

          if (bestWord && bestScore >= CONFIDENCE_THRESHOLD) {
            onCommand(WORD_MAP[bestWord], bestScore)
          }
        },
        {
          includeSpectrogram: false,
          probabilityThreshold: CONFIDENCE_THRESHOLD,
          invokeCallbackOnNoiseAndUnknown: false,
          overlapFactor: 0.75,
        }
      )

      setStatus('listening')
    } catch (err) {
      console.error('[VOXA] Recognizer error:', err)
      setError(err.message)
      setStatus('error')
    }
  }, [onCommand, resumeAudioContext])

  const stop = useCallback(async () => {
    if (recognizerRef.current) {
      try { await recognizerRef.current.stopListening() } catch (_) {}
    }
    setStatus('idle')
  }, [])

  return { status, error, start, stop }
}
