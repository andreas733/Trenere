"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="text-lg font-semibold text-slate-800">
          Skien Svømmeklubb – Admin
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-slate-600 hover:text-slate-900"
          >
            Trenere
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Logg ut
          </button>
        </div>
      </div>
    </nav>
  );
}
