import { DEFAULT_ADMIN_PASSCODE } from './defaults';

const HASH_KEY = 'abv.admin.hash';
const SESSION_KEY = 'abv.admin.session';

export async function hashPass(code: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return `plain:${code}`;
  }
}

export async function storedHash(): Promise<string> {
  return localStorage.getItem(HASH_KEY) || hashPass(DEFAULT_ADMIN_PASSCODE);
}

export async function verifyPass(code: string): Promise<boolean> {
  const attempt = await hashPass(code);
  return attempt === (await storedHash());
}

export async function setPass(code: string): Promise<void> {
  localStorage.setItem(HASH_KEY, await hashPass(code));
}

export function isSessionActive(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function startSession(): void {
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function endSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isDefaultPasscode(): boolean {
  return !localStorage.getItem(HASH_KEY);
}
