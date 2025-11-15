# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Workflow
```bash
pnpm dev          # Start dev servers (Next.js on :3005 + Convex backend)
pnpm build        # Build Next.js for production
pnpm typecheck    # TypeScript checks
```

### Code Quality
```bash
pnpm lint         # Check with Ultracite (Biome preset)
pnpm lint:fix     # Auto-fix linting and formatting
pnpm check        # Run all checks (lint, ESLint, TypeScript)
```

### Database Management
```bash
pnpm reset        # Reset all tables (preserves admins)
pnpm seed         # Seed with sample data (dev only)
pnpm studio       # Open Convex dashboard
pnpm sync         # Sync Convex env (first time setup)
```

### Auth Schema Generation
```bash
pnpm gen          # Regenerate Better Auth schema from convex/authSchema.ts
```

## Architecture Overview

### Custom Function Wrappers (CRITICAL)

**Never use raw Convex `query`/`mutation`/`action` directly.** This codebase uses custom wrappers in `convex/functions.ts` that provide:

- **Automatic authentication**: Pre-loaded `ctx.user` (type `SessionUser`) in auth contexts
- **Rate limiting**: Tier-based limits (free/premium) with auto-selection
- **Type safety**: Zod validation for args and returns
- **Ents integration**: `ctx.table()` for entity operations (replaces `ctx.db`)

**Available wrappers:**
```typescript
// Public (auth optional)
createPublicQuery()
createPublicMutation()           // NEEDS rate limiting
createPublicPaginatedQuery()

// Protected (auth required)
createAuthQuery()
createAuthMutation()             // NEEDS rate limiting
createAuthPaginatedQuery()

// Internal (Convex-only)
createInternalQuery/Mutation/Action()
```

**Function pattern:**
```typescript
export const example = createAuthMutation({
  rateLimit: 'feature/action',  // REQUIRED for mutations
  role: 'admin',                // Optional role check
})(({
  args: { id: zid('table') },   // ALWAYS use zid() for IDs
  returns: z.object(...),
  handler: async (ctx, args) => {
    // ctx.user is pre-loaded SessionUser with ent methods
    // ctx.table() replaces ctx.db
  }
}));
```

### Rate Limiting (TWO-STEP REQUIREMENT)

**Every user-facing mutation MUST have rate limiting.** This is a two-step process:

1. **Add `rateLimit` parameter to mutation**
2. **Define the rate limit in `convex/helpers/rateLimiter.ts`**

```typescript
// Step 1: Add to rateLimiter.ts
'feature/action:free': { kind: 'fixed window', period: MINUTE, rate: 20 },
'feature/action:premium': { kind: 'fixed window', period: MINUTE, rate: 60 },

// Step 2: Use in mutation (auto appends :free/:premium)
createAuthMutation({ rateLimit: 'feature/action' })({ ... });
```

### Schema Architecture (Convex Ents)

Two validator systems:
- **Schema files** (`convex/schema.ts`): Use `v.` validators
- **Function files** (`convex/*.ts`): Use `z.` validators

**Entity relationships:**
- `defineEnt({...})` - Define fields inline
- `.field(name, type, options)` - Add fields with unique/default/index
- `.edge(name)` - 1:many or 1:1 relationship
- `.edges(name)` - many:many relationship
- `.index(name, fields)` - ALWAYS put indexes LAST

**Edge patterns:**
- **1:1**: `.edge()` with `{ref: true}` on optional side
- **1:many**: `.edges()` on "one" side, `.edge()` on "many" side
- **many:many**: `.edges()` on both sides (auto-generates join table)

**CRITICAL: Never create indexes for edge-generated fields!**
- Edges auto-create indexes on ID fields
- Only create compound indexes: `.index('userId_status', ['userId', 'status'])`

### Database Operations (Convex Ents)

**NEVER use `ctx.db`** - Always use `ctx.table()` (except for streams first param).

```typescript
// Fetching
await ctx.table('user').get(id)              // null if not found
await ctx.table('user').getX(id)             // throws if not found
await ctx.table('user').get('email', email)  // by unique field
await ctx.table('user').getMany([id1, id2])  // batch

// Edge traversal (PREFERRED)
await user.edge('profile')                    // optional edge
await user.edgeX('profile')                   // throws if missing
await user.edge('messages').take(10)          // 1:many with limit

// Mutations
await ctx.table('user').insert(data)
await ctx.table('user').insertMany([...])    // prefer over loop
await ctx.table('user').getX(id).patch({...})
await ctx.table('user').getX(id).delete()

// CRITICAL: Never refetch ctx.user in auth contexts!
// ❌ const user = await ctx.table('user').getX(ctx.userId)
// ✅ const user = ctx.user  (already loaded)
```

