'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Bell, ExternalLink, LayoutDashboard, LogOut, Package, Settings2, ShoppingBag, TicketPercent, Truck, Users, UserCircle2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import Preferences from '../preferences';

const nav = [
  { id: 'overview', name: 'نظرة عامة', icon: LayoutDashboard, path: '/admin' },
  { id: 'products', name: 'المنتجات', icon: Package, path: '/admin/products' },
  { id: 'orders', name: 'الطلبات', icon: ShoppingBag, path: '/admin/orders' },
  { id: 'analytics', name: 'التحليلات والزيارات', icon: BarChart3, path: '/admin/analytics' },
  { id: 'coupons', name: 'كوبونات الخصم', icon: TicketPercent, path: '/admin/coupons' },
  { id: 'categories', name: 'الأقسام', icon: Package, path: '/admin/categories' },
  { id: 'shipping', name: 'المحافظات والتوصيل', icon: Truck, path: '/admin/shipping' },
  { id: 'notifications', name: 'التنبيهات', icon: Bell, path: '/admin/notifications' },
  { id: 'team', name: 'المشرفون والصلاحيات', icon: Users, path: '/admin/team' },
  { id: 'settings', name: 'إعدادات المتجر', icon: Settings2, path: '/admin/settings' },
  { id: 'profile', name: 'البروفايل الشخصي', icon: UserCircle2, path: '/admin/profile' },
];

export default function AdminChrome({ active, title, children }: { active: string; title: string; children: React.ReactNode }) {
  const [viewer, setViewer] = useState<{role:string;permissions:string[]}>({role:'owner',permissions:['*']});
  const [visitTotal, setVisitTotal] = useState(0);
  useEffect(() => { void Promise.all([fetch('/api/admin').then(r=>r.json()),fetch('/api/analytics').then(r=>r.json())]).then(([adminRaw,analyticsRaw])=>{ const v=adminRaw as {viewer?:{role:string;permissions:string[]}}; const a=analyticsRaw as {totalVisits?:number}; if(v.viewer) setViewer(v.viewer); setVisitTotal(Number(a.totalVisits||0)); }).catch(()=>{}); }, []);
  const visibleNav = nav.filter(item => { const permission=item.id==='categories'?'settings':item.id==='notifications'?'analytics':item.id; return item.id === 'profile' || viewer.role === 'owner' || viewer.permissions.includes('*') || (item.id !== 'team' && viewer.permissions.includes(permission)); });
  return <SidebarProvider>
    <Sidebar side="right" className="admin-sidebar">
      <SidebarHeader><a href="/" className="admin-wordmark">بيعة<span>لوحة إدارة المتجر</span></a></SidebarHeader>
      <SidebarContent><SidebarMenu>{visibleNav.map(item => <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild isActive={active === item.id}>
          <a href={item.path}><item.icon /><span>{item.name}</span>{item.id==='analytics'&&<b className="sidebar-count" title="زيارات آخر 7 أيام">{visitTotal>999?'+999':visitTotal}</b>}</a>
        </SidebarMenuButton>
      </SidebarMenuItem>)}</SidebarMenu></SidebarContent>
      <SidebarFooter>
        <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={17}/>عرض المتجر</a>
        <a href="/api/auth?mode=logout&return_to=/admin/login" target="_top"><LogOut size={17}/>تسجيل الخروج</a>
        <small dir="ltr">be3amarket@gmail.com</small>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset className="admin-surface">
      <header className="admin-top">
        <div><SidebarTrigger aria-label="فتح قائمة لوحة الإدارة"/><span>{title}</span></div>
        <div><Preferences embedded/><span className="live-tag">لوحة الإدارة</span><a className="admin-view-store" href="/" target="_blank" rel="noreferrer">عرض المتجر</a></div>
      </header>
      {children}
    </SidebarInset>
  </SidebarProvider>;
}
