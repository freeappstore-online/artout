import { useCallback, useEffect, useState } from 'react'

interface Position {
  lat: number
  lon: number
}

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setError(null)
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  useEffect(() => {
    requestPosition()
  }, [requestPosition])

  return { position, error, requestPosition }
}
