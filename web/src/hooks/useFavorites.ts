import { useCallback, useEffect, useState } from 'react'
import { fas } from '../lib/fas'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [user, setUser] = useState(fas.auth.user)

  // Track auth changes so we reload favorites after sign-in
  useEffect(() => fas.auth.onChange(setUser), [])

  useEffect(() => {
    if (!user) { setFavorites([]); return }
    fas.kv.get<string[]>('favorites').then((val) => {
      if (val) setFavorites(val)
    })
  }, [user])

  const toggle = useCallback(async (postId: string) => {
    if (!fas.auth.user) return
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
