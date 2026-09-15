import { requireAdminAccess } from '@/lib/admin-auth';
import CouponsPanel from './panel';
import AdminChrome from '../chrome';
export const dynamic='force-dynamic';
export default async function CouponsPage(){await requireAdminAccess('/admin/coupons','coupons');return <AdminChrome active="coupons" title="كوبونات الخصم"><CouponsPanel/></AdminChrome>;}
