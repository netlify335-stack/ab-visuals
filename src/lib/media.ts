export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  dataUrl?: string;
};

const MAX_DIM = 2048;

/** Downscale + convert any DSLR/drone/phone photo to a crisp WebP in the browser. */
export async function compressImage(file: File, maxDim = MAX_DIM, quality = 0.85): Promise<CompressedImage> {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality)
  );
  if (!blob) throw new Error('Could not compress image');
  return { blob, width, height };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image decode failed'));
      el.src = url;
    });
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
