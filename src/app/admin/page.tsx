"use client";

import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, RefreshCw, KeyRound, ExternalLink } from "lucide-react";

type Submission = {
  id: string;
  type: string;
  placeId?: string | null;
  payload: any;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Restore from localStorage so refreshing the page doesn't kick you out
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("citysip-admin-token") : null;
    if (saved) {
      setToken(saved);
      load(saved);
    }
  }, []);

  async function load(t?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/submissions", {
        headers: { "x-admin-token": t ?? token },
        cache: "no-store"
      });
      if (res.status === 401) {
        setError("Invalid admin token.");
        setUnlocked(false);
        return;
      }
      const data = await res.json();
      setSubs(data.submissions ?? []);
      setUnlocked(true);
      if (t) localStorage.setItem("citysip-admin-token", t);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function act(id: string, status: "approved" | "rejected") {
    const prev = subs;
    setSubs((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id, status })
    });
    if (!res.ok) setSubs(prev);
  }

  function signOut() {
    localStorage.removeItem("citysip-admin-token");
    setToken("");
    setUnlocked(false);
    setSubs([]);
  }

  const visible = subs.filter((s) => (filter === "all" ? true : s.status === filter));
  const counts = {
    pending: subs.filter((s) => s.status === "pending").length,
    approved: subs.filter((s) => s.status === "approved").length,
    rejected: subs.filter((s) => s.status === "rejected").length
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="glass-strong rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-ember-500/15 text-ember-400 flex items-center justify-center mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="display text-3xl mb-2">Admin gate</h1>
          <p className="text-ink-300 text-sm mb-6">
            Paste your <code className="mono text-ember-300">ADMIN_TOKEN</code> to review pending submissions.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="space-y-3"
          >
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Admin token"
                className="input pl-10"
                type="password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-coral-400">{error}</p>
            )}
            <button type="submit" disabled={loading || !token} className="ember-btn w-full">
              {loading ? "Checking…" : "Unlock"}
            </button>
          </form>
          <p className="text-xs text-ink-400 mt-6">
            Set <code className="mono">ADMIN_TOKEN</code> in your <code className="mono">.env</code> file
            to change this. Leaving it unset disables the gate (dev only).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-ember-400 mb-1">CitySip · admin</p>
          <h1 className="display text-4xl">Submissions queue</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} className="ghost-btn" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={signOut} className="ghost-btn">Sign out</button>
        </div>
      </div>

      {/* counts */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Pending" value={counts.pending} active={filter === "pending"} onClick={() => setFilter("pending")} accent />
        <Stat label="Approved" value={counts.approved} active={filter === "approved"} onClick={() => setFilter("approved")} />
        <Stat label="Rejected" value={counts.rejected} active={filter === "rejected"} onClick={() => setFilter("rejected")} />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setFilter("all")} className={`chip ${filter === "all" ? "chip-active" : ""}`}>
          All ({subs.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-ink-400">
          {loading ? "Loading…" : "Nothing in this bucket yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((s) => (
            <SubmissionCard key={s.id} sub={s} onAct={act} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  active,
  onClick,
  accent
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-5 transition border ${
        active
          ? "border-ember-500/60 bg-ember-500/[0.08]"
          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
      }`}
    >
      <div className={`text-xs uppercase tracking-wider ${accent ? "text-ember-400" : "text-ink-400"}`}>
        {label}
      </div>
      <div className="display text-3xl mt-1">{value}</div>
    </button>
  );
}

function SubmissionCard({ sub, onAct }: { sub: Submission; onAct: (id: string, status: "approved" | "rejected") => void }) {
  const created = new Date(sub.createdAt);
  const dateLabel = created.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

  const typeLabel: Record<string, string> = {
    "new-place": "New place",
    "update-deal": "Update deal",
    "menu-photo": "Menu photo",
    "report-error": "Error report"
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="chip chip-active">{typeLabel[sub.type] ?? sub.type}</span>
            <StatusPill status={sub.status} />
            <span className="text-xs text-ink-400 mono">{dateLabel}</span>
          </div>
          <h3 className="font-semibold text-cream">
            {sub.payload?.venueName || sub.payload?.dealTitle || sub.payload?.message?.slice(0, 80) || "Untitled submission"}
          </h3>
          {sub.placeId && (
            <a
              href={`/place/${sub.placeId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-ember-400 hover:underline mt-1"
            >
              View place <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {sub.status === "pending" && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onAct(sub.id, "approved")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
            >
              <Check className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => onAct(sub.id, "rejected")}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm bg-coral-500/15 text-coral-300 border border-coral-500/30 hover:bg-coral-500/25 transition"
            >
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="text-xs text-ink-400 cursor-pointer hover:text-ink-200 select-none">
          Payload
        </summary>
        <pre className="mt-2 text-xs mono bg-black/40 border border-white/5 rounded-xl p-3 overflow-x-auto text-ink-200">
{JSON.stringify(sub.payload, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function StatusPill({ status }: { status: Submission["status"] }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    rejected: "bg-coral-500/15 text-coral-300 border-coral-500/30"
  } as const;
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}
