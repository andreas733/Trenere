"use client";

import Link from "next/link";
import Image from "next/image";
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
    <nav className="border-b border-ssk-800 bg-ssk-blue">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/logo-white.png"
            alt="Skien Svømmeklubb"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full"
          />
          <span className="text-lg font-semibold text-white">
            Skien Svømmeklubb – Admin
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-white/90 hover:text-white"
          >
            Trenere
          </Link>
          <Link
            href="/admin/svommere"
            className="text-white/90 hover:text-white"
          >
            Svømmere
          </Link>
          <Link
            href="/admin/kompetanse"
            className="text-white/90 hover:text-white"
          >
            Kompetanseoversikt
          </Link>
          <Link
            href="/admin/wage-levels"
            className="text-white/90 hover:text-white"
          >
            Lønnstrinn
          </Link>
          <Link
            href="/admin/treningsokter"
            className="text-white/90 hover:text-white"
          >
            Treningsøkter
          </Link>
          <Link
            href="/admin/innstillinger"
            className="text-white/90 hover:text-white"
          >
            Innstillinger
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white"
          >
            Logg ut
          </button>
        </div>
      </div>
    </nav>
  );
}
