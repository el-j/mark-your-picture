import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { useT } from '../../i18n/index';
import {
  cleanupProjects,
  clearProjects,
  createProjectId,
  deleteProject,
  getStorageStats,
  listProjects,
  parseProjectFile,
  saveProject,
  toProjectExportFile,
} from '../../lib/projectStorage';
import type { SavedProjectSnapshot, StorageStats } from '../../lib/types';

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function ProjectsPage() {
  const { state, saveCurrentProject, loadSavedProject, setProjectName } = useWatermark();
  const { toast } = useToast();
  const t = useT();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<SavedProjectSnapshot[]>([]);
  const [stats, setStats] = useState<StorageStats>({ count: 0, newestUpdatedAt: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [nextProjects, nextStats] = await Promise.all([listProjects(), getStorageStats()]);
    setProjects(nextProjects);
    setStats(nextStats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totalBatchFilesPotential = useMemo(
    () => projects.filter((project) => project.state.mode === 'batch').length,
    [projects],
  );

  const handleSaveCurrent = async () => {
    setIsSaving(true);
    try {
      const fallbackName = t('projects.untitled');
      await saveCurrentProject(state.projectName || fallbackName);
      toast(t('projects.toastSaved'));
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenProject = (project: SavedProjectSnapshot) => {
    loadSavedProject(project);
    toast(t('projects.toastLoaded'));
    navigate('/');
  };

  const handleDuplicateProject = async (project: SavedProjectSnapshot) => {
    const now = new Date().toISOString();
    await saveProject({
      ...project,
      id: createProjectId(),
      name: `${project.name} Copy`,
      createdAt: now,
      updatedAt: now,
      state: {
        ...project.state,
        currentProjectId: null,
        currentProjectCreatedAt: null,
        projectName: `${project.name} Copy`,
      },
    });
    toast(t('projects.toastDuplicated'));
    await refresh();
  };

  const handleDeleteProject = async (project: SavedProjectSnapshot) => {
    await deleteProject(project.id);
    toast(t('projects.toastDeleted'));
    await refresh();
  };

  const handleExportProject = (project: SavedProjectSnapshot) => {
    const payload = toProjectExportFile(project);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.myp-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(t('projects.toastExported'));
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const project = await parseProjectFile(file);
      const importedAt = new Date().toISOString();
      await saveProject({
        ...project,
        id: createProjectId(),
        name: `${project.name} (Imported)`,
        updatedAt: importedAt,
      });
      toast(t('projects.toastImported'));
      await refresh();
    } catch {
      toast(t('projects.toastImportFailed'));
    } finally {
      event.target.value = '';
    }
  };

  const handleCleanup = async () => {
    const removed = await cleanupProjects(10);
    if (removed > 0) {
      toast(t('projects.toastCleanup', { count: removed }));
    } else {
      toast(t('projects.toastCleanupNone'));
    }
    await refresh();
  };

  const handleClearAll = async () => {
    if (!window.confirm(t('projects.confirmClearAll'))) return;
    await clearProjects();
    toast(t('projects.toastCleared'));
    await refresh();
  };

  const cardCls =
    'bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-3';

  return (
    <main className="mx-auto flex w-full max-w-[920px] flex-col gap-4 px-5 py-8">
      <h2 className="bg-gradient-to-br from-[var(--accent)] to-[#a78bfa] bg-clip-text font-bold text-2xl text-transparent">
        {t('projects.title')}
      </h2>

      <div className={cardCls}>
        <p className="mb-3 font-bold text-[0.75rem] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          {t('projects.current')}
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={state.projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder={t('projects.namePlaceholder')}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.85rem] text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleSaveCurrent}
            disabled={isSaving}
            className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 font-semibold text-[0.82rem] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('projects.saveCurrent')}
          </button>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 font-semibold text-[0.82rem] text-[var(--text)] hover:border-[var(--accent)]">
            {t('projects.import')}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
      </div>

      <div className={`${cardCls} grid gap-2 sm:grid-cols-4`}>
        <div>
          <p className="text-[0.68rem] text-[var(--text-muted)] uppercase">{t('projects.count')}</p>
          <p className="font-semibold text-[0.9rem] text-[var(--text)]">{stats.count}</p>
        </div>
        <div>
          <p className="text-[0.68rem] text-[var(--text-muted)] uppercase">
            {t('projects.newest')}
          </p>
          <p className="text-[0.84rem] text-[var(--text)]">
            {stats.newestUpdatedAt ? formatDateTime(stats.newestUpdatedAt) : '-'}
          </p>
        </div>
        <div>
          <p className="text-[0.68rem] text-[var(--text-muted)] uppercase">
            {t('projects.batchCount')}
          </p>
          <p className="font-semibold text-[0.9rem] text-[var(--text)]">
            {totalBatchFilesPotential}
          </p>
        </div>
        <div className="flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={handleCleanup}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-[0.78rem] text-[var(--text)] hover:border-[var(--accent)]"
          >
            {t('projects.cleanup')}
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-[var(--radius-sm)] border border-[var(--danger)] px-3 py-2 text-[0.78rem] text-[var(--danger)]"
          >
            {t('projects.clearAll')}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className={cardCls}>{t('projects.loading')}</div>
        ) : projects.length === 0 ? (
          <div className={cardCls}>{t('projects.empty')}</div>
        ) : (
          projects.map((project) => (
            <article key={project.id} className={cardCls}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[0.95rem] text-[var(--text)]">
                    {project.name}
                  </h3>
                  <p className="text-[0.78rem] text-[var(--text-muted)]">
                    {t('projects.updatedAt')} {formatDateTime(project.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenProject(project)}
                    className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-1.5 font-semibold text-[0.76rem] text-white"
                  >
                    {t('projects.open')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportProject(project)}
                    className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-[0.76rem] text-[var(--text)]"
                  >
                    {t('projects.export')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateProject(project)}
                    className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-[0.76rem] text-[var(--text)]"
                  >
                    {t('projects.duplicate')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project)}
                    className="rounded-[var(--radius-sm)] border border-[var(--danger)] px-3 py-1.5 text-[0.76rem] text-[var(--danger)]"
                  >
                    {t('projects.delete')}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
