import { requireChatGPTUser } from '@/app/chatgpt-auth';
import {isAdmin} from '@/lib/auth';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function AdminPage(){await requireChatGPTUser('/admin');if(!await isAdmin())return <main className="access-page"><h1>الدخول لإدارة بيعة فقط</h1><p>سجّلي الدخول بحساب be3amarket@gmail.com للوصول للوحة الإدارة.</p><a className="primary" href="/signout-with-chatgpt?return_to=/admin" target="_top">تغيير الحساب</a><a href="/">العودة للمتجر</a></main>;return <Admin/>;}
