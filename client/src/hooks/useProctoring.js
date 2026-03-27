/**
 * useProctoring.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time interview proctoring hook.
 * Detects:
 *   1. No face in frame (candidate looked away / left seat)
 *   2. Multiple faces (someone else in room)
 *   3. Gaze deviation (eyes not looking at screen via head-pose heuristic)
 *   4. Multiple voices via Web Audio API volume peak detection
 *   5. Tab switch / window blur  (fallback)
 *
 * Requirements:
 *   npm install @vladmandic/face-api
 *
 * Usage:
 *   const { violations, warningType, warningVisible, dismissWarning } =
 *     useProctoring({ videoRef, streamRef, enabled, onTerminate, maxViolations: 3 })
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as faceapi from '@vladmandic/face-api'

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
const SCAN_INTERVAL_MS   = 1200   // how often we scan the frame
const GAZE_YAW_THRESHOLD = 20     // degrees head yaw before "looking away"
const GAZE_PITCH_THRESHOLD = 25   // degrees head pitch (looking down)
const FACE_ABSENT_GRACE  = 2      // how many consecutive absent scans before warn
const AUDIO_VOICE_THRESHOLD = 0.04 // RMS amplitude above which a second voice is suspicious

export default function useProctoring({
  videoRef,
  streamRef,
  enabled = false,
  onViolation,      // (type, count) => void
  onTerminate,      // () => void
  maxViolations = 3,
}) {
  const [modelsLoaded,  setModelsLoaded]  = useState(false)
  const [violations,    setViolations]    = useState(0)
  const [warningVisible,setWarningVisible] = useState(false)
  const [warningType,   setWarningType]   = useState(null)
  const [terminated,    setTerminated]    = useState(false)
  const [expression,    setExpression]    = useState(null)  // { emotion, confidence }
  const [eyeContact,    setEyeContact]    = useState(100)   // 0-100 %

  const violationsRef      = useRef(0)
  const terminatedRef      = useRef(false)
  const absentCountRef     = useRef(0)
  const scanIntervalRef    = useRef(null)
  const audioContextRef    = useRef(null)
  const analyserRef        = useRef(null)
  const audioIntervalRef   = useRef(null)
  const lastViolationTypeRef = useRef(null)
  const cooldownRef        = useRef(false) // prevent rapid-fire violations

  // ── Load face-api models once ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ])
        if (!cancelled) setModelsLoaded(true)
      } catch (e) {
        console.warn('[Proctor] Model load failed (offline?). Face detection disabled.', e)
        if (!cancelled) setModelsLoaded(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ── Issue a violation ─────────────────────────────────────────────────────
  const issueViolation = useCallback((type) => {
    if (terminatedRef.current) return
    if (cooldownRef.current) return
    cooldownRef.current = true
    setTimeout(() => { cooldownRef.current = false }, 4000) // 4s cooldown

    lastViolationTypeRef.current = type
    const next = violationsRef.current + 1
    violationsRef.current = next
    setViolations(next)
    setWarningType(type)
    setWarningVisible(true)
    onViolation?.(type, next)

    if (next >= maxViolations) {
      terminatedRef.current = true
      setTerminated(true)
      setTimeout(() => {
        onTerminate?.()
      }, 3500) // show the final warning for 3.5s then terminate
    }
  }, [maxViolations, onTerminate, onViolation])

  const dismissWarning = useCallback(() => {
    if (terminatedRef.current) return
    setWarningVisible(false)
  }, [])

  // ── Face / gaze scanning ─────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !modelsLoaded) return
    const video = videoRef?.current
    if (!video) return

    const OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.35 })

    async function scan() {
      if (terminatedRef.current) return
      if (!video || video.readyState < 2) return
      try {
        const detections = await faceapi
          .detectAllFaces(video, OPTIONS)
          .withFaceLandmarks(true)
          .withFaceExpressions()
        const count = detections.length

        // ── No face ──
        if (count === 0) {
          absentCountRef.current += 1
          if (absentCountRef.current >= FACE_ABSENT_GRACE) {
            absentCountRef.current = 0
            issueViolation('no_face')
          }
          setEyeContact(prev => Math.max(0, prev - 8))
          return
        }
        absentCountRef.current = 0

        // ── Multiple faces ──
        if (count > 1) {
          issueViolation('multiple_faces')
          return
        }

        const det = detections[0]

        // ── Expressions ──
        if (det.expressions) {
          const exps   = det.expressions
          const sorted = Object.entries(exps).sort((a, b) => b[1] - a[1])
          const top    = sorted[0]
          if (top && top[1] > 0.4) {
            setExpression({ emotion: top[0], confidence: Math.round(top[1] * 100) })
          }
        }

        // ── Gaze deviation (head pose heuristic via landmarks) ──
        const lm = det.landmarks
        const jaw      = lm.getJawOutline()
        const nose     = lm.getNose()
        const leftEye  = lm.getLeftEye()
        const rightEye = lm.getRightEye()

        const faceWidth  = jaw[jaw.length - 1].x - jaw[0].x
        const eyeMidX    = (leftEye[0].x + rightEye[3].x) / 2
        const noseTipX   = nose[3].x
        const noseBase   = nose[0]
        const noseTip    = nose[6]

        const yawRatio  = Math.abs(noseTipX - eyeMidX) / (faceWidth || 1)
        const yawDeg    = yawRatio * 90
        const noseLenY  = Math.abs(noseTip.y - noseBase.y)
        const faceHeight = Math.abs(jaw[8].y - noseBase.y)
        const pitchRatio = noseLenY / (faceHeight || 1)
        const pitchDeg   = (1 - pitchRatio) * 60

        const gazeOK = yawDeg <= GAZE_YAW_THRESHOLD && pitchDeg <= GAZE_PITCH_THRESHOLD

        // Eye contact score: smooth decay/recovery
        setEyeContact(prev => {
          const target = gazeOK ? Math.min(100, prev + 3) : Math.max(0, prev - 5)
          return Math.round(target)
        })

        if (!gazeOK) issueViolation('gaze')

      } catch { /* ignore individual frame errors */ }
    }

    scanIntervalRef.current = setInterval(scan, SCAN_INTERVAL_MS)
    return () => clearInterval(scanIntervalRef.current)
  }, [enabled, modelsLoaded, videoRef, issueViolation])

  // ── Audio analysis: detect multiple voices ───────────────────────────────
  useEffect(() => {
    if (!enabled) return
    const stream = streamRef?.current
    if (!stream) return

    try {
      const ctx      = new (window.AudioContext || window.webkitAudioContext)()
      const source   = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      audioContextRef.current = ctx
      analyserRef.current     = analyser

      const bufLen = analyser.frequencyBinCount
      const dataArr = new Uint8Array(bufLen)

      // We track the rolling average RMS — a sudden spike above threshold while
      // speech recognition also has transcript = likely second voice
      let baselineRMS = null
      let spikeCount  = 0

      audioIntervalRef.current = setInterval(() => {
        if (terminatedRef.current) return
        analyser.getByteTimeDomainData(dataArr)
        // Compute RMS
        let sumSq = 0
        for (let i = 0; i < bufLen; i++) {
          const n = (dataArr[i] - 128) / 128
          sumSq += n * n
        }
        const rms = Math.sqrt(sumSq / bufLen)

        if (baselineRMS === null) { baselineRMS = rms; return }
        // Update slow baseline
        baselineRMS = baselineRMS * 0.98 + rms * 0.02

        // If current RMS is much higher than baseline → possible 2nd voice burst
        if (rms > AUDIO_VOICE_THRESHOLD && rms > baselineRMS * 2.8) {
          spikeCount++
          if (spikeCount >= 3) { // 3 consecutive intervals
            spikeCount = 0
            issueViolation('multi_voice')
          }
        } else {
          spikeCount = Math.max(0, spikeCount - 1)
        }
      }, 800)
    } catch (e) {
      console.warn('[Proctor] Audio analysis failed:', e)
    }

    return () => {
      clearInterval(audioIntervalRef.current)
      audioContextRef.current?.close()
    }
  }, [enabled, streamRef, issueViolation])

  // ── Tab switch detection (visibilitychange is the most reliable) ────────
  // We use a SEPARATE cooldown for tab-switch so face/audio cooldowns
  // don't accidentally block it.
  const tabCooldownRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const handleVisibility = () => {
      if (!document.hidden) return            // tab came back — ignore
      if (terminatedRef.current) return       // already terminated
      if (tabCooldownRef.current) return      // tab-switch cooldown active

      // Separate 2-second cooldown just for tab switches
      tabCooldownRef.current = true
      setTimeout(() => { tabCooldownRef.current = false }, 2000)

      // Issue violation directly (bypass main cooldown for tab-switch)
      const next = violationsRef.current + 1
      violationsRef.current = next
      setViolations(next)
      setWarningType('tab_switch')
      setWarningVisible(true)
      onViolation?.('tab_switch', next)

      if (next >= maxViolations) {
        terminatedRef.current = true
        setTerminated(true)
        setTimeout(() => { onTerminate?.() }, 3500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [enabled, maxViolations, onTerminate, onViolation])


  // ── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(scanIntervalRef.current)
      clearInterval(audioIntervalRef.current)
      audioContextRef.current?.close()
    }
  }, [])

  return {
    violations,
    warningVisible,
    warningType,
    terminated,
    modelsLoaded,
    expression,
    eyeContact,
    dismissWarning,
  }
}
