"use client";

import { useState , Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Send } from "lucide-react";

function SubmitInner() {
  const sp = useSearchParams();
  const placeIdParam = sp.get("placeId") ?? "";
  const typeParam = (sp.get("type") as any) ?? "new-place";

  const [type, setType] = useState<"new-place" | "update-deal" | "menu-photo" | "report-error">(typeParam);
  const [placeId, setPlaceId] = useState(placeIdParam);
  const [form, setForm] = useState({
    venueName: "",
    citySlug: "chicago",
    address: "",
    dealTitle: "",
    description: "",
    priceHint: "",
    daysOfWeek: [] as string[],
    startTime: "16:00",
    endTime: "19:00",
    submitterName: "",
    submitterEmail: "",
    notes: ""
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleDay(d: string) {
    setForm((s) => ({
      ...s,
      daysOfWeek: s.daysOfWeek.includes(d)
        ? s.daysOfWeek.filter((x) => x !== d)
        : [...s.daysOfWeek, d]
    }));
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          placeId: placeId || undefined,
          payload: form
        })
      });
      if (res.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-ember-500/20 border border-ember-500/40 flex items-center justify-center">
          <Check className="text-ember-300" />
        </div>
        <h1 className="display text-4xl mt-5">Submission received.</h1>
        <p className="text-white/65 mt-3">
          Thanks for helping CitySip stay accurate. Our team will review and publish
          your update within 24 hours.
        </p>
        <button onClick={() => { setSent(false); setForm({ ...form, dealTitle: "" }); }}
          className="ember-btn mt-6">Submit another</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 pt-10 pb-20">
      <p className="chip mono text-[10px] mb-3">Community submissions</p>
      <h1 className="display text-4xl md:text-5xl tracking-tight">
        Help others <span className="ember-text">sip the city.</span>
      </h1>
      <p className="text-white/65 mt-3 max-w-xl">
        Spotted a deal we missed? Know a place where the menu changed?
        Submit it — our editors verify within 24 hours.
      </p>

      {/* Type picker */}
      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ["new-place",    "Add a new place"],
          ["update-deal",  "Update a deal"],
          ["menu-photo",   "Submit a menu photo"],
          ["report-error", "Report an error"]
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setType(k as any)}
            className={`chip ${type === k ? "chip-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 glass rounded-2xl p-6 space-y-5">
        <Field label="Venue name">
          <input
            value={form.venueName}
            onChange={(e) => setForm({ ...form, venueName: e.target.value })}
            placeholder="e.g. The Aviary Loop"
            className="input"
          />
        </Field>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="City">
            <select
              value={form.citySlug}
              onChange={(e) => setForm({ ...form, citySlug: e.target.value })}
              className="input"
            >
              {[
                ["chicago", "Chicago"], ["new-york", "New York"], ["san-francisco", "San Francisco"],
                ["seattle", "Seattle"], ["los-angeles", "Los Angeles"], ["philadelphia", "Philadelphia"],
                ["raleigh", "Raleigh"], ["sacramento", "Sacramento"], ["boston", "Boston"],
                ["washington-dc", "Washington DC"], ["austin", "Austin"], ["miami", "Miami"],
                ["atlanta", "Atlanta"], ["jersey-city", "Jersey City"], ["charlotte", "Charlotte"]
              ].map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          </Field>
          <Field label="Address">
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 N State St"
              className="input"
            />
          </Field>
        </div>

        {(type === "new-place" || type === "update-deal") && (
          <>
            <div className="divider" />
            <Field label="Deal title">
              <input
                value={form.dealTitle}
                onChange={(e) => setForm({ ...form, dealTitle: e.target.value })}
                placeholder="Golden Hour"
                className="input"
              />
            </Field>

            <Field label="Deal description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="$5 well drinks, $1 oysters"
                className="input"
              />
            </Field>

            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Price hint">
                <input
                  value={form.priceHint}
                  onChange={(e) => setForm({ ...form, priceHint: e.target.value })}
                  placeholder="$5 drinks"
                  className="input"
                />
              </Field>
              <Field label="Starts">
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input" />
              </Field>
              <Field label="Ends">
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input" />
              </Field>
            </div>

            <Field label="Days of week">
              <div className="flex flex-wrap gap-2">
                {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => (
                  <button key={d} type="button"
                    onClick={() => toggleDay(d)}
                    className={`chip mono ${form.daysOfWeek.includes(d) ? "chip-active" : ""}`}>{d}</button>
                ))}
              </div>
            </Field>
          </>
        )}

        <div className="divider" />

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Your name">
            <input value={form.submitterName} onChange={(e) => setForm({ ...form, submitterName: e.target.value })} className="input" />
          </Field>
          <Field label="Your email">
            <input type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })} className="input" />
          </Field>
        </div>

        <Field label="Notes for the editor (optional)">
          <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" />
        </Field>

        <button onClick={submit} disabled={loading} className="ember-btn w-full sm:w-auto">
          <Send size={14} /> {loading ? "Submitting…" : "Submit for review"}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          font-size: 14px;
          outline: none;
        }
        .input:focus { border-color: rgba(255,122,26,0.4); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-12 text-ink-400">Loading…</div>}>
      <SubmitInner />
    </Suspense>
  );
}