**Filtering patterns:**
- Simple: Use built-in `.filter()` (maintains page sizes)
- Complex without pagination: Use `filter` helper from `convex-helpers/server/filter`
- Complex with pagination: Use streams from `convex-helpers/server/stream`

**Streams exception:**
```typescript
import { stream } from 'convex-helpers/server/stream';
// ONLY place ctx.db is allowed (first param only)
const results = stream(ctx.db, schema)
  .query('posts')
  .filterWith(async (post) => {
    // Inside streams, use ctx.table()!
    const author = await ctx.table('user').get(post.authorId);
    return author && !author.isBanned;
  })
  .paginate(args.paginationOpts);
```

### Client-Side Hooks (React)

**Never use `useQuery` or `usePaginatedQuery` directly.** Use wrappers from `@/lib/convex/hooks`:

```typescript
// Queries (ALWAYS pass {} for no args)
const { data, isPending } = usePublicQuery(api.items.list, {});
const { data } = useAuthQuery(api.user.getProfile, {});

// Conditional queries
const { data } = usePublicQuery(
  api.items.get,
  itemId ? { id: itemId } : 'skip'
);

// Mutations (don't destructure)
const createItem = useAuthMutation(api.items.create);

// With toast
toast.promise(createItem.mutateAsync({ name: 'New' }), {
  loading: 'Creating...',
  success: 'Created!',
  error: (e) => e.data?.message ?? 'Failed',
});

// Paginated
const { data, hasNextPage, fetchNextPage } = usePublicPaginatedQuery(
  api.messages.list,
  { author: 'alice' },
  { initialNumItems: 10 }
);
```

**Skeleton loading pattern:**
```typescript
import { WithSkeleton } from '@/components/ui/skeleton';

const { data, isLoading } = useAuthQuery(api.items.list, {}, {
  placeholderData: {
    items: [
      { _id: '1' as any, name: 'Item 1' },  // Use 'as any' for IDs
      { _id: '2' as any, name: 'Item 2' },
    ]
  }
});

return data?.items?.map((item, index) => (
  <WithSkeleton key={index} isLoading={isLoading}>
    <Card>{item.name}</Card>
  </WithSkeleton>
));
```

### Server Components (RSC)

```typescript
import {
  getSessionToken,
  getSessionUser,
  isAuth,
  fetchAuthQuery,
  fetchAuthQueryOrThrow,
  authGuard,
  adminGuard,
} from '@/lib/convex/server';

// Auth helpers
const token = await getSessionToken();  // string | null
const user = await getSessionUser();    // SessionUser | null

// Guards (use in server components)
await authGuard();   // Redirects to login if not authenticated
await adminGuard();  // Returns 404 if not admin

// Fetch with auth
const data = await fetchAuthQuery(api.user.getData, { id });
const data = await fetchAuthQueryOrThrow(api.user.getData, { id });
```

### Aggregates (Performance)

**Use aggregates instead of `.length` for counting.** O(log n) vs O(n) performance.

**CRITICAL: Always use triggers to keep aggregates in sync. Never update manually.**

```typescript
// Define in convex/aggregates.ts
const leaderboard = new TableAggregate<...>(components.leaderboard, {
  namespace: (doc) => doc.gameId,
  sortKey: (doc) => doc.score,
});

// Register in convex/convex.config.ts
app.use(aggregate, { name: 'leaderboard' });

// Setup trigger in convex/triggers.ts
triggers.register('scores', leaderboard.trigger());

// In mutations - just do normal operations!
await ctx.table('scores').insert(data);  // Aggregate updates automatically

// Read operations (O(log n))
const count = await leaderboard.count(ctx, { namespace: gameId, bounds: {} as any });
```

**Null key requirement:** Aggregates with `sortKey: () => null` require `bounds: {} as any`.

### Authentication & Authorization

- **Admin setup**: Configure via `ADMIN` env var in `convex/.env` (comma-separated emails)
- **Session user**: Pre-loaded in auth contexts as `ctx.user` (type `SessionUser`)
- **Role checking**: Add `role: 'admin'` to function options
- **Organizations**: Multi-org support with Better Auth organization plugin

```typescript
// Auth context types
SessionUser includes:
- Better Auth fields: id, email, emailVerified, role, createdAt, etc.
- App fields: name, image, bio, username, credits, etc.
- Computed: isAdmin, plan ('premium' | 'team')
- Session: token, expiresAt, activeOrganizationId, etc.
- Ent methods: .patch(), .delete(), .edge(), .edgeX(), etc.
```

