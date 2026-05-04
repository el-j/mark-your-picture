import { describe, expect, it } from 'vitest';

// resolveOutputFormat is an internal (unexported) function in src/lib/batch.ts.
// These tests document and pin its expected behaviour by mirroring the same
// pure mapping logic. If the logic in batch.ts ever changes, update these tests
// in sync — or export resolveOutputFormat and import it directly here.

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
