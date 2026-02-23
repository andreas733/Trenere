"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateMyProfile(data: {
  name: string;
  phone: string | null;
  street: string | null;
  street2: string | null;
  zip: string | null;
  city: string | null;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!trainer) return { error: "Ikke registrert som trener" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("trainers")
    .update({
      name: data.name.trim().slice(0, 200),
      phone: data.phone?.trim().slice(0, 20) || null,
      street: data.street?.trim().slice(0, 200) || null,
      street2: data.street2?.trim().slice(0, 200) || null,
      zip: data.zip?.trim().slice(0, 10) || null,
      city: data.city?.trim().slice(0, 100) || null,
    })
    .eq("id", trainer.id);

  if (error) return { error: error.message };
  return {};
}
