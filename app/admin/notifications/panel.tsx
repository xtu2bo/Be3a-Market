'use client';
import { useEffect, useState } from 'react';
import { Bell, Check, Eye } from 'lucide-react';
type Notification={id:string;type:string;title:string;body:string;href:string;read:number;created:number};
export default function NotificationsPanel(){const [items,setItems]=useState<Notification[]>([]);const [permission,setPermission]=useState<NotificationPermission|'unsupported'>('default');
 async function load(read=false){const r=await fetch('/api/analytics'+(read?'?read=1':''));if(r.ok){const v=await r.json() as {notifications:Notification[]};setItems(v.notifications||[]);}}
 useEffect(()=>{if('Notification' in window)setPermission(Notification.permission);else setPermission('unsupported');void load();},[]);
 async function enable(){if(!('Notification' in window))return;setPermission(await Notification.requestPermission());}
 return <main className="standalone-admin-page"><div className="admin-heading"><div><p className="eyebrow">BE3A / NOTIFICATIONS</p><h1>التنبيهات</h1><p>كل الطلبات والتنبيهات المهمة في مكان واحد.</p></div><button className="secondary" onClick={()=>void load(true)}><Check size={17}/>تحديد الكل كمقروء</button></div><section className="admin-card notification-page-card"><div className="notification-actions"><button onClick={()=>void enable()}><Bell size={16}/>{permission==='granted'?'تنبيهات المتصفح مفعّلة':'تفعيل إشعارات الموبايل والمتصفح'}</button><a href="/admin/orders">عرض الطلبات ←</a></div>{items.length?<div className="notification-list notification-page-list">{items.map(n=><a href={n.href} key={n.id} className={n.read?'':'unread'}><span>{n.type==='order'?'🛍️':'📦'}</span><div><strong>{n.title}</strong><p>{n.body}</p><small>{new Date(n.created).toLocaleString('ar-EG')}</small></div><Eye size={16}/></a>)}</div>:<div className="empty-state"><Bell size={40}/><h2>مفيش تنبيهات حاليًا</h2><p>أي طلب جديد أو نقص في المخزون هيظهر هنا فورًا.</p></div>}</section></main>;
}
