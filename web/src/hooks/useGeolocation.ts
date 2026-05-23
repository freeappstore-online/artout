import { useEffect, useState } from 'react'

interface Position {
  lat: number
  lon: number
}

export type GeoState = 'pending' | 'granted' | 'denied' | 'unavailable'

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null)
  const [state, setState] = useState<GeoState>('pending')

  useEffect(() => {
    if (!navigator.geolocation) {
      setState('unavailable')
      return
    }

    // Try high accuracy first, fall back to low accuracy
    let watchId: number | undefined
    let fallbackDone = false

    const onSuccess = (pos: GeolocationPosition) => {
      setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      setState('granted')
    }

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setState('denied')
      } else if (!fallbackDone) {
        // High-accuracy timed out — try low accuracy
        fallbackDone = true
        navigator.geolocation.getCurrentPosition(onSuccess, () => setState('denied'), {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        })
      }
    }

    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 30000,
    })

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return { position, state }
}
