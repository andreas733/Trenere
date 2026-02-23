"use client";

import { useState } from "react";
import Link from "next/link";
import { registerTrainer } from "./actions";

export default function RegistrerPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await registerTrainer({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      national_identity_number: formData.get("national_identity_number") as string,
      bank_account_number: formData.get("bank_account_number") as string,
      phone: formData.get("phone") as string,
      street: formData.get("street") as string,
      zip: formData.get("zip") as string,
      city: formData.get("city") as string,
      street2: (formData.get("street2") as string) || undefined,
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-green-700">Bekreft e-posten din</h1>
          <p className="text-slate-600">
            Vi har sendt en e-post til deg med en lenke for å bekrefte din konto.
            Klikk på lenken i e-posten for å fullføre registreringen.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-blue-600 hover:underline"
          >
            Tilbake til forsiden
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">
            Velkommen til Skien Svømmeklubb
          </h1>
          <p className="mt-2 text-slate-600">
            Registrer deg som trener eller frivillig. Fyll ut skjemaet under for
            å opprette din konto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              E-post <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Passord <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">Minst 6 tegn</p>
          </div>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Fullt navn <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="national_identity_number" className="mb-1 block text-sm font-medium text-slate-700">
              Fødselsnummer <span className="text-red-500">*</span>
            </label>
            <input
              id="national_identity_number"
              name="national_identity_number"
              type="text"
              required
              placeholder="11 siffer"
              maxLength={20}
              pattern="\d{11}"
              title="Fødselsnummer må være 11 siffer"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="bank_account_number" className="mb-1 block text-sm font-medium text-slate-700">
              Bankkonto (IBAN eller kontonummer) <span className="text-red-500">*</span>
            </label>
            <input
              id="bank_account_number"
              name="bank_account_number"
              type="text"
              required
              placeholder="F.eks. NO1234567890123"
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
              Telefon <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="F.eks. 12345678"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="street" className="mb-1 block text-sm font-medium text-slate-700">
              Gateadresse <span className="text-red-500">*</span>
            </label>
            <input
              id="street"
              name="street"
              type="text"
              required
              placeholder="Gate og husnummer"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="street2" className="mb-1 block text-sm font-medium text-slate-700">
              Adresselinje 2 (valgfri)
            </label>
            <input
              id="street2"
              name="street2"
              type="text"
              placeholder="Leilighet, etasje, etc."
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="zip" className="mb-1 block text-sm font-medium text-slate-700">
                Postnummer <span className="text-red-500">*</span>
              </label>
              <input
                id="zip"
                name="zip"
                type="text"
                required
                placeholder="1234"
                maxLength={10}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
                Poststed <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                placeholder="Oslo"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Registrerer..." : "Registrer deg"}
            </button>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
