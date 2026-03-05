/**
 * useCamera — manages getUserMedia stream, capture, and cleanup.
 * useGeolocation — wraps navigator.geolocation with Promise interface.
 * Both are tested independently from components.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

// ── useCamera ─────────────────────────────────────────────────────────────────

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  stream: MediaStream | null
  isActive: boolean
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  captureBase64: () => string | null  // returns base64 JPEG or null
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = ms
      setStream(ms)
      setIsActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = ms
        await videoRef.current.play()
      }
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : `Camera error: ${err.message}`
      )
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStream(null)
    setIsActive(false)
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const captureBase64 = useCallback((): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !isActive) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0)
    // Remove data:image/jpeg;base64, prefix — API expects raw base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    return dataUrl.split(',')[1] ?? null
  }, [isActive])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  return { videoRef, canvasRef, stream, isActive, error, startCamera, stopCamera, captureBase64 }
}


// ── useGeolocation ────────────────────────────────────────────────────────────

export interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
}

export interface UseGeolocationReturn {
  position: GeoPosition | null
  error: string | null
  loading: boolean
  getPosition: () => Promise<GeoPosition>
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getPosition = useCallback((): Promise<GeoPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation is not supported by this device.'
        setError(msg)
        reject(new Error(msg))
        return
      }

      setLoading(true)
      setError(null)

      navigator.geolocation.getCurrentPosition(
        pos => {
          const gp: GeoPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          setPosition(gp)
          setLoading(false)
          resolve(gp)
        },
        err => {
          const msg =
            err.code === 1
              ? 'Location permission denied. Please allow location access.'
              : err.code === 2
              ? 'Location unavailable. Check your GPS signal.'
              : 'Location request timed out. Please try again.'
          setError(msg)
          setLoading(false)
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
      )
    })
  }, [])

  return { position, error, loading, getPosition }
}
