import SessionForm from "../SessionForm";

export const dynamic = "force-dynamic";

export default async function NyTreningsoktPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Legg til treningsøkt
      </h1>
      <SessionForm mode="create" />
    </div>
  );
}
