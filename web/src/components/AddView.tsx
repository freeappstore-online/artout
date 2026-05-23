import { useCallback, useRef, useState } from 'react'
import { uploadImage } from '../lib/cloudinary'
import { buildLocationPath } from '../lib/geo'
import { useAuth } from '../hooks/useAuth'
import type { ArtPost } from '../lib/types'

interface AddViewProps {
  userLat?: number
  userLon?: number
  onSubmit: (post: Omit<ArtPost, 'id' | 'thumbUrl' | 'imageUrl'> & { imageId: string }) => Promise<ArtPost>
  onDone: () => void
}

export function AddView({ userLat, userLon, onSubmit, onDone }: AddViewProps) {
  const { user, signIn } = useAuth()
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
      if (userLat && userLon && typeof google !== 'undefined') {
        const geocoder = new google.maps.Geocoder()
        geocoder
          .geocode({ location: { lat: userLat, lng: userLon } })
          .then(({ results }) => {
            if (results?.[0]) {
              setLocationInfo(buildLocationPath(results[0].address_components))
            }
          })
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-[var(--ink)]">Sign in to share art</p>
        <p className="text-sm text-[var(--muted)]">
          You need an account to upload street art photos.
        </p>
        <button
          onClick={signIn}
          className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Sign in with GitHub
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-4 pb-2 pt-4 text-lg font-bold">Share Art</div>

      {!preview ? (
        <div className="mx-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--line-strong)] p-12">
          <div className="text-4xl text-[var(--muted)]">&#128247;</div>
          <p className="text-sm text-[var(--muted)]">Tap to take a photo or choose from gallery</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white"
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
