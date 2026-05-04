// ── Batch processing ─────────────────────────────────────────────────────────

import JSZip from 'jszip';
import type { RenderOptions } from './types';
import { loadImageFile, renderWatermark } from './watermark';

export interface BatchCallbacks {
  onFileStart: (index: number) => void;
  onFileComplete: (index: number) => void;
  onFileError: (index: number, error: unknown) => void;
  onProgress: (percent: number) => void;
  onDone: () => void;
}

/** Maps a source MIME type to the best canvas-supported output type and extension. */
function resolveOutputFormat(sourceMime: string): { mime: string; ext: string } {
  const supported: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  if (supported[sourceMime]) return { mime: sourceMime, ext: supported[sourceMime] };
  return { mime: 'image/png', ext: 'png' };
}

export async function processBatch(
  files: File[],
  opts: RenderOptions,
  callbacks: BatchCallbacks,
): Promise<void> {
  const zip = new JSZip();
  const tempCanvas = document.createElement('canvas');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    callbacks.onFileStart(i);

    try {
      const img = await loadImageFile(file);
      renderWatermark(tempCanvas, img, opts);

      const { mime, ext } = resolveOutputFormat(file.type);
      const quality = mime === 'image/jpeg' ? 0.92 : undefined;

      const blob = await new Promise<Blob>((resolve, reject) => {
        tempCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
          mime,
          quality,
        );
      });

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_watermarked.${ext}`, blob);
      callbacks.onFileComplete(i);
    } catch (err) {
      callbacks.onFileError(i, err);
    }

    callbacks.onProgress(((i + 1) / files.length) * 100);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'watermarked_images.zip';
  a.click();
  URL.revokeObjectURL(url);

  callbacks.onDone();
}
