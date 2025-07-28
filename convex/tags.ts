import { z } from "zod";
import { zid } from "convex-helpers/server/zod";
import { ConvexError } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import {
  createAuthQuery,
  createAuthMutation,
  createPublicQuery,
  createPublicPaginatedQuery,
} from "./functions";
import { aggregateTagUsage } from "./aggregates";

// ============================================
// TAG QUERIES
// ============================================

// List all tags created by the user
export const listMyTags = createAuthQuery()({
  args: {},
  returns: z.array(
    z.object({
      _id: zid("tags"),
      _creationTime: z.number(),
      name: z.string(),
      color: z.string(),
      usageCount: z.number(),
    })
  ),
  handler: async (ctx) => {
    // Get tags created by user
    const tags = await ctx
      .table("tags")
      .filter((q) => q.eq(q.field("createdBy"), ctx.userId))
      .order("asc");

    // Get usage counts in parallel
    return await Promise.all(
      tags.map(async (tag) => {
        const usageCount = await aggregateTagUsage.count(ctx, {
          namespace: tag._id,
          bounds: {} as any,
        });
        return {
          ...tag.doc(),
          usageCount,
        };
      })
    );
  },
});

// Get popular tags (most used)
export const getPopularTags = createPublicQuery()({
  args: {
    limit: z.number().min(1).max(50).default(20),
  },
  returns: z.array(
    z.object({
      _id: zid("tags"),
      name: z.string(),
      color: z.string(),
      usageCount: z.number(),
      creator: z
        .object({
          name: z.string().optional(),
          image: z.string().optional(),
        })
        .nullable(),
    })
  ),
  handler: async (ctx, args) => {
    // Get top tags by usage
    // Get top tags by counting todoTags join table
    const todoTags = await ctx.table("todoTags").take(1000);
    const tagCounts = new Map<Id<"tags">, number>();

    for (const todoTag of todoTags) {
      const count = tagCounts.get(todoTag.tagId) || 0;
      tagCounts.set(todoTag.tagId, count + 1);
    }

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, args.limit);

    // Enrich with tag details
    const enrichedTags = await Promise.all(
      topTags.map(async ([tagId, count]) => {
        const tag = await ctx.table("tags").get(tagId);
        if (!tag) return null;

        const creator = await ctx.table("users").get(tag.createdBy);

        return {
          _id: tag._id,
          name: tag.name,
          color: tag.color,
          usageCount: count,
          creator: creator
            ? {
                name: creator.name,
                image: creator.image,
              }
            : null,
        };
      })
    );

    return enrichedTags.filter((t): t is NonNullable<typeof t> => t !== null);
  },
});

// Search tags by name
export const searchTags = createPublicQuery()({
  args: {
    query: z.string().min(1),
    limit: z.number().min(1).max(20).default(10),
  },
  returns: z.array(
    z.object({
      _id: zid("tags"),
      name: z.string(),
      color: z.string(),
      usageCount: z.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Search tags by name (case-insensitive partial match)
    const tags = await ctx
      .table("tags", "name")
      .filter(
        (q) =>
          q.gte(q.field("name"), args.query.toLowerCase()) &&
          q.lt(q.field("name"), args.query.toLowerCase() + "\uffff")
      )
      .take(args.limit);

    // Get usage counts
    return await Promise.all(
      tags.map(async (tag) => {
        const usageCount = await aggregateTagUsage.count(ctx, {
          namespace: tag._id,
          bounds: {} as any,
        });
        return {
          ...tag.doc(),
          usageCount,
        };
      })
    );
  },
});

// Get tags for a specific todo
export const getTodoTags = createPublicQuery()({
  args: {
    todoId: zid("todos"),
  },
  returns: z.array(
    z.object({
      _id: zid("tags"),
      name: z.string(),
      color: z.string(),
    })
  ),
  handler: async (ctx, args) => {
    const todo = await ctx.table("todos").get(args.todoId);
    if (!todo) return [];

    // Get tags via edge
    const tags = await todo.edge("tags").order("asc");

    return tags.map((tag) => ({
      _id: tag._id,
      name: tag.name,
      color: tag.color,
    }));
  },
});

// Get todos by tag
export const getTodosByTag = createPublicPaginatedQuery()({
  args: {
    tagId: zid("tags"),
    completed: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.table("tags").get(args.tagId);
    if (!tag) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Tag not found",
      });
    }

    // Get todos via edge with pagination
    const result = await tag
      .edge("todos")
      .order("desc")
      .paginate(args.paginationOpts)
      .map(async (todo) => {
        // Apply filter after pagination for many-to-many edges
        if (args.completed !== undefined && todo.completed !== args.completed) {
          return null;
        }

        const user = await todo.edge("user");
        return {
          ...todo.doc(),
          user: user
            ? {
                name: user.name,
                image: user.image,
              }
            : null,
        };
      });

    // Filter out nulls from filtering
    return {
      ...result,
      page: result.page.filter(
        (item): item is NonNullable<typeof item> => item !== null
      ),
    };
  },
});

