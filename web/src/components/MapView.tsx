import { useCallback, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { ArtPost } from '../lib/types'

// Default: Melbourne, AU (where ArtOut was born)
const DEFAULT_CENTER: [number, number] = [-37.8136, 144.9631]
const DEFAULT_ZOOM = 13

const dotIcon = L.divIcon({
  className: '',
  html: '<div style="width:12px;height:12px;border-radius:50%;border:2px solid white;background:var(--accent,#d86f4d);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

interface MapViewProps {
  posts: ArtPost[]
  userLat?: number
  userLon?: number
  onPostClick: (post: ArtPost) => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
}

function LocateButton({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  const handleClick = useCallback(() => {
    map.setView([lat, lon], 15)
  }, [map, lat, lon])

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-4 right-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-strong)] shadow-lg backdrop-blur"
      title="My location"
    >
      <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
      </svg>
    </button>
  )
}

export function MapView({ posts, userLat, userLon, onPostClick, isFavorite, onToggleFavorite }: MapViewProps) {
  const [selected, setSelected] = useState<ArtPost | null>(null)
  const popupRef = useRef<L.Popup>(null)

  const center = useMemo<[number, number]>(
    () => (userLat && userLon ? [userLat, userLon] : DEFAULT_CENTER),
    [userLat, userLon],
  )

  return (
    <div className="relative flex-1" style={{ minHeight: 0 }}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="absolute inset-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />

        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.lat, post.lon]}
            icon={dotIcon}
            eventHandlers={{ click: () => setSelected(post) }}
          />
        ))}

        {selected && (
          <Popup
            ref={popupRef}
            position={[selected.lat, selected.lon]}
            eventHandlers={{ remove: () => setSelected(null) }}
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
          </Popup>
        )}

        {userLat && userLon && <LocateButton lat={userLat} lon={userLon} />}
      </MapContainer>
    </div>
  )
}
