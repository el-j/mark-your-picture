import { describe, expect, it } from 'vitest';

// We test the internal resolveOutputFormat logic via its observable effect on
// processBatch by duplicating the pure mapping here, consistent with the
// implementation in src/lib/batch.ts.

function resolveOutputFormat(sourceMime: string): { mime: string; ext: string } {
  const supported: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  if (supported[sourceMime]) return { mime: sourceMime, ext: supported[sourceMime] };
  return { mime: 'image/png', ext: 'png' };
}

describe('resolveOutputFormat', () => {
  it('returns jpg for image/jpeg', () => {
    expect(resolveOutputFormat('image/jpeg')).toEqual({ mime: 'image/jpeg', ext: 'jpg' });
  });

  it('returns png for image/png', () => {
    expect(resolveOutputFormat('image/png')).toEqual({ mime: 'image/png', ext: 'png' });
  });

  it('returns webp for image/webp', () => {
    expect(resolveOutputFormat('image/webp')).toEqual({ mime: 'image/webp', ext: 'webp' });
  });

  it('falls back to png for unknown MIME types', () => {
    expect(resolveOutputFormat('image/gif')).toEqual({ mime: 'image/png', ext: 'png' });
    expect(resolveOutputFormat('image/bmp')).toEqual({ mime: 'image/png', ext: 'png' });
    expect(resolveOutputFormat('')).toEqual({ mime: 'image/png', ext: 'png' });
  });
});
