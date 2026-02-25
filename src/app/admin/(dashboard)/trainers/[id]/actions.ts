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
    contract_fast: boolean;
    level_ids: string[];
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
      contract_to_date: data.contract_fast ? null : (data.contract_to_date || null),
      contract_fast: data.contract_fast,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const { error: delError } = await supabase
    .from("trainer_certifications")
    .delete()
    .eq("trainer_id", id);

  if (delError) return { error: delError.message };

  if (data.level_ids.length > 0) {
    const { error: insertError } = await supabase
      .from("trainer_certifications")
      .insert(
        data.level_ids.map((level_id) => ({ trainer_id: id, level_id }))
      );

    if (insertError) return { error: insertError.message };
  }

  return {};
}

export async function deleteTrainer(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const admin = createAdminClient();
  const { error } = await admin.from("trainers").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}
