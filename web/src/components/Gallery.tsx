import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { LocationTags } from './LocationTags'
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
  onTrash: (id: string) => void
  onLocationTap: (path: string) => void
}

export function Gallery({ posts, index, onClose, isFavorite, onToggleFavorite, getFavCount, onTrash, onLocationTap }: GalleryProps) {
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
        <div className="fixed inset-x-0 bottom-0 z-[10000] space-y-2 bg-black/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <LocationTags locationPath={current.locationPath} onTagClick={(p) => { onLocationTap(p); onClose() }} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleFavorite(current.id)}
              className="flex items-center gap-1 text-lg"
            >
              {isFavorite(current.id) ? '❤️' : '🤍'}
              {getFavCount(current.id) > 0 && (
                <span className="text-xs font-semibold text-white/70">{getFavCount(current.id)}</span>
              )}
            </button>
            <button onClick={() => onTrash(current.id)} className="text-base text-white/40">🗑</button>
            {current.created_at && <span className="text-[0.6rem] text-white/40">{formatDate(current.created_at)}</span>}
            <div className="flex-1" />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${current.lat},${current.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[var(--sky)] px-3 py-1 text-xs font-semibold text-black"
            >
              Navigate →
            </a>
          </div>
        </div>
      )}
    </>
  )
}
