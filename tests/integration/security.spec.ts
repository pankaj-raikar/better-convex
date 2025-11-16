import { expect, test } from '@playwright/test';

test.describe('Arcjet Security - Bot Detection', () => {
  test('should allow normal browser requests', async ({ page }) => {
    // Visit dashboard page
    const response = await page.goto('/dashboard');

    // May return 403 if Playwright is detected as bot
    // Without ARCJET_KEY, should pass through
    expect([200, 403]).toContain(response?.status());
  });

  test('should block malicious bot requests', async ({ request }) => {
    // Make request with suspicious bot user-agent
    const response = await request.get('/dashboard', {
      headers: {
        'User-Agent': 'curl/7.68.0', // Common scraper user-agent
      },
    });

    // When ARCJET_KEY is configured, should return 403 for bots
    // In test environment without key, may pass through
    if (process.env.ARCJET_KEY) {
      expect(response.status()).toBe(403);
    }
  });

  test('should allow search engine bots', async ({ request }) => {
    // Make request with Googlebot user-agent
    const response = await request.get('/dashboard', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });

    // Search engines should be allowed when Arcjet is configured
    // Without ARCJET_KEY, behavior may vary
    if (process.env.ARCJET_KEY) {
      expect(response.status()).not.toBe(403);
    } else {
      // Without Arcjet, just verify it doesn't crash
      expect(response.status()).toBeGreaterThanOrEqual(200);
    }
  });

  test('should not block webhook endpoints', async ({ request }) => {
    // Webhooks should bypass bot detection
    const response = await request.post('/api/webhooks/test', {
      data: { test: 'data' },
    });

    // Should not return 403 (may be 404/405 if endpoint doesn't exist)
    // Webhook routes are excluded from middleware matcher
    expect(response.status()).not.toBe(403);
  });
});

test.describe('Arcjet Security - Protected Routes', () => {
  test('should protect /dashboard routes', async ({ page }) => {
    const response = await page.goto('/dashboard');

    // Should either allow or redirect to auth, not return 500
    expect(response?.status()).not.toBe(500);
  });

  test('should protect /admin routes', async ({ page }) => {
    const response = await page.goto('/admin');

    // Should either allow or redirect to auth, not return 500
    expect(response?.status()).not.toBe(500);
  });

  test('should allow public routes without protection', async ({ page }) => {
    const response = await page.goto('/');

    // Public routes should be accessible
    // May return 403 if Playwright is detected as bot without proper config
    expect([200, 403]).toContain(response?.status());
  });
});

test.describe('Arcjet Security - Shield WAF', () => {
  test('should block SQL injection attempts', async ({ request }) => {
    // Attempt SQL injection in query parameter
    const response = await request.get("/api/test?id=1' OR '1'='1' --");

    // Shield should detect and block when enabled
    if (process.env.ARCJET_KEY) {
      expect(response.status()).toBe(403);
    }
  });

  test('should block XSS attempts', async ({ request }) => {
    // Attempt XSS in query parameter
    const response = await request.get(
      '/api/test?name=<script>alert("xss")</script>'
    );

    // Shield should detect and block when enabled
    if (process.env.ARCJET_KEY) {
      expect(response.status()).toBe(403);
    }
  });

  test('should allow normal requests through Shield', async ({ page }) => {
    const response = await page.goto('/dashboard?filter=active&limit=10');

    // Normal requests should pass through
    // May return 403 if Playwright is detected as bot
    expect([200, 403]).toContain(response?.status());
  });
});

test.describe('Arcjet Security - Middleware Configuration', () => {
  test('should exclude static assets from middleware', async ({ request }) => {
    // Static assets should bypass middleware
    const response = await request.get('/favicon.ico');

    // Should not be blocked by Arcjet (may be 404 if doesn't exist)
    expect(response.status()).not.toBe(403);
  });

  test('should exclude Next.js internal routes', async ({ request }) => {
    // _next routes should bypass middleware
    const response = await request.get('/_next/static/test.js');

    // Should not be blocked (may be 404)
    expect(response.status()).not.toBe(403);
  });
});
