import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
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

function getClusterLabel(cluster: any): string {
  const markers = cluster.getAllChildMarkers()
  const paths: string[][] = []
  for (const m of markers) {
    const lp = m.options?.locationPath as string | undefined
    if (lp) paths.push(lp.split(' > '))
  }
  if (paths.length === 0) return ''
  const first = paths[0]
  let depth = 0
  for (let i = 0; i < first.length; i++) {
    if (paths.every((p) => p[i] === first[i])) depth = i + 1
    else break
  }
  return depth > 0 ? first[depth - 1] : ''
}

function formatCount(n: number): string {
  if (n > 999) return (Math.round(n / 100) / 10) + 'k'
  return String(n)
}

function clusterIcon(cluster: any) {
  const count = cluster.getChildCount()
  const label = getClusterLabel(cluster)
  const hasLabel = label.length > 0

  if (hasLabel) {
    const w = Math.max(48, label.length * 7 + 24)
    return L.divIcon({
      html: `<div style="
        min-width:${w}px;height:28px;padding:0 10px;
        border-radius:14px;
        background:rgba(255,45,107,0.88);
        color:#fff;
        display:flex;align-items:center;justify-content:center;gap:5px;
        font-family:Manrope,sans-serif;
        font-weight:700;font-size:11px;white-space:nowrap;
        box-shadow:0 0 12px rgba(255,45,107,0.4),0 2px 8px rgba(0,0,0,0.4);
        border:1.5px solid rgba(255,255,255,0.15);
      "><span style="opacity:0.7;font-size:10px">${formatCount(count)}</span> ${label}</div>`,
      className: '',
      iconSize: L.point(w, 28),
      iconAnchor: L.point(w / 2, 14),
    })
  }

  const size = count > 100 ? 44 : count > 10 ? 38 : 32
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:rgba(255,45,107,0.85);
      color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-family:Manrope,sans-serif;
      font-weight:700;font-size:12px;
      box-shadow:0 0 12px rgba(255,45,107,0.5),0 2px 8px rgba(0,0,0,0.4);
      border:2px solid rgba(255,255,255,0.2);
    ">${formatCount(count)}</div>`,
    className: '',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  })
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

interface MapViewProps {
  posts: ArtPost[]
  userLat?: number
  userLon?: number
  locationFilter: string | null
  onPostClick: (post: ArtPost) => void
  onBoundsChange: (bounds: MapBounds, visibleCount: number) => void
  onShowWall: () => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
}

function FlyToFilteredPosts({ posts, locationFilter }: { posts: ArtPost[]; locationFilter: string | null }) {
  const map = useMap()
  const prevFilter = useRef(locationFilter)

  useEffect(() => {
    if (locationFilter === prevFilter.current) return
    prevFilter.current = locationFilter

    if (!locationFilter) return // reset to all — don't move
    if (posts.length === 0) return

    const lats = posts.map((p) => p.lat)
    const lons = posts.map((p) => p.lon)
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)],
    )
    map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 16, duration: 0.8 })
  }, [map, posts, locationFilter])

  return null
}

function BoundsTracker({ posts, onBoundsChange }: { posts: ArtPost[]; onBoundsChange: (bounds: MapBounds, count: number) => void }) {
  const update = useCallback((map: L.Map) => {
    const b = map.getBounds()
    const bounds: MapBounds = {
      north: b.getNorth(), south: b.getSouth(),
      east: b.getEast(), west: b.getWest(),
    }
    const count = posts.filter((p) =>
      p.lat >= bounds.south && p.lat <= bounds.north &&
      p.lon >= bounds.west && p.lon <= bounds.east
    ).length
    onBoundsChange(bounds, count)
  }, [posts, onBoundsChange])

  useMapEvents({
    moveend: (e) => update(e.target),
    zoomend: (e) => update(e.target),
    load: (e) => update(e.target),
  })
  return null
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

export function MapView({ posts, userLat, userLon, locationFilter, onPostClick, onBoundsChange, onShowWall, isFavorite, onToggleFavorite }: MapViewProps) {
  const [selected, setSelected] = useState<ArtPost | null>(null)
  const [visibleCount, setVisibleCount] = useState(0)

  const handleBoundsChange = useCallback((bounds: MapBounds, count: number) => {
    setVisibleCount(count)
    onBoundsChange(bounds, count)
  }, [onBoundsChange])

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
        <BoundsTracker posts={posts} onBoundsChange={handleBoundsChange} />
        <FlyToFilteredPosts posts={posts} locationFilter={locationFilter} />

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
              // @ts-expect-error — custom option for cluster label extraction
              locationPath={post.locationPath}
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
                <div className="text-xs text-[var(--muted)]">{selected.locationPath}</div>
                <div className="mt-1.5 flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(selected.id)
                    }}
                    className="text-xs text-[var(--accent)]"
                  >
                    {isFavorite(selected.id) ? '\u2764\ufe0f' : '\u2661'} Fav
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-[var(--sky)]"
                  >
                    Navigate →
                  </a>
                </div>
              </div>
            </div>
          </Popup>
        )}

        {userLat && userLon && <LocateButton lat={userLat} lon={userLon} />}
      </MapContainer>

      {visibleCount > 0 && visibleCount < posts.length && (
        <button
          onClick={onShowWall}
          className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--panel-strong)] px-4 py-2 shadow-lg"
        >
          <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-xs font-semibold text-[var(--ink)]">{visibleCount} in view</span>
        </button>
      )}
    </div>
  )
}
