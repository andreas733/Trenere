"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createWageLevel,
  updateWageLevel,
  deleteWageLevel,
} from "./actions";

type WageLevel = {
  id: string;
  name: string;
  hourly_wage: number;
  sequence: number;
};

export default function WageLevelsClient({
  wageLevels: initialLevels,
}: {
  wageLevels: WageLevel[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    hourly_wage: 0,
    sequence: 10,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    hourly_wage: 0,
    sequence: 10,
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createWageLevel(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setFormData({ name: "", hourly_wage: 0, sequence: 10 });
    router.refresh();
  }

  function startEdit(wl: WageLevel) {
    setEditingId(wl.id);
    setEditFormData({
      name: wl.name,
      hourly_wage: wl.hourly_wage,
      sequence: wl.sequence,
    });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    setLoading(true);
    const result = await updateWageLevel(editingId, editFormData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Er du sikker på at du vil slette dette lønnstrinnet?")) return;
    setDeletingId(id);
    setError(null);
    const result = await deleteWageLevel(id);
    setDeletingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="rounded-lg border border-slate-200 bg-white p-6"
      >
        <h2 className="mb-4 font-semibold text-slate-800">Legg til lønnstrinn</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="add_name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Navn
            </label>
            <input
              id="add_name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="F.eks. Nivå 1"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label
              htmlFor="add_hourly"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Timelønn (kr)
            </label>
            <input
              id="add_hourly"
              type="number"
              min={0}
              step={1}
              value={formData.hourly_wage || ""}
              onChange={(e) =>
                setFormData((s) => ({
                  ...s,
                  hourly_wage: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="add_sequence"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Rekkefølge
            </label>
            <input
              id="add_sequence"
              type="number"
              min={0}
              value={formData.sequence || ""}
              onChange={(e) =>
                setFormData((s) => ({
                  ...s,
                  sequence: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Legger til..." : "Legg til"}
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Navn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Timelønn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Rekkefølge
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {initialLevels.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Ingen lønnstrinn. Legg til et nivå ovenfor.
                </td>
              </tr>
            ) : (
              initialLevels.map((wl) =>
                editingId === wl.id ? (
                  <tr key={wl.id} className="bg-slate-50">
                    <td colSpan={4} className="px-4 py-3">
                      <form
                        onSubmit={handleUpdate}
                        className="flex flex-wrap items-center gap-3"
                      >
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) =>
                            setEditFormData((s) => ({
                              ...s,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Navn"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                          required
                        />
                        <input
                          type="number"
                          min={0}
                          value={editFormData.hourly_wage || ""}
                          onChange={(e) =>
                            setEditFormData((s) => ({
                              ...s,
                              hourly_wage: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          placeholder="Timelønn"
                          className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          value={editFormData.sequence || ""}
                          onChange={(e) =>
                            setEditFormData((s) => ({
                              ...s,
                              sequence: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          placeholder="Rekkefølge"
                          className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Lagre
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Avbryt
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={wl.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {wl.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {wl.hourly_wage} kr
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {wl.sequence}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(wl)}
                        className="mr-2 text-blue-600 hover:text-blue-800"
                      >
                        Rediger
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(wl.id)}
                        disabled={deletingId === wl.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === wl.id ? "Sletter..." : "Slett"}
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
