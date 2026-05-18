import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 grid md:grid-cols-4 gap-10">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CitySip" className="w-8 h-8" />
            <span className="display text-xl">
              City<span className="ember-text">Sip</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-white/55 max-w-xs">
            Sip the city. Find the hour. Built for after-work explorers in
            15+ U.S. cities.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link className="hover:text-white" href="/explore">All cities</Link></li>
            <li><Link className="hover:text-white" href="/city/chicago">Chicago</Link></li>
            <li><Link className="hover:text-white" href="/city/raleigh">Raleigh</Link></li>
            <li><Link className="hover:text-white" href="/city/sacramento">Sacramento</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">Use CitySip</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link className="hover:text-white" href="/events">Events nearby</Link></li>
            <li><Link className="hover:text-white" href="/submit">Submit a deal</Link></li>
            <li><Link className="hover:text-white" href="/business">For business</Link></li>
            <li><Link className="hover:text-white" href="/admin">Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">Tagline</h4>
          <p className="display text-2xl leading-tight">
            Sip the city.<br />
            <span className="ember-text">Find the hour.</span>
          </p>
        </div>
      </div>

      <div className="divider" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
        <p>© {new Date().getFullYear()} CitySip. All deals subject to change — confirm at venue.</p>
        <p className="mono">v0.1 · MVP</p>
      </div>
    </footer>
  );
}
