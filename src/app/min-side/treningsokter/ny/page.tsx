import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SessionForm from "@/app/admin/(dashboard)/treningsokter/SessionForm";
import { canAccessWorkoutLibrary } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function NyTreningsoktMinSidePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");
  if (!(await canAccessWorkoutLibrary())) redirect("/min-side");
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Legg til treningsøkt
      </h1>
      <SessionForm mode="create" basePath="/min-side/treningsokter" />
    </div>
  );
}
