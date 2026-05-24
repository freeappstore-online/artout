import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Shell, type Tab } from './components/Shell'
import { MapView } from './components/MapView'
import { WallView } from './components/WallView'
import { AddView } from './components/AddView'
import { FavoritesView } from './components/FavoritesView'
import { ProfileView } from './components/ProfileView'
import { Gallery } from './components/Gallery'
import { MapTopBar, WallTopBar, FavsTopBar } from './components/TopBar'
import { LocationPickerModal } from './components/LocationPicker'
import { usePosts } from './hooks/usePosts'
import { useFavorites } from './hooks/useFavorites'
import { useGeolocation } from './hooks/useGeolocation'
import { getPostsForPath } from './lib/locations'
import type { ArtPost } from './lib/types'

type Sort = 'newest' | 'nearby' | 'popular'
type Layout = 'grid' | 'feed'

export default function App() {
  const [tab, setTab] = useState<Tab>('map')
  const { posts, loading, allLoaded, loadMore, loadAll, addPost } = usePosts()
  const { favorites, toggle: toggleFavorite, isFavorite, getFavCount } = useFavorites()
  const { position, state: geoState } = useGeolocation()
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [galleryPosts, setGalleryPosts] = useState<ArtPost[]>([])

  // Separate location filters
  const [mapLocation, setMapLocation] = useState<string | null>(null)
  const [wallLocation, setWallLocation] = useState<string | null>(null)
  const [pickerFor, setPickerFor] = useState<'map' | 'wall' | null>(null)

  // Wall controls
  const [sort, setSort] = useState<Sort>('newest')
  const [layout, setLayout] = useState<Layout>('grid')

  const hasGPS = position != null

  // Stable posts for map (debounced to prevent marker blinking)
  const [stablePosts, setStablePosts] = useState<ArtPost[]>([])
  const stabilizeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    clearTimeout(stabilizeTimer.current)
    stabilizeTimer.current = setTimeout(() => setStablePosts(posts), 500)
    if (stablePosts.length === 0 && posts.length > 0) setStablePosts(posts)
    return () => clearTimeout(stabilizeTimer.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts])

  // Map needs all posts for clustering
  useEffect(() => {
    if (tab === 'map' && !allLoaded) loadAll()
  }, [tab, allLoaded, loadAll])

  // Filtered posts per view
  const mapPosts = useMemo(() => {
    if (!mapLocation) return stablePosts
    return getPostsForPath(stablePosts, mapLocation)
  }, [stablePosts, mapLocation])

  const wallPosts = useMemo(() => {
    if (!wallLocation) return posts
    return getPostsForPath(posts, wallLocation)
  }, [posts, wallLocation])

  const openGallery = useCallback(
    (post: ArtPost, context?: ArtPost[]) => {
      const list = context || wallPosts
      const idx = list.findIndex((p) => p.id === post.id)
      setGalleryPosts(list)
      setGalleryIndex(idx >= 0 ? idx : 0)
    },
    [wallPosts],
  )

  const handleAddDone = useCallback(() => setTab('map'), [])

  const handleLocationTap = useCallback((path: string) => {
    setWallLocation(path)
    setTab('wall')
  }, [])

  const handlePickerSelect = useCallback((path: string | null) => {
    if (pickerFor === 'map') setMapLocation(path)
    else if (pickerFor === 'wall') setWallLocation(path)
    setPickerFor(null)
  }, [pickerFor])

  // Top bars per tab
  let topBar = null
  if (tab === 'map') {
    topBar = (
      <MapTopBar
        path={mapLocation}
        posts={posts}
        onNavigate={setMapLocation}
        onSearch={() => setPickerFor('map')}
      />
    )
  } else if (tab === 'wall') {
    topBar = (
      <WallTopBar
        path={wallLocation}
        posts={posts}
        onNavigate={setWallLocation}
        onSearch={() => setPickerFor('wall')}
        sort={sort}
        onSortChange={setSort}
        hasGPS={hasGPS}
        layout={layout}
        onLayoutChange={setLayout}
      />
    )
  } else if (tab === 'favs') {
    topBar = (
      <FavsTopBar layout={layout} onLayoutChange={setLayout} />
    )
  }

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
      <div className={tab === 'map' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
        <MapView
          posts={mapPosts}
          userLat={position?.lat}
          userLon={position?.lon}
          locationFilter={mapLocation}
          onPostClick={openGallery}
          onShowWall={() => setTab('wall')}
          onLocationChange={setMapLocation}
          onLocationTap={handleLocationTap}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </div>
      {tab === 'wall' && (
        <WallView
          posts={wallPosts}
          userLat={position?.lat}
          userLon={position?.lon}
          sort={sort}
          layout={layout}
          onPostClick={openGallery}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          getFavCount={getFavCount}
          onLocationTap={handleLocationTap}
          allLoaded={allLoaded}
          onLoadMore={loadMore}
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
          onLocationTap={handleLocationTap}
        />
      )}

      {pickerFor && (
        <LocationPickerModal
          posts={posts}
          currentPath={pickerFor === 'map' ? mapLocation : wallLocation}
          onSelect={handlePickerSelect}
          onClose={() => setPickerFor(null)}
        />
      )}
    </Shell>
  )
}
