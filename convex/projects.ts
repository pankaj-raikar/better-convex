import { z } from "zod";
import { zid } from "convex-helpers/server/zod";
import { ConvexError } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import {
  createAuthQuery,
  createAuthMutation,
  createPublicQuery,
  createPublicPaginatedQuery,
  createInternalMutation,
} from "./functions";
import { aggregateProjectMembers, aggregateTodosByProject } from "./aggregates";

// ============================================
// PROJECT QUERIES
// ============================================

// List user's projects with member counts
export const listMyProjects = createAuthQuery()({
  args: {
    includeArchived: z.boolean().default(false),
  },
  returns: z.array(
    z.object({
      _id: zid("projects"),
      _creationTime: z.number(),
      name: z.string(),
      description: z.string().optional(),
      isPublic: z.boolean(),
      archived: z.boolean(),
      isOwner: z.boolean(),
      memberCount: z.number(),
      todoCount: z.number(),
      role: z.enum(["owner", "member"]),
    })
  ),
  handler: async (ctx, args) => {
    // Get projects user owns
    const ownedProjects = await ctx
      .table("projects")
      .filter((q) => q.eq(q.field("ownerId"), ctx.userId));

    // Get projects user is member of
    const memberProjects = await ctx.user.edge("memberProjects");

    // Combine and deduplicate
    const projectMap = new Map<
      Id<"projects">,
      { project: (typeof ownedProjects)[0]; role: "owner" | "member" }
    >();

    for (const project of ownedProjects) {
      projectMap.set(project._id, { project, role: "owner" as const });
    }

    for (const project of memberProjects) {
      if (!projectMap.has(project._id)) {
        projectMap.set(project._id, { project, role: "member" as const });
      }
    }

    // Filter and enrich projects
    const projects = Array.from(projectMap.values()).filter(
      (p) => args.includeArchived || !p.project.archived
    );

    // Get counts in parallel
    return await Promise.all(
      projects.map(async ({ project, role }) => {
        const [memberCount, todoCount] = await Promise.all([
          aggregateProjectMembers.count(ctx, {
            namespace: project._id,
            bounds: {} as any,
          }),
          aggregateTodosByProject.count(ctx, {
            namespace: project._id,
            bounds: {
              lower: { key: [false, 0, false], inclusive: true },
              upper: { key: [true, Number.MAX_SAFE_INTEGER, false], inclusive: true },
            },
          }),
        ]);

        return {
          ...project.doc(),
          isOwner: project.ownerId === ctx.userId,
          memberCount: memberCount + 1, // +1 for owner
          todoCount,
          role,
        };
      })
    );
  },
});

// Get single project details with members
export const getProject = createPublicQuery()({
  args: {
    projectId: zid("projects"),
  },
  returns: z
    .object({
      _id: zid("projects"),
      _creationTime: z.number(),
      name: z.string(),
      description: z.string().optional(),
      isPublic: z.boolean(),
      archived: z.boolean(),
      owner: z.object({
        _id: zid("users"),
        name: z.string().optional(),
        email: z.string(),
        image: z.string().optional(),
      }),
      members: z.array(
        z.object({
          _id: zid("users"),
          name: z.string().optional(),
          email: z.string(),
          image: z.string().optional(),
          joinedAt: z.number(),
        })
      ),
      stats: z.object({
        totalTodos: z.number(),
        completedTodos: z.number(),
        memberCount: z.number(),
      }),
    })
    .nullable(),
  handler: async (ctx, args) => {
    const project = await ctx.table("projects").get(args.projectId);
    if (!project) return null;

    // Check access
    const sessionUser = ctx.user;
    if (!project.isPublic && sessionUser?.id !== project.ownerId) {
      // Check if user is member
      const isMember = sessionUser
        ? await project.edge("members").has(sessionUser.id)
        : false;
      if (!isMember) {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Project is private",
        });
      }
    }

    // Get data in parallel
    const [owner, members, todoCount, completedCount] = await Promise.all([
      project.edgeX("owner"),
      project.edge("members").take(50),
      aggregateTodosByProject.count(ctx, {
        namespace: project._id,
        bounds: {} as any,
      }),
      aggregateTodosByProject.sum(ctx, {
        namespace: project._id,
        bounds: { prefix: [true] },
      }),
    ]);

    // Enrich members with join time
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        // Get join record to find join time
        const joinRecord = await ctx
          .table("projectMembers")
          .filter((q) =>
            q.and(
              q.eq(q.field("projectId"), project._id),
              q.eq(q.field("userId"), member._id)
            )
          )
          .first();

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          image: member.image,
          joinedAt: joinRecord?._creationTime ?? project._creationTime,
        };
      })
    );

    return {
      ...project.doc(),
      owner: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        image: owner.image,
      },
      members: enrichedMembers,
      stats: {
        totalTodos: todoCount,
        completedTodos: completedCount,
        memberCount: enrichedMembers.length + 1,
      },
    };
  },
});

// Search public projects
export const searchPublicProjects = createPublicPaginatedQuery()({
  args: {
    query: z.string().min(1),
    archived: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    return await ctx
      .table("projects")
      .search("search_name_description", (q) => {
        let searchQuery = q.search("name", args.query);
        searchQuery = searchQuery.eq("isPublic", true);

        if (args.archived !== undefined) {
          searchQuery = searchQuery.eq("archived", args.archived);
        }

        return searchQuery;
      })
      .paginate(args.paginationOpts)
      .map(async (project) => {
        const [owner, memberCount, todoCount] = await Promise.all([
          project.edge("owner"),
          aggregateProjectMembers.count(ctx, {
            namespace: project._id,
            bounds: {} as any,
          }),
          aggregateTodosByProject.count(ctx, {
            namespace: project._id,
            bounds: {
              lower: { key: [false, 0, false], inclusive: true },
              upper: { key: [true, Number.MAX_SAFE_INTEGER, false], inclusive: true },
            },
          }),
        ]);

        return {
          ...project.doc(),
          owner: owner
            ? {
                name: owner.name,
                image: owner.image,
              }
            : null,
          memberCount: memberCount + 1,
          todoCount,
        };
      });
  },
});

