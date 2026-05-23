import type { ArtPost } from '../lib/types'

interface WallViewProps {
  posts: ArtPost[]
  onPostClick: (post: ArtPost) => void
}

export function WallView({ posts, onPostClick }: WallViewProps) {
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
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="grid grid-cols-3 gap-px bg-[var(--line)]">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onPostClick(post)}
            className="relative aspect-square overflow-hidden bg-[var(--paper)]"
          >
            <img
              src={post.thumbUrl}
              alt={post.title || 'Street art'}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
              <span className="text-[0.6rem] font-medium text-white/90">
                {post.locationName}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
