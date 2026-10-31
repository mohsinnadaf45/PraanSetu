import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  ShieldCheck,
  Activity,
  Clock,
  Lock,
  ArrowRight,
  GitCompare,
  HeartHandshake,
  FileCheck,
  CheckCircle2,
  Scale,
  Building2,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "PraanSetu — National Organ Allocation Network",
  description:
    "Deterministic organ donor–recipient matching platform replacing suspicion with mathematics. NOTTO-aligned, DPDP Act compliant, and cryptographically tamper-evident.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink selection:bg-accent selection:text-white">
      {/* ── Top Navigation Bar ── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
              PS
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-white leading-none">
                PraanSetu
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#55C29C] font-mono mt-0.5">
                Bridge of Life
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3">
            <a
              href="#features"
              className="hidden px-3 py-2 text-xs font-medium text-white/85 hover:text-white sm:inline transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#how-it-works"
              className="hidden px-3 py-2 text-xs font-medium text-white/85 hover:text-white sm:inline transition-colors"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="hidden px-3 py-2 text-xs font-medium text-white/85 hover:text-white sm:inline transition-colors"
            >
              Audit & Privacy
            </a>
            <Link
              href="/sign-in"
              className="px-3 py-2 text-xs font-medium text-white/90 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover text-xs font-semibold transition-all border border-accent-border shadow-xs"
            >
              Launch Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero Section (Full-Bleed Atmospheric Clinical Canvas) ── */}
      <section className="relative min-h-[100svh] overflow-hidden text-white flex flex-col justify-end">
        {/* Background Photograph */}
        <Image
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2400&q=80"
          alt="Modern clinical hospital corridor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Deep Clinical Teal Veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,31,28,0.96)] via-[rgba(15,31,28,0.78)] to-[rgba(15,31,28,0.65)]" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-20">
          <div className="max-w-3xl">
            {/* Live Operational Status Pill */}
            <p className="animate-rise mb-4 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#55C29C]">
              <span className="animate-dot inline-block h-2 w-2 rounded-full bg-[#55C29C]" />
              Operational Prototype • NOTTO & DPDP Guarded
            </p>

            {/* Main Title */}
            <h1 className="animate-rise-delay-1 font-serif text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              PraanSetu
            </h1>

            {/* Accent Divider Line */}
            <div className="animate-line mt-5 h-px w-28 bg-[#55C29C]" />

            {/* Subtitle */}
            <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl font-sans">
              Deterministic organ allocation that replaces suspicion with mathematics—guaranteeing multi-factor clinical fairness, zero-knowledge patient privacy, and cryptographic auditability for hospitals across India.
            </p>

            {/* Action Buttons */}
            <div className="animate-rise-delay-3 mt-9 flex flex-wrap gap-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-accent text-white hover:bg-accent-hover text-sm font-semibold transition-all border border-accent-border shadow-xs"
              >
                Access Allocation Console
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-semibold transition-all backdrop-blur-xs"
              >
                Explore Allocation Rules
              </a>
            </div>

            {/* Key Trust Signals */}
            <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap gap-6 text-xs text-white/75 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#55C29C]" />
                <span>Zero PII in Clinical Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#55C29C]" />
                <span>Append-Only SHA-256 Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#55C29C]" />
                <span>100% Deterministic NOTTO Scoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 1: Prototype Capabilities (Numbered Editorial Feature List) ── */}
      <section id="features" className="site-grid border-y border-ink-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-secondary">
              Clinical Infrastructure
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Built for transplant coordinators who cannot afford suspicion
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink-secondary">
              PraanSetu isolates four operational layers—multi-factor matching, cryptographic audit, zero-knowledge privacy, and dynamic offer escalation—without burying clinical decisions in black-box opacity.
            </p>
          </div>

          <ol className="mt-14 divide-y divide-ink-border border-y border-ink-border bg-surface/50">
            <li className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr] sm:gap-10">
              <span className="font-serif text-2xl font-bold text-accent">01</span>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                  Deterministic Multi-Factor Matching
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                  NOTTO-aligned allocation algorithm evaluates medical urgency, HLA tissue typing, pediatric preference, geographic transit decay, and accrued waiting time. Results are 100% mathematically reproducible with full explainability.
                </p>
              </div>
            </li>

            <li className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr] sm:gap-10">
              <span className="font-serif text-2xl font-bold text-accent">02</span>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                  Dual-Custody Identity Vault
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                  Patient and donor personal identifiable information (PII) is isolated in an encrypted vault database using AES-256 envelope encryption. Doctors, coordinators, and algorithms operate solely with anonymous codes (e.g. <code>R-4F7A91</code>).
                </p>
              </div>
            </li>

            <li className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr] sm:gap-10">
              <span className="font-serif text-2xl font-bold text-accent">03</span>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                  Tamper-Evident Hash Chain Audit
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                  Every donor listing, match execution, offer response, and clinical override is permanently hashed and chained with SHA-256 pointers. Any retroactive database modification breaks the chain immediately and alerts all hospital nodes.
                </p>
              </div>
            </li>

            <li className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr] sm:gap-10">
              <span className="font-serif text-2xl font-bold text-accent">04</span>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                  Cold Ischemia Offer Timers & Dynamic Fallback
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                  Time-windowed organ offer dispatch pairs synchronized countdown timers with attending surgical teams. If an offer expires or is declined with written clinical justification, the engine automatically escalates to candidate #2 without bypass.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ── Section 2: How It Works (Pipeline from Donor Declaration to Surgical Standby) ── */}
      <section id="how-it-works" className="bg-surface border-b border-ink-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-secondary">
              Operational Pipeline
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              From donor declaration to recipient standby in 5 audit steps
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink-secondary">
              A transparent clinical state machine synchronizes hospital nodes, matching engine logic, and statutory oversight in real-time.
            </p>
          </div>

          <div className="mt-14 border-l border-ink-border pl-6 sm:pl-8">
            <article className="relative pb-10 last:pb-0">
              <span className="absolute -left-[1.9rem] top-1 flex h-7 w-7 items-center justify-center border border-accent bg-surface font-serif text-xs font-bold text-accent sm:-left-[2.15rem] rounded-md">
                1
              </span>
              <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                Ingest physiological telemetry & donor declaration
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                Certified transplant coordinators register donor parameters (ABO group, crossmatch, organ vitals, ischemic time limits) into the decentralized network. PII is encrypted immediately.
              </p>
            </article>

            <article className="relative pb-10 last:pb-0">
              <span className="absolute -left-[1.9rem] top-1 flex h-7 w-7 items-center justify-center border border-accent bg-surface font-serif text-xs font-bold text-accent sm:-left-[2.15rem] rounded-md">
                2
              </span>
              <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                Execute clinical hard filters
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                Incompatible ABO blood types, prohibitive size/weight disparities, and positive crossmatches are deterministically filtered out. Zero discretionary bypass is permitted.
              </p>
            </article>

            <article className="relative pb-10 last:pb-0">
              <span className="absolute -left-[1.9rem] top-1 flex h-7 w-7 items-center justify-center border border-accent bg-surface font-serif text-xs font-bold text-accent sm:-left-[2.15rem] rounded-md">
                3
              </span>
              <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                Compute multi-factor rank & decision breakdown
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                The scoring engine weights medical urgency, HLA tissue match, distance decay, pediatric priority, and waiting time. Every candidate receives a verifiable clinical reason breakdown.
              </p>
            </article>

            <article className="relative pb-10 last:pb-0">
              <span className="absolute -left-[1.9rem] top-1 flex h-7 w-7 items-center justify-center border border-accent bg-surface font-serif text-xs font-bold text-accent sm:-left-[2.15rem] rounded-md">
                4
              </span>
              <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                Time-windowed offer dispatch & surgical acceptance
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                Candidate #1 hospital team receives the organ offer with an active countdown timer. Acceptance initiates recipient preparation; decline immediately triggers rank #2 fallback.
              </p>
            </article>

            <article className="relative pb-10 last:pb-0">
              <span className="absolute -left-[1.9rem] top-1 flex h-7 w-7 items-center justify-center border border-accent bg-surface font-serif text-xs font-bold text-accent sm:-left-[2.15rem] rounded-md">
                5
              </span>
              <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                Cryptographic hash sealing & statutory audit entry
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                The final decision payload is hashed using SHA-256, chained to the previous block, and signed for permanent statutory inspection under NOTTO and THOTA Section 10 guidelines.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Section 3: Live Cryptographic Terminal Preview ── */}
      <section id="security" className="site-grid py-20 sm:py-24 border-b border-ink-border">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-secondary">
                Cryptographic Integrity
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Inspectable mathematics. Zero reliance on blind trust.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                Every match determination on PraanSetu generates an immutable audit record. Clinicians, hospital directors, and government authorities can mathematically verify that allocation happened strictly according to published rules.
              </p>

              <div className="mt-8 space-y-3 font-mono text-xs">
                <div className="p-3 bg-surface border border-ink-border rounded-md flex items-center justify-between">
                  <span className="text-ink-secondary">Cryptographic Primitive:</span>
                  <span className="font-semibold text-ink">SHA-256 Merkle Chain</span>
                </div>
                <div className="p-3 bg-surface border border-ink-border rounded-md flex items-center justify-between">
                  <span className="text-ink-secondary">Vault Encryption:</span>
                  <span className="font-semibold text-ink">AES-256 Envelope KMS</span>
                </div>
                <div className="p-3 bg-surface border border-ink-border rounded-md flex items-center justify-between">
                  <span className="text-ink-secondary">Statutory Compliance:</span>
                  <span className="font-semibold text-status-green">NOTTO & THOTA (Section 10)</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-hover text-xs font-semibold transition-all"
                >
                  Verify Live Chain in Auditor Console
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Simulated Live Ledger Card */}
            <div className="bg-surface border border-ink-border rounded-md p-5 shadow-xs font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ink-border">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
                  <span className="font-semibold text-ink">LEDGER ENTRY #4102</span>
                </div>
                <span className="text-status-green font-bold text-[11px] bg-status-greenBg border border-status-greenBorder px-2 py-0.5 rounded-md">
                  CHAIN INTACT
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Action:</span>
                  <span className="text-ink font-semibold">match.execute_run</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Candidate Assigned:</span>
                  <span className="text-accent font-semibold">R-4F7A91 (Rank #1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Organ / Blood:</span>
                  <span className="text-ink">KIDNEY • O-POSITIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Composite Score:</span>
                  <span className="text-ink font-semibold">94.8 / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Prev Block Hash:</span>
                  <span className="text-ink-secondary truncate max-w-[180px]">e3b0c44298fc1c149afbf4c8996fb924</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Entry Hash:</span>
                  <span className="text-status-green truncate max-w-[180px]">8f434346648f6b96df89dda901c5176b</span>
                </div>
              </div>

              <div className="pt-3 border-t border-ink-border text-[10px] text-ink-secondary leading-relaxed">
                Deterministic calculation verified against NOTTO Rule v1.3. Dual-custody vault record remained unrevealed during allocation run.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ink-border bg-accent text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-white text-accent flex items-center justify-center font-serif font-bold text-xs">
                PS
              </div>
              <p className="font-serif text-2xl font-bold tracking-tight">PraanSetu</p>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-white/80 font-sans">
              National Organ Allocation & Match Coordination Network. Built under the guidelines of the National Organ and Tissue Transplant Organisation (NOTTO), Transplantation of Human Organs and Tissues Act (THOTA 1994), and the Digital Personal Data Protection Act (DPDP Act 2023).
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <Link href="/sign-in" className="hover:underline">
              Sign In
            </Link>
            <a href="#features" className="hover:underline">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:underline">
              Allocation Pipeline
            </a>
            <a href="#security" className="hover:underline">
              Audit Architecture
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
