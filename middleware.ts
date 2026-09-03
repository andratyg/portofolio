import { NextResponse, type NextRequest } from 'next/server';

// Assets & special routes to skip middleware entirely
const SKIP_PATTERNS = [
  /^\/_next\//,
  /^\/api\//,
  /^\/admin(\/|$)/,
  /^\/l\//,
  /^\/feed\.xml(\/|$)/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/sw\.js$/,
  /^\/llms\.txt$/,
  /^\/manifest\.json$/,
  /\.(png|jpg|jpeg|svg|webp|avif|ico|txt|xml|json)$/i,
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip middleware for system routes and static files
  if (SKIP_PATTERNS.some(pattern => pattern.test(pathname))) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // If path is prefixed with /id (default language), redirect 301 to strip prefix (SEO best practice)
  if (firstSegment === 'id') {
    const cleanPath = '/' + segments.slice(1).join('/') + (search || '');
    return NextResponse.redirect(new URL(cleanPath || '/', request.url), 301);
  }

  // Check if path has English language prefix (/en/...)
  if (firstSegment === 'en') {
    const remainingPath = '/' + segments.slice(1).join('/');
    const url = request.nextUrl.clone();
    url.pathname = remainingPath === '/' ? '/' : remainingPath;
    url.search = search || '';
    const response = NextResponse.rewrite(url);
    response.cookies.set('lang', 'en', { maxAge: 60 * 60 * 24 * 365, path: '/' });
    response.headers.set('x-language', 'en');
    return response;
  }

  // No prefix: standard pass-through (Indonesian default)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
