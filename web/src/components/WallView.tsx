import { useEffect, useMemo, useRef } from 'react'
import { haversineDistance } from '../lib/geo'
import type { ArtPost } from '../lib/types'

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

type Sort = 'nearby' | 'newest' | 'popular'
type Layout = 'grid' | 'feed'

interface WallViewProps {
  posts: ArtPost[]
  userLat?: number
  userLon?: number
  sort: Sort
  layout: Layout
  onPostClick: (post: ArtPost) => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
  getFavCount: (id: string) => number
  allLoaded?: boolean
  onLoadMore?: () => void
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  if (meters < 10000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.round(meters / 1000)}km`
}

export function WallView({ posts, userLat, userLon, sort, layout, onPostClick, isFavorite, onToggleFavorite, getFavCount, allLoaded, onLoadMore }: WallViewProps) {
  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (allLoaded || !onLoadMore || !sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore() },
      { rootMargin: '400px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [allLoaded, onLoadMore])
  const hasLocation = userLat != null && userLon != null

  const sorted = useMemo(() => {
    const withDist = posts.map((p) => ({
      ...p,
      dist: hasLocation ? haversineDistance(userLat!, userLon!, p.lat, p.lon) : undefined,
    }))
    if (sort === 'nearby' && hasLocation) {
      return withDist.sort((a, b) => a.dist! - b.dist!)
    }
    if (sort === 'popular') {
      return withDist.sort((a, b) => getFavCount(b.id) - getFavCount(a.id))
    }
    return withDist
  }, [posts, sort, userLat, userLon, hasLocation, getFavCount])

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
                className="absolute right-1 top-1 flex items-center gap-0.5 rounded-full bg-black/40 px-1.5 py-0.5 text-xs backdrop-blur-sm"
              >
                {isFavorite(post.id) ? '❤️' : '🤍'}
                {getFavCount(post.id) > 0 && <span className="text-white/80">{getFavCount(post.id)}</span>}
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
                <span className="text-[0.6rem] font-medium text-white/90">{post.locationName}</span>
                {post.dist != null && (
                  <span className="ml-1 text-[0.55rem] text-white/50">{formatDistance(post.dist)}</span>
                )}
                {post.created_at && (
                  <span className="ml-1 text-[0.5rem] text-white/40">{formatDate(post.created_at)}</span>
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
                className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1.5 text-base backdrop-blur-sm"
              >
                {isFavorite(post.id) ? '❤️' : '🤍'}
                {getFavCount(post.id) > 0 && <span className="text-sm text-white/80">{getFavCount(post.id)}</span>}
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-sm font-medium text-white">{post.locationName}</span>
                    {post.dist != null && (
                      <span className="ml-2 text-xs text-white/50">{formatDistance(post.dist)}</span>
                    )}
                    {post.created_at && (
                      <span className="ml-2 text-xs text-white/40">{formatDate(post.created_at)}</span>
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
      {!allLoaded && onLoadMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          <span className="animate-pulse text-xs text-[var(--muted)]">Loading more...</span>
        </div>
      )}
    </div>
  )
}
