"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/events", label: "Events" },
  { href: "/submit", label: "Submit" },
  { href: "/business", label: "For Business" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-ink-950/70 border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative w-8 h-8">
            <span className="absolute inset-0 bg-ember-glow rounded-full blur-md opacity-70 group-hover:opacity-100 transition" />
            <img src="/logo.svg" alt="CitySip" className="relative w-8 h-8" />
          </span>
          <span className="display text-xl tracking-tight">
            City<span className="ember-text">Sip</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/admin" className="text-xs text-white/40 hover:text-white/70 px-2">
            Admin
          </Link>
          <Link href="/explore" className="ember-btn">Find Happy Hours</Link>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-white/80"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden grid transition-all overflow-hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 border-t border-white/[0.06]">
          <nav className="flex flex-col px-5 py-3 gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-xl text-white/80 hover:bg-white/[0.04]"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/explore" className="ember-btn mt-2 w-full" onClick={() => setOpen(false)}>
              Find Happy Hours
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
