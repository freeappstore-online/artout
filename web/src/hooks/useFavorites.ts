import { useCallback, useEffect, useState } from 'react'
import { fas } from '../lib/fas'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [user, setUser] = useState(fas.auth.user)

  useEffect(() => fas.auth.onChange(setUser), [])

  // Load per-user favorites
  useEffect(() => {
    if (!user) { setFavorites([]); return }
    fas.kv.get<string[]>('favorites').then((val) => {
      if (val) setFavorites(val)
    })
  }, [user])

  // Load public fav counts
  useEffect(() => {
    fas.counters.list({ prefix: 'fav:' }).then(setCounts).catch(() => {})
  }, [])

  const toggle = useCallback(async (postId: string) => {
    if (!fas.auth.user) return
    const wasFav = favorites.includes(postId)

    setFavorites((prev) => {
      const next = wasFav ? prev.filter((id) => id !== postId) : [...prev, postId]
      fas.kv.set('favorites', next)
      return next
    })

    // Update counter optimistically
    setCounts((prev) => ({
      ...prev,
      [`fav:${postId}`]: Math.max(0, (prev[`fav:${postId}`] || 0) + (wasFav ? -1 : 1)),
    }))

    // Fire-and-forget the actual counter update
    fas.counters.increment(`fav:${postId}`, wasFav ? -1 : 1).catch(() => {})
  }, [favorites])

  const isFavorite = useCallback(
    (postId: string) => favorites.includes(postId),
    [favorites],
  )

  const getFavCount = useCallback(
    (postId: string) => counts[`fav:${postId}`] || 0,
    [counts],
  )

  return { favorites, toggle, isFavorite, getFavCount }
}
