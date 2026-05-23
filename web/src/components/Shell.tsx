import type { ReactNode } from 'react'
import { STORE_URL } from '../lib/fas'

export type Tab = 'map' | 'wall' | 'add' | 'places' | 'favs'

interface ShellProps {
  children: ReactNode
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'map', label: 'Map', icon: 'M' },
  { id: 'wall', label: 'Wall', icon: 'W' },
  { id: 'add', label: 'Add', icon: '+' },
  { id: 'places', label: 'Places', icon: 'P' },
  { id: 'favs', label: 'Favs', icon: '\u2665' },
]

export function Shell({ children, activeTab, onTabChange }: ShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--paper)]">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--dock)]/95 backdrop-blur-2xl">
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto block max-w-md px-4 py-1 text-center text-[0.55rem] text-[var(--muted)] hover:text-[var(--accent)]"
        >
          a free app on freeappstore.online
        </a>
        <div className="mx-auto grid max-w-md grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex flex-col items-center gap-0.5 pb-1 pt-2 text-[0.6rem] font-semibold uppercase tracking-wider transition-colors ${
                activeTab === t.id
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted)]'
              }`}
            >
              <span className={`text-lg leading-none ${t.id === 'add' ? 'flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white' : ''}`}>
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
