import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SITE_CONTENT } from './defaults';
import {
  deleteProject as deleteProjectApi,
  getStatus,
  initStore,
  loadProjects,
  loadSiteContent,
  saveProject as saveProjectApi,
  saveProjectOrder,
  saveSiteContent,
  type UploadProgress,
} from './store';
import type { Project, SiteContent, StoreMode } from './types';

type DataContextType = {
  loading: boolean;
  mode: StoreMode;
  modeReason: string | null;
  projects: Project[];
  publicProjects: Project[];
  content: SiteContent;
  refresh: () => Promise<void>;
  updateContent: (next: SiteContent) => Promise<void>;
  persistProject: (project: Project) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
  reorderProjects: (projects: Project[]) => Promise<void>;
  error: string | null;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [mode, setMode] = useState<StoreMode>('local');
  const [modeReason, setModeReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const status = await initStore(true);
      setMode(status.mode);
      setModeReason(status.reason);
      const [nextProjects, nextContent] = await Promise.all([loadProjects(), loadSiteContent()]);
      setProjects(nextProjects);
      setContent(nextContent);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateContent = useCallback(async (next: SiteContent) => {
    setContent(next);
    await saveSiteContent(next);
  }, []);

  const persistProject = useCallback(
    async (project: Project) => {
      const saved = await saveProjectApi(project);
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        const next = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
        return next.sort((a, b) => a.sort_order - b.sort_order);
      });
      return saved;
    },
    []
  );

  const removeProject = useCallback(async (id: string) => {
    await deleteProjectApi(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const reorderProjects = useCallback(async (list: Project[]) => {
    const ordered = list.map((p, i) => ({ ...p, sort_order: i + 1 }));
    setProjects(ordered);
    await saveProjectOrder(ordered);
  }, []);

  const publicProjects = useMemo(() => projects.filter((p) => p.is_published), [projects]);

  const value: DataContextType = {
    loading,
    mode: mode || getStatus().mode,
    modeReason,
    projects,
    publicProjects,
    content,
    refresh,
    updateContent,
    persistProject,
    removeProject,
    reorderProjects,
    error,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}

export type { UploadProgress };
