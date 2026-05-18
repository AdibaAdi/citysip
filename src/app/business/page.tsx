"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Building2, Sparkles, TrendingUp, Megaphone, ShieldCheck, ArrowRight } from "lucide-react";

const PERKS = [
  {
    icon: Megaphone,
    title: "Own your listing",
    body: "Update your happy-hour times, post limited-run deals, and add event nights — all in one place."
  },
  {
    icon: TrendingUp,
    title: "Show up at the right moment",
    body: "CitySip surfaces your venue to thirsty locals the minute your deal goes live. Free traffic, real intent."
  },
  {
    icon: Sparkles,
    title: "Featured placement",
    body: "Run promoted slots on city pages and the Happening Now rail for special events and slow nights."
  },
  {
    icon: ShieldCheck,
    title: "Verified badge",
    body: "Earn the verified mark once you've claimed your profile — guests trust accurate, owner-confirmed info."
  }
];

export default function BusinessPage() {
  const [form, setForm] = useState({
    venueName: "",
    city: "",
    role: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    website: "",
    message: ""
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new-place",
          payload: {
            kind: "business-claim",
            ...form
          }
        })
      });
      if (res.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-ember-glow opacity-60" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 chip mb-6">
            <Building2 className="w-3.5 h-3.5 text-ember-400" />
            <span className="text-xs tracking-wide">For restaurants &amp; bars</span>
          </div>
          <h1 className="display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] max-w-4xl">
            Put your <span className="ember-text">happy hour</span> in front of the right room.
          </h1>
          <p className="mt-6 text-lg text-ink-300 max-w-2xl">
            Claim your CitySip profile to control your deals, push limited-time offers,
            and reach guests who are already searching for somewhere to go — right now.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#claim" className="ember-btn">
              Claim your venue <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/explore" className="ghost-btn">See it in action</Link>
          </div>

          {/* stats strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["15", "Launch cities"],
              ["100%", "Free to claim"],
              ["< 24h", "Avg review time"],
              ["1-tap", "Deal updates"]
            ].map(([n, l]) => (
              <div key={l} className="glass rounded-2xl p-5">
                <div className="display text-3xl ember-text">{n}</div>
                <div className="text-xs text-ink-400 mt-1 uppercase tracking-wider">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* perks */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="display text-3xl sm:text-4xl mb-10">Why list on CitySip</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PERKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition">
              <div className="w-10 h-10 rounded-xl bg-ember-500/15 text-ember-400 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-cream">{title}</h3>
              <p className="text-ink-300 mt-2 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="divider mb-12" />
        <h2 className="display text-3xl sm:text-4xl mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ["01", "Send a claim", "Tell us your venue, your role, and how we can reach you. Takes about a minute."],
            ["02", "We verify", "Our team confirms ownership by email or phone within 24 hours."],
            ["03", "Go live", "Edit your deals, post events, and watch your live badge light up in the app."]
          ].map(([n, t, b]) => (
            <div key={n} className="glass rounded-2xl p-6">
              <div className="display text-4xl ember-text">{n}</div>
              <h3 className="mt-4 font-semibold text-lg text-cream">{t}</h3>
              <p className="text-ink-300 mt-2 text-sm">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* form */}
      <section id="claim" className="max-w-3xl mx-auto px-6 py-16">
        <div className="glass-strong rounded-3xl p-8 sm:p-10">
          {sent ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-ember-500/20 text-ember-400 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="display text-3xl mb-3">Claim received</h2>
              <p className="text-ink-300 max-w-md mx-auto">
                Thanks for reaching out. We'll verify ownership and email you back within 24 hours
                with login details for your venue dashboard.
              </p>
              <Link href="/" className="ghost-btn mt-6 inline-flex">Back to home</Link>
            </div>
          ) : (
            <>
              <h2 className="display text-3xl mb-2">Claim your venue</h2>
              <p className="text-ink-300 mb-8 text-sm">
                We'll review and reach out within one business day. No commitment, no card required.
              </p>
              <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
                <Field label="Venue name" required>
                  <input
                    required
                    value={form.venueName}
                    onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                    className="input"
                    placeholder="The Aviary"
                  />
                </Field>
                <Field label="City" required>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input"
                    placeholder="Chicago, IL"
                  />
                </Field>
                <Field label="Your role" required>
                  <select
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input"
                  >
                    <option value="">Select…</option>
                    <option>Owner</option>
                    <option>General manager</option>
                    <option>Marketing</option>
                    <option>Other staff</option>
                  </select>
                </Field>
                <Field label="Your name" required>
                  <input
                    required
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    className="input"
                    placeholder="Jordan Reyes"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    required
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                    className="input"
                    placeholder="you@venue.com"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    placeholder="(555) 555-0123"
                  />
                </Field>
                <Field label="Website" className="sm:col-span-2">
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="input"
                    placeholder="https://"
                  />
                </Field>
                <Field label="Anything else?" className="sm:col-span-2">
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input"
                    placeholder="Existing happy-hour times, special events, etc."
                  />
                </Field>
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-ink-400">
                    By submitting you agree to our terms and to be contacted about your listing.
                  </p>
                  <button type="submit" disabled={loading} className="ember-btn">
                    {loading ? "Sending…" : "Submit claim"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs uppercase tracking-wider text-ink-400">
        {label} {required && <span className="text-ember-400">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
