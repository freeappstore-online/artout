import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { ArtPost } from '../lib/types'

interface GalleryProps {
  posts: ArtPost[]
  index: number
  onClose: () => void
}

export function Gallery({ posts, index, onClose }: GalleryProps) {
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
        <div className="fixed inset-x-0 bottom-0 z-[10000] flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-white/90">{current.locationPath || current.locationName}</div>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${current.lat},${current.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 shrink-0 rounded-full bg-[var(--sky)] px-4 py-1.5 text-xs font-semibold text-black"
          >
            Navigate →
          </a>
        </div>
      )}
    </>
  )
}
