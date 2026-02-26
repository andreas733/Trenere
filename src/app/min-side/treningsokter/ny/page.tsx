import SessionForm from "@/app/admin/(dashboard)/treningsokter/SessionForm";

export const dynamic = "force-dynamic";

export default function NyTreningsoktMinSidePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Legg til treningsøkt
      </h1>
      <SessionForm mode="create" basePath="/min-side/treningsokter" />
    </div>
  );
}
