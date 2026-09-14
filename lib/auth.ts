import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function isAdmin(){const user=await getChatGPTUser();return !!user && (user.email.toLowerCase()==='be3amarket@gmail.com' || ((import.meta as ImportMeta & {env:{DEV:boolean}}).env.DEV && user.userId==='local_seedy' && user.email==='seedy@sites.test'));}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return origin===new URL(req.url).origin && req.headers.get('sec-fetch-site')!=='cross-site';}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
