import { useCallback, useEffect, useState } from 'react'
import { fas } from '../lib/fas'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (!fas.auth.user) return
    fas.kv.get<string[]>('favorites').then((val) => {
      if (val) setFavorites(val)
    })
  }, [])

  const toggle = useCallback(async (postId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
      fas.kv.set('favorites', next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (postId: string) => favorites.includes(postId),
    [favorites],
  )

  return { favorites, toggle, isFavorite }
}
