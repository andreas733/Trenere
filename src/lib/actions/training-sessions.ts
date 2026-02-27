"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function ensureTrainerOrAdmin(): Promise<
  { trainerId: string } | { isAdmin: true } | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (trainer) return { trainerId: trainer.id };

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (adminRow) return { isAdmin: true };

  return { error: "Kun trenere og admin kan bruke denne funksjonen" };
}

export async function createTrainingSession(data: {
  title: string;
  content: string;
  total_meters?: string | null;
  focus_stroke?: string | null;
  intensity?: string | null;
}): Promise<{ error?: string; id?: string }> {
  const auth = await ensureTrainerOrAdmin();
  if ("error" in auth) return { error: auth.error };

  const admin = createAdminClient();
  const trainerId = "trainerId" in auth ? auth.trainerId : null;

  const { data: row, error } = await admin
    .from("training_sessions")
    .insert({
      title: data.title.trim().slice(0, 500),
      content: data.content,
      total_meters: data.total_meters?.trim().slice(0, 100) || null,
      focus_stroke: data.focus_stroke?.trim() || null,
      intensity: data.intensity?.trim() || null,
      created_by: trainerId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/treningsokter");
  revalidatePath("/min-side/treningsokter");
  revalidatePath("/min-side/planlegging");
  return { id: row?.id };
}

export async function updateTrainingSession(
  id: string,
  data: {
    title: string;
    content: string;
    total_meters?: string | null;
    focus_stroke?: string | null;
    intensity?: string | null;
  }
): Promise<{ error?: string }> {
  const auth = await ensureTrainerOrAdmin();
  if ("error" in auth) return { error: auth.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("training_sessions")
    .update({
      title: data.title.trim().slice(0, 500),
      content: data.content,
      total_meters: data.total_meters?.trim().slice(0, 100) || null,
      focus_stroke: data.focus_stroke?.trim() || null,
      intensity: data.intensity?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/treningsokter");
  revalidatePath("/min-side/treningsokter");
  revalidatePath("/min-side/planlegging");
  return {};
}

export async function deleteTrainingSession(id: string): Promise<{ error?: string }> {
  const auth = await ensureTrainerOrAdmin();
  if ("error" in auth) return { error: auth.error };

  const admin = createAdminClient();
  const { error } = await admin.from("training_sessions").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/treningsokter");
  revalidatePath("/min-side/treningsokter");
  revalidatePath("/min-side/planlegging");
  return {};
}

export async function planSession(
  sessionId: string,
  plannedDate: string,
  partyId: string
): Promise<{ error?: string }> {
  const auth = await ensureTrainerOrAdmin();
  if ("error" in auth) return { error: auth.error };

  const admin = createAdminClient();
  const trainerId = "trainerId" in auth ? auth.trainerId : null;

  const { error } = await admin.from("planned_sessions").insert({
    session_id: sessionId,
    planned_date: plannedDate,
    planned_by: trainerId,
    party_id: partyId,
  });

  if (error) return { error: error.message };
  revalidatePath("/min-side/planlegging");
  revalidatePath("/admin/treningsokter");
  return {};
}

export async function unplanSession(id: string): Promise<{ error?: string }> {
  const auth = await ensureTrainerOrAdmin();
  if ("error" in auth) return { error: auth.error };

  const admin = createAdminClient();
  const { error } = await admin.from("planned_sessions").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/min-side/planlegging");
  revalidatePath("/admin/treningsokter");
  return {};
}

export async function planSessionWithAIContent(data: {
  plannedDate: string;
  title: string;
  content: string;
  totalMeters?: string | null;
  focusStroke?: string | null;
  intensity?: string | null;
  partyId: string;
}): Promise<{ error?: string }> {
  const auth = await ensureTrainerOrAdmin();
  if ("error" in auth) return { error: auth.error };

  const admin = createAdminClient();
  const trainerId = "trainerId" in auth ? auth.trainerId : null;

  const { error } = await admin.from("planned_sessions").insert({
    session_id: null,
    planned_date: data.plannedDate,
    planned_by: trainerId,
    party_id: data.partyId,
    ai_title: data.title.trim().slice(0, 500),
    ai_content: data.content,
    ai_total_meters: data.totalMeters?.trim().slice(0, 100) || null,
    ai_focus_stroke: data.focusStroke?.trim() || null,
    ai_intensity: data.intensity?.trim() || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/min-side/planlegging");
  revalidatePath("/admin/treningsokter");
  return {};
}
