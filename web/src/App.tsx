import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Shell, type Tab } from './components/Shell'
import { MapView } from './components/MapView'
import { WallView } from './components/WallView'
import { AddView } from './components/AddView'
import { FavoritesView } from './components/FavoritesView'
import { ProfileView } from './components/ProfileView'
import { Gallery } from './components/Gallery'
import { TopBar } from './components/TopBar'
import { LocationPickerModal } from './components/LocationPicker'
import { usePosts } from './hooks/usePosts'
import { useFavorites } from './hooks/useFavorites'
import { useGeolocation } from './hooks/useGeolocation'
import { getPostsForPath } from './lib/locations'
import type { ArtPost } from './lib/types'

type Sort = 'nearby' | 'newest' | 'popular'
type Layout = 'grid' | 'feed'

export default function App() {
  const [tab, setTab] = useState<Tab>('map')
  const { posts, loading, addPost } = usePosts()
  const { favorites, toggle: toggleFavorite, isFavorite, getFavCount } = useFavorites()
  const { position, state: geoState } = useGeolocation()
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [galleryPosts, setGalleryPosts] = useState<ArtPost[]>([])
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [sort, setSort] = useState<Sort>('newest')
  const [layout, setLayout] = useState<Layout>('grid')
  const [sortAutoSwitched, setSortAutoSwitched] = useState(false)

  const hasLocation = position != null

  // Auto-switch to nearby when GPS arrives
  useEffect(() => {
    if (hasLocation && !sortAutoSwitched) {
      setSort('nearby')
      setSortAutoSwitched(true)
    }
  }, [hasLocation, sortAutoSwitched])

  // Stable posts ref for map — only update map markers when posts stop changing
  // (prevents blinking during progressive load)
  const [stablePosts, setStablePosts] = useState<ArtPost[]>([])
  const stabilizeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    clearTimeout(stabilizeTimer.current)
    stabilizeTimer.current = setTimeout(() => setStablePosts(posts), 500)
    // Show first batch immediately
    if (stablePosts.length === 0 && posts.length > 0) setStablePosts(posts)
    return () => clearTimeout(stabilizeTimer.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (!locationFilter) return stablePosts
    return getPostsForPath(stablePosts, locationFilter)
  }, [stablePosts, locationFilter])

  const filteredWallPosts = useMemo(() => {
    if (!locationFilter) return posts
    return getPostsForPath(posts, locationFilter)
  }, [posts, locationFilter])

  const openGallery = useCallback(
    (post: ArtPost, context?: ArtPost[]) => {
      const list = context || filteredWallPosts
      const idx = list.findIndex((p) => p.id === post.id)
      setGalleryPosts(list)
      setGalleryIndex(idx >= 0 ? idx : 0)
    },
    [filteredWallPosts],
  )

  const handleAddDone = useCallback(() => setTab('map'), [])

  const showMap = tab === 'map'
  const showWall = tab === 'wall'
  const showFavs = tab === 'favs'

  const topBar = (showMap || showWall || showFavs) ? (
    <TopBar
      locationPath={locationFilter}
      locationCount={filteredWallPosts.length}
      onOpenPicker={() => setPickerOpen(true)}
      sort={sort}
      onSortChange={showMap ? undefined : setSort}
      hasLocation={hasLocation}
      layout={layout}
      onLayoutChange={(showWall || showFavs) ? setLayout : undefined}
      showControls={!showMap}
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
    <Shell activeTab={tab} onTabChange={setTab} topBar={topBar}>
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
          posts={filteredWallPosts}
          userLat={position?.lat}
          userLon={position?.lon}
          sort={sort}
          layout={layout}
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
          layout={layout}
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
