import StatistikkClient from "./StatistikkClient";

export const dynamic = "force-dynamic";

function getDefaultPeriod() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  return { from, to };
}

export default async function StatistikkPage() {
  const { from, to } = getDefaultPeriod();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Statistikk – treningsøkter</h1>
      <StatistikkClient initialFrom={from} initialTo={to} />
    </div>
  );
}
