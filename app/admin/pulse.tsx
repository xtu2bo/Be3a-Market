'use client';
import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';

type Notification = { id: string; type: string; title: string; body: string; href: string; read: number; created: number };
type Data = { notifications: Notification[] };

export default function AdminPulse() {
  const [data, setData] = useState<Data | null>(null);
  const lastNotification = useRef('');
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
async function load(read = false) { try { const r = await fetch('/api/analytics' + (read ? '?read=1' : '')); if (r.ok) { const value = await r.json() as Data; const fresh = value.notifications.find(n=>!n.read); if (fresh && fresh.id!==lastNotification.current && lastNotification.current && permission==='granted') new Notification(fresh.title,{body:fresh.body}); if (fresh) lastNotification.current=fresh.id; setData(value); } } catch {} }
  useEffect(() => { if ('Notification' in window) setPermission(Notification.permission); void load(); const timer = window.setInterval(() => void load(), 30000); return () => window.clearInterval(timer); }, [permission]);
  const notifications = data?.notifications ?? [];
  const unread = notifications.filter(n => !n.read).length;
  async function enableNotifications() { if (!('Notification' in window)) { setPermission('unsupported'); return; } const result = await Notification.requestPermission(); setPermission(result); }
  return <div className="admin-pulse"><button className={unread ? 'pulse-bell has-alert' : 'pulse-bell'} aria-label="إشعارات الإدارة" title="إشعارات الإدارة" onClick={() => { setOpen(v => !v); if (unread) void load(true); }}><Bell size={19}/>{unread > 0 && <b>{unread > 9 ? '9+' : unread}</b>}</button>{open&&<div className="admin-notification-panel"><div className="notification-heading"><strong>تنبيهات المتجر</strong><button onClick={() => setOpen(false)} aria-label="إغلاق"><X size={16}/></button></div>{notifications.length?<div className="notification-list">{notifications.slice(0,8).map(n=><a href={n.href} key={n.id} onClick={() => setOpen(false)} className={n.read?'':'unread'}><span>{n.type==='order'?'🛍️':'📦'}</span><div><strong>{n.title}</strong><p>{n.body}</p><small>{new Date(n.created).toLocaleString('ar-EG')}</small></div></a>)}</div>:<p className="notification-empty">مفيش تنبيهات جديدة.</p>}<div className="notification-actions"><button onClick={enableNotifications}>{permission==='granted'?'تنبيهات المتصفح مفعّلة':'فعّلي تنبيهات المتصفح'}</button><a href="/admin/orders">عرض الطلبات ←</a><a href="/api/auth?mode=logout&return_to=/admin/login">خروج</a></div></div>}</div>;
}
