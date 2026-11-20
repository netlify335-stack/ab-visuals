/** Client-side image compression → WebP, max 2048px, q0.85 (fast gallery loads). */
export async function compressImage(
  file: Blob,
  maxDim = 2048,
  quality = 0.85,
): Promise<{ blob: Blob; width: number; height: number }> {
  let bmp: ImageBitmap | null = null
  try {
    bmp = await createImageBitmap(file)
  } catch {
    bmp = await loadImageBitmap(file)
  }
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height))
  const width = Math.max(1, Math.round(bmp.width * scale))
  const height = Math.max(1, Math.round(bmp.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return { blob: file, width: bmp.width, height: bmp.height }
  ctx.drawImage(bmp, 0, 0, width, height)
  bmp.close?.()
  const webp = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality))
  if (webp) return { blob: webp, width, height }
  const jpeg = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))
  return { blob: jpeg ?? file, width, height }
}

function loadImageBitmap(file: Blob): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      try {
        const b = await createImageBitmap(img)
        URL.revokeObjectURL(url)
        resolve(b)
      } catch (e) {
        URL.revokeObjectURL(url)
        reject(e)
      }
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/** Read natural dimensions without compressing (for gallery metadata). */
export function readDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })
}
