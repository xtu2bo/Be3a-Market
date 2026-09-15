import { requireAdminAccess } from '@/lib/admin-auth';
import AdminReports from '../reports';
import AdminChrome from '../chrome';
export const dynamic='force-dynamic';
export default async function AnalyticsPage(){await requireAdminAccess('/admin/analytics','analytics');return <AdminChrome active="analytics" title="التحليلات والتقارير"><AdminReports/></AdminChrome>;}
