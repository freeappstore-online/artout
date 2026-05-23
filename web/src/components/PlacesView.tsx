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

/** Rebuild the breadcrumb chain from root to a target node by matching the path segments. */
function buildBreadcrumbTo(tree: LocationNode[], target: LocationNode): LocationNode[] {
  const parts = target.path.split(' > ')
  const chain: LocationNode[] = []
  let siblings = tree
  for (const part of parts) {
    const node = siblings.find((n) => n.name === part)
    if (!node) break
    chain.push(node)
    siblings = node.children
  }
  return chain
}

export function PlacesView({ posts, onPostClick }: PlacesViewProps) {
  const [breadcrumb, setBreadcrumb] = useState<LocationNode[]>([])
  const [search, setSearch] = useState('')

  const tree = useMemo(() => buildLocationTree(posts), [posts])

  const currentNode = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : null
  const childNodes = currentNode ? currentNode.children : tree

  const searchResults = useMemo(
    () => (search.length >= 2 ? filterNodes(tree, search) : null),
    [tree, search],
  )

  // Posts at this exact level (not descendants)
  const postsHere = useMemo(() => {
    if (!currentNode) return []
    return posts.filter((p) => p.locationPath === currentNode.path)
  }, [posts, currentNode])

  // All posts under this level (including descendants) — for when there are no child nodes
  const allPostsHere = useMemo(() => {
    if (!currentNode) return []
    return getPostsForPath(posts, currentNode.path)
  }, [posts, currentNode])

  const drillDown = useCallback((node: LocationNode) => {
    setSearch('')
    setBreadcrumb((prev) => [...prev, node])
  }, [])

  const drillDownFromSearch = useCallback((node: LocationNode) => {
    setSearch('')
    setBreadcrumb(buildBreadcrumbTo(tree, node))
  }, [tree])

  const goBack = useCallback((index: number) => {
    setBreadcrumb((prev) => prev.slice(0, index + 1))
  }, [])

  const goRoot = useCallback(() => {
    setBreadcrumb([])
  }, [])

  const displayNodes = searchResults || childNodes
  const hasChildren = childNodes.length > 0
  const showPhotos = currentNode && (postsHere.length > 0 || !hasChildren)
  const photosToShow = hasChildren ? postsHere : allPostsHere

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
        {currentNode && (
          <span className="ml-2 text-sm text-[var(--muted)]">
            {currentNode.count} artwork{currentNode.count !== 1 ? 's' : ''}
          </span>
        )}
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
        <div className="flex flex-wrap items-center gap-1 border-b border-[var(--line)] px-4 py-2 text-xs">
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

      {/* Show all photos button when at a branch with many descendants */}
      {currentNode && hasChildren && allPostsHere.length > postsHere.length && (
        <button
          onClick={() => onPostClick(allPostsHere[0])}
          className="flex w-full items-center gap-2 border-b border-[var(--line)] px-4 py-2.5 text-xs text-[var(--accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          View all {allPostsHere.length} artworks in {currentNode.name}
        </button>
      )}

      {/* Child location nodes */}
      {displayNodes.map((node) => (
        <button
          key={node.path}
          onClick={() => searchResults ? drillDownFromSearch(node) : drillDown(node)}
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

      {/* Photos at this level */}
      {showPhotos && photosToShow.length > 0 && (
        <div className="grid grid-cols-3 gap-px bg-[var(--line)]">
          {photosToShow.map((post) => (
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

      {currentNode && !hasChildren && allPostsHere.length === 0 && (
        <div className="p-8 text-center text-sm text-[var(--muted)]">No art at this location yet.</div>
      )}
    </div>
  )
}
