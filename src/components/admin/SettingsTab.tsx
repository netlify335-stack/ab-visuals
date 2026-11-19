import { useEffect, useState } from 'react';
import { SUPABASE_SQL } from '../../lib/defaults';
import { useData } from '../../lib/DataContext';
import { setPass, isDefaultPasscode } from '../../lib/auth';
import {
  exportBackup,
  importBackup,
  loadInquiries,
  resetSiteContent,
  testCloudConfig,
} from '../../lib/store';
import { getSupabaseConfig, hasEnvConfig, saveSupabaseConfig } from '../../lib/supabase';
import type { Inquiry } from '../../lib/types';
import { Card, Field } from './AdminUI';
import { CheckIcon, LockIcon } from '../Icons';

type Props = { toast: (m: string, e?: boolean) => void };

export default function SettingsTab({ toast }: Props) {
  const { mode, modeReason, refresh, content, projects } = useData();
  const cfg = getSupabaseConfig();
  const [url, setUrl] = useState(cfg?.url || '');
  const [key, setKey] = useState(cfg?.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [leads, setLeads] = useState<Inquiry[]>([]);

  useEffect(() => {
    void loadInquiries().then(setLeads).catch(() => setLeads([]));
  }, []);

  const test = async () => {
    setTesting(true);
    try {
      const result = await testCloudConfig({ url: url.trim(), anonKey: key.trim() });
      setTestResult(result);
    } catch (err) {
      setTestResult({ ok: false, message: (err as Error).message });
    } finally {
      setTesting(false);
    }
  };

  const connect = async () => {
    if (!url.trim() || !key.trim()) {
      toast('Add both the project URL and the anon/publishable key', true);
      return;
    }
    saveSupabaseConfig({ url: url.trim(), anonKey: key.trim() });
    toast('Cloud config saved — reloading…');
    window.setTimeout(() => window.location.reload(), 700);
  };

  const disconnect = () => {
    saveSupabaseConfig(null);
    toast('Cloud config cleared — reloading…');
    window.setTimeout(() => window.location.reload(), 600);
  };

  const download = async () => {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ab-visuals-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup downloaded');
  };

  const upload = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await importBackup(parsed);
      await refresh();
      toast('Backup imported');
    } catch (err) {
      toast(`Import failed: ${(err as Error).message}`, true);
    }
  };

  const changePass = async () => {
    if (newPass.length < 6) {
      toast('Use at least 6 characters', true);
      return;
    }
    if (newPass !== confirmPass) {
      toast('Passcodes do not match', true);
      return;
    }
    await setPass(newPass);
    setNewPass('');
    setConfirmPass('');
    toast('Admin passcode updated');
  };

  const resetText = async () => {
    if (!window.confirm('Reset all website text, badge fields and services back to the AB VISUALS defaults? Projects are kept.')) return;
    await resetSiteContent();
    await refresh();
    toast('Website text reset to defaults');
  };

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL);
      toast('SQL copied — paste it into the Supabase SQL editor');
    } catch {
      toast('Copy failed — select the SQL manually', true);
    }
  };

  return (
    <>
      <h2 className="adm-page-title">Database &amp; Security</h2>
      <p className="adm-page-sub">Connect your Supabase cloud so every phone and laptop sees the same projects, photos and copy.</p>

      <div className={`adm-note ${mode === 'cloud' ? 'ok' : 'warn'}`}>
        {mode === 'cloud' ? (
          <>
            <CheckIcon className="w-4 h-4" /> <strong>Cloud sync live.</strong>&nbsp;Projects, photos and site text are stored in Supabase
            and served to all visitors.
          </>
        ) : (
          <>
            <LockIcon className="w-4 h-4" /> <strong>Local preview store.</strong>&nbsp;{modeReason || 'Connect Supabase below to sync across devices.'}
          </>
        )}
      </div>

      <Card title="Connect Supabase Cloud" desc="Create a project at supabase.com, run the SQL below, then paste the project URL and anon key.">
        <div className="adm-grid2">
          <Field label="Project URL" full hint="Settings → API → Project URL, e.g. https://abcdefgh.supabase.co">
            <input className="adm-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-project.supabase.co" />
          </Field>
          <Field label="Anon / publishable key" full hint="Safe for the browser — row level security protects writes.">
            <input className="adm-input" value={key} onChange={(e) => setKey(e.target.value)} placeholder="eyJhbGciOi… or sb_publishable_…" />
          </Field>
        </div>
        {testResult ? (
          <div className={`adm-note ${testResult.ok ? 'ok' : 'warn'}`} style={{ marginTop: 12, marginBottom: 0 }}>
            {testResult.message}
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" className="adm-btn dark" onClick={test} disabled={testing || !url || !key}>
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          <button type="button" className="adm-btn primary" onClick={connect}>
            Save &amp; connect
          </button>
          {(cfg || hasEnvConfig) && (
            <button type="button" className="adm-btn ghost" onClick={disconnect}>
              Disconnect
            </button>
          )}
        </div>
        {hasEnvConfig ? (
          <p className="adm-hint" style={{ marginTop: 10 }}>
            A build-time Supabase config is present (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Any config saved here overrides it.
          </p>
        ) : null}
      </Card>

      <Card
        title="1-minute Supabase setup"
        desc="Creates the projects, site_content and inquiries tables, the public ab-visuals-media bucket and its access policies."
        action={
          <button type="button" className="adm-btn dark tiny" onClick={copySql}>
            Copy SQL
          </button>
        }
      >
        <textarea className="adm-code" readOnly value={SUPABASE_SQL} onFocus={(e) => e.currentTarget.select()} />
      </Card>

      <Card title="Admin passcode" desc={isDefaultPasscode() ? 'You are still on the default passcode — change it now.' : 'Passcode protects /amit231106.'}>
        <div className="adm-grid2">
          <Field label="New passcode">
            <input className="adm-input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Confirm passcode">
            <input className="adm-input" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} autoComplete="new-password" />
          </Field>
        </div>
        <button type="button" className="adm-btn dark" style={{ marginTop: 12 }} onClick={changePass}>
          Update passcode
        </button>
      </Card>

      <Card title="Backup & reset" desc={`${projects.length} projects · ${content.services.length} services · site copy included`}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="adm-btn dark" onClick={() => void download()}>
            Export site backup (JSON)
          </button>
          <label className="adm-btn ghost" style={{ cursor: 'pointer' }}>
            Import backup
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = '';
              }}
            />
          </label>
          <button type="button" className="adm-btn danger" onClick={() => void resetText()}>
            Reset text to defaults
          </button>
        </div>
      </Card>

      <Card title="Recent inquiries" desc="Every enquiry submitted through the site is logged here.">
        {leads.length ? (
          <div className="adm-list">
            {leads.map((lead, i) => (
              <div className="adm-item" key={lead.id || i} style={{ alignItems: 'flex-start' }}>
                <div className="main">
                  <strong>
                    {lead.name} · {lead.phone}
                  </strong>
                  <div className="meta" style={{ whiteSpace: 'normal' }}>
                    {lead.shoot_type}
                    {lead.shoot_date ? ` · ${lead.shoot_date}` : ''}
                    {lead.location ? ` · ${lead.location}` : ''}
                  </div>
                  {lead.message ? (
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>{lead.message}</div>
                  ) : null}
                </div>
                <span className="adm-pill">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'new'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="adm-empty">No inquiries yet.</div>
        )}
      </Card>
    </>
  );
}
