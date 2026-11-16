// Runs in the browser: shrink phone photos before upload so they're quick to
// send on cell data and the free storage tier lasts.

type Source = ImageBitmap | HTMLImageElement;

async function decode(file: File): Promise<Source> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function render(src: Source, scale: number, quality: number): Promise<Blob> {
  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't process photo"))), "image/jpeg", quality),
  );
}

export async function compressPhoto(file: File): Promise<{ full: Blob; thumb: Blob; preview: string }> {
  let src: Source;
  try {
    src = await decode(file);
  } catch {
    throw new Error("Couldn't read that photo. Try a JPG or PNG.");
  }
  const long = Math.max(src.width, src.height);
  const short = Math.min(src.width, src.height);
  const full = await render(src, Math.min(1, 1800 / long), 0.82);
  const thumb = await render(src, Math.min(1, 520 / short, 1000 / long), 0.78);
  if ("close" in src) src.close();
  return { full, thumb, preview: URL.createObjectURL(thumb) };
}
