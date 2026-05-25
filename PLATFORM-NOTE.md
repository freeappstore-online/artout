# Note to FAS Platform Team

**Re:** SCALE-REQUEST.md follow-up
**App:** ArtOut (`artout.freeappstore.online`)
**Date:** 2026-05-25

---

Hey team,

We submitted `SCALE-REQUEST.md` with 6 API features needed for ArtOut to scale. Wanted to follow up with context on where we are and what's urgent.

## Current state

- **2,460 posts** migrated from legacy Firebase, live and working
- **42 e2e tests** passing, app is stable
- **Architecture:** loads all posts client-side for map clustering + location tree. Works fine at 2.5K. Will break at 10K+.

## What's blocking growth

We can't promote ArtOut or enable community posting until we know the map won't collapse. Right now if we get 500 new posts/week (modest for a street art community), we hit 10K in 4 months and the app starts lagging. At 50K it's unusable.

## The one thing we need most

If you can only do one thing:

**Geo bounding box query on Collections.**

```
GET /v1/apps/artout/db/posts?lat_min=X&lat_max=Y&lon_min=X&lon_max=Y&limit=200
```

This is a `WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?` with a compound index. Should be straightforward in D1.

With this single endpoint, we can:
- Load only what's on screen (not all posts)
- Remove `loadAll()` entirely
- Make the map instant at any scale
- Keep infinite scroll for wall (already paginated)

We'll handle clustering client-side from the bounded result (200 markers is fine for Leaflet).

## What we DON'T need right now

- Server-side clustering (#2) — nice to have at 1M, not needed until 100K
- Location tree endpoint (#3) — we can cap the tree to top 5K posts for now
- Cursor pagination (#5) — offset works fine up to 50K with a good index

## Questions for you

1. Is geo query on the roadmap? Any ETA?
2. Would you accept a PR to `platform/packages/backend` that adds it? We can write it.
3. Is there a D1 index on `(lat, lon)` already, or do we need a migration?

## How to test the need

Open `artout.freeappstore.online` → Map tab. Notice it loads ALL 2,460 posts on map open (check Network tab — dozens of API calls). That's the problem. At 10K+ it'll be 100+ sequential fetches before the map shows anything.

---

Let us know how you'd like to proceed. Happy to write the backend code if you point us at the right file.

— ArtOut team
