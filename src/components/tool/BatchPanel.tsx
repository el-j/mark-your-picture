import { useRef, useCallback } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { processBatch } from '../../lib/batch';
import { ProgressBar } from './ProgressBar';

export function BatchPanel() {
  const { state, dispatch, getRenderOpts } = useWatermark();
  const { toast } = useToast();
  const batchInputRef = useRef<HTMLInputElement>(null);

  const loadBatchFiles = useCallback((files: File[]) => {
    dispatch({ type: 'SET_BATCH_FILES', files });
    toast(`${files.length} image${files.length > 1 ? 's' : ''} ready`);
  }, [dispatch, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length) loadBatchFiles(files);
  }, [loadBatchFiles]);

  const handleBatch = useCallback(async () => {
    if (!state.batchFiles.length) return;
    if (state.activeTab === 'image' && !state.wmImg) {
      toast('Please load a watermark image first');
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
        toast('ZIP downloaded ✓', 3500);
      },
    });
  }, [state.batchFiles, state.activeTab, state.wmImg, getRenderOpts, dispatch, toast]);

  const statusCls: Record<string, string> = {
    pending: 'text-[var(--text-muted)]',
    processing: 'text-[var(--accent)]',
    done: 'text-[var(--success)]',
    error: 'text-[var(--danger)]',
  };
  const statusLabel: Record<string, string> = { pending: 'Waiting', processing: 'Processing…', done: 'Done ✓', error: 'Error ✗' };

  const btnBase = "inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[var(--radius-sm)] text-[0.82rem] font-semibold cursor-pointer border-none transition-all w-full";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[0.62rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1.5">Images</p>
        <div
          onClick={() => batchInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius)] py-3 px-4 text-center cursor-pointer transition-all bg-transparent hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
        >
          <svg className="mx-auto mb-1 opacity-45" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="text-[0.85rem] text-[var(--text-muted)]">Drag &amp; drop or <strong className="text-[var(--accent)]">click to select</strong></p>
          <p className="text-[0.72rem] mt-0.5 opacity-60 text-[var(--text-muted)]">Select multiple images</p>
          <input ref={batchInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) loadBatchFiles(files);
          }} />
        </div>

        <div className="mt-2.5 max-h-[160px] overflow-y-auto border border-[var(--border-subtle)] rounded-[var(--radius-sm)] bg-[var(--bg)] text-[0.78rem]">
          {state.batchFiles.length === 0 ? (
            <div className="py-2.5 text-center text-[var(--text-muted)] text-[0.78rem]">No images selected yet</div>
          ) : (
            state.batchFiles.map((file, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 px-3 border-b border-[var(--border-subtle)] last:border-b-0">
                <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-2">{file.name}</span>
                <span className={`text-[0.7rem] font-bold shrink-0 ${statusCls[state.batchStatuses[i]] ?? ''}`}>
                  {statusLabel[state.batchStatuses[i]] ?? ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-3">Watermark Type</p>
        <p className="text-[0.78rem] text-[var(--text-muted)]">Uses the same watermark settings configured above.</p>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={handleBatch} disabled={!state.batchFiles.length || state.isProcessing}
          className={`${btnBase} bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-glow)] hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0 disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Download ZIP
        </button>
        {state.isProcessing && <ProgressBar progress={state.batchProgress} />}
      </div>
    </div>
  );
}