// ============================================
// PROJECT MUTATIONS
// ============================================

// Create a new project
export const createProject = createAuthMutation()({
  args: {
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(false),
  },
  returns: zid("projects"),
  handler: async (ctx, args) => {
    // Check for duplicate names for this user
    const existing = await ctx
      .table("projects")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("ownerId"), ctx.userId)
        )
      )
      .first();

    if (existing) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "You already have a project with this name",
      });
    }

    return await ctx.table("projects").insert({
      name: args.name,
      description: args.description,
      isPublic: args.isPublic,
      archived: false,
      ownerId: ctx.userId,
    });
  },
});

// Update project details
export const updateProject = createAuthMutation()({
  args: {
    projectId: zid("projects"),
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    isPublic: z.boolean().optional(),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const project = await ctx.table("projects").getX(args.projectId);

    // Only owner can update
    if (project.ownerId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only project owner can update settings",
      });
    }

    const updates: Partial<Doc<"projects">> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined)
      updates.description = args.description || undefined;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    if (Object.keys(updates).length > 0) {
      await project.patch(updates);
    }

    return null;
  },
});

// Archive/unarchive project
export const archiveProject = createAuthMutation()({
  args: {
    projectId: zid("projects"),
    archived: z.boolean(),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const project = await ctx.table("projects").getX(args.projectId);

    if (project.ownerId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only project owner can archive",
      });
    }

    await project.patch({ archived: args.archived });
    return null;
  },
});

// Delete project (owner only)
export const deleteProject = createAuthMutation()({
  args: {
    projectId: zid("projects"),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const project = await ctx.table("projects").getX(args.projectId);

    if (project.ownerId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only project owner can delete",
      });
    }

    // Delete all todos in project first
    const todos = await project.edge("todos");
    for (const todo of todos) {
      await ctx.table("todos").getX(todo._id).delete();
    }

    // Delete project (this also removes member relationships)
    await project.delete();
    return null;
  },
});

// ============================================
// MEMBER MANAGEMENT
// ============================================

// Add member to project
export const addMember = createAuthMutation()({
  args: {
    projectId: zid("projects"),
    userEmail: z.string().email(),
  },
  returns: z.object({
    userId: zid("users"),
    name: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const project = await ctx.table("projects").getX(args.projectId);

    // Only owner can add members
    if (project.ownerId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only project owner can add members",
      });
    }

    // Find user by email
    const user = await ctx.table("users").get("email", args.userEmail);
    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found with this email",
      });
    }

    // Check if already member
    const isMember = await project.edge("members").has(user._id);
    if (isMember || user._id === project.ownerId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "User is already a member",
      });
    }

    // Add member via join table
    await ctx.table("projectMembers").insert({
      projectId: project._id,
      userId: user._id,
    });

    return {
      userId: user._id,
      name: user.name,
    };
  },
});

// Remove member from project
export const removeMember = createAuthMutation()({
  args: {
    projectId: zid("projects"),
    userId: zid("users"),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const project = await ctx.table("projects").getX(args.projectId);

    // Owner can remove anyone, members can remove themselves
    if (project.ownerId !== ctx.userId && args.userId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    // Can't remove owner
    if (args.userId === project.ownerId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Cannot remove project owner",
      });
    }

    // Find and delete membership
    const membership = await ctx
      .table("projectMembers")
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), project._id),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (membership) {
      await membership.delete();
    }

    return null;
  },
});

// Leave project (for members)
export const leaveProject = createAuthMutation()({
  args: {
    projectId: zid("projects"),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    // Same logic as removeMember but for current user
    const project = await ctx.table("projects").getX(args.projectId);

    // Can't remove owner
    if (ctx.userId === project.ownerId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Cannot remove project owner",
      });
    }

    // Find and delete membership
    const membership = await ctx
      .table("projectMembers")
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), project._id),
          q.eq(q.field("userId"), ctx.userId)
        )
      )
      .first();

    if (membership) {
      await ctx.table("projectMembers").getX(membership._id).delete();
    }

    return null;
  },
});

// ============================================
// INTERNAL FUNCTIONS
// ============================================

// Clean up empty projects (could be scheduled)
export const cleanupEmptyProjects = createInternalMutation()({
  args: {
    daysOld: z.number().default(30),
    batchSize: z.number().default(50),
  },
  returns: z.object({
    deleted: z.number(),
    hasMore: z.boolean(),
  }),
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.daysOld * 24 * 60 * 60 * 1000;

    // Find old projects with no todos
    const candidates = await ctx
      .table("projects")
      .filter((q) =>
        q.and(
          q.eq(q.field("archived"), true),
          q.lt(q.field("_creationTime"), cutoff)
        )
      )
      .take(args.batchSize);

    let deleted = 0;
    for (const project of candidates) {
      const todoCount = await aggregateTodosByProject.count(ctx, {
        namespace: project._id,
        bounds: {} as any,
      });
      if (todoCount === 0) {
        await ctx.table("projects").getX(project._id).delete();
        deleted++;
      }
    }

    return {
      deleted,
      hasMore: candidates.length === args.batchSize,
    };
  },
});
