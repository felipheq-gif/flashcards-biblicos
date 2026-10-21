import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  }
  const data = new TextEncoder().encode('fb-v1:' + process.env.APP_PASSWORD);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const token = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  });
  return res;
}
