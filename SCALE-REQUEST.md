# ArtOut Scale Request — Platform API Features Needed

**From:** ArtOut app team
**To:** FAS Platform team
**Date:** 2026-05-25
**Context:** ArtOut has 2,460 posts now, expects 50K–1M. Current architecture loads all posts client-side. This won't scale.

---

## What ArtOut needs from the platform

### 1. Geospatial queries on Collections (CRITICAL)

**Current:** App fetches ALL posts, filters by lat/lon in the browser.
**Needed:** Query posts within a bounding box.

```
GET /v1/apps/:appId/db/:collection?lat_min=-38&lat_max=-37&lon_min=144&lon_max=145
```

Or a GeoJSON-style query:
```
GET /v1/apps/:appId/db/:collection?near=lat,lon&radius=5000
```

**Why:** Map can't load 1M posts to show what's on screen. Needs the API to return only what's visible. Without this, the map is the first thing that breaks.

**D1 consideration:** SQLite (D1) doesn't have native spatial indexes, but a simple `WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?` with a compound index on `(lat, lon)` would work up to ~1M rows.

---

### 2. Server-side aggregation / clustering (HIGH)

**Current:** Browser creates MarkerClusterGroup from all individual markers.
**Needed:** API returns pre-aggregated cluster summaries by zoom level.

```
GET /v1/apps/:appId/db/:collection/clusters?zoom=5&bounds=...
→ [{ lat: -37.8, lon: 144.9, count: 340, label: "Melbourne" }]
```

**Why:** At 1M posts, creating 1M Leaflet markers crashes the browser. The API should return ~50-200 cluster points per request, not individual posts.

**Implementation idea:** Pre-compute clusters using geohash prefixes (different prefix lengths = different zoom levels). Store in a separate table, update on insert.

---

### 3. Hierarchical location tree endpoint (HIGH)

**Current:** App fetches all posts, builds location tree client-side from `locationPath` strings.
**Needed:** API returns the tree directly.

```
GET /v1/apps/:appId/db/:collection/locations?parent=Australia
→ [{ name: "Victoria", path: "Australia > Victoria", count: 1800 }, ...]
```

Or return the full tree up to depth N:
```
GET /v1/apps/:appId/db/:collection/locations?depth=2
→ { "Australia": { count: 2400, children: { "Victoria": { count: 1800 }, ... } } }
```

**Why:** Building a tree from 1M `locationPath` strings in the browser takes seconds and hundreds of MB. The server can do this once and cache it.

---

### 4. Sort by counter value (MEDIUM)

**Current:** App loads all fav counters via `counters.list()`, sorts client-side.
**Needed:** Collections query supports `orderBy` a counter key.

```
GET /v1/apps/:appId/db/:collection?orderBy=counter:fav&order=desc&limit=30
```

**Why:** "Popular" sort requires knowing every post's fav count. At 1M posts + 1M counters, loading all counters to sort client-side is impossible.

**Alternative:** Store `favCount` as a field on the post document, updated by a counter trigger/webhook. Then normal `orderBy=favCount` works.

---

### 5. Cursor-based pagination (MEDIUM)

**Current:** Offset-based (`?offset=300&limit=30`).
**Needed:** Cursor-based (`?cursor=abc123&limit=30`).

**Why:** `OFFSET 999970 LIMIT 30` in D1 scans 999,970 rows to skip them. At 1M posts, deep pagination is O(n). Cursor pagination is O(1).

```
GET /v1/apps/:appId/db/:collection?limit=30
→ { documents: [...], cursor: "abc123" }

GET /v1/apps/:appId/db/:collection?cursor=abc123&limit=30
→ { documents: [...], cursor: "def456" }
```

---

### 6. Bounded KV values (LOW)

**Current:** Per-user favorites and trashed lists stored as JSON arrays in KV. Grows unbounded.
**At scale:** A user who trashes 10,000 posts has a 100KB+ KV value that's read/written on every page load.

**Needed:** Either:
- KV set operations (add/remove/contains without loading the full value)
- Or a per-user collection (like a `user_trash` collection with one doc per trashed post)

---

## What we can do client-side (no platform changes)

These are mitigations we can implement now to get to ~50K:

1. **Limit map to 5,000 most recent posts** — don't load all, accept imperfect clustering
2. **Virtual scrolling on wall** — only render visible DOM elements
3. **Debounce location tree builds** — memoize aggressively, use web worker
4. **Cap trash/favorites arrays** — limit to last 1,000 entries

These buy time but don't solve the fundamental "load everything" architecture.

---

## Priority for platform team

| # | Feature | Unlocks | Effort estimate |
|---|---------|---------|----------------|
| 1 | Geo bounding box query | Map at any scale | Low (SQL WHERE + index) |
| 2 | Server-side clusters | Map performance | Medium (geohash table) |
| 3 | Location tree endpoint | Browse at scale | Medium (recursive SQL or cache) |
| 4 | Counter-based sort | Popular sort at scale | Low (denormalize to field) |
| 5 | Cursor pagination | Deep scroll at scale | Low (keyset pagination) |
| 6 | Bounded KV | User data at scale | Medium (new KV operations) |

**#1 alone would get us to 100K.** Combined with #5, probably to 1M.

---

*This document can be shared with the platform team as-is. No secrets or credentials included.*
