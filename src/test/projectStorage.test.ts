import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersistedWatermarkState, SavedProjectSnapshot } from '../lib/types';

const store = new Map<string, SavedProjectSnapshot>();

interface MockUpgradeDb {
  objectStoreNames: {
    contains: () => boolean;
  };
  createObjectStore: () => void;
}

vi.mock('idb', () => ({
  openDB: vi.fn(
    async (
      _name: string,
      _version: number,
      options?: { upgrade?: (db: MockUpgradeDb) => void },
    ) => {
      options?.upgrade?.({
        objectStoreNames: {
          contains: () => false,
        },
        createObjectStore: vi.fn(),
      });

      return {
        put: async (_store: string, project: SavedProjectSnapshot) => {
          store.set(project.id, project);
        },
        getAll: async () => Array.from(store.values()),
        get: async (_store: string, id: string) => store.get(id),
        delete: async (_store: string, id: string) => {
          store.delete(id);
        },
        clear: async () => {
          store.clear();
        },
      };
    },
  ),
}));

const baseState: PersistedWatermarkState = {
  activeTab: 'text',
  text: 'Watermark',
  font: 'Arial',
  size: 48,
  style: '',
  color: '#ffffff',
  wmImgScale: 25,
  position: 'free',
  opacity: 60,
  rotation: -30,
  margin: 20,
  freeX: 0.5,
  freeY: 0.5,
  mode: 'single',
  projectName: 'Demo',
  currentProjectId: null,
  currentProjectCreatedAt: null,
};

const makeProject = (id: string, name: string, updatedAt: string): SavedProjectSnapshot => ({
  id,
  name,
  createdAt: '2026-05-18T10:00:00.000Z',
  updatedAt,
  state: {
    ...baseState,
    projectName: name,
    currentProjectId: id,
    currentProjectCreatedAt: '2026-05-18T10:00:00.000Z',
  },
});

describe('projectStorage', () => {
  beforeEach(() => {
    store.clear();
    Object.defineProperty(globalThis, 'indexedDB', {
      value: {},
      configurable: true,
      writable: true,
    });
  });

  it('saves and lists projects sorted by updatedAt desc', async () => {
    const storage = await import('../lib/projectStorage');
    await storage.saveProject(makeProject('a', 'First', '2026-05-18T10:00:00.000Z'));
    await storage.saveProject(makeProject('b', 'Second', '2026-05-18T12:00:00.000Z'));

    const projects = await storage.listProjects();
    expect(projects.map((project) => project.id)).toEqual(['b', 'a']);
  });

  it('cleans up older snapshots and returns removed count', async () => {
    const storage = await import('../lib/projectStorage');
    await storage.saveProject(makeProject('a', 'One', '2026-05-18T10:00:00.000Z'));
    await storage.saveProject(makeProject('b', 'Two', '2026-05-18T11:00:00.000Z'));
    await storage.saveProject(makeProject('c', 'Three', '2026-05-18T12:00:00.000Z'));

    const removed = await storage.cleanupProjects(1);
    const projects = await storage.listProjects();

    expect(removed).toBe(2);
    expect(projects).toHaveLength(1);
    expect(projects[0]?.id).toBe('c');
  });

  it('builds storage stats', async () => {
    const storage = await import('../lib/projectStorage');
    await storage.saveProject(makeProject('a', 'First', '2026-05-18T10:00:00.000Z'));
    await storage.saveProject(makeProject('b', 'Second', '2026-05-18T12:00:00.000Z'));

    const stats = await storage.getStorageStats();
    expect(stats).toEqual({
      count: 2,
      newestUpdatedAt: '2026-05-18T12:00:00.000Z',
    });
  });

  it('exports and parses a valid project file', async () => {
    const storage = await import('../lib/projectStorage');
    const snapshot = makeProject('export-id', 'Export Demo', '2026-05-18T14:00:00.000Z');

    const file = storage.toProjectExportFile(snapshot);
    const parsed = await storage.parseProjectFile(
      new File([JSON.stringify(file)], 'export.json', { type: 'application/json' }),
    );

    expect(parsed).toEqual(snapshot);
  });

  it('rejects malformed and unsupported project files', async () => {
    const storage = await import('../lib/projectStorage');

    await expect(
      storage.parseProjectFile(new File(['not-json'], 'broken.json', { type: 'application/json' })),
    ).rejects.toThrow('Invalid JSON file.');

    await expect(
      storage.parseProjectFile(
        new File([JSON.stringify({ version: 99, project: {} })], 'unsupported.json', {
          type: 'application/json',
        }),
      ),
    ).rejects.toThrow('Unsupported project file format.');
  });
});
