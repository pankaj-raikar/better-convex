import { detectBot } from '@arcjet/next';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';

const isProtectedRoute = (pathname: string) =>
  pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

const isWebhookRoute = (pathname: string) =>
  pathname.startsWith('/api/webhooks');

const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:MONITOR'],
  })
);

export default async function proxy(
  request: NextRequest,
  _event: NextFetchEvent
) {
  // Skip Arcjet protection for webhooks (they need raw body access)
  if (isWebhookRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Verify the request with Arcjet
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Better Auth handles authentication via API routes
  // Protected routes are handled by individual page components
  // using useSession() hook from Better Auth
  if (isProtectedRoute(request.nextUrl.pathname)) {
    // Let Better Auth's client-side session check handle redirection
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
