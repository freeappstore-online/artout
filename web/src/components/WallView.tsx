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
          <p className="text-lg font-semibold">No art yet</p>
          <p className="mt-2 text-sm">Be the first to share some street art!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-4 pb-2 pt-4 text-lg font-bold">Nearby Art</div>
      <div className="grid grid-cols-3 gap-0.5 px-0.5">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onPostClick(post)}
            className="relative aspect-square overflow-hidden"
          >
            <img
              src={post.thumbUrl}
              alt={post.title || 'Street art'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[0.6rem] text-white/80 backdrop-blur-sm">
              {post.locationName}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
