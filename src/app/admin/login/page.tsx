"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  async function handleLoginWithMicrosoft() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });
    if (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">
          Admin – Skien Svømmeklubb
        </h1>
        <p className="mb-6 text-slate-600">
          Logg inn med Microsoft-kontoen din for å administrere kontrakter.
        </p>

        {errorParam === "unauthorized" && (
          <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Du har ikke tilgang til admin-dashboardet. Kun administratorer kan
            logge inn her.
          </div>
        )}

        <button
          onClick={handleLoginWithMicrosoft}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? (
            "Logger inn..."
          ) : (
            <>
              <svg
                className="h-5 w-5"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="10" height="10" fill="#F25022" />
                <rect x="11" width="10" height="10" fill="#7FBA00" />
                <rect y="11" width="10" height="10" fill="#00A4EF" />
                <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
              </svg>
              Logg inn med Microsoft
            </>
          )}
        </button>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-700"
        >
          Tilbake til forsiden
        </Link>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <p className="text-slate-600">Laster...</p>
        </div>
      </main>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
