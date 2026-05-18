import { useCallback, useEffect, useRef, useState } from 'react'
import { fas } from '../lib/fas'
import { thumbUrl, fullUrl } from '../lib/cloudinary'
import type { ArtPost } from '../lib/types'

const PAGE_SIZE = 100
const MAX_PAGES = 5

export function usePosts() {
  const [posts, setPosts] = useState<ArtPost[]>([])
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  const fetchAllPosts = useCallback(async () => {
    setLoading(true)
    const allPosts: ArtPost[] = []
    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await fas.db.collection('posts').query<ArtPost>({
        orderBy: 'created_at',
        order: 'desc',
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })
      allPosts.push(...result.documents)
      if (result.documents.length < PAGE_SIZE) break
    }
    setPosts(allPosts)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchAllPosts()
    }
  }, [fetchAllPosts])

  const addPost = useCallback(
    async (post: Omit<ArtPost, 'id' | 'thumbUrl' | 'imageUrl'> & { imageId: string }) => {
      const doc = await fas.db.collection('posts').create({
        ...post,
        imageUrl: fullUrl(post.imageId),
        thumbUrl: thumbUrl(post.imageId),
      })
      setPosts((prev) => [doc as ArtPost, ...prev])
      return doc as ArtPost
    },
    [],
  )

  const deletePost = useCallback(async (id: string) => {
    await fas.db.collection('posts').delete(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { posts, loading, addPost, deletePost, refresh: fetchAllPosts }
}
