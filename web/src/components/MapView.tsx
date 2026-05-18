import { useCallback, useMemo, useState } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import type { ArtPost } from '../lib/types'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

// Default: Melbourne, AU (where ArtOut was born)
const DEFAULT_CENTER = { lat: -37.8136, lng: 144.9631 }
const DEFAULT_ZOOM = 13

interface MapViewProps {
  posts: ArtPost[]
  userLat?: number
  userLon?: number
  onPostClick: (post: ArtPost) => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
}

function MapContent({ posts, userLat, userLon, onPostClick, isFavorite, onToggleFavorite }: MapViewProps) {
  const [selected, setSelected] = useState<ArtPost | null>(null)
  const map = useMap()

  const center = useMemo(
    () => (userLat && userLon ? { lat: userLat, lng: userLon } : DEFAULT_CENTER),
    [userLat, userLon],
  )

  const handleLocate = useCallback(() => {
    if (map && userLat && userLon) {
      map.panTo({ lat: userLat, lng: userLon })
      map.setZoom(15)
    }
  }, [map, userLat, userLon])

  return (
    <div className="relative flex-1">
      <Map
        defaultCenter={center}
        defaultZoom={DEFAULT_ZOOM}
        mapId="artout-map"
        gestureHandling="greedy"
        disableDefaultUI
        className="h-full w-full"
      >
        {posts.map((post) => (
          <AdvancedMarker
            key={post.id}
            position={{ lat: post.lat, lng: post.lon }}
            onClick={() => setSelected(post)}
          >
            <div className="h-3 w-3 rounded-full border-2 border-white bg-[var(--accent)] shadow-lg" />
          </AdvancedMarker>
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lon }}
            onCloseClick={() => setSelected(null)}
            headerDisabled
          >
            <div
              className="flex cursor-pointer gap-2 p-1"
              onClick={() => {
                onPostClick(selected)
                setSelected(null)
              }}
            >
              <img
                src={selected.thumbUrl}
                alt={selected.title || 'Street art'}
                className="h-16 w-16 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900">
                  {selected.title || 'Untitled'}
                </div>
                <div className="text-xs text-gray-500">{selected.locationName}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(selected.id)
                  }}
                  className="mt-1 text-xs"
                >
                  {isFavorite(selected.id) ? '\u2764\ufe0f' : '\u2661'} Favorite
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Locate me button */}
      {userLat && userLon && (
        <button
          onClick={handleLocate}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-strong)] shadow-lg backdrop-blur"
          title="My location"
        >
          <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
        </button>
      )}
    </div>
  )
}

export function MapView(props: MapViewProps) {
  if (!MAPS_API_KEY) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-[var(--muted)]">
        <div>
          <p className="text-lg font-semibold">Google Maps API key missing</p>
          <p className="mt-2 text-sm">
            Set <code className="rounded bg-[var(--glass)] px-1">VITE_GOOGLE_MAPS_KEY</code> in your <code>.env</code> file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={MAPS_API_KEY}>
      <MapContent {...props} />
    </APIProvider>
  )
}
