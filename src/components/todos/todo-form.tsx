"use client";

import { useState } from "react";
import { useAuthMutation } from "@/lib/convex/hooks";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TodoForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | undefined
  >();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const createTodo = useAuthMutation(api.todos.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    toast.promise(
      createTodo.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate?.getTime(),
      }),
      {
        loading: "Creating todo...",
        success: () => {
          setTitle("");
          setDescription("");
          setPriority(undefined);
          setDueDate(undefined);
          setIsOpen(false);
          onSuccess?.();
          return "Todo created!";
        },
        error: (e) => e.data?.message ?? "Failed to create todo",
      }
    );
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Plus className="h-4 w-4" />
        Add Todo
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dueDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setTitle("");
            setDescription("");
            setPriority(undefined);
            setDueDate(undefined);
            setIsOpen(false);
          }}
          disabled={createTodo.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createTodo.isPending}>
          Create Todo
        </Button>
      </div>
    </form>
  );
}
