// src/hooks/useVoiceRecognizer.js
//
// TF.js and speech-commands are loaded as UMD globals via <script> tags in index.html.
// We access them through window.tf and window.speechCommands — zero bundler involvement.
import { useCallback, useRef, useState } from 'react'
import { CONFIDENCE_THRESHOLD, WORD_MAP, MONITORED_WORDS } from '../lib/constants'

export function useVoiceRecognizer({ onCommand }) {
  const recognizerRef = useRef(null)
  const [status, setStatus] = useState('idle')   // idle | loading | listening | error
  const [error, setError]   = useState(null)

  // Resume AudioContext — mandatory on Android Chrome / iOS Safari before getUserMedia
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
      // Guard — CDN scripts must be loaded
      if (!window.tf || !window.speechCommands) {
        throw new Error('TensorFlow.js CDN scripts not yet loaded. Check your network.')
      }

      const tf             = window.tf
      const speechCommands = window.speechCommands

      await resumeAudioContext()

      // WebGL backend for GPU-accelerated inference on Android
      try {
        await tf.setBackend('webgl')
        await tf.ready()
      } catch {
        await tf.setBackend('cpu')
        await tf.ready()
        console.warn('[VOXA] WebGL unavailable — falling back to CPU')
      }
      console.log('[VOXA] TF backend:', tf.getBackend())

      // Load model once; cached in ref for subsequent starts
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
          includeSpectrogram:             false,
          probabilityThreshold:           CONFIDENCE_THRESHOLD,
          invokeCallbackOnNoiseAndUnknown: false,
          overlapFactor:                  0.75,
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
