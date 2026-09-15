import { requireAdminAccess } from '@/lib/admin-auth';
import AdminChrome from '../chrome';
import NotificationsPanel from './panel';
export const dynamic='force-dynamic';
export default async function NotificationsPage(){await requireAdminAccess('/admin/notifications','analytics');return <AdminChrome active="notifications" title="التنبيهات"><NotificationsPanel/></AdminChrome>;}
