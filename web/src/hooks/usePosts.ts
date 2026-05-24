import { useCallback, useEffect, useRef, useState } from 'react'
import { fas } from '../lib/fas'
import { thumbUrl, fullUrl } from '../lib/cloudinary'
import type { ArtPost } from '../lib/types'

const PAGE_SIZE = 100

async function fetchPage(offset: number): Promise<ArtPost[]> {
  const result = await fas.collections.collection('posts').query<ArtPost>({
    orderBy: 'created_at',
    order: 'desc',
    limit: PAGE_SIZE,
    offset,
  })
  return result.documents
}

export function usePosts() {
  const [posts, setPosts] = useState<ArtPost[]>([])
  const [loading, setLoading] = useState(true)
  const [allLoaded, setAllLoaded] = useState(false)
  const fetchedRef = useRef(false)
  const loadingMoreRef = useRef(false)

  // Load first page only on init
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchPage(0).then((first) => {
      setPosts(first)
      setLoading(false)
      if (first.length < PAGE_SIZE) setAllLoaded(true)
    }).catch(() => setLoading(false))
  }, [])

  // Load next page — called by infinite scroll or map
  const loadMore = useCallback(async () => {
    if (allLoaded || loadingMoreRef.current) return
    loadingMoreRef.current = true
    const docs = await fetchPage(posts.length)
    if (docs.length > 0) {
      setPosts((prev) => [...prev, ...docs])
    }
    if (docs.length < PAGE_SIZE) setAllLoaded(true)
    loadingMoreRef.current = false
  }, [posts.length, allLoaded])

  // Load ALL remaining posts (for map clustering)
  const loadAll = useCallback(async () => {
    if (allLoaded || loadingMoreRef.current) return
    loadingMoreRef.current = true
    let offset = posts.length
    const all = [...posts]
    while (true) {
      const docs = await fetchPage(offset)
      all.push(...docs)
      offset += docs.length
      if (docs.length < PAGE_SIZE) break
    }
    setPosts(all)
    setAllLoaded(true)
    loadingMoreRef.current = false
  }, [posts, allLoaded])

  const addPost = useCallback(
    async (post: Omit<ArtPost, 'id' | 'thumbUrl' | 'imageUrl'> & { imageId: string }) => {
      const doc = await fas.collections.collection('posts').create({
        ...post,
        imageUrl: fullUrl(post.imageId),
        thumbUrl: thumbUrl(post.imageId),
      })
      setPosts((prev) => [doc as ArtPost, ...prev])
      return doc as ArtPost
    },
    [],
  )

  return { posts, loading, allLoaded, loadMore, loadAll, addPost }
}
