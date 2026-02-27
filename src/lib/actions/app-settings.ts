"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAppSetting(key: string): Promise<boolean | string | number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) return null;

  const v = data.value;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v;
  if (typeof v === "number") return v;
  return null;
}

export async function updateAppSetting(
  key: string,
  value: boolean | string | number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke innlogget" };

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminRow) {
    return { error: "Kun administratorer kan endre innstillinger" };
  }

  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) return { error: error.message };
  return {};
}
