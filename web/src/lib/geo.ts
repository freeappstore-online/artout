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

export function buildLocationPath(components: google.maps.GeocoderAddressComponent[]): {
  path: string
  name: string
} {
  let country = ''
  let city = ''
  let neighborhood = ''

  for (const c of components) {
    if (c.types.includes('country')) country = c.long_name
    if (c.types.includes('locality')) city = c.long_name
    if (c.types.includes('sublocality_level_1') || c.types.includes('neighborhood')) {
      neighborhood = c.long_name
    }
  }

  // Fall back: if no neighborhood, try admin_area_level_2 or route
  if (!neighborhood) {
    for (const c of components) {
      if (c.types.includes('administrative_area_level_2')) {
        neighborhood = c.long_name
        break
      }
    }
  }

  const parts = [country, city, neighborhood].filter(Boolean)
  const path = parts.join(' > ')
  const name = parts[parts.length - 1] || 'Unknown'
  return { path, name }
}
