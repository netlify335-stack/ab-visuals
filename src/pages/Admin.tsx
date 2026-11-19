import { useCallback, useEffect, useState } from 'react';
import ContactTab from '../components/admin/ContactTab';
import ProjectsTab from '../components/admin/ProjectsTab';
import SettingsTab from '../components/admin/SettingsTab';
import SiteTextTab from '../components/admin/SiteTextTab';
import { LockIcon } from '../components/Icons';
import { endSession, isDefaultPasscode, isSessionActive, startSession, verifyPass } from '../lib/auth';
import { useData } from '../lib/DataContext';

type Tab = 'projects' | 'contact' | 'text' | 'settings';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'projects', label: 'Projects & Media' },
  { id: 'contact', label: 'Contact & Socials' },
  { id: 'text', label: 'Website Text & Services' },
  { id: 'settings', label: 'Database & Security' },
];

export default function Admin() {
  const { mode, modeReason, projects } = useData();
  const [authed, setAuthed] = useState(isSessionActive());
  const [tab, setTab] = useState<Tab>('projects');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState<{ id: number; msg: string; error: boolean } | null>(null);

  const notify = useCallback((msg: string, error = false) => {
    setToast({ id: Date.now(), msg, error });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    window.history.replaceState({}, '', '/amit231106');
    document.body.classList.add('admin-mode');
    document.title = 'AB VISUALS · Studio Admin';
    return () => {
      document.body.classList.remove('admin-mode');
      document.title = 'AB VISUALS — Drone Pilot & Wedding Cinematographer';
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    const ok = await verifyPass(passcode);
    if (ok) {
      startSession();
      setAuthed(true);
      setPasscode('');
    } else {
      setError('Incorrect passcode. Try again.');
    }
    setChecking(false);
  };

  if (!authed) {
    return (
      <div className="adm-login">
        <form className="adm-login-card" onSubmit={submit}>
          <div className="eyebrow" style={{ color: 'var(--mint)', fontSize: 9.5 }}>AB VISUALS · STUDIO CMS</div>
          <h1>Admin Access</h1>
          <p>Enter the studio passcode to manage projects, photos, films and every line of copy on the site.</p>
          <label className="adm-field">
            <span className="adm-label">Passcode</span>
            <input
              className="adm-input"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
            />
          </label>
          {error ? <div className="adm-error">{error}</div> : null}
          <button type="submit" className="adm-btn primary wide" style={{ marginTop: 14 }} disabled={checking || !passcode}>
            <LockIcon className="w-4 h-4" /> {checking ? 'Checking…' : 'Unlock studio'}
          </button>
          {isDefaultPasscode() ? (
            <div className="adm-login-hint">
              First run — the default passcode is <code>amit231106</code>. Change it in Database &amp; Security after logging in.
            </div>
          ) : (
            <div className="adm-login-hint">Forgot the passcode? Clear this browser's site data to fall back to the default.</div>
          )}
          <a href="/" className="adm-back" style={{ marginTop: 16 }}>
            ← Back to ab visuals site
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-brand">
          <span className="mark">AB VISUALS</span>
          <span className="sub">Studio CMS</span>
          <span className={`adm-status ${mode}`} title={modeReason || undefined}>
            <i /> {mode === 'cloud' ? 'Cloud live' : 'Local preview'}
          </span>
        </div>
        <div className="adm-top-actions">
          <a href="/" className="adm-btn dark">
            View site ↗
          </a>
          <button
            type="button"
            className="adm-btn ghost"
            onClick={() => {
              endSession();
              setAuthed(false);
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="adm-tabs" aria-label="Admin sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`adm-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="adm-wrap">
        {mode === 'local' ? (
          <div className="adm-note warn">
            <LockIcon className="w-4 h-4" /> You are editing the <strong>local preview store</strong> in this browser. Connect Supabase in
            Database &amp; Security so photos and copy appear on every visitor's device.
          </div>
        ) : null}

        {tab === 'projects' && <ProjectsTab toast={notify} />}
        {tab === 'contact' && <ContactTab toast={notify} />}
        {tab === 'text' && <SiteTextTab toast={notify} />}
        {tab === 'settings' && <SettingsTab toast={notify} />}

        <footer style={{ marginTop: 30, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 11, color: 'rgba(255,255,255,.32)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span>AB VISUALS Studio CMS · /amit231106</span>
          <span>
            {projects.length} projects · {mode === 'cloud' ? 'Supabase cloud' : 'IndexedDB local'} storage
          </span>
        </footer>
      </main>

      {toast ? <div key={toast.id} className={`adm-toast ${toast.error ? 'error' : ''}`}>{toast.msg}</div> : null}
    </div>
  );
}
