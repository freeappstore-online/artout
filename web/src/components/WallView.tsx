import { useEffect, useMemo, useState } from 'react'
import { haversineDistance } from '../lib/geo'
import type { ArtPost } from '../lib/types'

interface WallViewProps {
  posts: ArtPost[]
  userLat?: number
  userLon?: number
  onPostClick: (post: ArtPost) => void
}

type Sort = 'nearby' | 'newest'

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  if (meters < 10000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.round(meters / 1000)}km`
}

export function WallView({ posts, userLat, userLon, onPostClick }: WallViewProps) {
  const hasLocation = userLat != null && userLon != null
  const [sort, setSort] = useState<Sort>('newest')
  const [autoSwitched, setAutoSwitched] = useState(false)

  // Auto-switch to 'nearby' when GPS first arrives
  useEffect(() => {
    if (hasLocation && !autoSwitched) {
      setSort('nearby')
      setAutoSwitched(true)
    }
  }, [hasLocation, autoSwitched])

  const sorted = useMemo(() => {
    if (sort === 'nearby' && hasLocation) {
      return [...posts]
        .map((p) => ({ ...p, dist: haversineDistance(userLat, userLon, p.lat, p.lon) }))
        .sort((a, b) => a.dist - b.dist)
    }
    return posts.map((p) => ({
      ...p,
      dist: hasLocation ? haversineDistance(userLat!, userLon!, p.lat, p.lon) : undefined,
    }))
  }, [posts, sort, userLat, userLon, hasLocation])

  if (posts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-[var(--muted)]">
        <div>
          <p className="display-font text-2xl text-[var(--ink)]">Nothing here yet</p>
          <p className="mt-2 text-sm">Be the first to drop some art.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {hasLocation && (
        <div className="flex gap-2 px-3 py-2">
          <button
            onClick={() => setSort('nearby')}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              sort === 'nearby'
                ? 'bg-[var(--accent)] text-black'
                : 'bg-[var(--glass)] text-[var(--muted)]'
            }`}
          >
            Nearby
          </button>
          <button
            onClick={() => setSort('newest')}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              sort === 'newest'
                ? 'bg-[var(--accent)] text-black'
                : 'bg-[var(--glass)] text-[var(--muted)]'
            }`}
          >
            Newest
          </button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-px bg-[var(--line)]">
        {sorted.map((post) => (
          <button
            key={post.id}
            onClick={() => onPostClick(post)}
            className="relative aspect-square overflow-hidden bg-[var(--paper)]"
          >
            <img
              src={post.thumbUrl}
              alt={post.title || 'Street art'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
              <span className="text-[0.6rem] font-medium text-white/90">
                {post.locationName}
              </span>
              {post.dist != null && (
                <span className="ml-1 text-[0.55rem] text-white/50">
                  {formatDistance(post.dist)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
