import { useCallback, useRef, useState } from 'react'
import { uploadImage } from '../lib/cloudinary'
import { reverseGeocode } from '../lib/geo'
import { useAuth } from '../hooks/useAuth'
import type { ArtPost } from '../lib/types'

interface AddViewProps {
  userLat?: number
  userLon?: number
  onSubmit: (post: Omit<ArtPost, 'id' | 'thumbUrl' | 'imageUrl'> & { imageId: string }) => Promise<ArtPost>
  onDone: () => void
}

export function AddView({ userLat, userLon, onSubmit, onDone }: AddViewProps) {
  const { user, signIn, signInWithGoogle } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationInfo, setLocationInfo] = useState<{ path: string; name: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (!f) return
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setError(null)

      // Reverse geocode if we have position
      if (userLat && userLon) {
        reverseGeocode(userLat, userLon)
          .then(setLocationInfo)
          .catch(() => { /* geocoding failed, location stays null */ })
      }
    },
    [userLat, userLon],
  )

  const handleSubmit = useCallback(async () => {
    if (!file || !userLat || !userLon) return
    setUploading(true)
    setError(null)
    try {
      const { publicId } = await uploadImage(file)
      await onSubmit({
        imageId: publicId,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        lat: userLat,
        lon: userLon,
        locationPath: locationInfo?.path || 'Unknown',
        locationName: locationInfo?.name || 'Unknown',
      })
      setFile(null)
      setPreview(null)
      setTitle('')
      setDescription('')
      setLocationInfo(null)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [file, userLat, userLon, title, description, locationInfo, onSubmit, onDone])

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
        <p className="display-font text-2xl text-[var(--ink)]">Drop some art</p>
        <p className="text-sm text-[var(--muted)]">Sign in to share what you find on the streets.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={signInWithGoogle}
            className="flex w-56 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-800"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button
            onClick={signIn}
            className="flex w-56 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--glass)] px-6 py-2.5 text-sm font-semibold text-[var(--ink)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-4 pb-2 pt-4">
        <span className="display-font text-xl text-[var(--ink)]">Drop a spot</span>
      </div>

      {!preview ? (
        <div className="mx-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--muted)]/30 p-10">
          <p className="text-sm text-[var(--muted)]">Snap it or pick from your roll</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20"
          >
            Choose Photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      ) : (
        <div className="mx-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-xl object-cover"
            style={{ maxHeight: 280 }}
          />
        </div>
      )}

      {locationInfo && (
        <div className="mx-4 mt-3 flex items-center gap-1.5 text-sm text-[var(--mint)]">
          <span>&#128205;</span> {locationInfo.path}
        </div>
      )}
      {!userLat && (
        <div className="mx-4 mt-3 text-sm text-[var(--warning)]">
          Location unavailable. Enable GPS for auto-detection.
        </div>
      )}

      <div className="mx-4 mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Banksy-style stencil on brick wall"'
            className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about this piece..."
            rows={3}
            className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      {preview && (
        <div className="mx-4 mt-4 flex gap-3">
          <button
            onClick={() => {
              setFile(null)
              setPreview(null)
            }}
            className="flex-1 rounded-full border border-[var(--line-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !userLat}
            className="flex-1 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Share'}
          </button>
        </div>
      )}
    </div>
  )
}
