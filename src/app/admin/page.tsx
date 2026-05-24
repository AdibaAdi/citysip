"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check, X, ShieldAlert, RefreshCw, KeyRound, ExternalLink,
  Download, Building2, AlertTriangle, BarChart3, Database,
  MapPin, Star, Zap, Clock, Shield
} from "lucide-react";

/* ──────────── types ────────────── */
type Status = "pending" | "approved" | "rejected";
interface Submission {
  id: string; type: string; placeId?: string | null;
  payload: Record<string, unknown>; status: Status; createdAt: string;
}
interface Claim {
  id: string; placeId?: string | null; email: string;
  fullName: string; venueName?: string | null; message?: string | null;
  status: Status; createdAt: string;
}
interface UnverifiedDeal {
  id: string; title: string; priceHint?: string | null; source: string;
  place: { id: string; slug: string; name: string };
}
interface RecentPlace {
  id: string; slug: string; name: string; source?: string | null;
  isVerified: boolean; rating: number; lastSyncedAt?: string | null;
  city: { name: string; slug: string };
}
interface CityHealth {
  id: string; slug: string; name: string; places: number; events: number;
  verifiedPlaces: number; unverifiedDeals: number;
}
interface Overview {
  noDatabase: boolean;
  counts: { places: number; deals: number; events: number; submissions: number; claims: number };
  cityHealth: CityHealth[];
  recentlySynced: RecentPlace[];
  unverifiedDeals: UnverifiedDeal[];
}

const SECTIONS = ["Queue", "Claims", "Import", "Places", "Deals", "Cities"] as const;
type Section = (typeof SECTIONS)[number];

