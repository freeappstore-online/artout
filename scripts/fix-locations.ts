/**
 * Fix posts with "Unknown" locationPath by looking up the `l` field
 * from the legacy Firebase DB. The `l` field uses "/" separators and
 * is present on all 2,460 posts.
 *
 * Usage: FAS_SESSION_TOKEN=... npx tsx scripts/fix-locations.ts
 */

const FIREBASE_API_KEY = 'AIzaSyAuNWnjDJiUzjQaWAanGfPK75NHVuAG3YQ';
const FIREBASE_DB = 'https://project-2920765739914330301.firebaseio.com';
const FAS_API = 'https://api.freeappstore.online';
const APP_ID = 'artout';
const BATCH_SIZE = 20;
const DELAY_MS = 300;

interface FasPost {
  id: string;
  imageId: string;
  locationPath: string;
  lat: number;
  lon: number;
}

async function getFirebaseToken(): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' },
  );
  return ((await res.json()) as { idToken: string }).idToken;
}

async function fetchFirebasePosts(fbToken: string): Promise<Record<string, { l?: string }>> {
  const res = await fetch(`${FIREBASE_DB}/pst.json?auth=${fbToken}`);
  return (await res.json()) as Record<string, { l?: string }>;
}

async function fetchFasPosts(fasToken: string): Promise<FasPost[]> {
  const all: FasPost[] = [];
  for (let page = 0; page < 30; page++) {
    const res = await fetch(
      `${FAS_API}/v1/apps/${APP_ID}/db/posts?limit=100&offset=${page * 100}&order=asc`,
    );
    const data = (await res.json()) as { documents: FasPost[] };
    all.push(...data.documents);
    if (data.documents.length < 100) break;
  }
  return all;
}

async function patchPost(id: string, patch: { locationPath: string; locationName: string }, fasToken: string): Promise<boolean> {
  const res = await fetch(`${FAS_API}/v1/apps/${APP_ID}/db/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fasToken}` },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    console.error(`  Failed ${id}: ${res.status} ${await res.text()}`);
    return false;
  }
  return true;
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  const fasToken = process.env.FAS_SESSION_TOKEN;
  if (!fasToken) { console.error('Set FAS_SESSION_TOKEN'); process.exit(1); }

  console.log('Fetching Firebase posts...');
  const fbToken = await getFirebaseToken();
  const fbPosts = await fetchFirebasePosts(fbToken);

  // Build a lookup: imageId "artout/<key>" -> l field
  const fbLookup = new Map<string, string>();
  for (const [key, val] of Object.entries(fbPosts)) {
    if (val.l) fbLookup.set(`artout/${key}`, val.l);
  }
  console.log(`Firebase: ${fbLookup.size} posts with location path`);

  console.log('Fetching FAS posts...');
  const fasPosts = await fetchFasPosts(fasToken);
  console.log(`FAS: ${fasPosts.length} posts total`);

  const toFix = fasPosts.filter((p) => p.locationPath === 'Unknown' || !p.locationPath);
  console.log(`${toFix.length} posts need fixing`);

  let fixed = 0, notFound = 0, failed = 0;

  for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
    const batch = toFix.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (post) => {
      const fbPath = fbLookup.get(post.imageId);
      if (!fbPath) { notFound++; return; }

      // Convert "Australia/Victoria/Melbourne/Hosier Ln" -> "Australia > Victoria > Melbourne > Hosier Ln"
      const parts = fbPath.split('/').filter(Boolean);
      const locationPath = parts.join(' > ');
      const locationName = parts[parts.length - 1] || 'Unknown';

      const ok = await patchPost(post.id, { locationPath, locationName }, fasToken);
      if (ok) fixed++;
      else failed++;
    }));

    const pct = Math.round(((i + batch.length) / toFix.length) * 100);
    console.log(`Progress: ${i + batch.length}/${toFix.length} (${pct}%) — fixed: ${fixed}, not found: ${notFound}, failed: ${failed}`);

    if (i + BATCH_SIZE < toFix.length) await sleep(DELAY_MS);
  }

  console.log(`\nDone! Fixed: ${fixed}, Not found in Firebase: ${notFound}, Failed: ${failed}`);
}

main().catch(console.error);
