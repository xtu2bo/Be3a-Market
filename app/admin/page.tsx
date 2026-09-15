import { requireAdminAccess } from '@/lib/admin-auth';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function AdminPage(){await requireAdminAccess('/admin');return <Admin/>;}
