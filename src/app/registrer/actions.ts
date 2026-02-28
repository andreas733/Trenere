"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { birthdateFromNationalId } from "@/lib/utils/birthdate";

export async function registerTrainer(data: {
  email: string;
  password: string;
  name: string;
  national_identity_number: string;
  bank_account_number: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  street2?: string;
}): Promise<{ error?: string }> {
  const nationalId = data.national_identity_number.replace(/\s/g, "");
  if (nationalId.length !== 11 || !/^\d{11}$/.test(nationalId)) {
    return { error: "Fødselsnummer må være 11 siffer." };
  }

  if (!data.bank_account_number?.trim()) {
    return { error: "Bankkonto er påkrevd." };
  }
  if (!data.phone?.trim()) {
    return { error: "Telefon er påkrevd." };
  }
  if (!data.street?.trim()) {
    return { error: "Gateadresse er påkrevd." };
  }
  if (!data.zip?.trim()) {
    return { error: "Postnummer er påkrevd." };
  }
  if (!data.city?.trim()) {
    return { error: "Poststed er påkrevd." };
  }

  const supabase = createAdminClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/`,
      data: {
        name: data.name,
      },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Denne e-postadressen er allerede registrert." };
    }
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Kunne ikke opprette bruker." };
  }

  const birthdate = birthdateFromNationalId(nationalId);

  const { error: insertError } = await supabase.from("trainers").insert({
    auth_user_id: authData.user.id,
    email: data.email,
    name: data.name.trim(),
    national_identity_number: nationalId.slice(0, 20),
    birthdate: birthdate || null,
    bank_account_number: data.bank_account_number.trim().replace(/\s/g, "").slice(0, 30),
    phone: data.phone.trim().slice(0, 20),
    street: data.street.trim().slice(0, 200),
    street2: data.street2?.trim().slice(0, 200) || null,
    zip: data.zip.trim().slice(0, 10),
    city: data.city.trim().slice(0, 100),
    can_access_workout_library: false,
    can_access_planner: false,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Denne e-postadressen er allerede registrert." };
    }
    return { error: insertError.message };
  }

  return {};
}
