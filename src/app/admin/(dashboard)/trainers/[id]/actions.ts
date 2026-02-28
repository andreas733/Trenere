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
    party_ids: string[];
    can_access_workout_library: boolean;
    can_access_planner: boolean;
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
      can_access_workout_library: data.can_access_workout_library,
      can_access_planner: data.can_access_planner,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const { error: delCertError } = await supabase
    .from("trainer_certifications")
    .delete()
    .eq("trainer_id", id);

  if (delCertError) return { error: delCertError.message };

  if (data.level_ids.length > 0) {
    const { error: insertCertError } = await supabase
      .from("trainer_certifications")
      .insert(
        data.level_ids.map((level_id) => ({ trainer_id: id, level_id }))
      );

    if (insertCertError) return { error: insertCertError.message };
  }

  const { error: delPartyError } = await supabase
    .from("trainer_parties")
    .delete()
    .eq("trainer_id", id);

  if (delPartyError) return { error: delPartyError.message };

  if (data.party_ids.length > 0) {
    const { error: insertPartyError } = await supabase
      .from("trainer_parties")
      .insert(
        data.party_ids.map((party_id) => ({ trainer_id: id, party_id }))
      );

    if (insertPartyError) return { error: insertPartyError.message };
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
