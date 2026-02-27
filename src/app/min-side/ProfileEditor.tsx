"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyProfile } from "./actions";

type Trainer = {
  name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  street: string | null;
  street2: string | null;
  zip: string | null;
  city: string | null;
};

function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("nb-NO");
}

export default function ProfileEditor({ trainer }: { trainer: Trainer }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: trainer.name,
    phone: trainer.phone ?? "",
    street: trainer.street ?? "",
    street2: trainer.street2 ?? "",
    zip: trainer.zip ?? "",
    city: trainer.city ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateMyProfile({
      name: formData.name,
      phone: formData.phone || null,
      street: formData.street || null,
      street2: formData.street2 || null,
      zip: formData.zip || null,
      city: formData.city || null,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Navn
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((s) => ({ ...s, name: e.target.value }))
            }
            className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            E-post (kan ikke endres)
          </label>
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
            {trainer.email}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Telefon
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData((s) => ({ ...s, phone: e.target.value }))
            }
            placeholder="F.eks. 12345678"
            className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fødselsdato (registrert ved registrering)
          </label>
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
            {formatDate(trainer.birthdate)}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Gateadresse
          </label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) =>
              setFormData((s) => ({ ...s, street: e.target.value }))
            }
            placeholder="Gate og husnummer"
            className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Adresselinje 2 (valgfri)
          </label>
          <input
            type="text"
            value={formData.street2}
            onChange={(e) =>
              setFormData((s) => ({ ...s, street2: e.target.value }))
            }
            placeholder="Leilighet, etasje, etc."
            className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Postnummer
            </label>
            <input
              type="text"
              value={formData.zip}
              onChange={(e) =>
                setFormData((s) => ({ ...s, zip: e.target.value }))
              }
              placeholder="1234"
              maxLength={10}
              className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Poststed
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData((s) => ({ ...s, city: e.target.value }))
              }
              placeholder="Oslo"
              className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-ssk-blue px-4 py-2.5 font-medium text-white hover:bg-ssk-700 disabled:opacity-50"
          >
            {loading ? "Lagrer..." : "Lagre"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setFormData({
                name: trainer.name,
                phone: trainer.phone ?? "",
                street: trainer.street ?? "",
                street2: trainer.street2 ?? "",
                zip: trainer.zip ?? "",
                city: trainer.city ?? "",
              });
            }}
            className="min-h-[44px] rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Avbryt
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">Navn</dt>
          <dd className="font-medium text-slate-900">{trainer.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">E-post</dt>
          <dd className="text-slate-900">{trainer.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Telefon</dt>
          <dd className="text-slate-900">{trainer.phone ?? "–"}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Fødselsdato</dt>
          <dd className="text-slate-900">{formatDate(trainer.birthdate)}</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-slate-200 pt-4">
        <h3 className="mb-3 text-sm font-medium text-slate-700">Adresse</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Gateadresse</dt>
            <dd className="text-slate-900">
              {[trainer.street, trainer.street2].filter(Boolean).join(", ") ||
                "–"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Postnummer og sted</dt>
            <dd className="text-slate-900">
              {trainer.zip && trainer.city
                ? `${trainer.zip} ${trainer.city}`
                : "–"}
            </dd>
          </div>
        </dl>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-4 flex min-h-[44px] items-center text-sm text-ssk-blue hover:text-ssk-800"
      >
        Rediger
      </button>
    </>
  );
}
