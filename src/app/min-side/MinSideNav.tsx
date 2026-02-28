"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./LogoutButton";

const NAV_LINKS = [
  { href: "/min-side/treningsokter", label: "Treningsøkter", permission: "workoutLibrary" as const },
  { href: "/min-side/planlegging", label: "Planlegging", permission: "planner" as const },
  { href: "/min-side/statistikk", label: "Statistikk", permission: null },
  { href: "/min-side/profil", label: "Min side", permission: null },
];

export default function MinSideNav({
  canAccessWorkoutLibrary = false,
  canAccessPlanner = false,
}: {
  canAccessWorkoutLibrary?: boolean;
  canAccessPlanner?: boolean;
}) {
  const navLinks = NAV_LINKS.filter((link) => {
    if (link.permission === "workoutLibrary") return canAccessWorkoutLibrary;
    if (link.permission === "planner") return canAccessPlanner;
    return true;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-ssk-800 bg-ssk-blue">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/min-side" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Skien Svømmeklubb"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full"
          />
          <span className="text-lg font-semibold text-white">
            Skien Svømmeklubb – Trenere
          </span>
        </Link>

        {/* Desktop nav – hidden on mobile */}
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-white/90 hover:text-white"
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
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/90 hover:bg-white/10 hover:text-white md:hidden"
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
        <div className="border-t border-ssk-800 bg-ssk-700 md:hidden">
          <div className="mx-auto max-w-4xl px-4 py-4 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block min-h-[44px] rounded-lg px-4 py-3 text-white/90 hover:bg-white/10 hover:text-white"
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
