import { useCallback, useState } from 'react'
import { Shell, type Tab } from './components/Shell'
import { MapView } from './components/MapView'
import { WallView } from './components/WallView'
import { AddView } from './components/AddView'
import { PlacesView } from './components/PlacesView'
import { FavoritesView } from './components/FavoritesView'
import { Gallery } from './components/Gallery'
import { usePosts } from './hooks/usePosts'
import { useFavorites } from './hooks/useFavorites'
import { useGeolocation } from './hooks/useGeolocation'
import type { ArtPost } from './lib/types'

export default function App() {
  const [tab, setTab] = useState<Tab>('map')
  const { posts, loading, addPost } = usePosts()
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites()
  const { position } = useGeolocation()
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [galleryPosts, setGalleryPosts] = useState<ArtPost[]>([])

  const openGallery = useCallback(
    (post: ArtPost, context?: ArtPost[]) => {
      const list = context || posts
      const idx = list.findIndex((p) => p.id === post.id)
      setGalleryPosts(list)
      setGalleryIndex(idx >= 0 ? idx : 0)
    },
    [posts],
  )

  const handleAddDone = useCallback(() => setTab('map'), [])

  if (loading) {
    return (
      <Shell activeTab={tab} onTabChange={setTab}>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-[var(--muted)]">Loading...</div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell activeTab={tab} onTabChange={setTab}>
      {tab === 'map' && (
        <MapView
          posts={posts}
          userLat={position?.lat}
          userLon={position?.lon}
          onPostClick={openGallery}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}
      {tab === 'wall' && (
        <WallView posts={posts} userLat={position?.lat} userLon={position?.lon} onPostClick={openGallery} />
      )}
      {tab === 'add' && (
        <AddView
          userLat={position?.lat}
          userLon={position?.lon}
          onSubmit={addPost}
          onDone={handleAddDone}
        />
      )}
      {tab === 'places' && (
        <PlacesView posts={posts} onPostClick={openGallery} />
      )}
      {tab === 'favs' && (
        <FavoritesView
          posts={posts}
          favorites={favorites}
          onPostClick={openGallery}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {galleryIndex !== null && (
        <Gallery
          posts={galleryPosts}
          index={galleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
      )}
    </Shell>
  )
}
