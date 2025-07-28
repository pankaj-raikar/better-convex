"use client";

import { useState } from "react";
import { useAuthPaginatedQuery, useCurrentUser } from "@/lib/convex/hooks";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";
import { Button } from "@/components/ui/button";
import { WithSkeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Archive, LogOut, LogIn } from "lucide-react";
import { signOut } from "@/lib/convex/auth-client";
import Link from "next/link";

interface TodoListProps {
  projectId?: Id<"projects">;
  showFilters?: boolean;
}

export function TodoList({ projectId, showFilters = true }: TodoListProps) {
  const user = useCurrentUser();
  const [completedFilter, setCompletedFilter] = useState<boolean | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<
    "low" | "medium" | "high" | undefined
  >();
  const [showDeleted, setShowDeleted] = useState(false);

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAuthPaginatedQuery(
      api.todos.list,
      {
        completed: completedFilter,
        projectId,
        priority: priorityFilter,
      },
      {
        initialNumItems: 10,
        placeholderData: [
          {
            _id: "1" as any,
            _creationTime: Date.now(),
            title: "Example Todo 1",
            description: "This is a placeholder todo item",
            completed: false,
            priority: "medium" as const,
            dueDate: Date.now() + 86400000,
            userId: "user1" as any,
            tags: [],
            project: null,
          },
          {
            _id: "2" as any,
            _creationTime: Date.now() - 86400000,
            title: "Example Todo 2",
            description: "Another placeholder todo item",
            completed: true,
            priority: "low" as const,
            userId: "user1" as any,
            tags: [],
            project: null,
          },
        ],
      }
    );

  const allTodos = data || [];
  const todos = showDeleted
    ? allTodos.filter((todo) => todo.deletionTime)
    : allTodos.filter((todo) => !todo.deletionTime);
  const isEmpty = !isLoading && todos.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Todos</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleted(!showDeleted)}
            className={showDeleted ? "bg-muted" : ""}
          >
            <Archive className="h-4 w-4" />
            {showDeleted ? "Hide" : "Show"} Deleted
          </Button>
          <TodoForm />
          {user && user.id ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <Tabs
            value={
              completedFilter === undefined
                ? "all"
                : completedFilter
                  ? "completed"
                  : "active"
            }
            onValueChange={(value) => {
              setCompletedFilter(
                value === "all" ? undefined : value === "completed"
              );
            }}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={priorityFilter || "all"}
            onValueChange={(value) =>
              setPriorityFilter(value === "all" ? undefined : (value as any))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        {isEmpty ? (
          <div className="text-center py-12 text-muted-foreground">
            {showDeleted
              ? "No deleted todos."
              : completedFilter === false
                ? "No active todos. Great job!"
                : completedFilter === true
                  ? "No completed todos yet."
                  : "No todos yet. Create your first one!"}
          </div>
        ) : (
          <>
            {todos.map((todo, index) => (
              <WithSkeleton
                key={todo._id || index}
                isLoading={isLoading}
                className="w-full"
              >
                <TodoItem todo={todo} />
              </WithSkeleton>
            ))}

            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
