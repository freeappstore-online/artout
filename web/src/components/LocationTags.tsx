/** Renders location path as tappable segment tags: [Australia] [Victoria] [Melbourne] [Hosier Ln] */
export function LocationTags({ locationPath, onTagClick }: {
  locationPath: string
  onTagClick: (path: string) => void
}) {
  if (!locationPath || locationPath === 'Unknown') return null
  const parts = locationPath.split(' > ')

  return (
    <div className="pointer-events-auto flex flex-wrap gap-1">
      {parts.map((part, i) => {
        const segPath = parts.slice(0, i + 1).join(' > ')
        return (
          <button
            key={segPath}
            onClick={(e) => { e.stopPropagation(); onTagClick(segPath) }}
            className="rounded-full bg-white/15 px-2 py-0.5 text-[0.55rem] font-medium text-white/80 backdrop-blur-sm hover:bg-white/25"
          >
            {part}
          </button>
        )
      })}
    </div>
  )
}
