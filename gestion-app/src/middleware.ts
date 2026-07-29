import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

const PUBLIC_PATHS = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|logo-noir.png).*)'],
};
