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
}

export interface LocationNode {
  name: string
  path: string
  count: number
  children: LocationNode[]
}
