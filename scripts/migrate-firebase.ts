/**
 * Migrate ArtOut posts from legacy Firebase DB to FAS Collections.
 *
 * Usage: npx tsx scripts/migrate-firebase.ts
 *
 * Requires FAS_SESSION_TOKEN env var (get from Bitwarden or browser localStorage).
 */

const FIREBASE_API_KEY = 'AIzaSyAuNWnjDJiUzjQaWAanGfPK75NHVuAG3YQ';
const FIREBASE_DB = 'https://project-2920765739914330301.firebaseio.com';
const FAS_API = 'https://api.freeappstore.online';
const APP_ID = 'artout';
const CLOUD_NAME = 'lkzycqsuf';
const BATCH_SIZE = 20;
const DELAY_MS = 500;

interface FirebasePost {
  lat: number;
  lon: number;
  loc?: { c?: string; p?: string; l?: string; s?: string };
  l?: string;
  t?: number;
  h?: number;
  w?: number;
  authorId?: string;
}

interface ArtPost {
  imageId: string;
  imageUrl: string;
  thumbUrl: string;
  lat: number;
  lon: number;
  locationPath: string;
  locationName: string;
}

function thumbUrl(publicId: string, size = 300): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${size},h_${size},c_fill/${publicId}`;
}

function fullUrl(publicId: string, maxWidth = 1600): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${maxWidth},c_limit/${publicId}`;
}

function buildLocationPath(loc?: FirebasePost['loc']): { path: string; name: string } {
  if (!loc) return { path: 'Unknown', name: 'Unknown' };
  const parts = [loc.c, loc.p, loc.l, loc.s].filter(Boolean) as string[];
  return {
    path: parts.join(' > ') || 'Unknown',
    name: parts[parts.length - 1] || 'Unknown',
  };
}

async function getFirebaseToken(): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  const data = (await res.json()) as { idToken: string };
  return data.idToken;
}

async function fetchAllPosts(fbToken: string): Promise<Record<string, FirebasePost>> {
  const res = await fetch(`${FIREBASE_DB}/pst.json?auth=${fbToken}`);
  if (!res.ok) throw new Error(`Firebase fetch failed: ${res.status}`);
  return (await res.json()) as Record<string, FirebasePost>;
}

async function createPost(post: ArtPost, fasToken: string): Promise<boolean> {
  const res = await fetch(`${FAS_API}/v1/apps/${APP_ID}/collections/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${fasToken}`,
    },
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`  Failed: ${res.status} ${text}`);
    return false;
  }
  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const fasToken = process.env.FAS_SESSION_TOKEN;
  if (!fasToken) {
    console.error('Set FAS_SESSION_TOKEN env var first.');
    console.error('Get it from: bw get password 50ccf0e6');
    process.exit(1);
  }

  console.log('Authenticating with Firebase...');
  const fbToken = await getFirebaseToken();

  console.log('Fetching all posts from Firebase...');
  const posts = await fetchAllPosts(fbToken);
  const keys = Object.keys(posts);
  console.log(`Found ${keys.length} posts.`);

  let created = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (key) => {
        const fb = posts[key];
        if (!fb.lat || !fb.lon) {
          skipped++;
          return;
        }

        const imageId = `artout/${key}`;
        const { path, name } = buildLocationPath(fb.loc);

        const post: ArtPost = {
          imageId,
          imageUrl: fullUrl(imageId),
          thumbUrl: thumbUrl(imageId),
          lat: fb.lat,
          lon: fb.lon,
          locationPath: path,
          locationName: name,
        };

        const ok = await createPost(post, fasToken);
        if (ok) created++;
        else failed++;
      }),
    );

    const pct = Math.round(((i + batch.length) / keys.length) * 100);
    console.log(`Progress: ${i + batch.length}/${keys.length} (${pct}%) — created: ${created}, failed: ${failed}, skipped: ${skipped}`);

    if (i + BATCH_SIZE < keys.length) await sleep(DELAY_MS);
  }

  console.log(`\nDone! Created: ${created}, Failed: ${failed}, Skipped: ${skipped}`);
}

main().catch(console.error);
