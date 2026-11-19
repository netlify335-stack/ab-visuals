import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseConfig } from './types';

const LS_KEY = 'abv.supabase.config';
export const MEDIA_BUCKET = 'ab-visuals-media';

const env = import.meta.env as Record<string, string | undefined>;

export function getSupabaseConfig(): SupabaseConfig | null {
  let stored: SupabaseConfig | null = null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SupabaseConfig;
      if (parsed?.url && parsed?.anonKey) stored = parsed;
    }
  } catch {
    /* ignore */
  }
  if (stored) return stored;
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (url && anonKey) return { url, anonKey };
  return null;
}

export function saveSupabaseConfig(cfg: SupabaseConfig | null) {
  if (!cfg) localStorage.removeItem(LS_KEY);
  else localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

let cached: { key: string; client: SupabaseClient } | null = null;

export function getClient(cfg: SupabaseConfig | null = getSupabaseConfig()): SupabaseClient | null {
  if (!cfg) return null;
  const key = `${cfg.url}::${cfg.anonKey}`;
  if (cached?.key === key) return cached.client;
  const client = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false },
  });
  cached = { key, client };
  return client;
}

export const hasEnvConfig = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
