import { type ReactNode, useCallback, useMemo, useState } from 'react'
import type { ArtPost, LocationNode } from '../lib/types'
import { buildLocationTree } from '../lib/locations'

/** Inline dropdown that appears below a breadcrumb segment */
function InlineDropdown({ nodes, onSelect, onClose }: {
  nodes: LocationNode[]
  onSelect: (path: string) => void
  onClose: () => void
}) {
  if (nodes.length === 0) return null
  return (
    <>
      <div className="fixed inset-0 z-[1060]" onClick={onClose} />
      <div className="fixed left-3 right-3 top-12 z-[1061] max-h-64 overflow-y-auto rounded-xl border border-[var(--line-strong)] bg-[var(--panel-strong)] shadow-lg backdrop-blur-xl" style={{ marginTop: 'env(safe-area-inset-top)' }}>
        {nodes.map((n) => (
          <button
            key={n.path}
            onClick={() => { onSelect(n.path); onClose() }}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-[var(--glass)]"
          >
            <span className="font-medium text-[var(--ink)]">{n.name}</span>
            <span className="ml-3 text-[var(--muted)]">{n.count}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/** Breadcrumb with inline drill-down: World › Australia (×) › NSW (×) */
export function LocationBreadcrumb({ path, posts, onNavigate }: {
  path: string | null
  posts: ArtPost[]
  onNavigate: (path: string | null) => void
}) {
  const tree = useMemo(() => buildLocationTree(posts), [posts])
  const parts = path ? path.split(' > ') : []
  const [openDropdown, setOpenDropdown] = useState<number | null>(null) // -1 = World, 0+ = segment index

  // Get children at a specific depth
  const getChildrenAt = useCallback((depth: number): LocationNode[] => {
    if (depth < 0) return tree // World level — show countries
    let nodes = tree
    for (let i = 0; i <= depth && i < parts.length; i++) {
      const found = nodes.find((n) => n.name === parts[i])
      if (!found) return []
      nodes = found.children
    }
    return nodes
  }, [tree, parts])

  return (
    <div className="relative flex min-w-0 items-center gap-0.5 text-xs">
      {/* World button */}
      <button
        onClick={() => setOpenDropdown(openDropdown === -1 ? null : -1)}
        className={`shrink-0 whitespace-nowrap font-semibold ${!path ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
      >
        World
      </button>
      {openDropdown === -1 && (
        <InlineDropdown
          nodes={getChildrenAt(-1)}
          onSelect={onNavigate}
          onClose={() => setOpenDropdown(null)}
        />
      )}

      {/* Path segments — tap to navigate to that level, tap again to drill down */}
      {parts.map((part, i) => {
        const segPath = parts.slice(0, i + 1).join(' > ')
        const isLast = i === parts.length - 1
        const hasChildren = getChildrenAt(i).length > 0
        return (
          <span key={i} className="flex shrink-0 items-center gap-0.5">
            <span className="text-[var(--muted)]/50">›</span>
            <button
              onClick={() => {
                if (isLast && hasChildren) {
                  // Last segment with children — toggle dropdown to drill deeper
                  setOpenDropdown(openDropdown === i ? null : i)
                } else {
                  // Non-last segment — navigate to this level (clear below)
                  onNavigate(segPath)
                  setOpenDropdown(null)
                }
              }}
              className={`whitespace-nowrap font-semibold ${isLast ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              {part}
            </button>
            {openDropdown === i && (
              <InlineDropdown
                nodes={getChildrenAt(i)}
                onSelect={onNavigate}
                onClose={() => setOpenDropdown(null)}
              />
            )}
          </span>
        )
      })}
    </div>
  )
}

/** Search icon button */
function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="shrink-0 rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--ink)]">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  )
}

/** Layout toggle */
function LayoutToggle({ layout, onChange }: { layout: 'grid' | 'feed'; onChange: (l: 'grid' | 'feed') => void }) {
  return (
    <div className="flex shrink-0 gap-0.5">
      <button onClick={() => onChange('grid')} className={`rounded p-1 ${layout === 'grid' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      <button onClick={() => onChange('feed')} className={`rounded p-1 ${layout === 'feed' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="8" rx="1" />
          <rect x="3" y="14" width="18" height="8" rx="1" />
        </svg>
      </button>
    </div>
  )
}

type Sort = 'newest' | 'nearby' | 'popular'

/** Map top bar */
export function MapTopBar({ path, posts, onNavigate, onSearch }: {
  path: string | null
  posts: ArtPost[]
  onNavigate: (path: string | null) => void
  onSearch: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <LocationBreadcrumb path={path} posts={posts} onNavigate={onNavigate} />
      <div className="flex-1" />
      <SearchButton onClick={onSearch} />
    </div>
  )
}

/** Wall top bar */
export function WallTopBar({ path, posts, onNavigate, onSearch, sort, onSortChange, hasGPS, layout, onLayoutChange }: {
  path: string | null
  posts: ArtPost[]
  onNavigate: (path: string | null) => void
  onSearch: () => void
  sort: Sort
  onSortChange: (s: Sort) => void
  hasGPS: boolean
  layout: 'grid' | 'feed'
  onLayoutChange: (l: 'grid' | 'feed') => void
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as Sort)}
        className="shrink-0 appearance-none rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-2 py-1 pr-5 text-xs font-semibold text-[var(--ink)] focus:outline-none"
        style={{ WebkitAppearance: 'none' }}
      >
        <option value="newest">Newest</option>
        {hasGPS && <option value="nearby">Nearby</option>}
        <option value="popular">Popular</option>
      </select>
      <LocationBreadcrumb path={path} posts={posts} onNavigate={onNavigate} />
      <div className="flex-1" />
      <SearchButton onClick={onSearch} />
      <LayoutToggle layout={layout} onChange={onLayoutChange} />
    </div>
  )
}

/** Favs top bar */
export function FavsTopBar({ layout, onLayoutChange, extra }: {
  layout: 'grid' | 'feed'
  onLayoutChange: (l: 'grid' | 'feed') => void
  extra?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      {extra}
      <div className="flex-1" />
      <LayoutToggle layout={layout} onChange={onLayoutChange} />
    </div>
  )
}
