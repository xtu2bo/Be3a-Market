'use client';
import { useEffect } from 'react';
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (window.location.pathname.startsWith('/admin')) return;
      const key = 'be3a-visit-' + new Date().toISOString().slice(0, 10);
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      void fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
    } catch { /* private browsing can disable storage; the storefront remains usable */ }
  }, []);
  return null;
}
