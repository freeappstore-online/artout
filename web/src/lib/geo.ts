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

interface NominatimAddress {
  country?: string
  state?: string
  county?: string
  city?: string
  town?: string
  village?: string
  suburb?: string
  neighbourhood?: string
  road?: string
}

/**
 * Reverse geocode to 5-level location path: Country > State > City > Suburb > Street
 * Uses Nominatim (free, no API key).
 */
export async function reverseGeocode(lat: number, lon: number): Promise<{ path: string; name: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
    { headers: { 'User-Agent': 'ArtOut/1.0 (https://artout.freeappstore.online)' } },
  )
  if (!res.ok) return { path: 'Unknown', name: 'Unknown' }

  const data = await res.json() as { address?: NominatimAddress }
  const addr = data.address
  if (!addr) return { path: 'Unknown', name: 'Unknown' }

  const country = addr.country || ''
  const state = addr.state || addr.county || ''
  const city = addr.city || addr.town || addr.village || ''
  const suburb = addr.suburb || addr.neighbourhood || ''
  const street = addr.road || ''

  const parts = [country, state, city, suburb, street].filter(Boolean)
  const path = parts.join(' > ')
  const name = parts[parts.length - 1] || 'Unknown'
  return { path, name }
}
