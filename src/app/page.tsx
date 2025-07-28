import { TodoList } from "@/components/todos";

export default async function HomePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <TodoList />
    </div>
  );
}
