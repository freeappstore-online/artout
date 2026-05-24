import { useCallback, useEffect, useState } from 'react'
import { fas } from '../lib/fas'

export function useTrash() {
  const [trashed, setTrashed] = useState<string[]>([])
  const [user, setUser] = useState(fas.auth.user)

  useEffect(() => fas.auth.onChange(setUser), [])

  useEffect(() => {
    if (!user) { setTrashed([]); return }
    fas.kv.get<string[]>('trashed').then((val) => {
      if (val) setTrashed(val)
    })
  }, [user])

  const trash = useCallback(async (postId: string) => {
    if (!fas.auth.user) return
    if (trashed.includes(postId)) return

    setTrashed((prev) => {
      const next = [...prev, postId]
      fas.kv.set('trashed', next)
      return next
    })

    // Increment public trash counter (for admin visibility)
    fas.counters.increment(`trash:${postId}`, 1).catch(() => {})
  }, [trashed])

  const isTrashed = useCallback(
    (postId: string) => trashed.includes(postId),
    [trashed],
  )

  return { trashed, trash, isTrashed }
}
