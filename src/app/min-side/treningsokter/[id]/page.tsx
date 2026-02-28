import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import SessionForm from "@/app/admin/(dashboard)/treningsokter/SessionForm";
import { canAccessWorkoutLibrary } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function RedigerTreningsoktMinSidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");
  if (!(await canAccessWorkoutLibrary())) redirect("/min-side");

  const { data: session } = await supabase
    .from("training_sessions")
    .select("id, title, content, total_meters, focus_stroke, intensity")
    .eq("id", id)
    .single();

  if (!session) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Rediger treningsøkt
      </h1>
      <SessionForm
        mode="edit"
        id={session.id}
        initialTitle={session.title}
        initialContent={session.content}
        initialTotalMeters={session.total_meters}
        initialFocusStroke={session.focus_stroke}
        initialIntensity={session.intensity}
        basePath="/min-side/treningsokter"
      />
    </div>
  );
}