/* ──────────── helpers ────────────── */
const rel = (d: string) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ──────────── root component ────────────── */
export default function AdminPage() {
  const [token, setToken]       = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [section, setSection]   = useState<Section>("Queue");

  // dashboard data
  const [overview, setOverview]   = useState<Overview | null>(null);
  const [subs, setSubs]           = useState<Submission[]>([]);
  const [claims, setClaims]       = useState<Claim[]>([]);
  const [subsFilter, setSubsFilter] = useState<Status | "all">("pending");
  const [claimsFilter, setClaimsFilter] = useState<Status | "all">("pending");

  // import state
  const [importSlug, setImportSlug]     = useState("");
  const [importLimit, setImportLimit]   = useState(30);
  const [importResult, setImportResult] = useState<Record<string, unknown> | null>(null);
  const [importing, setImporting]       = useState<"venues" | "events" | null>(null);

  const savedToken = useRef("");

  /* restore token */
  useEffect(() => {
    const t = localStorage.getItem("citysip-admin-token") ?? "";
    if (t) { setToken(t); savedToken.current = t; load(t); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* auth header */
  const hdrs = useCallback(
    (t?: string) => ({ "x-admin-token": t ?? savedToken.current, "Content-Type": "application/json" }),
    []
  );

  async function load(t?: string) {
    setLoading(true); setAuthError(null);
    try {
      const tk = t ?? savedToken.current;
      const [overRes, subRes, claimRes] = await Promise.all([
        fetch("/api/admin/overview",    { headers: hdrs(tk), cache: "no-store" }),
        fetch("/api/admin/submissions", { headers: hdrs(tk), cache: "no-store" }),
        fetch("/api/admin/claims",      { headers: hdrs(tk), cache: "no-store" }),
      ]);
      if (overRes.status === 401 || subRes.status === 401) {
        setAuthError("Invalid admin token."); setUnlocked(false); return;
      }
      const [ov, subData, claimData] = await Promise.all([
        overRes.json(), subRes.json(), claimRes.json()
      ]);
      setOverview(ov);
      setSubs(subData.submissions ?? []);
      setClaims(claimData.claims ?? []);
      setUnlocked(true);
      if (t) { localStorage.setItem("citysip-admin-token", t); savedToken.current = t; }
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function actSub(id: string, status: "approved" | "rejected") {
    setSubs(s => s.map(x => x.id === id ? { ...x, status } : x));
    await fetch("/api/admin/submissions", {
      method: "PATCH", headers: hdrs(),
      body: JSON.stringify({ id, status })
    });
  }

  async function actClaim(id: string, status: "approved" | "rejected") {
    setClaims(s => s.map(x => x.id === id ? { ...x, status } : x));
    await fetch("/api/admin/claims", {
      method: "PATCH", headers: hdrs(),
      body: JSON.stringify({ id, status })
    });
  }

  async function verifyPlace(id: string, verified: boolean) {
    setOverview(prev => prev ? ({
      ...prev,
      recentlySynced: prev.recentlySynced.map(p => p.id === id ? { ...p, isVerified: verified } : p)
    }) : null);
    await fetch("/api/admin/verify", {
      method: "PATCH", headers: hdrs(),
      body: JSON.stringify({ kind: "place", id, verified })
    });
  }

  async function verifyDeal(id: string) {
    setOverview(prev => prev ? ({
      ...prev,
      unverifiedDeals: prev.unverifiedDeals.filter(d => d.id !== id)
    }) : null);
    await fetch("/api/admin/verify", {
      method: "PATCH", headers: hdrs(),
      body: JSON.stringify({ kind: "deal", id, verified: true })
    });
  }

  async function runImport(kind: "venues" | "events") {
    if (!importSlug.trim()) return;
    setImporting(kind); setImportResult(null);
    try {
      const endpoint = kind === "venues" ? "/api/import/foursquare" : "/api/import/events";
      const res = await fetch(endpoint, {
        method: "POST", headers: hdrs(),
        body: JSON.stringify({ citySlug: importSlug.trim(), limit: importLimit })
      });
      const data = await res.json();
      setImportResult(data);
      if (data.ok) load();
    } catch (e) {
      setImportResult({ ok: false, errors: [String(e)] });
    } finally {
      setImporting(null);
    }
  }

  function signOut() {
    localStorage.removeItem("citysip-admin-token");
    setToken(""); savedToken.current = "";
    setUnlocked(false); setSubs([]); setClaims([]); setOverview(null);
  }

  /* ── gate screen ── */
  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="glass-strong rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-ember-500/15 text-ember-400 flex items-center justify-center mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="display text-3xl mb-2">Admin gate</h1>
          <p className="text-ink-300 text-sm mb-6">
            Paste your <code className="mono text-ember-300">ADMIN_TOKEN</code> to enter.
          </p>
          <form onSubmit={e => { e.preventDefault(); load(); }} className="space-y-3">
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={token} onChange={e => setToken(e.target.value)}
                placeholder="Admin token" className="input pl-10" type="password" autoFocus
                onBlur={() => { savedToken.current = token; }} />
            </div>
            {authError && <p className="text-xs text-coral-400">{authError}</p>}
            <button type="submit" disabled={loading || !token} className="ember-btn w-full">
              {loading ? "Checking…" : "Unlock"}
            </button>
          </form>
          <p className="text-xs text-ink-400 mt-5">
            Set <code className="mono">ADMIN_TOKEN</code> in your <code className="mono">.env</code> to change this.
          </p>
        </div>
      </div>
    );
  }

  const counts = overview?.counts;
  const pendingSubs = subs.filter(s => s.status === "pending").length;
  const pendingClaims = claims.filter(c => c.status === "pending").length;

  /* ── dashboard ── */
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-ember-400 mb-1">CitySip · Admin</p>
          <h1 className="display text-4xl">Control center</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load()} disabled={loading} className="ghost-btn">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={signOut} className="ghost-btn">Sign out</button>
        </div>
      </div>

      {/* data-unavailable banner */}
      {overview?.noDatabase && (
        <div className="glass border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3 text-sm">
          <Database className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-amber-200">
            No database connected. Set <code className="mono">DATABASE_URL</code> to unlock import and
            verify features.
          </span>
        </div>
      )}

      {/* stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Places",      value: counts?.places,      icon: MapPin },
          { label: "Deals",       value: counts?.deals,       icon: Zap },
          { label: "Events",      value: counts?.events,      icon: Clock },
          { label: "Submissions", value: counts?.submissions, icon: Download,
            badge: pendingSubs > 0 ? pendingSubs : undefined },
          { label: "Claims",      value: counts?.claims,      icon: Building2,
            badge: pendingClaims > 0 ? pendingClaims : undefined },
        ].map(({ label, value, icon: Icon, badge }) => (
          <div key={label} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <Icon className="w-4 h-4 text-ember-400" />
              {badge != null && (
                <span className="text-[10px] font-bold bg-ember-500 text-white rounded-full px-1.5 py-0.5">
                  {badge}
                </span>
              )}
            </div>
            <div className="display text-2xl">{value ?? "—"}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`chip whitespace-nowrap ${section === s ? "chip-active" : ""}`}>
            {s}
            {s === "Queue" && pendingSubs > 0 && (
              <span className="ml-1 text-ember-400">({pendingSubs})</span>
            )}
            {s === "Claims" && pendingClaims > 0 && (
              <span className="ml-1 text-ember-400">({pendingClaims})</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Queue ── */}
      {section === "Queue" && (
        <SectionWrap title="Submissions Queue" description="User-submitted new places, deal corrections, and error reports.">
          <StatusTabs value={subsFilter} onChange={v => setSubsFilter(v as typeof subsFilter)}
            counts={{ all: subs.length, pending: subs.filter(s => s.status==="pending").length,
              approved: subs.filter(s => s.status==="approved").length,
              rejected: subs.filter(s => s.status==="rejected").length }} />
          <div className="space-y-3 mt-4">
            {subs.filter(s => subsFilter === "all" || s.status === subsFilter).length === 0
              ? <EmptyState icon={Download} text="Nothing in this bucket." />
              : subs
                  .filter(s => subsFilter === "all" || s.status === subsFilter)
                  .map(s => (
                    <SubmissionCard key={s.id} sub={s}
                      onApprove={() => actSub(s.id, "approved")}
                      onReject={() => actSub(s.id, "rejected")} />
                  ))}
          </div>
        </SectionWrap>
      )}

      {/* ── Claims ── */}
      {section === "Claims" && (
        <SectionWrap title="Business Claims" description="Venue owners requesting control of their listing.">
          <StatusTabs value={claimsFilter} onChange={v => setClaimsFilter(v as typeof claimsFilter)}
            counts={{ all: claims.length, pending: claims.filter(c => c.status==="pending").length,
              approved: claims.filter(c => c.status==="approved").length,
              rejected: claims.filter(c => c.status==="rejected").length }} />
          <div className="space-y-3 mt-4">
            {claims.filter(c => claimsFilter === "all" || c.status === claimsFilter).length === 0
              ? <EmptyState icon={Building2} text="No claims match this filter." />
              : claims
                  .filter(c => claimsFilter === "all" || c.status === claimsFilter)
                  .map(c => (
                    <ClaimCard key={c.id} claim={c}
                      onApprove={() => actClaim(c.id, "approved")}
                      onReject={() => actClaim(c.id, "rejected")} />
                  ))}
          </div>
        </SectionWrap>
      )}

      {/* ── Import Venues ── */}
      {section === "Import" && (
        <SectionWrap title="Import Data" description="Pull venues from Foursquare and events from Ticketmaster into the database. Duplicates are skipped automatically.">
          <div className="glass rounded-2xl p-6 mb-4">
            <h3 className="font-semibold text-cream mb-4">Settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-ink-400">City slug</span>
                <input value={importSlug} onChange={e => setImportSlug(e.target.value)}
                  className="input mt-1.5" placeholder="chicago" />
                <p className="text-xs text-ink-400 mt-1">Must match a city in your database.</p>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-ink-400">Limit (max 50)</span>
                <input type="number" value={importLimit} min={1} max={50}
                  onChange={e => setImportLimit(Number(e.target.value))}
                  className="input mt-1.5" />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={() => runImport("venues")}
                disabled={!!importing || !importSlug.trim()}
                className="ember-btn">
                {importing === "venues"
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Importing venues…</>
                  : <><Download className="w-4 h-4" /> Import Foursquare venues</>}
              </button>
              <button onClick={() => runImport("events")}
                disabled={!!importing || !importSlug.trim()}
                className="ghost-btn">
                {importing === "events"
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Importing events…</>
                  : <><Download className="w-4 h-4" /> Import Ticketmaster events</>}
              </button>
            </div>
          </div>

          {importResult && (
            <div className={`rounded-2xl p-5 border ${importResult.ok ? "border-emerald-500/30 bg-emerald-500/8" : "border-coral-500/30 bg-coral-500/8"}`}>
              <div className="flex items-center gap-2 mb-3">
                {importResult.ok
                  ? <Check className="w-5 h-5 text-emerald-400" />
                  : <AlertTriangle className="w-5 h-5 text-coral-400" />}
                <span className="font-semibold">
                  {importResult.ok ? "Import complete" : "Import finished with errors"}
                </span>
                <span className="text-xs text-ink-400 ml-auto mono">
                  {String(importResult.provider)} · {String(importResult.city ?? "")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {[
                  ["Imported", importResult.imported, "text-emerald-300"],
                  ["Updated",  importResult.updated,  "text-amber-300"],
                  ["Skipped",  importResult.skipped,  "text-ink-300"],
                ].map(([label, val, cls]) => (
                  <div key={String(label)} className="glass rounded-xl p-3 text-center">
                    <div className={`display text-2xl ${cls}`}>{String(val)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-400 mt-0.5">{String(label)}</div>
                  </div>
                ))}
              </div>
              {Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="text-xs text-coral-400 cursor-pointer">
                    {importResult.errors.length} error(s)
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {(importResult.errors as string[]).map((e, i) => (
                      <li key={i} className="text-xs mono text-coral-300">{e}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="glass rounded-2xl p-5 mt-4">
            <h3 className="text-sm font-semibold text-cream mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-ember-400" /> API key status
            </h3>
            <div className="space-y-2">
              <KeyStatus label="Foursquare" env="FOURSQUARE_API_KEY" />
              <KeyStatus label="Ticketmaster" env="TICKETMASTER_API_KEY" />
              <KeyStatus label="Google Places" env="GOOGLE_PLACES_API_KEY" />
              <KeyStatus label="Yelp" env="YELP_API_KEY" />
            </div>
          </div>
        </SectionWrap>
      )}

      {/* ── Recently Synced Places ── */}
      {section === "Places" && (
        <SectionWrap title="Recently Synced Places" description="Venues imported from external providers. Verify them once you've confirmed the data is accurate.">
          {!overview?.recentlySynced.length
            ? <EmptyState icon={MapPin} text="No synced places yet. Run an import to populate this." />
            : (
              <div className="space-y-2">
                {overview.recentlySynced.map(p => (
                  <div key={p.id} className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <a href={`/place/${p.slug}`} target="_blank" rel="noreferrer"
                          className="font-semibold text-cream hover:underline inline-flex items-center gap-1">
                          {p.name} <ExternalLink className="w-3 h-3" />
                        </a>
                        {p.isVerified
                          ? <span className="chip border-emerald-500/30 text-emerald-300 bg-emerald-500/10 text-[10px]">Verified</span>
                          : <span className="chip border-amber-500/30 text-amber-300 bg-amber-500/10 text-[10px]">Unverified</span>}
                        {p.source && <span className="chip text-[10px]">{p.source}</span>}
                      </div>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {p.city.name} · ★ {p.rating.toFixed(1)}
                        {p.lastSyncedAt && ` · synced ${rel(p.lastSyncedAt)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => verifyPlace(p.id, !p.isVerified)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border transition ${
                        p.isVerified
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-white/5 text-ink-300 border-white/10 hover:border-emerald-500/40"
                      }`}>
                      <Shield className="w-3.5 h-3.5" />
                      {p.isVerified ? "Verified" : "Mark verified"}
                    </button>
                  </div>
                ))}
              </div>
            )}
        </SectionWrap>
      )}

      {/* ── Unverified Deals ── */}
      {section === "Deals" && (
        <SectionWrap title="Unverified Deals" description="Deals not yet confirmed by the admin team. Verify them once you've checked the times and prices are accurate.">
          {!overview?.unverifiedDeals.length
            ? <EmptyState icon={Zap} text="All deals are verified." />
            : (
              <div className="space-y-2">
                {overview.unverifiedDeals.map(d => (
                  <div key={d.id} className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-cream">{d.title}</p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        <a href={`/place/${d.place.slug}`} target="_blank" rel="noreferrer"
                          className="hover:underline inline-flex items-center gap-1">
                          {d.place.name} <ExternalLink className="w-3 h-3" />
                        </a>
                        {d.priceHint && ` · ${d.priceHint}`}
                        {d.source && <span className="ml-1 opacity-60">[{d.source}]</span>}
                      </p>
                    </div>
                    <button onClick={() => verifyDeal(d.id)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border bg-white/5 text-ink-300 border-white/10 hover:border-emerald-500/40 transition">
                      <Check className="w-3.5 h-3.5" /> Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
        </SectionWrap>
      )}

      {/* ── City Data Health ── */}
      {section === "Cities" && (
        <SectionWrap title="City Data Health" description="At-a-glance data coverage per city.">
          {!overview?.cityHealth.length
            ? <EmptyState icon={BarChart3} text="No cities found." />
            : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {overview.cityHealth.map(c => {
                  const pct = c.places > 0
                    ? Math.round((c.verifiedPlaces / c.places) * 100)
                    : 0;
                  return (
                    <div key={c.id} className="glass rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-cream">{c.name}</h3>
                          <p className="text-xs text-ink-400 mono">{c.slug}</p>
                        </div>
                        <a href={`/city/${c.slug}`} target="_blank" rel="noreferrer"
                          className="text-ink-400 hover:text-ember-400 transition">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        {[
                          [c.places, "Places"],
                          [c.events, "Events"],
                          [c.unverifiedDeals, "Unverified"],
                        ].map(([v, l]) => (
                          <div key={String(l)} className="bg-black/20 rounded-xl p-2">
                            <div className="display text-xl">{v}</div>
                            <div className="text-[10px] text-ink-400 uppercase tracking-wider">{l}</div>
                          </div>
                        ))}
                      </div>
                      {/* verified bar */}
                      <div>
                        <div className="flex justify-between text-xs text-ink-400 mb-1">
                          <span>Verified places</span>
                          <span>{c.verifiedPlaces}/{c.places} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-ember-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </SectionWrap>
      )}
    </div>
  );
}

/* ── sub-components ── */
function SectionWrap({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="display text-2xl mb-1">{title}</h2>
      <p className="text-ink-300 text-sm mb-6">{description}</p>
      {children}
    </div>
  );
}

function StatusTabs({ value, onChange, counts }: {
  value: string;
  onChange: (v: string) => void;
  counts: { all: number; pending: number; approved: number; rejected: number };
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(["all", "pending", "approved", "rejected"] as const).map(s => (
        <button key={s} onClick={() => onChange(s)}
          className={`chip ${value === s ? "chip-active" : ""}`}>
          {s} ({counts[s]})
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="glass rounded-2xl p-12 text-center text-ink-400">
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function SubmissionCard({ sub, onApprove, onReject }: {
  sub: Submission; onApprove: () => void; onReject: () => void;
}) {
  const TYPE: Record<string, string> = {
    "new-place": "New place", "update-deal": "Update deal",
    "menu-photo": "Menu photo", "report-error": "Error report",
  };
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="chip chip-active">{TYPE[sub.type] ?? sub.type}</span>
            <StatusPill status={sub.status} />
            <span className="text-xs text-ink-400 mono">{rel(sub.createdAt)}</span>
          </div>
          <p className="font-semibold text-cream">
            {String(sub.payload?.venueName ?? sub.payload?.dealTitle ?? sub.payload?.message ?? "").slice(0, 80) || "Untitled"}
          </p>
          {sub.placeId && (
            <a href={`/place/${sub.placeId}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-ember-400 hover:underline mt-1">
              View place <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {sub.status === "pending" && (
          <div className="flex gap-2 shrink-0">
            <ActionBtn label="Approve" color="emerald" icon={Check} onClick={onApprove} />
            <ActionBtn label="Reject"  color="coral"   icon={X}     onClick={onReject} />
          </div>
        )}
      </div>
      <details className="mt-3">
        <summary className="text-xs text-ink-400 cursor-pointer hover:text-ink-200 select-none">Payload</summary>
        <pre className="mt-2 text-xs mono bg-black/40 border border-white/5 rounded-xl p-3 overflow-x-auto text-ink-200">
{JSON.stringify(sub.payload, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function ClaimCard({ claim, onApprove, onReject }: {
  claim: Claim; onApprove: () => void; onReject: () => void;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="chip chip-active"><Building2 className="w-3 h-3" /> Claim</span>
            <StatusPill status={claim.status} />
            <span className="text-xs text-ink-400 mono">{rel(claim.createdAt)}</span>
          </div>
          <p className="font-semibold text-cream">{claim.venueName ?? "Unknown venue"}</p>
          <p className="text-xs text-ink-400 mt-0.5">
            {claim.fullName} · <a href={`mailto:${claim.email}`} className="hover:underline">{claim.email}</a>
          </p>
          {claim.message && (
            <p className="text-xs text-ink-300 mt-1 italic">&ldquo;{claim.message}&rdquo;</p>
          )}
        </div>
        {claim.status === "pending" && (
          <div className="flex gap-2 shrink-0">
            <ActionBtn label="Approve" color="emerald" icon={Check} onClick={onApprove} />
            <ActionBtn label="Reject"  color="coral"   icon={X}     onClick={onReject} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, icon: Icon, onClick }: {
  label: string; color: "emerald" | "coral"; icon: React.ElementType; onClick: () => void;
}) {
  const cls = color === "emerald"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
    : "bg-coral-500/15 text-coral-300 border-coral-500/30 hover:bg-coral-500/25";
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm border transition ${cls}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    pending:  "bg-amber-500/15 text-amber-300 border-amber-500/30",
    approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    rejected: "bg-coral-500/15 text-coral-300 border-coral-500/30",
  };
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${map[status]}`}>
      {status}
    </span>
  );
}

function KeyStatus({ label, env }: { label: string; env: string }) {
  // We can't check process.env from the client. Show static guidance.
  return (
    <div className="flex items-center gap-2 text-sm">
      <Star className="w-3.5 h-3.5 text-ink-400" />
      <span className="text-ink-300">{label}</span>
      <span className="text-xs mono text-ink-400">({env})</span>
      <span className="text-xs text-ink-400 ml-auto">set in .env</span>
    </div>
  );
}
