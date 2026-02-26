import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import SessionForm from "../SessionForm";

export const dynamic = "force-dynamic";

export default async function RedigerTreningsoktPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: session } = await admin
    .from("training_sessions")
    .select("id, title, content, total_meters")
    .eq("id", id)
    .single();

  if (!session) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Rediger treningsøkt
      </h1>
      <SessionForm
        mode="edit"
        id={session.id}
        initialTitle={session.title}
        initialContent={session.content}
        initialTotalMeters={session.total_meters}
      />
    </div>
  );
}
