export interface ArtPost {
  id: string
  imageId: string
  imageUrl: string
  thumbUrl: string
  title?: string
  description?: string
  lat: number
  lon: number
  locationPath: string
  locationName: string
  created_at?: string
}

export interface LocationNode {
  name: string
  path: string
  count: number
  children: LocationNode[]
}
