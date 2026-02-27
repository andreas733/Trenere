import Link from "next/link";

type Session = {
  id: string;
  title: string;
  total_meters: string | null;
};

export default function TreningsokterTable({ sessions }: { sessions: Session[] }) {
  return (
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
            Tittel
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
            Totale meter
          </th>
          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
            Handlinger
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white">
        {sessions.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">{s.title}</td>
            <td className="px-4 py-3 text-slate-600">
              {s.total_meters || "–"}
            </td>
            <td className="px-4 py-3 text-right">
              <Link
                href={`/admin/treningsokter/${s.id}`}
                className="text-ssk-blue hover:text-ssk-800"
              >
                Rediger
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
