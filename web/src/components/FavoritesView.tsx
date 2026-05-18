import { useAuth } from '../hooks/useAuth'
import type { ArtPost } from '../lib/types'

interface FavoritesViewProps {
  posts: ArtPost[]
  favorites: string[]
  onPostClick: (post: ArtPost) => void
  onToggleFavorite: (id: string) => void
}

export function FavoritesView({ posts, favorites, onPostClick, onToggleFavorite }: FavoritesViewProps) {
  const { user, signIn } = useAuth()
  const favPosts = posts.filter((p) => favorites.includes(p.id))

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-[var(--ink)]">Sign in to see favorites</p>
        <button
          onClick={signIn}
          className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  if (favPosts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-[var(--muted)]">
        <div>
          <p className="text-lg font-semibold">No favorites yet</p>
          <p className="mt-2 text-sm">Tap the heart on any art to save it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-4 pb-2 pt-4 text-lg font-bold">Saved Art</div>
      {favPosts.map((post) => (
        <div key={post.id} className="flex gap-3 border-b border-[var(--line)] px-4 py-3">
          <button onClick={() => onPostClick(post)} className="shrink-0">
            <img
              src={post.thumbUrl}
              alt={post.title || 'Street art'}
              className="h-14 w-14 rounded-lg object-cover"
            />
          </button>
          <button
            onClick={() => onPostClick(post)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="truncate text-sm font-semibold text-[var(--ink)]">
              {post.title || 'Untitled'}
            </div>
            <div className="text-xs text-[var(--muted)]">{post.locationName}</div>
          </button>
          <button
            onClick={() => onToggleFavorite(post.id)}
            className="self-center text-lg text-[var(--error)]"
          >
            &#10084;
          </button>
        </div>
      ))}
    </div>
  )
}
