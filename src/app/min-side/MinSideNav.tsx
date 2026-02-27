"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const NAV_LINKS = [
  { href: "/min-side/treningsokter", label: "Treningsøkter" },
  { href: "/min-side/planlegging", label: "Planlegging" },
  { href: "/min-side/statistikk", label: "Statistikk" },
  { href: "/min-side/profil", label: "Min side" },
];

export default function MinSideNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/min-side" className="text-lg font-semibold text-slate-800">
          Skien Svømmeklubb – Trenere
        </Link>

        {/* Desktop nav – hidden on mobile */}
        <div className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-slate-600 hover:text-slate-900"
            >
              {label}
            </Link>
          ))}
          <LogoutButton />
        </div>

        {/* Mobile: Hamburger button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile: Dropdown menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-4xl px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block min-h-[44px] rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                {label}
              </Link>
            ))}
            <div className="min-h-[44px] pt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
