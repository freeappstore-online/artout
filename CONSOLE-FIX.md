# Console showing empty data for Artout

## What happened

The Creator Console at `console.freeappstore.online/apps/artout` shows the page layout but no data — analytics, roles, secrets, webhooks, and logs panels are all empty.

## Root cause

Artout was deployed before the current publish flow existed. The app is live on `artout.freeappstore.online` (hosted via CF Pages or R2), but it was never registered in the platform's D1 `apps` table. The console's backend endpoints (`/v1/apps/:appId/analytics`, `/v1/apps/:appId/roles`, etc.) all look up the app in D1 first — if there's no row, they return 404, and the console silently shows nothing.

## How to fix it

Re-publish the app through the standard flow. This registers it in D1 and connects it to the console.

**Option A: CLI (recommended)**

```bash
# From the artout repo root
npx @freeappstore/cli publish
```

This calls `POST /v1/publish`, which does an `INSERT OR IGNORE INTO apps` — idempotent and safe for existing apps.

**Option B: Manual API call**

If you can't use the CLI, ask a platform admin to insert the row directly. But the CLI is preferred because it also wires up GitHub Actions deploy and VCQA scanning.

## After fixing

1. Go to `console.freeappstore.online`
2. Artout should now appear in your Dashboard app list
3. Click into it — analytics, roles, secrets, webhooks, logs should all load

## Preventing this in the future

All new apps must go through one of these paths:
- **VibeCode** (`create.freeappstore.online`) — auto-registers in D1
- **CLI** (`fas publish`) — auto-registers in D1
- **Publisher Portal** (`publish.freeappstore.online`) — auto-registers in D1

Never create a repo directly in the `freeappstore-online` GitHub org. The org has `members_can_create_repositories: false` to prevent this. If a repo exists without a D1 entry, the console, analytics, roles, and all platform features won't work for that app.
