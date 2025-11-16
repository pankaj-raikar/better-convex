import { getHeaders } from 'better-auth-convex';
import { ConvexError } from 'convex/values';
import { zid } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { aggregateUsers } from './aggregates';
import { createAuth } from './auth';
import {
  createAuthMutation,
  createAuthPaginatedQuery,
  createAuthQuery,
} from './functions';

// Admin operations that work with our application's user role system
// Better Auth admin plugin integration for comprehensive admin features

// Check if a user has admin privileges in our system
export const checkUserAdminStatus = createAuthQuery({
  role: 'admin',
})({
  args: {
    userId: zid('user'),
  },
  returns: z.object({
    isAdmin: z.boolean(),
    role: z.string().nullish(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.table('user').getX(args.userId);

    return {
      isAdmin: user.role === 'admin',
      role: user.role,
    };
  },
});

// Update user role
export const updateUserRole = createAuthMutation({
  role: 'admin',
})({
  args: {
    role: z.enum(['user', 'admin']),
    userId: zid('user'),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    // Only admin can promote to admin
    if (args.role === 'admin' && !ctx.user.isAdmin) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only admin can promote users to admin',
      });
    }

    const targetUser = await ctx.table('user').getX(args.userId);

    // Can't demote admin unless you are admin
    if (targetUser.role === 'admin' && !ctx.user.isAdmin) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Cannot modify admin users',
      });
    }

    await targetUser.patch({
      role: args.role.toLowerCase(),
    });

    return true;
  },
});

// Grant admin access to a user based on their email (for admin setup)
export const grantAdminByEmail = createAuthMutation({
  role: 'admin',
})({
  args: {
    email: z.string().email(),
    role: z.enum(['admin']),
  },
  returns: z.object({
    success: z.boolean(),
    userId: zid('user').optional(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.table('user').get('email', args.email);

    if (!user) {
      return {
        success: false,
      };
    }

    await user.patch({
      role: args.role.toLowerCase(),
    });

    return {
      success: true,
      userId: user._id,
    };
  },
});

// Get all users with pagination for admin dashboard
export const getAllUsers = createAuthPaginatedQuery()({
  args: {
    role: z.enum(['all', 'user', 'admin']).optional(),
    search: z.string().optional(),
  },
  handler: async (ctx, args) => {
    // Build query
    const query = ctx.table('user');

    // Filter by search term if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();

      // For now, just paginate and filter in memory
      // You can add a search index later for better performance
      const result = await query.paginate(args.paginationOpts);

      const enrichedPage = await Promise.all(
        result.page.map(async (user) => {
          const email = user?.email || '';

          // Check if any field matches search
          if (
            !(
              user.name?.toLowerCase().includes(searchLower) ||
              email.toLowerCase().includes(searchLower)
            )
          ) {
            return null;
          }

          return {
            ...user.doc(),
            banExpiresAt: user?.banExpires,
            banReason: user?.banReason,
            email,
            isBanned: user?.banned,
            role: user?.role || 'user',
          };
        })
      );

      return {
        ...result,
        page: enrichedPage.filter(Boolean),
      };
    }

    // Regular pagination without search
    const result = await query.paginate(args.paginationOpts);

    const enrichedPage = await Promise.all(
      result.page.map(async (user) => {
        const userData = {
          ...user.doc(),
          banExpiresAt: user?.banExpires,
          banReason: user?.banReason,
          email: user?.email || '',
          isBanned: user?.banned,
          role: user?.role || 'user',
        };

        // Filter by role if specified
        if (args.role && args.role !== 'all' && userData.role !== args.role) {
          return null;
        }

        return userData;
      })
    );

    return {
      ...result,
      page: enrichedPage.filter(Boolean),
    };
  },
});

// Get admin dashboard statistics
export const getDashboardStats = createAuthQuery({
  role: 'admin',
})({
  args: {},
  returns: z.object({
    recentUsers: z.array(
      z.object({
        _id: zid('user'),
        _creationTime: z.number(),
        image: z.string().nullish(),
        name: z.string().optional(),
      })
    ),
    totalAdmins: z.number(),
    totalUsers: z.number(),
    userGrowth: z.array(
      z.object({
        count: z.number(),
        date: z.string(),
      })
    ),
  }),
  handler: async (ctx) => {
    // Get recent users
    const recentUsers = await ctx
      .table('user')
      .order('desc')
      .take(5)
      .map(async (user) => ({
        _id: user._id,
        _creationTime: user._creationTime,
        image: user.image,
        name: user.name,
      }));

    // Get users from last 7 days for growth calculation
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const usersLast7Days = await ctx
      .table('user')
      .filter((q) => q.gte(q.field('_creationTime'), sevenDaysAgo))
      .take(1000); // Reasonable limit for 7 days of users

    // Calculate user growth for last 7 days
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const userGrowth: { count: number; date: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * oneDay);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const endOfDay = new Date(date.setHours(23, 59, 59, 999)).getTime();

      const count = usersLast7Days.filter(
        (user) =>
          user._creationTime >= startOfDay && user._creationTime <= endOfDay
      ).length;

      userGrowth.push({
        count,
        date: new Date(startOfDay).toISOString().split('T')[0],
      });
    }

    // Count users and admins using aggregates (O(log n) vs O(n))
    const totalUsers = await aggregateUsers.count(ctx, {
      bounds: {},
      namespace: 'user',
    });

    const totalAdmins = await aggregateUsers.count(ctx, {
      bounds: {},
      namespace: 'admin',
    });

    return {
      recentUsers,
      totalAdmins,
      totalUsers,
      userGrowth,
    };
  },
});

