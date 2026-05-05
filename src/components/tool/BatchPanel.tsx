import { useCallback } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { useT } from '../../i18n/index';
import { processBatch } from '../../lib/batch';
import { ProgressBar } from './ProgressBar';

export function BatchPanel() {
  const { state, dispatch, getRenderOpts } = useWatermark();
  const { toast } = useToast();
  const t = useT();

  const loadBatchFiles = useCallback(
    (files: File[]) => {
      dispatch({ type: 'SET_BATCH_FILES', files });
      const msg =
        files.length === 1
          ? t('batch.toastReady_one')
          : t('batch.toastReady_many', { count: files.length });
      toast(msg);
    },
    [dispatch, toast, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (files.length) loadBatchFiles(files);
    },
    [loadBatchFiles],
  );

  const handleBatch = useCallback(async () => {
    if (!state.batchFiles.length) return;
    if (state.activeTab === 'image' && !state.wmImg) {
      toast(t('batch.toastNoWmImg'));
      return;
    }
    dispatch({ type: 'SET_IS_PROCESSING', value: true });

    await processBatch(state.batchFiles, getRenderOpts(), {
      onFileStart: (i) => dispatch({ type: 'SET_BATCH_STATUS', index: i, status: 'processing' }),
      onFileComplete: (i) => dispatch({ type: 'SET_BATCH_STATUS', index: i, status: 'done' }),
      onFileError: (i) => dispatch({ type: 'SET_BATCH_STATUS', index: i, status: 'error' }),
      onProgress: (pct) => dispatch({ type: 'SET_BATCH_PROGRESS', value: pct }),
      onDone: () => {
        dispatch({ type: 'SET_IS_PROCESSING', value: false });
        toast(t('batch.toastZipDone'), 3500);
      },
    });
  }, [state.batchFiles, state.activeTab, state.wmImg, getRenderOpts, dispatch, toast, t]);

  const statusCls: Record<string, string> = {
    pending: 'text-[var(--text-muted)]',
    processing: 'text-[var(--accent)]',
    done: 'text-[var(--success)]',
    error: 'text-[var(--danger)]',
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('batch.statusWaiting'),
      processing: t('batch.statusProcessing'),
      done: t('batch.statusDone'),
      error: t('batch.statusError'),
    };
    return map[status] ?? '';
  };

  const btnBase =
    'inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[var(--radius-sm)] text-[0.82rem] font-semibold cursor-pointer border-none transition-all w-full';

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 font-bold text-[0.62rem] text-[var(--text-muted)] uppercase tracking-[0.1em]">
          {t('batch.imagesLabel')}
        </p>
        <label
          htmlFor="batch-file-input"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="block cursor-pointer rounded-[var(--radius)] border-2 border-[var(--border)] border-dashed bg-transparent px-4 py-3 text-center transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
        >
          <svg
            aria-hidden="true"
            className="mx-auto mb-1 opacity-45"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="text-[0.85rem] text-[var(--text-muted)]">
            {t('batch.dropzone')}{' '}
            <strong className="text-[var(--accent)]">{t('batch.dropzoneStrong')}</strong>
          </p>
          <p className="mt-0.5 text-[0.72rem] text-[var(--text-muted)] opacity-60">
            {t('batch.dropzoneHint')}
          </p>
          <input
            type="file"
            id="batch-file-input"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) loadBatchFiles(files);
            }}
          />
        </label>

        <div className="mt-2.5 max-h-[160px] overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg)] text-[0.78rem]">
          {state.batchFiles.length === 0 ? (
            <div className="py-2.5 text-center text-[0.78rem] text-[var(--text-muted)]">
              {t('batch.noImages')}
            </div>
          ) : (
            state.batchFiles.map((file, i) => (
              <div
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between border-[var(--border-subtle)] border-b px-3 py-1.5 last:border-b-0"
              >
                <span className="mr-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {file.name}
                </span>
                <span
                  className={`shrink-0 font-bold text-[0.7rem] ${statusCls[state.batchStatuses[i]] ?? ''}`}
                >
                  {getStatusLabel(state.batchStatuses[i])}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 font-bold text-[0.65rem] text-[var(--text-muted)] uppercase tracking-[0.1em]">
          {t('batch.wmTypeLabel')}
        </p>
        <p className="text-[0.78rem] text-[var(--text-muted)]">{t('batch.wmTypeHint')}</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleBatch}
          disabled={!state.batchFiles.length || state.isProcessing}
          className={`${btnBase} bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-glow)] hover:-translate-y-px hover:bg-[var(--accent-hover)] active:translate-y-0 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none`}
        >
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {t('batch.downloadZip')}
        </button>
        {state.isProcessing && <ProgressBar progress={state.batchProgress} />}
      </div>
    </div>
  );
}
