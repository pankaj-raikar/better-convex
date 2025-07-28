import aggregate from '@convex-dev/aggregate/convex.config';
import betterAuth from '@convex-dev/better-auth/convex.config';
import rateLimiter from '@convex-dev/rate-limiter/convex.config';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(betterAuth);
app.use(rateLimiter);

// Register all aggregates
app.use(aggregate, { name: 'aggregateUsers' });
app.use(aggregate, { name: 'aggregateTodosByUser' });
app.use(aggregate, { name: 'aggregateTodosByProject' });
app.use(aggregate, { name: 'aggregateTodosByStatus' });
app.use(aggregate, { name: 'aggregateTagUsage' });
app.use(aggregate, { name: 'aggregateProjectMembers' });
app.use(aggregate, { name: 'aggregateCommentsByTodo' });

export default app;