// ===== Better Auth Admin API Integration =====

// Create user via Better Auth admin API
export const createUser = createAuthMutation({
  role: 'admin',
})({
  args: {
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(8),
    role: z.enum(['user', 'admin']).optional(),
  },
  returns: z.object({
    success: z.boolean(),
    userId: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    if (!ctx.user.session) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'No active session found',
      });
    }

    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);
    try {
      const result = await auth.api.createUser({
        body: {
          email: args.email,
          name: args.name,
          password: args.password,
          role: args.role || 'user',
        },
        headers,
      });

      return {
        success: true,
        userId: result.user.id,
      };
    } catch (error) {
      console.error('Admin API error:', error);
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message: 'Failed to create user',
      });
    }
  },
});

// Set user password via Better Auth admin API
export const setUserPassword = createAuthMutation({
  role: 'admin',
})({
  args: {
    newPassword: z.string().min(8),
    userId: zid('user'),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    if (!ctx.user.session) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'No active session found',
      });
    }

    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);

    try {
      await auth.api.setUserPassword({
        body: {
          userId: args.userId,
          newPassword: args.newPassword,
        },
        headers,
      });

      return true;
    } catch (error) {
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to set password',
      });
    }
  },
});

// Ban user via Better Auth admin API
export const banUser = createAuthMutation({
  role: 'admin',
})({
  args: {
    banExpiresIn: z.number().optional(),
    banReason: z.string().optional(),
    userId: zid('user'),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);

    try {
      await auth.api.banUser({
        body: {
          userId: args.userId,
          banReason: args.banReason,
          banExpiresIn: args.banExpiresIn,
        },
        headers,
      });

      return true;
    } catch (error) {
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message: error instanceof Error ? error.message : 'Failed to ban user',
      });
    }
  },
});

// Unban user via Better Auth admin API
export const unbanUser = createAuthMutation({
  role: 'admin',
})({
  args: {
    userId: zid('user'),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);

    try {
      await auth.api.unbanUser({
        body: {
          userId: args.userId,
        },
        headers,
      });

      return true;
    } catch (error) {
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to unban user',
      });
    }
  },
});

// List user sessions via Better Auth admin API
export const listUserSessions = createAuthQuery({
  role: 'admin',
})({
  args: {
    userId: zid('user'),
  },
  returns: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      expiresAt: z.number(),
      createdAt: z.number(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    })
  ),
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);

    try {
      const result = await auth.api.listUserSessions({
        body: {
          userId: args.userId,
        },
        headers,
      });

      type BetterAuthSession = {
        id: string;
        userId: string;
        expiresAt: Date;
        createdAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
      };

      return result.sessions.map((session: BetterAuthSession) => ({
        id: session.id,
        userId: session.userId,
        expiresAt:
          session.expiresAt instanceof Date
            ? session.expiresAt.getTime()
            : session.expiresAt,
        createdAt:
          session.createdAt instanceof Date
            ? session.createdAt.getTime()
            : session.createdAt,
        ipAddress: session.ipAddress ?? undefined,
        userAgent: session.userAgent ?? undefined,
      }));
    } catch (error) {
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to list sessions',
      });
    }
  },
});

// Revoke specific user session via Better Auth admin API
export const revokeUserSession = createAuthMutation({
  role: 'admin',
})({
  args: {
    sessionToken: z.string(),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);

    try {
      await auth.api.revokeUserSession({
        body: {
          sessionToken: args.sessionToken,
        },
        headers,
      });

      return true;
    } catch (error) {
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to revoke session',
      });
    }
  },
});

// Revoke all user sessions via Better Auth admin API
export const revokeUserSessions = createAuthMutation({
  role: 'admin',
})({
  args: {
    userId: zid('user'),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);

    try {
      await auth.api.revokeUserSessions({
        body: {
          userId: args.userId,
        },
        headers,
      });

      return true;
    } catch (error) {
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to revoke sessions',
      });
    }
  },
});

// Remove user via Better Auth admin API
export const removeUser = createAuthMutation({
  role: 'admin',
})({
  args: {
    userId: zid('user'),
  },
  returns: z.boolean(),
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);
    const headers = await getHeaders(ctx, ctx.user.session);

    try {
      await auth.api.removeUser({
        body: {
          userId: args.userId,
        },
        headers,
      });

      return true;
    } catch (error) {
      throw new ConvexError({
        code: 'ADMIN_API_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to remove user',
      });
    }
  },
});
