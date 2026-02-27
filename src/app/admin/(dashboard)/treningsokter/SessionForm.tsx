"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
} from "@/lib/actions/training-sessions";

const STROKES = [
  { value: "", label: "– Velg –" },
  { value: "crawl", label: "Crawl" },
  { value: "rygg", label: "Rygg" },
  { value: "bryst", label: "Bryst" },
  { value: "butterfly", label: "Butterfly" },
  { value: "medley", label: "Medley" },
];

const INTENSITIES = [
  { value: "", label: "– Velg –" },
  { value: "lett", label: "Lett" },
  { value: "moderat", label: "Moderat" },
  { value: "høy", label: "Høy" },
  { value: "topp", label: "Topp" },
];

type SessionFormProps = (
  | { mode: "create" }
  | {
      mode: "edit";
      id: string;
      initialTitle: string;
      initialContent: string;
      initialTotalMeters: string | null;
      initialFocusStroke: string | null;
      initialIntensity: string | null;
    }
) & { basePath?: string };

export default function SessionForm(props: SessionFormProps) {
  const router = useRouter();
  const basePath = props.basePath ?? "/admin/treningsokter";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: props.mode === "edit" ? props.initialTitle : "",
    content: props.mode === "edit" ? props.initialContent : "",
    total_meters: props.mode === "edit" ? (props.initialTotalMeters ?? "") : "",
    focus_stroke: props.mode === "edit" ? (props.initialFocusStroke ?? "") : "",
    intensity: props.mode === "edit" ? (props.initialIntensity ?? "") : "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (props.mode === "create") {
      const result = await createTrainingSession({
        title: formData.title,
        content: formData.content,
        total_meters: formData.total_meters || null,
        focus_stroke: formData.focus_stroke || null,
        intensity: formData.intensity || null,
      });
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(basePath);
      router.refresh();
      return;
    }

    const result = await updateTrainingSession(props.id, {
      title: formData.title,
      content: formData.content,
      total_meters: formData.total_meters || null,
      focus_stroke: formData.focus_stroke || null,
      intensity: formData.intensity || null,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(basePath);
    router.refresh();
  }

  async function handleDelete() {
    if (props.mode !== "edit") return;
    if (!confirm("Er du sikker på at du vil slette denne økten? Planlagte økter som bruker den vil også fjernes.")) return;
    setError(null);
    setLoading(true);
    const result = await deleteTrainingSession(props.id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(basePath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
              Tittel
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
              placeholder="F.eks. Rygg/bryst teknikk + crøving"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-medium text-slate-700">
              Innhold (hele økten)
            </label>
            <textarea
              id="content"
              rows={16}
              value={formData.content}
              onChange={(e) => setFormData((s) => ({ ...s, content: e.target.value }))}
              placeholder="Lim inn eller skriv øktens innhold her..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="total_meters" className="mb-1 block text-sm font-medium text-slate-700">
              Totale meter
            </label>
            <input
              id="total_meters"
              type="text"
              value={formData.total_meters}
              onChange={(e) => setFormData((s) => ({ ...s, total_meters: e.target.value }))}
              placeholder="F.eks. 5150/4850"
              className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="focus_stroke" className="mb-1 block text-sm font-medium text-slate-700">
                Fokussvømmeart
              </label>
              <select
                id="focus_stroke"
                value={formData.focus_stroke}
                onChange={(e) => setFormData((s) => ({ ...s, focus_stroke: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              >
                {STROKES.map((s) => (
                  <option key={s.value || "empty"} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="intensity" className="mb-1 block text-sm font-medium text-slate-700">
                Intensitet
              </label>
              <select
                id="intensity"
                value={formData.intensity}
                onChange={(e) => setFormData((s) => ({ ...s, intensity: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              >
                {INTENSITIES.map((i) => (
                  <option key={i.value || "empty"} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Lagrer..." : props.mode === "create" ? "Legg til" : "Lagre"}
        </button>
        <Link
          href={basePath}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Avbryt
        </Link>
        {props.mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Slett
          </button>
        )}
      </div>
    </form>
  );
}
