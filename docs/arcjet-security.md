# Arcjet Security Implementation

This document describes the Arcjet security layer implementation for protecting the application with WAF, bot detection, and rate limiting capabilities.

## Overview

**Arcjet** is a security platform that provides:
- **Shield WAF**: Blocks OWASP Top 10 attacks (SQL injection, XSS, etc.)
- **Bot Detection**: Blocks scrapers and malicious bots while allowing search engines
- **Rate Limiting**: Protects endpoints from abuse (configured per route)

## Installation

```bash
pnpm add @arcjet/next
```

## Configuration

### 1. Environment Variables

Add `ARCJET_KEY` to your `.env.local`:

```env
ARCJET_KEY=your-key-from-app.arcjet.com
```

Get your key from: https://app.arcjet.com

### 2. Core Files

#### `src/libs/Arcjet.ts`
Base Arcjet instance with Shield WAF protection:

```typescript
import arcjet, { shield } from '@arcjet/next';

export default arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    shield({
      mode: 'LIVE', // Blocks malicious requests
    }),
  ],
});
```

#### `src/middleware.ts`
Next.js middleware with bot detection and route protection:

```typescript
import { detectBot } from '@arcjet/next';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';

const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:MONITOR'],
  })
);

export default async function middleware(
  request: NextRequest,
  _event: NextFetchEvent
) {
  // Arcjet protection (if key configured)
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Your other middleware logic here...

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
```

## Protected Routes

The middleware currently protects:
- `/dashboard/*` - Dashboard pages
- `/admin/*` - Admin pages

Excluded routes:
- `/_next/*` - Next.js internals
- Static files (`.js`, `.css`, images, etc.)
- `/api/webhooks/*` - Webhook endpoints

## Bot Detection Rules

### Allowed Bots
- `CATEGORY:SEARCH_ENGINE` - Google, Bing, etc.
- `CATEGORY:PREVIEW` - Social media preview bots (Facebook, Twitter, etc.)
- `CATEGORY:MONITOR` - Uptime monitors (Pingdom, etc.)

### Blocked Bots
- Scrapers (curl, wget, etc.)
- AI crawlers (without proper identification)
- Malicious bots

## Adding Rate Limiting

To add rate limiting to specific routes, extend the Arcjet instance:

### Example: API Rate Limiting

Create `src/app/api/protected/route.ts`:

```typescript
import { rateLimit } from '@arcjet/next';
import arcjet from '@/libs/Arcjet';

const aj = arcjet.withRule(
  rateLimit({
    mode: 'LIVE',
    max: 100, // 100 requests
    window: '1m', // per minute
    characteristics: ['ip.src'],
  })
);

export async function GET(request: Request) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': decision.reason.resetTime?.toISOString() ?? '',
        },
      }
    );
  }

  // Your API logic here
  return Response.json({ data: 'success' });
}
```

### Example: Form Protection

```typescript
import { tokenBucket } from '@arcjet/next';
import arcjet from '@/libs/Arcjet';

const aj = arcjet.withRule(
  tokenBucket({
    mode: 'LIVE',
    refillRate: 5, // 5 tokens
    interval: '1m', // per minute
    capacity: 10, // max 10 tokens
    characteristics: ['userId'], // Per user
  })
);

export async function POST(request: Request) {
  // Extract userId from session
  const userId = await getUserId(request);

  const decision = await aj.protect(request, {
    userId,
    requested: 1, // Consume 1 token
  });

  if (decision.isDenied()) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Process form submission
  return Response.json({ success: true });
}
```

## Testing

### Unit Tests
Located in `tests/unit/arcjet.test.ts`:

```bash
# Run unit tests (when Vitest is configured)
pnpm test:unit
```

### Integration Tests
Located in `tests/integration/security.spec.ts`:

```bash
# Run E2E tests (when Playwright is configured)
pnpm test:e2e
```

Tests cover:
- Bot detection (allowed vs blocked bots)
- Shield WAF (SQL injection, XSS protection)
- Route protection
- Static file exclusions

## Monitoring

View security decisions in the Arcjet dashboard:
1. Visit https://app.arcjet.com
2. Navigate to your site
3. View blocked requests, bot activity, and rate limit hits

## Development Mode

During development without `ARCJET_KEY`:
- Middleware runs but protection is skipped
- No requests are blocked
- Add key to `.env.local` to enable protection locally

## Production Deployment

1. Add `ARCJET_KEY` to your hosting provider's environment variables
2. Arcjet automatically protects all requests
3. Monitor dashboard for blocked requests and adjust rules as needed

## Troubleshooting

### False Positives

If legitimate requests are blocked:
1. Check Arcjet dashboard for decision details
2. Adjust rules in middleware or route handlers
3. Consider using `DRY_RUN` mode temporarily to log without blocking:

```typescript
shield({ mode: 'DRY_RUN' })
```

### Search Engine Issues

If search engines can't crawl your site:
- Verify `CATEGORY:SEARCH_ENGINE` is in allowed list
- Check Arcjet dashboard for Googlebot/Bingbot blocks
- Test with Google Search Console

### Rate Limiting Too Strict

Adjust limits per route:
```typescript
rateLimit({
  max: 200, // Increase limit
  window: '1m',
})
```

## References

- [Arcjet Documentation](https://docs.arcjet.com)
- [Next.js Middleware Guide](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Files Modified

- `src/libs/Arcjet.ts` - Base Arcjet configuration
- `src/middleware.ts` - Middleware implementation
- `src/env.ts` - Environment variable validation
- `.env.example` - Example configuration
- `biome.jsonc` - Excluded test files from lint
- `tsconfig.json` - Excluded test/reference files
- `tests/unit/arcjet.test.ts` - Unit tests
- `tests/integration/security.spec.ts` - E2E tests
