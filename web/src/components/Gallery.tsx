import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { ArtPost } from '../lib/types'

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

interface GalleryProps {
  posts: ArtPost[]
  index: number
  onClose: () => void
  isFavorite: (id: string) => boolean
  onToggleFavorite: (id: string) => void
  getFavCount: (id: string) => number
}

export function Gallery({ posts, index, onClose, isFavorite, onToggleFavorite, getFavCount }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(index)
  const current = posts[currentIndex]

  return (
    <>
      <Lightbox
        open
        close={onClose}
        index={index}
        on={{ view: ({ index: i }) => setCurrentIndex(i) }}
        slides={posts.map((p) => ({
          src: p.imageUrl,
          alt: p.title || 'Street art',
        }))}
      />
      {current && (
        <div className="fixed inset-x-0 bottom-0 z-[10000] flex items-center gap-3 bg-black/80 px-4 py-3 backdrop-blur">
          <button
            onClick={() => onToggleFavorite(current.id)}
            className="flex shrink-0 items-center gap-1.5 text-xl"
          >
            {isFavorite(current.id) ? '❤️' : '🤍'}
            {getFavCount(current.id) > 0 && (
              <span className="text-sm font-semibold text-white/80">{getFavCount(current.id)}</span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-white/90">{current.locationPath || current.locationName}</div>
            {current.created_at && <div className="text-[0.6rem] text-white/40">{formatDate(current.created_at)}</div>}
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${current.lat},${current.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-[var(--sky)] px-4 py-1.5 text-xs font-semibold text-black"
          >
            Navigate →
          </a>
        </div>
      )}
    </>
  )
}
