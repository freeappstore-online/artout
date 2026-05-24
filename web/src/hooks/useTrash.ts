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

    setTrashed((prev) => {
      if (prev.includes(postId)) return prev // already trashed
      const next = [...prev, postId]
      fas.kv.set('trashed', next)
      return next
    })

    fas.counters.increment(`trash:${postId}`, 1).catch(() => {})
  }, [])

  const isTrashed = useCallback(
    (postId: string) => trashed.includes(postId),
    [trashed],
  )

  return { trash, isTrashed }
}
