import { openDB } from 'idb';
import type {
  PersistedWatermarkState,
  ProjectExportFile,
  SavedProjectSnapshot,
  StorageStats,
} from './types';

const DB_NAME = 'mark-your-picture-db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

interface ProjectDB {
  projects: {
    key: string;
    value: SavedProjectSnapshot;
  };
}

let projectDbPromise: Promise<import('idb').IDBPDatabase<ProjectDB>> | null = null;

const getProjectDb = () => {
  if (projectDbPromise) return projectDbPromise;
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not available in this environment.');
  }
  projectDbPromise = openDB<ProjectDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (db.objectStoreNames.contains(STORE_NAME)) return;
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
  });
  return projectDbPromise;
};

export const createProjectId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `project-${Math.random().toString(36).slice(2, 10)}`;
};

export const saveProject = async (project: SavedProjectSnapshot): Promise<void> => {
  const db = await getProjectDb();
  await db.put(STORE_NAME, project);
};

export const listProjects = async (): Promise<SavedProjectSnapshot[]> => {
  const db = await getProjectDb();
  const projects = await db.getAll(STORE_NAME);
  return projects.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

export const getProjectById = async (id: string): Promise<SavedProjectSnapshot | undefined> => {
  const db = await getProjectDb();
  return db.get(STORE_NAME, id);
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await getProjectDb();
  await db.delete(STORE_NAME, id);
};

export const clearProjects = async (): Promise<void> => {
  const db = await getProjectDb();
  await db.clear(STORE_NAME);
};

export const cleanupProjects = async (keepNewest: number): Promise<number> => {
  const projects = await listProjects();
  const removable = projects.slice(Math.max(0, keepNewest));
  await Promise.all(removable.map((project) => deleteProject(project.id)));
  return removable.length;
};

export const getStorageStats = async (): Promise<StorageStats> => {
  const projects = await listProjects();
  return {
    count: projects.length,
    newestUpdatedAt: projects[0]?.updatedAt ?? null,
  };
};

export const toProjectExportFile = (project: SavedProjectSnapshot): ProjectExportFile => ({
  version: 1,
  project,
});

const hasPersistedStateShape = (value: unknown): value is PersistedWatermarkState => {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<PersistedWatermarkState>;
  return (
    typeof entry.activeTab === 'string' &&
    typeof entry.text === 'string' &&
    typeof entry.font === 'string' &&
    typeof entry.size === 'number' &&
    typeof entry.style === 'string' &&
    typeof entry.color === 'string' &&
    (typeof entry.wmImageDataUrl === 'string' || entry.wmImageDataUrl == null) &&
    typeof entry.wmImgScale === 'number' &&
    typeof entry.position === 'string' &&
    typeof entry.opacity === 'number' &&
    typeof entry.rotation === 'number' &&
    typeof entry.margin === 'number' &&
    typeof entry.freeX === 'number' &&
    typeof entry.freeY === 'number' &&
    typeof entry.mode === 'string' &&
    typeof entry.projectName === 'string'
  );
};

const isSavedProjectSnapshot = (value: unknown): value is SavedProjectSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<SavedProjectSnapshot>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.createdAt === 'string' &&
    typeof entry.updatedAt === 'string' &&
    hasPersistedStateShape(entry.state)
  );
};

export const parseProjectFile = async (file: File): Promise<SavedProjectSnapshot> => {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid project file format.');
  }

  const payload = parsed as Partial<ProjectExportFile>;
  if (payload.version !== 1 || !isSavedProjectSnapshot(payload.project)) {
    throw new Error('Unsupported project file format.');
  }

  return payload.project;
};
