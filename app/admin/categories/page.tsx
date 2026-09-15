import { requireAdminAccess } from '@/lib/admin-auth';
import AdminChrome from '../chrome';
import CategoriesPanel from './panel';
export const dynamic='force-dynamic';
export default async function CategoriesPage(){await requireAdminAccess('/admin/categories','settings');return <AdminChrome active="categories" title="الأقسام"><CategoriesPanel/></AdminChrome>;}
