"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createWageLevel(data: {
  name: string;
  hourly_wage: number;
  sequence: number;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const admin = createAdminClient();
  const { error } = await admin.from("wage_levels").insert({
    ...data,
    minimum_hours: 0,
  });

  if (error) return { error: error.message };
  return {};
}

export async function updateWageLevel(
  id: string,
  data: {
    name: string;
    hourly_wage: number;
    sequence: number;
  }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const admin = createAdminClient();
  const { error } = await admin.from("wage_levels").update(data).eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function deleteWageLevel(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const admin = createAdminClient();
  const { error } = await admin.from("wage_levels").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}
