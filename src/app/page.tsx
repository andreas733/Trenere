import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TrainerLoginForm from "./TrainerLoginForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: trainer } = await supabase
      .from("trainers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    if (trainer) {
      redirect("/min-side");
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo.png"
            alt="Skien Svømmeklubb"
            width={80}
            height={80}
            className="h-20 w-20 rounded-full"
          />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">
          Skien Svømmeklubb
        </h1>
        <p className="mb-6 text-slate-600">
          Logg inn for å se din registrerte informasjon.
        </p>

        <TrainerLoginForm />

        <p className="mt-4 text-center text-sm text-slate-500">
          Har du ikke konto?{" "}
          <Link href="/registrer" className="text-ssk-blue hover:underline">
            Registrer deg som trener
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Etter registrering må du bekrefte e-posten din før du kan logge inn.
        </p>
      </div>

      <Link
        href="/admin"
        className="fixed bottom-4 right-4 rounded-md bg-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-300"
      >
        Admin
      </Link>
    </main>
  );
}
