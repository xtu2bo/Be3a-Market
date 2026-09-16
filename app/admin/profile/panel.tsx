'use client';

import { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type Viewer = { email: string; role: string; permissions: string[] };

export default function ProfilePanel() {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then((raw: unknown) => {
      const data = raw as { viewer?: Viewer; supervisors?: Array<{ email: string; name: string }> };
      if (data.viewer) {
        setViewer(data.viewer);
        const supervisor = data.supervisors?.find(item => item.email.toLowerCase() === data.viewer!.email.toLowerCase());
        setName(supervisor?.name || (data.viewer.role === 'owner' ? 'Mahmoud Ahmed' : 'مشرف بيعة'));
      }
    }).catch(() => toast.error('تعذر تحميل بيانات الحساب')).finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('كلمتا المرور الجديدة غير متطابقتين'); return; }
    if (newPassword.length < 10) { toast.error('كلمة المرور الجديدة لازم تكون 10 أحرف على الأقل'); return; }
    if (!window.confirm('تأكيد تغيير كلمة المرور؟')) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'changePassword', currentPassword, newPassword }) });
      const data = await r.json() as { error?: string };
      if (!r.ok) throw Error(data.error || 'تعذر تغيير كلمة المرور');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast.success('اتغيرت كلمة المرور بنجاح');
    } catch (error) { toast.error((error as Error).message); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="standalone-admin-page"><section className="admin-card profile-loading">جاري تحميل بيانات الحساب…</section></main>;
  const isOwner = viewer?.role === 'owner';
  return <main className="standalone-admin-page profile-page">
    <div className="admin-heading"><div><p className="eyebrow">BE3A / PROFILE</p><h1>البروفايل الشخصي</h1><p>بيانات الحساب وصلاحياته وتغيير كلمة المرور.</p></div></div>
    <section className="admin-card profile-identity">
      <div className="profile-avatar"><UserCircle2 size={34}/></div>
      <div><h2>{name}</h2><p dir="ltr">{viewer?.email}</p></div>
      <span className="profile-role"><ShieldCheck size={16}/>{isOwner ? 'المالك الأساسي' : 'مشرف'}</span>
    </section>
    <section className="admin-card profile-permissions">
      <h2><ShieldCheck size={19}/>نوع الحساب والصلاحيات</h2>
      <p>{isOwner ? 'حساب المالك الأساسي لديه كل صلاحيات المتجر وإدارة المشرفين.' : 'حساب مشرف بصلاحيات يحددها المالك الأساسي.'}</p>
      {!isOwner && <div className="permission-chips">{viewer?.permissions.map(permission => <span key={permission}>{permission === '*' ? 'كل الصلاحيات' : permission}</span>)}</div>}
    </section>
    <section className="admin-card profile-password-card">
      <h2><KeyRound size={19}/>تغيير كلمة المرور</h2>
      <p className="muted">اكتبي كلمة المرور الحالية أولًا وبعد التحقق منها اختاري كلمة مرور جديدة.</p>
      <form className="form-grid" onSubmit={save}>
        <label className="full">كلمة المرور الحالية<input required type="password" autoComplete="current-password" minLength={10} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} dir="ltr"/></label>
        <label>كلمة المرور الجديدة<input required type="password" autoComplete="new-password" minLength={10} value={newPassword} onChange={e => setNewPassword(e.target.value)} dir="ltr"/></label>
        <label>تأكيد كلمة المرور الجديدة<input required type="password" autoComplete="new-password" minLength={10} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} dir="ltr"/></label>
        <button className="primary full" disabled={busy}>{busy ? 'جاري تغيير كلمة المرور…' : 'تأكيد وتغيير كلمة المرور'}</button>
      </form>
    </section>
  </main>;
}
