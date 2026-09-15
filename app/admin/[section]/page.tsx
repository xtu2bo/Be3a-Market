import {notFound} from 'next/navigation';
import {requireAdminAccess} from '@/lib/admin-auth';
import Admin from '../panel';
export const dynamic='force-dynamic';
export default async function AdminSection({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!['products','orders','settings'].includes(section))notFound();await requireAdminAccess('/admin/'+section,section==='settings'?'settings':section);return <Admin initialSection={section}/>;}
