"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateTrainer(
  id: string,
  data: {
    wage_level_id: string | null;
    minimum_hours: number;
    contract_from_date: string | null;
    contract_to_date: string | null;
  }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const { error } = await supabase
    .from("trainers")
    .update({
      wage_level_id: data.wage_level_id || null,
      minimum_hours: data.minimum_hours,
      contract_from_date: data.contract_from_date || null,
      contract_to_date: data.contract_to_date || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  return {};
}
