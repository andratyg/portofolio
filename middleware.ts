import { NextResponse, type NextRequest } from 'next/server';

const SUPPORTED_LANGUAGES = ['id', 'en'] as const;
const DEFAULT_LANG = 'id';

// Assets & special routes to skip middleware entirely
const SKIP_PATTERNS = [
  /^\/_next\//,
  /^\/api\//,
  /^\/admin(\/|$)/,
  /^\/l\//,
  /^\/feed\.xml(\/|$)/,
  /^\/favicon\.ico$/,
  /^\/og-image\.png$/,
  /^\/icon\.svg$/,
  /^\/apple-touch-icon\.png$/,
  /^\/manifest\.json$/,
  /^\/robots\.txt$/,
  /^\/sw\.js$/,
  /^\/llms\.txt$/,
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip middleware for system routes
  if (SKIP_PATTERNS.some(pattern => pattern.test(pathname))) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // Check if path already has a language prefix (e.g. /en/blog -> strip to /blog internally)
  if (SUPPORTED_LANGUAGES.includes(firstSegment as typeof SUPPORTED_LANGUAGES[number])) {
    const lang = firstSegment;
    const urlWithoutLang = '/' + segments.slice(1).join('/') + (search ? `?${search}` : '');
    // Invisible rewrite: URL bar keeps /en/* prefix, but route resolves to /*
    const url = request.nextUrl.clone();
    url.pathname = urlWithoutLang === '/' ? '/' : urlWithoutLang.replace(/\?[^?]*/, '');
    url.search = search || '';
    const response = NextResponse.rewrite(url);
    response.cookies.set('lang', lang, { maxAge: 60 * 60 * 24 * 365, path: '/' });
    response.headers.set('x-language', lang);
    return response;
  }

  // No prefix: just pass through normally (Indonesian default)
  // No redirect needed — pure prefix-based progressive enhancement
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
