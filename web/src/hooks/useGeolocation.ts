import { useEffect, useState } from 'react'

interface Position {
  lat: number
  lon: number
}

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setError(null)
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return { position, error }
}
