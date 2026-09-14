import {notFound} from 'next/navigation';
import {requireChatGPTUser} from '@/app/chatgpt-auth';
import {isAdmin} from '@/lib/auth';
import Admin from '../panel';
export const dynamic='force-dynamic';
export default async function AdminSection({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!['products','orders','settings'].includes(section))notFound();await requireChatGPTUser('/admin/'+section);if(!await isAdmin())return <main className="access-page"><h1>الدخول لإدارة بيعة فقط</h1><p>سجّلي بحساب be3amarket@gmail.com</p><a className="primary" href="/signout-with-chatgpt?return_to=/admin" target="_top">تغيير الحساب</a></main>;return <Admin initialSection={section}/>;}
