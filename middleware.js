import { NextResponse } from 'next/server';

async function token() {
  const data = new TextEncoder().encode('fb-v1:' + process.env.APP_PASSWORD);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(req) {
  if (req.cookies.get('auth')?.value === (await token())) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  matcher: ['/((?!login|api/login|_next|manifest.json|icon.svg).*)'],
};
