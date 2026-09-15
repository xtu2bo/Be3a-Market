import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

const SESSION_COOKIE = 'be3a_admin_session';
const ADMIN_EMAIL = 'be3amarket@gmail.com';
const SESSION_DAYS = 30;

type CredentialRow = { email: string; salt: string; hash: string; iterations: number };

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}
function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}
function readCookie(value: string | undefined, name: string) {
  if (!value) return '';
  const pair = value.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : '';
}
function passwordBytes(password: string) { return new TextEncoder().encode(password); }

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', passwordBytes(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
}
async function secureCompare(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

export async function ensureAdminTables() {
  const database = db();
  await database.batch([
    database.prepare('CREATE TABLE IF NOT EXISTS admin_credentials (id INTEGER PRIMARY KEY CHECK (id=1), email TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, iterations INTEGER NOT NULL, created INTEGER NOT NULL)'),
    database.prepare('CREATE TABLE IF NOT EXISTS admin_sessions (token TEXT PRIMARY KEY, email TEXT NOT NULL, expires INTEGER NOT NULL, created INTEGER NOT NULL, role TEXT NOT NULL DEFAULT \'owner\', permissions TEXT NOT NULL DEFAULT \'["*"]\')'),
    database.prepare('CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, iterations INTEGER NOT NULL, permissions TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created INTEGER NOT NULL)'),
  ]);
  for (const statement of [
    'ALTER TABLE admin_sessions ADD COLUMN role TEXT NOT NULL DEFAULT \'owner\'',
    'ALTER TABLE admin_sessions ADD COLUMN permissions TEXT NOT NULL DEFAULT \'["*"]\'',
  ]) { try { await database.prepare(statement).run(); } catch { /* columns already exist */ } }
}

async function credential() {
  await ensureAdminTables();
  return db().prepare('SELECT email,salt,hash,iterations FROM admin_credentials WHERE id=1').first<CredentialRow>();
}

export function adminEmail() { return ADMIN_EMAIL; }

export async function chatGPTIsOwner() {
  const user = await getChatGPTUser();
  return !!user && (user.email.toLowerCase() === ADMIN_EMAIL || ((import.meta as ImportMeta & {env:{DEV:boolean}}).env.DEV && user.userId === 'local_seedy'));
}

export async function createSession(email = ADMIN_EMAIL, role = 'owner', permissions = ['*']) {
  await ensureAdminTables();
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = bytesToBase64(tokenBytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const expires = Date.now() + SESSION_DAYS * 86400000;
  await db().prepare('INSERT INTO admin_sessions(token,email,expires,created,role,permissions) VALUES(?,?,?,?,?,?)').bind(token, email, expires, Date.now(), role, JSON.stringify(permissions)).run();
  return { token, expires };
}

export function sessionCookie(token: string, requestUrl?: string) {
  const secure = requestUrl?.startsWith('https://') ? '; Secure' : '';
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}
export function clearSessionCookie(requestUrl?: string) {
  const secure = requestUrl?.startsWith('https://') ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function sessionOwner() {
  await ensureAdminTables();
  const requestHeaders = await headers();
  const token = readCookie(requestHeaders.get('cookie') ?? undefined, SESSION_COOKIE);
  if (!token) return null;
  const row = await db().prepare('SELECT email,expires,role,permissions FROM admin_sessions WHERE token=? AND expires>?').bind(token, Date.now()).first<{email:string;expires:number;role:string;permissions:string}>();
  return row ? {...row, permissions: JSON.parse(row.permissions || '["*"]') as string[]} : null;
}

export async function passwordConfigured() { return !!(await credential()); }

export async function setupPassword(email: string, password: string) {
  if (email.toLowerCase() !== ADMIN_EMAIL) throw new Error('استخدمي إيميل إدارة بيعة الصحيح');
  if (password.length < 10 || password.length > 128) throw new Error('كلمة المرور لازم تكون من 10 إلى 128 حرفًا');
  if (!(await chatGPTIsOwner())) throw new Error('لإنشاء كلمة المرور، سجّلي أولًا بحساب ChatGPT المصرّح له');
  if (await credential()) throw new Error('كلمة المرور متجهزة بالفعل. استخدمي تسجيل الدخول');
  const iterations = 120000;
  const salt = new Uint8Array(16); crypto.getRandomValues(salt);
  const hash = await derive(password, salt, iterations);
  await db().prepare('INSERT INTO admin_credentials(id,email,salt,hash,iterations,created) VALUES(1,?,?,?,?,?)').bind(ADMIN_EMAIL, bytesToBase64(salt), bytesToBase64(hash), iterations, Date.now()).run();
  return createSession(ADMIN_EMAIL);
}

export async function loginPassword(email: string, password: string) {
  const row = await credential();
  if (row && email.toLowerCase() === row.email.toLowerCase()) {
    const hash = await derive(password, base64ToBytes(row.salt), row.iterations);
    if (await secureCompare(hash, base64ToBytes(row.hash))) return createSession(row.email);
  }
  await ensureAdminTables();
  const supervisor = await db().prepare('SELECT email,salt,hash,iterations,permissions,active FROM admin_users WHERE lower(email)=lower(?)').bind(email).first<{email:string;salt:string;hash:string;iterations:number;permissions:string;active:number}>();
  if (supervisor?.active) {
    const hash = await derive(password, base64ToBytes(supervisor.salt), supervisor.iterations);
    if (await secureCompare(hash, base64ToBytes(supervisor.hash))) return createSession(supervisor.email, 'supervisor', JSON.parse(supervisor.permissions || '[]') as string[]);
  }
  throw new Error('الإيميل أو كلمة المرور غير صحيحة');
}

export async function currentAdmin() { return (await sessionOwner()) || (await chatGPTIsOwner() ? { email: ADMIN_EMAIL, role: 'owner', permissions: ['*'], expires: 0 } : null); }
export async function canManage(permission: string) { const user = await currentAdmin(); return !!user && (user.role === 'owner' || user.permissions.includes('*') || user.permissions.includes(permission)); }
export async function listSupervisors() { await ensureAdminTables(); return (await db().prepare('SELECT id,email,name,permissions,active,created FROM admin_users ORDER BY created DESC').all()).results.map((row: any) => ({...row, permissions: JSON.parse(row.permissions || '[]'), active: !!row.active})); }
export async function addSupervisor(name: string, email: string, password: string, permissions: string[]) {
  if (password.length < 10 || password.length > 128) throw new Error('كلمة المرور لازم تكون من 10 إلى 128 حرفًا');
  if (!email.includes('@') || name.trim().length < 2) throw new Error('راجعي اسم وإيميل المشرف');
  await ensureAdminTables();
  const iterations = 120000; const salt = new Uint8Array(16); crypto.getRandomValues(salt); const hash = await derive(password, salt, iterations);
  await db().prepare('INSERT INTO admin_users(id,email,name,salt,hash,iterations,permissions,active,created) VALUES(?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), email.trim().toLowerCase(), name.trim(), bytesToBase64(salt), bytesToBase64(hash), iterations, JSON.stringify(permissions), 1, Date.now()).run();
}
export async function updateSupervisor(id: string, name: string, email: string, password: string, permissions: string[]) {
  if (!id || !email.includes('@') || name.trim().length < 2) throw new Error('راجعي اسم وإيميل المشرف');
  if (password && (password.length < 10 || password.length > 128)) throw new Error('كلمة المرور لازم تكون من 10 إلى 128 حرفًا');
  await ensureAdminTables();
  if (password) {
    const iterations = 120000; const salt = new Uint8Array(16); crypto.getRandomValues(salt); const hash = await derive(password, salt, iterations);
    await db().prepare('UPDATE admin_users SET name=?,email=?,salt=?,hash=?,iterations=?,permissions=? WHERE id=?').bind(name.trim(), email.trim().toLowerCase(), bytesToBase64(salt), bytesToBase64(hash), iterations, JSON.stringify(permissions), id).run();
  } else await db().prepare('UPDATE admin_users SET name=?,email=?,permissions=? WHERE id=?').bind(name.trim(), email.trim().toLowerCase(), JSON.stringify(permissions), id).run();
}
export async function removeSupervisor(id: string) { await ensureAdminTables(); await db().prepare('DELETE FROM admin_users WHERE id=?').bind(id).run(); }

export async function logoutSession() {
  const requestHeaders = await headers();
  const token = readCookie(requestHeaders.get('cookie') ?? undefined, SESSION_COOKIE);
  if (token) { await ensureAdminTables(); await db().prepare('DELETE FROM admin_sessions WHERE token=?').bind(token).run(); }
}

export async function isAdminSession() { return !!(await sessionOwner()); }

export async function requireAdminAccess(returnTo: string, permission?: string) {
  const user = await currentAdmin();
  if (!user) { redirect(`/admin/login?return_to=${encodeURIComponent(returnTo)}`); return; }
  if (permission && user.role !== 'owner' && !user.permissions.includes('*') && !user.permissions.includes(permission)) redirect('/admin?denied=1');
}

export async function requestSessionCookie() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? '';
}