// ============================================
// TAG MUTATIONS
// ============================================

// Create a new tag
export const createTag = createAuthMutation()({
  args: {
    name: z
      .string()
      .min(1)
      .max(50)
      .transform((s) => s.toLowerCase()),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  },
  returns: zid("tags"),
  handler: async (ctx, args) => {
    // Check for duplicate tag name by this user
    const existing = await ctx
      .table("tags")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("createdBy"), ctx.userId)
        )
      )
      .first();

    if (existing) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "You already have a tag with this name",
      });
    }

    return await ctx.table("tags").insert({
      name: args.name,
      color: args.color,
      createdBy: ctx.userId,
    });
  },
});

// Update tag (name or color)
export const updateTag = createAuthMutation()({
  args: {
    tagId: zid("tags"),
    name: z
      .string()
      .min(1)
      .max(50)
      .transform((s) => s.toLowerCase())
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const tag = await ctx.table("tags").getX(args.tagId);

    // Only creator can update
    if (tag.createdBy !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only tag creator can update",
      });
    }

    const updates: Partial<Doc<"tags">> = {};

    if (args.name !== undefined) {
      // Check for duplicate
      const existing = await ctx
        .table("tags")
        .filter((q) =>
          q.and(
            q.eq(q.field("name"), args.name),
            q.eq(q.field("createdBy"), ctx.userId),
            q.neq(q.field("_id"), args.tagId)
          )
        )
        .first();

      if (existing) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "You already have another tag with this name",
        });
      }

      updates.name = args.name;
    }

    if (args.color !== undefined) {
      updates.color = args.color;
    }

    if (Object.keys(updates).length > 0) {
      await tag.patch(updates);
    }

    return null;
  },
});

// Delete tag (only if unused or by creator)
export const deleteTag = createAuthMutation()({
  args: {
    tagId: zid("tags"),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const tag = await ctx.table("tags").getX(args.tagId);

    // Check permissions
    if (tag.createdBy !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only tag creator can delete",
      });
    }

    // Check usage
    const usageCount = await aggregateTagUsage.count(ctx, {
      namespace: tag._id,
      bounds: {} as any,
    });
    if (usageCount > 0) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: `Cannot delete tag that is used by ${usageCount} todos`,
      });
    }

    await ctx.table("tags").getX(tag._id).delete();
    return null;
  },
});

// ============================================
// TAG ASSIGNMENT
// ============================================

// Add tags to todo
export const addTagsToTodo = createAuthMutation()({
  args: {
    todoId: zid("todos"),
    tagIds: z.array(zid("tags")).min(1).max(10),
  },
  returns: z.object({
    added: z.number(),
    skipped: z.number(),
  }),
  handler: async (ctx, args) => {
    const todo = await ctx.table("todos").getX(args.todoId);

    // Check ownership
    if (todo.userId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Can only tag your own todos",
      });
    }

    let added = 0;
    let skipped = 0;

    for (const tagId of args.tagIds) {
      const tag = await ctx.table("tags").get(tagId);
      if (!tag) {
        skipped++;
        continue;
      }

      // Check if already tagged
      const hasTag = await todo.edge("tags").has(tagId);
      if (hasTag) {
        skipped++;
        continue;
      }

      // Add tag
      await ctx.table("todoTags").insert({
        todoId: todo._id,
        tagId: tagId,
      });
      added++;
    }

    return { added, skipped };
  },
});

// Remove tags from todo
export const removeTagsFromTodo = createAuthMutation()({
  args: {
    todoId: zid("todos"),
    tagIds: z.array(zid("tags")).min(1),
  },
  returns: z.object({
    removed: z.number(),
  }),
  handler: async (ctx, args) => {
    const todo = await ctx.table("todos").getX(args.todoId);

    // Check ownership
    if (todo.userId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Can only untag your own todos",
      });
    }

    let removed = 0;

    for (const tagId of args.tagIds) {
      // Find and remove join record
      const joinRecord = await ctx
        .table("todoTags")
        .filter((q) =>
          q.and(
            q.eq(q.field("todoId"), todo._id),
            q.eq(q.field("tagId"), tagId)
          )
        )
        .first();

      if (joinRecord) {
        await ctx.table("todoTags").getX(joinRecord._id).delete();
        removed++;
      }
    }

    return { removed };
  },
});

