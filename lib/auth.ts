import { isAdminSession, chatGPTIsOwner } from '@/lib/admin-auth';
export async function isAdmin(){return await isAdminSession() || await chatGPTIsOwner();}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return origin===new URL(req.url).origin && req.headers.get('sec-fetch-site')!=='cross-site';}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
