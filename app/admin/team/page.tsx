import { requireAdminAccess } from '@/lib/admin-auth';
import TeamPanel from './panel';
import AdminChrome from '../chrome';
export const dynamic='force-dynamic';
export default async function TeamPage(){await requireAdminAccess('/admin/team','team');return <AdminChrome active="team" title="المشرفون والصلاحيات"><TeamPanel/></AdminChrome>;}
