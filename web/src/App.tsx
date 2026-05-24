import { useCallback, useMemo, useState } from 'react'
import { Shell, type Tab } from './components/Shell'
import { MapView } from './components/MapView'
import { WallView } from './components/WallView'
import { AddView } from './components/AddView'
import { FavoritesView } from './components/FavoritesView'
import { ProfileView } from './components/ProfileView'
import { Gallery } from './components/Gallery'
import { LocationPill, LocationPickerModal } from './components/LocationPicker'
import { usePosts } from './hooks/usePosts'
import { useFavorites } from './hooks/useFavorites'
import { useGeolocation } from './hooks/useGeolocation'
import { getPostsForPath } from './lib/locations'
import type { ArtPost } from './lib/types'

export default function App() {
  const [tab, setTab] = useState<Tab>('map')
  const { posts, loading, addPost } = usePosts()
  const { favorites, toggle: toggleFavorite, isFavorite, getFavCount } = useFavorites()
  const { position, state: geoState } = useGeolocation()
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [galleryPosts, setGalleryPosts] = useState<ArtPost[]>([])
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const filteredPosts = useMemo(() => {
    if (!locationFilter) return posts
    return getPostsForPath(posts, locationFilter)
  }, [posts, locationFilter])

  const openGallery = useCallback(
    (post: ArtPost, context?: ArtPost[]) => {
      const list = context || filteredPosts
      const idx = list.findIndex((p) => p.id === post.id)
      setGalleryPosts(list)
      setGalleryIndex(idx >= 0 ? idx : 0)
    },
    [filteredPosts],
  )

  const handleAddDone = useCallback(() => setTab('map'), [])

  const showMap = tab === 'map'
  const showWall = tab === 'wall'

  const header = (showMap || showWall) ? (
    <LocationPill
      currentPath={locationFilter}
      count={filteredPosts.length}
      onOpen={() => setPickerOpen(true)}
    />
  ) : null

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
    <Shell activeTab={tab} onTabChange={setTab} header={header}>
      {/* Map stays mounted to prevent re-init blink */}
      <div className={showMap ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
        <MapView
          posts={filteredPosts}
          userLat={position?.lat}
          userLon={position?.lon}
          locationFilter={locationFilter}
          onPostClick={openGallery}
          onShowWall={() => setTab('wall')}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </div>
      {tab === 'wall' && (
        <WallView
          posts={filteredPosts}
          userLat={position?.lat}
          userLon={position?.lon}
          onPostClick={openGallery}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          getFavCount={getFavCount}
        />
      )}
      {tab === 'add' && (
        <AddView
          userLat={position?.lat}
          userLon={position?.lon}
          geoState={geoState}
          onSubmit={addPost}
          onDone={handleAddDone}
        />
      )}
      {tab === 'favs' && (
        <FavoritesView
          posts={posts}
          favorites={favorites}
          onPostClick={openGallery}
          onToggleFavorite={toggleFavorite}
        />
      )}
      {tab === 'profile' && <ProfileView />}

      {galleryIndex !== null && (
        <Gallery
          posts={galleryPosts}
          index={galleryIndex}
          onClose={() => setGalleryIndex(null)}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          getFavCount={getFavCount}
        />
      )}

      {pickerOpen && (
        <LocationPickerModal
          posts={posts}
          currentPath={locationFilter}
          onSelect={setLocationFilter}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </Shell>
  )
}
