import { z } from 'zod';

import { aggregateUsers } from './aggregates';
import { createInternalMutation } from './functions';

/**
 * Backfill the user aggregate after configuration changes.
 * This clears the aggregate and rebuilds it from the user table.
 *
 * Usage: Run this once via Convex dashboard after changing aggregate configuration
 */
export const backfillUserAggregate = createInternalMutation()({
  args: {},
  returns: z.object({
    cleared: z.boolean(),
    processed: z.number(),
  }),
  handler: async (ctx) => {
    // Get all users first
    const users = await ctx.table('user');

    // Clear both 'user' and 'admin' namespaces
    await aggregateUsers.clear(ctx, { namespace: 'user' });
    await aggregateUsers.clear(ctx, { namespace: 'admin' });

    // Rebuild from all users - trigger will handle the aggregate updates
    let processed = 0;
    for (const user of users) {
      await aggregateUsers.insertIfDoesNotExist(ctx, user);
      processed++;
    }

    return {
      cleared: true,
      processed,
    };
  },
});
