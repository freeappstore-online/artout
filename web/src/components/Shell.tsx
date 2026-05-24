import type { ReactNode } from 'react'
import { STORE_URL } from '../lib/fas'

export type Tab = 'map' | 'wall' | 'add' | 'favs' | 'profile'

interface ShellProps {
  children: ReactNode
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  topBar?: ReactNode
}

const tabs: { id: Tab; label: string; icon: (active: boolean) => ReactNode }[] = [
  {
    id: 'map', label: 'Map',
    icon: (a) => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'wall', label: 'Wall',
    icon: (a) => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'add', label: '',
    icon: () => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: 'favs', label: 'Saved',
    icon: (a) => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.6}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: 'profile', label: 'You',
    icon: (a) => (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6}>
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
]

export function Shell({ children, activeTab, onTabChange, topBar }: ShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--paper)]">
      {topBar && (
        <div className="fixed inset-x-0 top-0 z-[1050] border-b border-[var(--line)] bg-[var(--dock)]/95 backdrop-blur-2xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="mx-auto max-w-md px-3 py-2">
            {topBar}
          </div>
        </div>
      )}
      <main className={`flex min-h-0 flex-1 flex-col pb-[4rem] ${topBar ? 'pt-12' : ''}`}>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-[1100] border-t border-[var(--line)] bg-[var(--dock)]/95 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex flex-col items-center gap-0.5 pb-1.5 pt-2 transition-colors ${
                t.id === 'add'
                  ? ''
                  : activeTab === t.id
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--muted)]'
              }`}
            >
              {t.id === 'add' ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30">
                  {t.icon(false)}
                </span>
              ) : (
                <>
                  {t.icon(activeTab === t.id)}
                  <span className="text-[0.55rem] font-semibold uppercase tracking-widest">{t.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto block max-w-md px-4 text-center text-[0.45rem] tracking-wider text-[var(--muted)]/40 hover:text-[var(--accent)]"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2px)' }}
        >
          freeappstore.online
        </a>
      </nav>
    </div>
  )
}
