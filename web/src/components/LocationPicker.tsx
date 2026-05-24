import { useCallback, useMemo, useState } from 'react'
import type { ArtPost, LocationNode } from '../lib/types'
import { buildLocationTree } from '../lib/locations'

interface LocationPickerProps {
  posts: ArtPost[]
  currentPath: string | null
  onSelect: (path: string | null) => void
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

function buildBreadcrumbTo(tree: LocationNode[], path: string): LocationNode[] {
  const parts = path.split(' > ')
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

export function LocationPickerModal({ posts, currentPath, onSelect, onClose }: LocationPickerProps & { onClose: () => void }) {
  const tree = useMemo(() => buildLocationTree(posts), [posts])
  const [breadcrumb, setBreadcrumb] = useState<LocationNode[]>(
    currentPath ? buildBreadcrumbTo(tree, currentPath) : [],
  )
  const [search, setSearch] = useState('')

  const currentNode = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : null
  const childNodes = currentNode ? currentNode.children : tree

  const searchResults = useMemo(
    () => (search.length >= 2 ? filterNodes(tree, search) : null),
    [tree, search],
  )

  const displayNodes = searchResults || childNodes

  const drillDown = useCallback((node: LocationNode) => {
    setSearch('')
    setBreadcrumb((prev) => [...prev, node])
  }, [])

  const drillDownFromSearch = useCallback((node: LocationNode) => {
    setSearch('')
    setBreadcrumb(buildBreadcrumbTo(tree, node.path))
  }, [tree])

  const goBack = useCallback((index: number) => {
    setBreadcrumb((prev) => prev.slice(0, index + 1))
  }, [])

  const goRoot = useCallback(() => {
    setBreadcrumb([])
    setSearch('')
  }, [])

  const selectNode = useCallback((node: LocationNode) => {
    onSelect(node.path)
    onClose()
  }, [onSelect, onClose])

  const selectAll = useCallback(() => {
    onSelect(null)
    onClose()
  }, [onSelect, onClose])

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col" onClick={onClose}>
      <div className="flex-1 bg-black/60" />
      <div
        className="max-h-[75vh] overflow-hidden rounded-t-2xl border-t border-[var(--line-strong)] bg-[var(--paper)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <span className="display-font text-lg text-[var(--ink)]">Places</span>
          <button onClick={onClose} className="text-xl text-[var(--muted)]">&times;</button>
        </div>

        <div className="px-4 pb-2">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setBreadcrumb([]) }}
            placeholder="Search places..."
            className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
            autoFocus
          />
        </div>

        {!searchResults && (
          <div className="flex flex-wrap items-center gap-1 px-4 pb-2 text-xs">
            <button
              onClick={breadcrumb.length > 0 ? goRoot : selectAll}
              className={`rounded-full px-2.5 py-1 font-semibold ${
                !currentNode ? 'bg-[var(--accent)] text-black' : 'text-[var(--accent)]'
              }`}
            >
              All
            </button>
            {breadcrumb.map((node, i) => (
              <span key={node.path} className="flex items-center gap-1">
                <span className="text-[var(--muted)]">›</span>
                <button
                  onClick={() => i === breadcrumb.length - 1 ? selectNode(node) : goBack(i)}
                  className={`rounded-full px-2 py-1 font-semibold ${
                    i === breadcrumb.length - 1 ? 'bg-[var(--accent)] text-black' : 'text-[var(--accent)]'
                  }`}
                >
                  {node.name}
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 140px)' }}>
          {displayNodes.map((node) => (
            <div
              key={node.path}
              className="flex items-center border-b border-[var(--line)] px-4 py-3"
            >
              <button
                onClick={() => selectNode(node)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="text-[0.9rem] font-medium text-[var(--ink)]">{node.name}</div>
                <div className="text-xs text-[var(--muted)]">
                  {searchResults && <span className="text-[var(--accent)]">{node.path} · </span>}
                  {node.count} artwork{node.count !== 1 ? 's' : ''}
                </div>
              </button>
              {node.children.length > 0 && (
                <button
                  onClick={() => searchResults ? drillDownFromSearch(node) : drillDown(node)}
                  className="ml-2 shrink-0 rounded-full bg-[var(--glass)] px-2.5 py-1 text-xs text-[var(--muted)]"
                >
                  ›
                </button>
              )}
            </div>
          ))}

          {searchResults && searchResults.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--muted)]">No places matching "{search}"</div>
          )}
        </div>
      </div>
    </div>
  )
}
