import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function MinSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/min-side" className="text-lg font-semibold text-slate-800">
            Skien Svømmeklubb – Trenere
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/min-side/treningsokter"
              className="text-slate-600 hover:text-slate-900"
            >
              Treningsøkter
            </Link>
            <Link
              href="/min-side/planlegging"
              className="text-slate-600 hover:text-slate-900"
            >
              Planlegging
            </Link>
            <Link
              href="/min-side/profil"
              className="text-slate-600 hover:text-slate-900"
            >
              Min side
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
