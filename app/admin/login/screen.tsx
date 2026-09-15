'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import Preferences from '../../preferences';

type LoginMode = 'owner' | 'supervisor';

export default function AdminLogin() {
  const [configured, setConfigured] = useState(true);
  const [chatGPTAuthenticated, setChatGPTAuthenticated] = useState(false);
  const [mode, setMode] = useState<'login'|'setup'>('login');
  const [loginMode, setLoginMode] = useState<LoginMode>('owner');
  const [email, setEmail] = useState('be3amarket@gmail.com');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const returnTo = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('return_to') || '/admin' : '/admin';

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then((raw: unknown) => {
      const v = raw as { configured: boolean; chatGPTAuthenticated: boolean };
      setConfigured(v.configured); setChatGPTAuthenticated(v.chatGPTAuthenticated);
      if (!v.configured && v.chatGPTAuthenticated) setMode('setup');
    }).catch(() => {});
  }, []);

  function chooseLogin(next: LoginMode) {
    setLoginMode(next); setError(''); setPassword('');
    if (next === 'owner') setEmail('be3amarket@gmail.com'); else setEmail('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    if (mode === 'setup' && password !== confirm) { setError('كلمتا المرور غير متطابقتين'); setBusy(false); return; }
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: mode, email, password }) });
      const v = await r.json() as { error?: string };
      if (!r.ok) throw Error(v.error || 'تعذر تسجيل الدخول');
      window.location.assign(returnTo);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }

  async function chatGPTLogin() {
    if (chatGPTAuthenticated) { setLoginMode('owner'); setMode('setup'); return; }
    window.location.assign('/signin-with-chatgpt?return_to=/admin/login');
  }

  return <main className="admin-login-page">
    <div className="login-orbit login-orbit-one" aria-hidden="true"/><div className="login-orbit login-orbit-two" aria-hidden="true"/>
    <div className="admin-login-card">
      <div className="login-toolbar"><span>BE3A / ADMIN</span><Preferences embedded/></div>
      <a href="/" className="admin-login-brand"><span>ب</span><strong>بيعة</strong><small>إدارة المتجر</small></a>
      <ShieldCheck size={38} className="login-icon" aria-hidden="true"/>
      <h1>{mode === 'setup' ? 'اعملي كلمة مرور الإدارة' : 'دخول لوحة الإدارة'}</h1>
      <p>{mode === 'setup' ? 'أكدي الحساب المصرّح له مرة واحدة، وبعدها ادخلي بالإيميل وكلمة المرور.' : 'اختاري طريقة الدخول لإدارة المنتجات والطلبات والزيارات.'}</p>
      {mode === 'login' && <div className="login-choice-grid" role="tablist" aria-label="نوع حساب الإدارة">
        <button type="button" role="tab" aria-selected={loginMode === 'owner'} className={loginMode === 'owner' ? 'selected' : ''} onClick={() => chooseLogin('owner')}><UserRound size={18}/><span><strong>حساب المالك</strong><small>be3amarket@gmail.com</small></span></button>
        <button type="button" role="tab" aria-selected={loginMode === 'supervisor'} className={loginMode === 'supervisor' ? 'selected' : ''} onClick={() => chooseLogin('supervisor')}><UsersRound size={18}/><span><strong>حساب مشرف</strong><small>إيميل المشرف وكلمة مروره</small></span></button>
      </div>}
      <form onSubmit={submit}>
        <label>الإيميل<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" dir="ltr" placeholder={loginMode === 'owner' ? 'be3amarket@gmail.com' : 'supervisor@example.com'}/></label>
        <label>كلمة المرور<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={10} autoComplete={mode === 'setup' ? 'new-password' : 'current-password'} dir="ltr" placeholder="10 أحرف أو أكثر"/></label>
        {mode === 'setup' && <label>تأكيد كلمة المرور<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={10} autoComplete="new-password" dir="ltr" placeholder="أعيدي كتابة كلمة المرور"/></label>}
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="primary login-submit" disabled={busy}>{busy ? 'جاري التحقق…' : mode === 'setup' ? 'حفظ كلمة المرور والدخول' : loginMode === 'owner' ? 'دخول المالك' : 'دخول المشرف'}<ArrowLeft size={18}/></button>
      </form>
      {mode === 'login' && !configured && chatGPTAuthenticated && <button className="login-secondary" onClick={() => setMode('setup')}><KeyRound size={17}/>إعداد كلمة مرور لأول مرة</button>}
      {mode === 'login' && <button className="login-secondary" onClick={chatGPTLogin}>{chatGPTAuthenticated ? 'تأكيد الحساب المصرّح له لإعداد كلمة المرور' : 'الدخول بالحساب المصرّح له'}</button>}
      <a className="login-store-link" href="/"><span>الذهاب إلى المتجر</span><ArrowLeft size={21}/></a>
    </div>
  </main>;
}

