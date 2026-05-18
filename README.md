# ArtOut

Street art. On the map. By the community.

A location-based street art photo sharing PWA on [FreeAppStore](https://freeappstore.online). Rebuilt from [artout-legacy](https://github.com/ArtOut-street-art/artout-legacy) (2015-2017) on modern tech.

## Features

- **Map** -- browse street art on Google Maps with markers
- **Wall** -- photo grid sorted by newest, with location badges
- **Upload** -- snap a photo, auto-detect GPS location, share it
- **Places** -- browse art by location (country > city > neighborhood)
- **Favorites** -- save art you like
- **Gallery** -- full-screen lightbox with swipe

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS 4
- FAS SDK (auth, Collections DB, KV storage)
- Google Maps JS API
- Cloudinary (image upload + transforms)
- PWA (installable, dark theme)

## Dev

```bash
pnpm install
cp web/.env.example web/.env  # add your Google Maps API key
pnpm dev
```

## License

MIT.