### Search Indexes

```typescript
// Schema definition
.searchIndex('search_body', {
  searchField: 'body',
  filterFields: ['channel', 'userId']  // Fast equality filters only
})

// Usage
const results = await ctx
  .table('messages')
  .search('search_body', (q) =>
    q.search('body', 'hello world')
     .eq('channel', '#general')
  )
  .take(10);
```

**IMPORTANT:** Streams do NOT support search indexes. Choose between search or complex filtering.

## Code Style & Patterns

### Validator Reference

| Type     | Schema (v.)           | Functions (z.)              |
|----------|-----------------------|-----------------------------|
| IDs      | `v.id('table')`       | `zid('table')`              |
| Strings  | `v.string()`          | `z.string().min().max()`    |
| Optional | `v.optional(...)`     | `.optional()` NOT `.nullable()` |
| Enums    | `v.union(v.literal())` | `z.enum([...])`           |

**ID handling:**
- Function args/returns: `zid('tableName')`
- TypeScript: `Id<'tableName'>`
- Never `z.string()` for IDs

### Key Rules

1. **Never use raw Convex functions** - Always use custom wrappers
2. **Every mutation needs rate limiting** - Two-step process (define + use)
3. **Use `zid()` for IDs** in functions, `v.id()` in schemas
4. **Pass `{}` for no args** in queries, not `undefined`
5. **Use `ctx.table()`** instead of `ctx.db` (except streams first param)
6. **Leverage pre-loaded `ctx.user`** in auth contexts (never refetch)
7. **Use `.optional()` not `.nullable()`** for optional args
8. **Never create indexes for edge-generated fields**
9. **Use aggregates for counting**, not `.length`
10. **Always use triggers for aggregates**, never manual updates

### Error Handling

Always throw `ConvexError` with proper codes:
```typescript
throw new ConvexError({
  code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'TOO_MANY_REQUESTS',
  message: 'Human-readable message',
});
```

## Project-Specific Context

### Better Auth Integration

- Uses `better-auth-convex` package (local fork, no component boundaries)
- Auth schema in `convex/authSchema.ts` (generated via `pnpm gen`)
- Session management with organizations and invitations
- OAuth providers: GitHub, Google

### Subscription System (Polar)

- Polar payment integration ready (coming soon)
- Premium vs Free tier rate limiting
- Monthly credits system
- Organization-level subscriptions

### Starter Features (Can be removed)

The codebase includes example features that can be cleaned up:
- Todos with soft delete
- Projects with members
- Tags (many:many relationships)
- Comments with replies

See README.md "Start from Scratch" section for cleanup instructions.

## AI Agent Rules from .claude/rules/

### Critical Files (Load when working on related code)

- **convex.mdc** ⭐ - MUST READ for ANY backend work
- **convex-client.mdc** - Client-side integration patterns
- **convex-ents.mdc** - Entity relationships and edges
- **convex-aggregate.mdc** - Efficient counting (O(log n))
- **convex-optimize.mdc** - Performance optimization
- **convex-search.mdc** - Full-text search
- **convex-streams.mdc** - Advanced filtering with pagination
- **nextjs.mdc** - Next.js patterns
- **react.mdc** - React component patterns
- **ultracite.mdc** - Code quality standards

### Communication Style

From `.claude/AGENTS.md`:
- Be extremely concise, sacrifice grammar for concision
- Use GitHub CLI for GitHub interactions
- Tag issues with '@claude'
- End plans with list of unresolved questions

## File Organization

```
convex/
├── functions.ts           # Custom function wrappers (CORE)
├── schema.ts             # Database schema with Ents
├── auth.ts               # Better Auth setup
├── authHelpers.ts        # Session user utilities
├── helpers/
│   ├── rateLimiter.ts    # Rate limit definitions
│   └── roleGuard.ts      # Authorization helpers
├── aggregates.ts         # Aggregate definitions
├── triggers.ts           # Trigger registrations
├── shared/               # Shared code (accessible from Next.js)
└── [feature].ts          # Feature-specific functions

src/
├── app/                  # Next.js App Router
├── components/           # React components
├── lib/convex/
│   ├── hooks/           # React hooks (useAuthQuery, etc.)
│   ├── server.ts        # RSC helpers
│   └── auth-client.ts   # Client auth setup
└── env.ts               # Environment variables (t3-env)
```

## Environment Setup

Two env files required:
- `.env.local` - Next.js variables
- `convex/.env` - Convex secrets (OAuth, Resend, etc.)

Admin emails configured in `convex/.env` under `ADMIN` variable.

## Testing

No test framework specified in package.json. Check README or project structure before assuming test approach.
