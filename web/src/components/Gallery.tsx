import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { ArtPost } from '../lib/types'

interface GalleryProps {
  posts: ArtPost[]
  index: number
  onClose: () => void
}

export function Gallery({ posts, index, onClose }: GalleryProps) {
  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={posts.map((p) => ({
        src: p.imageUrl,
        alt: p.title || 'Street art',
        title: p.title,
        description: p.locationName,
      }))}
    />
  )
}
