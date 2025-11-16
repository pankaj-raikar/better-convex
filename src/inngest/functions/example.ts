import { inngest } from '@/inngest/client';

/**
 * Example Inngest function demonstrating basic patterns
 *
 * Triggers on "app/example" event
 * Uses step functions for retry-able operations
 */
export const exampleFunction = inngest.createFunction(
  { id: 'example-function' },
  { event: 'app/example' },
  async ({ event, step }) => {
    // Step 1: Wait (demonstrates sleep)
    await step.sleep('wait', '1s');

    // Step 2: Do some work (automatically retries on failure)
    const result = await step.run('process-data', async () => ({
      processed: true,
      data: event.data,
    }));

    // Step 3: Could call Convex mutation/action here
    // await step.run("update-convex", async () => {
    //   await fetch(`${process.env.CONVEX_SITE_URL}/api/...`, {
    //     method: "POST",
    //     body: JSON.stringify(result),
    //   });
    // });

    return result;
  }
);
