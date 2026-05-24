import { useCallback, useEffect, useRef, useState } from 'react'
import { fas } from '../lib/fas'
import { thumbUrl, fullUrl } from '../lib/cloudinary'
import type { ArtPost } from '../lib/types'

const PAGE_SIZE = 100
const MAX_PAGES = 30

export function usePosts() {
  const [posts, setPosts] = useState<ArtPost[]>([])
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  const fetchPage = useCallback(async (offset: number) => {
    const result = await fas.collections.collection('posts').query<ArtPost>({
      orderBy: 'created_at',
      order: 'desc',
      limit: PAGE_SIZE,
      offset,
    })
    return result.documents
  }, [])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    // Load first page fast, show the app, then background-load the rest
    fetchPage(0).then((first) => {
      setPosts(first)
      setLoading(false)

      if (first.length < PAGE_SIZE) return // all posts fit in one page

      // Fetch remaining pages in background
      const loadRemaining = async () => {
        const allPosts = [...first]
        for (let page = 1; page < MAX_PAGES; page++) {
          const docs = await fetchPage(page * PAGE_SIZE)
          allPosts.push(...docs)
          setPosts([...allPosts]) // update progressively
          if (docs.length < PAGE_SIZE) break
        }
      }
      loadRemaining()
    }).catch(() => setLoading(false))
  }, [fetchPage])

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

  const deletePost = useCallback(async (id: string) => {
    await fas.collections.collection('posts').delete(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { posts, loading, addPost, deletePost }
}
