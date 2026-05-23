const R = 6371e3 // Earth radius in meters

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isInBounds(
  lat: number, lon: number,
  bounds: { north: number; south: number; east: number; west: number },
): boolean {
  return lat >= bounds.south && lat <= bounds.north && lon >= bounds.west && lon <= bounds.east
}

interface NominatimAddress {
  country?: string
  city?: string
  town?: string
  village?: string
  suburb?: string
  neighbourhood?: string
  county?: string
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ path: string; name: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    { headers: { 'User-Agent': 'ArtOut/1.0 (https://artout.freeappstore.online)' } },
  )
  if (!res.ok) return { path: 'Unknown', name: 'Unknown' }

  const data = await res.json() as { address?: NominatimAddress }
  const addr = data.address
  if (!addr) return { path: 'Unknown', name: 'Unknown' }

  const country = addr.country || ''
  const city = addr.city || addr.town || addr.village || ''
  const neighborhood = addr.suburb || addr.neighbourhood || addr.county || ''

  const parts = [country, city, neighborhood].filter(Boolean)
  const path = parts.join(' > ')
  const name = parts[parts.length - 1] || 'Unknown'
  return { path, name }
}
