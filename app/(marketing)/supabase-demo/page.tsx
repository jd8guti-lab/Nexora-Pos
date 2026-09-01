import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Supabase demo</h1>
      <ul className="space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="rounded border border-slate-200 p-3">
            {todo.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
