# Inngest Integration

This project uses [Inngest](https://www.inngest.com) for background jobs, scheduled tasks, and event-driven workflows.

## Setup

### 1. Install Dependencies

Already installed via `pnpm add inngest`

### 2. Environment Variables

Add to your `.env.local`:

```bash
# For local development, this can be any value
# For production, get from https://app.inngest.com
INNGEST_SIGNING_KEY=your-signing-key-here
```

### 3. Local Development Server

Run the Inngest dev server alongside your Next.js app:

```bash
npx inngest-cli@latest dev
```

This starts a local dashboard at `http://localhost:8288` where you can:
- View function execution logs
- Manually trigger functions
- Inspect event payloads
- Debug step executions

## Project Structure

```
src/inngest/
  ├── client.ts              # Inngest client initialization
  └── functions/
      └── example.ts         # Example function (remove in production)

src/app/api/inngest/
  └── route.ts               # API route handler (required at /api/inngest)
```

## Creating Functions

Create new functions in `src/inngest/functions/`:

```typescript
import { inngest } from "@/inngest/client";

export const myFunction = inngest.createFunction(
  { id: "my-unique-function-id" },
  { event: "app/my.event" },  // or { cron: "0 0 * * *" } for scheduled
  async ({ event, step }) => {
    // Use step.run for retry-able operations
    const result = await step.run("step-name", async () => {
      // Your logic here
      return { success: true };
    });

    // Use step.sleep for delays
    await step.sleep("wait", "1h");

    return result;
  }
);
```

Register functions in `src/app/api/inngest/route.ts`:

```typescript
import { myFunction } from "@/inngest/functions/my-function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [myFunction], // Add here
  streaming: "force",
});
```

## Triggering Functions

### From Convex Actions

```typescript
// In convex/myAction.ts
import { action } from "./_generated/server";

export const myAction = action({
  handler: async (ctx, args) => {
    // Do Convex work...

    // Trigger Inngest function
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/inngest/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "app/my.event",
        data: { userId: args.userId },
      }),
    });
  },
});
```

### From Client Components

```typescript
import { inngest } from "@/inngest/client";

// In API route or server action
await inngest.send({
  name: "app/my.event",
  data: { userId: "123" },
});
```

## Best Practices

1. **Use Step Functions**: Wrap operations in `step.run()` for automatic retries
2. **Idempotent Operations**: Ensure functions can safely retry without side effects
3. **Event Naming**: Use namespaced events like `app/user.created` or `billing/subscription.updated`
4. **Error Handling**: Let Inngest handle retries; throw errors for retriable failures
5. **Streaming**: Already enabled for extended Vercel timeouts (up to 800s)

## Integration with Convex

- **Convex → Inngest**: Trigger background jobs from Convex actions
- **Inngest → Convex**: Call Convex HTTP API from Inngest functions
- **Use Case**: Convex for real-time state, Inngest for async workflows

## Production Deployment

1. Sign up at [app.inngest.com](https://app.inngest.com)
2. Get your signing key
3. Add `INNGEST_SIGNING_KEY` to production env vars
4. Deploy - Inngest will auto-discover functions via `/api/inngest`

## Monitoring

Access function logs, metrics, and traces at [app.inngest.com](https://app.inngest.com) or locally at `http://localhost:8288`.
