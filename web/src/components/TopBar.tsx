import type { ReactNode } from 'react'

/** Breadcrumb: World › Australia (×) › NSW (×) › Sydney */
export function LocationBreadcrumb({ path, onNavigate }: {
  path: string | null
  onNavigate: (path: string | null) => void
}) {
  const parts = path ? path.split(' > ') : []

  return (
    <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto text-xs">
      <button
        onClick={() => onNavigate(null)}
        className={`shrink-0 whitespace-nowrap font-semibold ${!path ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}
      >
        World
      </button>
      {parts.map((part, i) => {
        const segmentPath = parts.slice(0, i + 1).join(' > ')
        const isLast = i === parts.length - 1
        return (
          <span key={segmentPath} className="flex shrink-0 items-center gap-0.5">
            <span className="text-[var(--muted)]/50">›</span>
            <span className={`whitespace-nowrap font-semibold ${isLast ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
              {part}
            </span>
            <button
              onClick={() => onNavigate(i === 0 ? null : parts.slice(0, i).join(' > '))}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[0.5rem] text-[var(--muted)] hover:bg-[var(--glass)] hover:text-[var(--ink)]"
            >
              ×
            </button>
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

/** Map top bar: breadcrumb + search */
export function MapTopBar({ path, onNavigate, onSearch }: {
  path: string | null
  onNavigate: (path: string | null) => void
  onSearch: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <LocationBreadcrumb path={path} onNavigate={onNavigate} />
      <SearchButton onClick={onSearch} />
    </div>
  )
}

type Sort = 'newest' | 'nearby' | 'popular'

/** Wall top bar: sort dropdown + breadcrumb + search + layout */
export function WallTopBar({ path, onNavigate, onSearch, sort, onSortChange, hasGPS, layout, onLayoutChange }: {
  path: string | null
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
        className="shrink-0 rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-2 py-1 text-xs font-semibold text-[var(--ink)] focus:outline-none"
      >
        <option value="newest">Newest</option>
        {hasGPS && <option value="nearby">Nearby</option>}
        <option value="popular">Popular</option>
      </select>
      <LocationBreadcrumb path={path} onNavigate={onNavigate} />
      <SearchButton onClick={onSearch} />
      <LayoutToggle layout={layout} onChange={onLayoutChange} />
    </div>
  )
}

/** Favs top bar: layout toggle only */
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
