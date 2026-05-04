import { useCallback } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { useT } from '../../i18n/index';
import { loadImageFile } from '../../lib/watermark';

export function DropZone() {
  const { dispatch } = useWatermark();
  const { toast } = useToast();
  const t = useT();

  const loadSource = useCallback(
    async (file: File) => {
      try {
        const img = await loadImageFile(file);
        dispatch({ type: 'SET_SOURCE', img, file });
        toast(t('dropzone.toastLoaded'));
      } catch {
        toast(t('dropzone.toastError'));
      }
    },
    [dispatch, toast, t],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadSource(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-[var(--accent)]', 'bg-[var(--accent-glow)]');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-[var(--accent)]', 'bg-[var(--accent-glow)]');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[var(--accent)]', 'bg-[var(--accent-glow)]');
    const file = e.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) loadSource(file);
  };

  return (
    <label
      id="drop-zone"
      htmlFor="file-input"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col items-center border-2 border-dashed border-[var(--border)] rounded-[var(--radius)] !p-4 text-center cursor-pointer transition-all duration-[var(--transition)] bg-transparent w-[calc(100%-2.5rem)] max-w-[420px] hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
    >
      <svg
        className="opacity-45 mb-2.5 mx-auto"
        role="img"
        aria-label="Upload image"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="text-[0.85rem] text-[var(--text-muted)] leading-relaxed">
        {t('dropzone.hint')}{' '}
        <strong className="text-[var(--accent)]">{t('dropzone.hintStrong')}</strong>
      </p>
      <p className="text-[0.72rem] mt-1 opacity-60 text-[var(--text-muted)]">
        {t('dropzone.formats')}
      </p>
      <input
        type="file"
        id="file-input"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}
