import { useEffect, useMemo, useState } from 'react'
import { haversineDistance } from '../lib/geo'
import type { ArtPost } from '../lib/types'

interface WallViewProps {
  posts: ArtPost[]
  userLat?: number
  userLon?: number
  onPostClick: (post: ArtPost) => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
  filtered?: boolean
  onClearFilter?: () => void
}

type Sort = 'nearby' | 'newest'
type Layout = 'grid' | 'feed'

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  if (meters < 10000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.round(meters / 1000)}km`
}

export function WallView({ posts, userLat, userLon, onPostClick, isFavorite, onToggleFavorite, filtered, onClearFilter }: WallViewProps) {
  const hasLocation = userLat != null && userLon != null
  const [sort, setSort] = useState<Sort>('newest')
  const [layout, setLayout] = useState<Layout>('grid')
  const [autoSwitched, setAutoSwitched] = useState(false)

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
          <p className="display-font text-2xl text-[var(--ink)]">
            {filtered ? 'No art in this area' : 'Nothing here yet'}
          </p>
          <p className="mt-2 text-sm">
            {filtered ? 'Zoom out on the map or clear the filter.' : 'Be the first to drop some art.'}
          </p>
          {filtered && onClearFilter && (
            <button onClick={onClearFilter} className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-black">
              Show all art
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-2 px-3 py-2">
        {filtered && onClearFilter && (
          <button
            onClick={onClearFilter}
            className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
          >
            Map area ({posts.length})
            <span className="ml-0.5 text-[0.6rem]">&times;</span>
          </button>
        )}
        {hasLocation && (
          <button
            onClick={() => setSort('nearby')}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              sort === 'nearby' ? 'bg-[var(--accent)] text-black' : 'bg-[var(--glass)] text-[var(--muted)]'
            }`}
          >Nearby</button>
        )}
        <button
          onClick={() => setSort('newest')}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            sort === 'newest' ? 'bg-[var(--accent)] text-black' : 'bg-[var(--glass)] text-[var(--muted)]'
          }`}
        >Newest</button>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setLayout('grid')}
            className={`rounded-lg p-1.5 ${layout === 'grid' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setLayout('feed')}
            className={`rounded-lg p-1.5 ${layout === 'feed' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="8" rx="1" />
              <rect x="3" y="14" width="18" height="8" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {layout === 'grid' ? (
        <div className="grid grid-cols-3 gap-px bg-[var(--line)]">
          {sorted.map((post) => (
            <div key={post.id} className="relative aspect-square overflow-hidden bg-[var(--paper)]">
              <img
                src={post.thumbUrl}
                alt={post.title || 'Street art'}
                className="h-full w-full cursor-pointer object-cover"
                loading="lazy"
                onClick={() => onPostClick(post)}
              />
              <button
                onClick={() => onToggleFavorite(post.id)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-sm backdrop-blur-sm"
              >
                {isFavorite(post.id) ? '❤️' : '🤍'}
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
                <span className="text-[0.6rem] font-medium text-white/90">{post.locationName}</span>
                {post.dist != null && (
                  <span className="ml-1 text-[0.55rem] text-white/50">{formatDistance(post.dist)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 px-3 pb-4">
          {sorted.map((post) => (
            <div key={post.id} className="relative overflow-hidden rounded-xl bg-[var(--paper)]">
              <img
                src={post.imageUrl}
                alt={post.title || 'Street art'}
                className="w-full cursor-pointer object-cover"
                loading="lazy"
                style={{ maxHeight: 500 }}
                onClick={() => onPostClick(post)}
              />
              <button
                onClick={() => onToggleFavorite(post.id)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg backdrop-blur-sm"
              >
                {isFavorite(post.id) ? '❤️' : '🤍'}
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-sm font-medium text-white">{post.locationName}</span>
                    {post.dist != null && (
                      <span className="ml-2 text-xs text-white/50">{formatDistance(post.dist)}</span>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${post.lat},${post.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto shrink-0 text-xs font-medium text-[var(--sky)]"
                  >
                    Navigate →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
