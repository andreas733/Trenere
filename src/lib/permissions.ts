"use server";

import { createClient } from "@/lib/supabase/server";

export type TrainerPermissions = {
  canAccessWorkoutLibrary: boolean;
  canAccessPlanner: boolean;
};

/**
 * Henter modulrettigheter for innlogget bruker.
 * Returnerer null hvis bruker ikke er trener (f.eks. admin som ikke har rad i trainers).
 * For admin-brukere som også er trenere, returneres trenerens rettigheter.
 */
export async function getTrainerPermissions(
  userId: string
): Promise<TrainerPermissions | null> {
  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("can_access_workout_library, can_access_planner")
    .eq("auth_user_id", userId)
    .single();

  if (!trainer) return null;

  return {
    canAccessWorkoutLibrary: trainer.can_access_workout_library ?? false,
    canAccessPlanner: trainer.can_access_planner ?? false,
  };
}

/**
 * Sjekker om innlogget bruker har tilgang til treningsøktbanken.
 * Admin (Azure eller admin_users) får alltid tilgang.
 * Trener må ha can_access_workout_library = true.
 */
export async function canAccessWorkoutLibrary(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const identities = user.identities ?? [];
  const isAzure = identities.some((i) => i.provider === "azure");
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (isAzure || adminRow) return true;

  const permissions = await getTrainerPermissions(user.id);
  return permissions?.canAccessWorkoutLibrary ?? false;
}

/**
 * Sjekker om innlogget bruker har tilgang til planleggeren.
 * Admin (Azure eller admin_users) får alltid tilgang.
 * Trener må ha can_access_planner = true.
 */
export async function canAccessPlanner(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const identities = user.identities ?? [];
  const isAzure = identities.some((i) => i.provider === "azure");
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (isAzure || adminRow) return true;

  const permissions = await getTrainerPermissions(user.id);
  return permissions?.canAccessPlanner ?? false;
}
