import { requireAdminAccess } from '@/lib/admin-auth';
import AdminChrome from '../chrome';
import ShippingPanel from './panel';
export const dynamic='force-dynamic';
export default async function ShippingPage(){await requireAdminAccess('/admin/shipping','shipping');return <AdminChrome active="shipping" title="المحافظات والتوصيل"><ShippingPanel/></AdminChrome>;}
