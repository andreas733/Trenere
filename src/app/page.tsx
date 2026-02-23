import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Skien Svømmeklubb
        </h1>
        <p className="text-slate-600">
          Velkommen til trener- og frivilligregistreringen.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/registrer"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Registrer deg som trener
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Admin – Logg inn
          </Link>
        </div>
      </div>
    </main>
  );
}
