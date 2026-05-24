import { LocationPill } from './LocationPicker'

type Sort = 'nearby' | 'newest' | 'popular'
type Layout = 'grid' | 'feed'

interface TopBarProps {
  locationPath: string | null
  locationCount: number
  onOpenPicker: () => void
  sort?: Sort
  onSortChange?: (sort: Sort) => void
  hasLocation?: boolean
  layout?: Layout
  onLayoutChange?: (layout: Layout) => void
  showControls?: boolean
}

export function TopBar({
  locationPath, locationCount, onOpenPicker,
  sort, onSortChange, hasLocation,
  layout, onLayoutChange,
  showControls = true,
}: TopBarProps) {
  return (
    <div className="flex items-center gap-2">
      <LocationPill currentPath={locationPath} count={locationCount} onOpen={onOpenPicker} />

      {showControls && onSortChange && (
        <>
          {hasLocation && (
            <button
              onClick={() => onSortChange('nearby')}
              className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${
                sort === 'nearby' ? 'bg-[var(--accent)] text-black' : 'text-[var(--muted)]'
              }`}
            >Near</button>
          )}
          <button
            onClick={() => onSortChange('newest')}
            className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${
              sort === 'newest' ? 'bg-[var(--accent)] text-black' : 'text-[var(--muted)]'
            }`}
          >New</button>
          <button
            onClick={() => onSortChange('popular')}
            className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${
              sort === 'popular' ? 'bg-[var(--accent)] text-black' : 'text-[var(--muted)]'
            }`}
          >Top</button>
        </>
      )}

      {showControls && onLayoutChange && (
        <div className="ml-auto flex gap-0.5">
          <button
            onClick={() => onLayoutChange('grid')}
            className={`rounded p-1 ${layout === 'grid' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => onLayoutChange('feed')}
            className={`rounded p-1 ${layout === 'feed' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="8" rx="1" />
              <rect x="3" y="14" width="18" height="8" rx="1" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
