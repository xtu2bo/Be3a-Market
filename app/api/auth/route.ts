import { chatGPTIsOwner, clearSessionCookie, createSession, loginPassword, logoutSession, passwordConfigured, sessionCookie, setupPassword } from '@/lib/admin-auth';
import { json, sameOrigin } from '@/lib/auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('mode') === 'logout') {
    await logoutSession();
    const requested = url.searchParams.get('return_to') || '/';
    const returnTo = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';
    return new Response(null, { status: 303, headers: { Location: new URL(returnTo, url).toString(), 'Set-Cookie': clearSessionCookie(url.toString()) } });
  }
  return json({ configured: await passwordConfigured(), chatGPTAuthenticated: await chatGPTIsOwner(), email: 'be3amarket@gmail.com' });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'طلب غير مسموح' }, 403);
  try {
    const body = await req.json() as { action?: string; email?: string; password?: string };
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    let session: { token: string };
    if (body.action === 'setup') session = await setupPassword(email, password);
    else if (body.action === 'login') session = await loginPassword(email, password);
    else if (body.action === 'chatgpt') {
      if (!(await chatGPTIsOwner())) return json({ error: 'الحساب غير مصرح له بإدارة بيعة' }, 403);
      session = await createSession('be3amarket@gmail.com');
    } else return json({ error: 'إجراء غير معروف' }, 400);
    const response = json({ ok: true });
    response.headers.set('Set-Cookie', sessionCookie(session.token, req.url));
    return response;
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'تعذر تسجيل الدخول' }, 400);
  }
}
