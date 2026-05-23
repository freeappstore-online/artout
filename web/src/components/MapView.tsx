import { useCallback, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import type { ArtPost } from '../lib/types'

const DEFAULT_CENTER: [number, number] = [-37.8136, 144.9631]
const DEFAULT_ZOOM = 3

const dotIcon = L.divIcon({
  className: '',
  html: '<div style="width:10px;height:10px;border-radius:50%;background:#ff2d6b;box-shadow:0 0 8px #ff2d6b,0 0 2px rgba(0,0,0,0.6)"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

function clusterIcon(cluster: any) {
  const count = cluster.getChildCount()
  const size = count > 100 ? 48 : count > 10 ? 40 : 32
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:rgba(255,45,107,0.85);
      color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-family:Manrope,sans-serif;
      font-weight:700;font-size:${count > 100 ? 13 : 12}px;
      box-shadow:0 0 12px rgba(255,45,107,0.5),0 2px 8px rgba(0,0,0,0.4);
      border:2px solid rgba(255,255,255,0.2);
    ">${count > 999 ? Math.round(count / 100) / 10 + 'k' : count}</div>`,
    className: '',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  })
}

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
      className="absolute bottom-4 right-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--panel-strong)] shadow-lg"
      title="My location"
    >
      <svg className="h-5 w-5 text-[var(--sky)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
      </svg>
    </button>
  )
}

export function MapView({ posts, userLat, userLon, onPostClick, isFavorite, onToggleFavorite }: MapViewProps) {
  const [selected, setSelected] = useState<ArtPost | null>(null)

  const center = useMemo<[number, number]>(
    () => (userLat && userLon ? [userLat, userLon] : DEFAULT_CENTER),
    [userLat, userLon],
  )

  const zoom = userLat && userLon ? 13 : DEFAULT_ZOOM

  return (
    <div className="relative flex-1" style={{ minHeight: 0 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="absolute inset-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

        <MarkerClusterGroup
          iconCreateFunction={clusterIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          disableClusteringAtZoom={17}
        >
          {posts.map((post) => (
            <Marker
              key={post.id}
              position={[post.lat, post.lon]}
              icon={dotIcon}
              eventHandlers={{ click: () => setSelected(post) }}
            />
          ))}
        </MarkerClusterGroup>

        {selected && (
          <Popup
            position={[selected.lat, selected.lon]}
            eventHandlers={{ remove: () => setSelected(null) }}
          >
            <div
              className="flex cursor-pointer gap-3"
              onClick={() => {
                onPostClick(selected)
                setSelected(null)
              }}
            >
              <img
                src={selected.thumbUrl}
                alt={selected.title || 'Street art'}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[var(--ink)]">
                  {selected.title || 'Untitled'}
                </div>
                <div className="text-xs text-[var(--muted)]">{selected.locationName}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(selected.id)
                  }}
                  className="mt-1 text-xs text-[var(--accent)]"
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
