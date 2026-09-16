import { requireAdminAccess } from '@/lib/admin-auth';
import AdminChrome from '../chrome';
import ProfilePanel from './panel';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  await requireAdminAccess('/admin/profile');
  return <AdminChrome active="profile" title="البروفايل الشخصي"><ProfilePanel /></AdminChrome>;
}
