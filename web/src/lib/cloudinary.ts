const CLOUD_NAME = 'lkzycqsuf'
const UPLOAD_PRESET = 'cttcla3s'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload/`

/** Small square thumb for grid view (~5-8KB each) */
export function thumbUrl(publicId: string, size = 150): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${size},h_${size},c_fill,f_auto,q_auto/${publicId}`
}

/** Medium image for feed view (~30-50KB) */
export function mediumUrl(publicId: string, maxWidth = 800): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${maxWidth},c_limit,f_auto,q_auto/${publicId}`
}

/** Full-res for gallery (~80-150KB) */
export function fullUrl(publicId: string, maxWidth = 1600): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${maxWidth},c_limit,f_auto,q_auto/${publicId}`
}

export async function uploadImage(file: File): Promise<{ publicId: string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'artout')

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json() as { public_id: string; secure_url: string }
  return { publicId: data.public_id, url: data.secure_url }
}
