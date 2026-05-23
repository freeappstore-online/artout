import { useCallback, useMemo, useState } from 'react'
import type { ArtPost, LocationNode } from '../lib/types'
import { buildLocationTree, getPostsForPath } from '../lib/locations'

interface PlacesViewProps {
  posts: ArtPost[]
  onPostClick: (post: ArtPost) => void
}

function filterNodes(nodes: LocationNode[], query: string): LocationNode[] {
  const q = query.toLowerCase()
  const results: LocationNode[] = []
  const walk = (list: LocationNode[]) => {
    for (const n of list) {
      if (n.name.toLowerCase().includes(q)) results.push(n)
      walk(n.children)
    }
  }
  walk(nodes)
  return results
}

export function PlacesView({ posts, onPostClick }: PlacesViewProps) {
  const [breadcrumb, setBreadcrumb] = useState<LocationNode[]>([])
  const [search, setSearch] = useState('')
  const tree = buildLocationTree(posts)
  const currentNodes = breadcrumb.length === 0
    ? tree
    : breadcrumb[breadcrumb.length - 1].children

  const searchResults = useMemo(
    () => (search.length >= 2 ? filterNodes(tree, search) : null),
    [tree, search],
  )

  const drillDown = useCallback((node: LocationNode) => {
    setSearch('')
    setBreadcrumb((prev) => [...prev, node])
  }, [])

  const goBack = useCallback((index: number) => {
    setBreadcrumb((prev) => prev.slice(0, index + 1))
  }, [])

  const goRoot = useCallback(() => {
    setBreadcrumb([])
  }, [])

  const currentPath = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].path : null
  const isLeaf = currentPath && currentNodes.length === 0
  const leafPosts = isLeaf ? getPostsForPath(posts, currentPath) : []

  const displayNodes = searchResults || currentNodes

  if (tree.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-[var(--muted)]">
        <div>
          <p className="display-font text-xl text-[var(--ink)]">No places yet</p>
          <p className="mt-2 text-sm">Upload art to build the location tree.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--line)] px-4 pb-2 pt-4">
        <span className="display-font text-xl text-[var(--ink)]">Places</span>
      </div>

      <div className="px-4 py-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (e.target.value) setBreadcrumb([]) }}
          placeholder="Search places..."
          className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {!searchResults && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 border-b border-[var(--line)] px-4 py-2 text-xs">
          <button onClick={goRoot} className="text-[var(--accent)]">All</button>
          {breadcrumb.map((node, i) => (
            <span key={node.path} className="flex items-center gap-1">
              <span className="text-[var(--muted)]">&gt;</span>
              <button
                onClick={() => goBack(i)}
                className={i === breadcrumb.length - 1 ? 'font-semibold text-[var(--ink)]' : 'text-[var(--accent)]'}
              >
                {node.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {!isLeaf && displayNodes.map((node) => (
        <button
          key={node.path}
          onClick={() => drillDown(node)}
          className="flex w-full items-center justify-between border-b border-[var(--line)] px-4 py-3.5"
        >
          <div className="text-left">
            <div className="text-[0.9rem] font-medium text-[var(--ink)]">{node.name}</div>
            <div className="text-xs text-[var(--muted)]">
              {searchResults && <span className="text-[var(--accent)]">{node.path} · </span>}
              {node.count} artwork{node.count !== 1 ? 's' : ''}
            </div>
          </div>
          <span className="text-[var(--muted)]">&gt;</span>
        </button>
      ))}

      {searchResults && searchResults.length === 0 && (
        <div className="p-8 text-center text-sm text-[var(--muted)]">No places matching "{search}"</div>
      )}

      {isLeaf && leafPosts.length > 0 && (
        <div className="grid grid-cols-3 gap-px bg-[var(--line)]">
          {leafPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => onPostClick(post)}
              className="relative aspect-square overflow-hidden bg-[var(--paper)]"
            >
              <img
                src={post.thumbUrl}
                alt={post.title || 'Street art'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {isLeaf && leafPosts.length === 0 && (
        <div className="p-8 text-center text-sm text-[var(--muted)]">No art at this location yet.</div>
      )}
    </div>
  )
}
