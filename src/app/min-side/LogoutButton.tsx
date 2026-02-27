"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/min-side/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm text-white/90 hover:text-white"
    >
      Logg ut
    </button>
  );
}
