import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function hasValidCredentials(authHeader: string | null, login: string, password: string): boolean {
  if (!authHeader?.startsWith('Basic ')) return false;

  try {
    const decoded = atob(authHeader.slice('Basic '.length));
    const separator = decoded.indexOf(':');

    return separator !== -1 && decoded.slice(0, separator) === login && decoded.slice(separator + 1) === password;
  } catch {
    return false;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const login = process.env.HTTP_LOGIN;
  const password = process.env.HTTP_PASSWORD;

  if (pathname.startsWith('/api/') || (!login && !password)) {
    return NextResponse.next();
  }

  if (hasValidCredentials(req.headers.get('authorization'), login ?? '', password ?? '')) {
    return NextResponse.next();
  }

  return new NextResponse('Auth', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Protected Area"',
    },
  });
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)',
    '/llms.txt',
    '/llms-full.txt',
    '/sitemap.xml',
  ],
};