// Replace all tags on a todo
export const setTodoTags = createAuthMutation()({
  args: {
    todoId: zid("todos"),
    tagIds: z.array(zid("tags")).max(10),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const todo = await ctx.table("todos").getX(args.todoId);

    // Check ownership
    if (todo.userId !== ctx.userId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Can only tag your own todos",
      });
    }

    // Get current tags
    const currentTags = await todo.edge("tags");
    const currentTagIds = new Set(currentTags.map((t) => t._id));
    const newTagIds = new Set(args.tagIds);

    // Remove tags not in new set
    for (const tag of currentTags) {
      if (!newTagIds.has(tag._id)) {
        const joinRecord = await ctx
          .table("todoTags")
          .filter((q) =>
            q.and(
              q.eq(q.field("todoId"), todo._id),
              q.eq(q.field("tagId"), tag._id)
            )
          )
          .first();

        if (joinRecord) {
          await ctx.table("todoTags").getX(joinRecord._id).delete();
        }
      }
    }

    // Add new tags
    for (const tagId of args.tagIds) {
      if (!currentTagIds.has(tagId)) {
        const tag = await ctx.table("tags").get(tagId);
        if (tag) {
          await ctx.table("todoTags").insert({
            todoId: todo._id,
            tagId: tagId,
          });
        }
      }
    }

    return null;
  },
});

// ============================================
// TAG SUGGESTIONS
// ============================================

// Get tag suggestions based on todo content
export const getSuggestedTags = createAuthQuery()({
  args: {
    todoId: zid("todos"),
    limit: z.number().min(1).max(5).default(5),
  },
  returns: z.array(
    z.object({
      _id: zid("tags"),
      name: z.string(),
      color: z.string(),
      reason: z.enum(["used_together", "similar_todos", "popular"]),
    })
  ),
  handler: async (ctx, args) => {
    const todo = await ctx.table("todos").getX(args.todoId);

    // Get current tags
    const currentTags = await todo.edge("tags");
    const currentTagIds = new Set(currentTags.map((t) => t._id));

    const suggestions: Array<{
      tag: { _id: Id<"tags">; name: string; color: string };
      reason: "used_together" | "similar_todos" | "popular";
      score: number;
    }> = [];

    // Strategy 1: Tags often used together
    if (currentTags.length > 0) {
      for (const tag of currentTags) {
        // Find todos with this tag
        const relatedTodos = await tag.edge("todos").take(20);

        // Count co-occurring tags
        const coOccurrence = new Map<Id<"tags">, number>();
        for (const relatedTodo of relatedTodos) {
          const relatedTags = await relatedTodo.edge("tags");
          for (const relatedTag of relatedTags) {
            if (
              !currentTagIds.has(relatedTag._id) &&
              relatedTag._id !== tag._id
            ) {
              coOccurrence.set(
                relatedTag._id,
                (coOccurrence.get(relatedTag._id) || 0) + 1
              );
            }
          }
        }

        // Add top co-occurring tags
        const sorted = Array.from(coOccurrence.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        for (const [tagId, count] of sorted) {
          const suggestedTag = await ctx.table("tags").get(tagId);
          if (suggestedTag) {
            suggestions.push({
              tag: {
                _id: suggestedTag._id,
                name: suggestedTag.name,
                color: suggestedTag.color,
              },
              reason: "used_together",
              score: count,
            });
          }
        }
      }
    }

    // Strategy 2: Popular tags not yet used
    // Get most used tags by counting todoTags
    const todoTags = await ctx.table("todoTags").take(100);
    const tagCounts = new Map<Id<"tags">, number>();

    for (const todoTag of todoTags) {
      const count = tagCounts.get(todoTag.tagId) || 0;
      tagCounts.set(todoTag.tagId, count + 1);
    }

    const popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [tagId, count] of popularTags) {
      if (!currentTagIds.has(tagId)) {
        const tag = await ctx.table("tags").get(tagId);
        if (tag) {
          suggestions.push({
            tag: {
              _id: tag._id,
              name: tag.name,
              color: tag.color,
            },
            reason: "popular",
            score: count,
          });
        }
      }
    }

    // Sort by score and deduplicate
    const seen = new Set<Id<"tags">>();
    const deduped = suggestions
      .sort((a, b) => b.score - a.score)
      .filter((s) => {
        if (seen.has(s.tag._id)) return false;
        seen.add(s.tag._id);
        return true;
      })
      .slice(0, args.limit);

    return deduped.map((s) => ({
      ...s.tag,
      reason: s.reason,
    }));
  },
});
