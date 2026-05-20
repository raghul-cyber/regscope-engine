import React from "react";
import Link from "next/link";
import { ChevronRight, FileText, AlertCircle } from "lucide-react";

/* ---- Empty State ---- */
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>{description}</p>
      {action && (
        <div className="mt-5">
          {action.href ? (
            <Link href={action.href} className="btn-primary">{action.label}</Link>
          ) : (
            <button onClick={action.onClick} className="btn-primary">{action.label}</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Spinner ---- */
export function Spinner({ text, size = "md" }: { text?: string; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "w-5 h-5 border-[1.5px]", md: "w-8 h-8 border-2", lg: "w-10 h-10 border-[3px]" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className={`${dims[size]} rounded-full animate-spin`}
        style={{ borderColor: "var(--border-subtle)", borderTopColor: "var(--accent-cyan)" }}
      />
      {text && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{text}</p>}
    </div>
  );
}

/* ---- Pillar Tag ---- */
export function PillarTag({ pillar }: { pillar: string }) {
  const cls = pillar === "pillar_6" ? "badge-cyan" : pillar === "pillar_7" ? "badge-green" : "badge-neutral";
  return <span className={cls}>{pillar.replace("_", " ").toUpperCase()}</span>;
}

/* ---- Confidence Bar ---- */
export function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 85 ? "var(--accent-green)" : pct >= 60 ? "var(--accent-amber)" : "var(--accent-red)";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs tabular-nums" style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        {pct}%
      </span>
    </div>
  );
}

/* ---- Citation Badge ---- */
export function CitationBadge({ text }: { text: string }) {
  return (
    <span className="badge-neutral">
      <FileText size={9} /> {text}
    </span>
  );
}

/* ---- Clause Card ---- */
export function ClauseCard({ clause }: { clause: any }) {
  const typeClass: Record<string, string> = {
    prohibition: "badge-red",
    obligation:  "badge-cyan",
    permission:  "badge-green",
    right:       "badge-amber",
  };

  return (
    <div className="rs-card group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PillarTag pillar={clause.pillar || "other"} />
          <span className={typeClass[clause.clause_type] || "badge-neutral"}>
            {clause.clause_type}
          </span>
          {clause.flags?.length > 0 && (
            <span className="badge-amber">
              <AlertCircle size={9} /> {clause.flags.length} flag{clause.flags.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <ConfidenceBar confidence={clause.confidence ?? 0} />
      </div>

      <p
        className="text-sm leading-relaxed mb-3 line-clamp-3"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
      >
        {clause.raw_text}
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(clause.topics || []).map((t: string) => (
            <span key={t} className="badge-neutral">{t.replace(/_/g, " ")}</span>
          ))}
        </div>
        <Link
          href={`/clauses/${clause.id}`}
          className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap transition-colors"
          style={{ color: "var(--accent-cyan)" }}
        >
          Audit trail <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

/* ---- Pagination ---- */
export function Pagination({ page, totalPages, onChange }: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="btn-ghost" style={{ padding: "0 0.75rem", height: "2.25rem", fontSize: "0.8125rem" }}>
        ← Previous
      </button>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="btn-ghost" style={{ padding: "0 0.75rem", height: "2.25rem", fontSize: "0.8125rem" }}>
        Next →
      </button>
    </div>
  );
}

/* ---- Stat Card ---- */
export function StatCard({ label, value, sub, icon }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rs-card-static flex items-start justify-between">
      <div>
        <p className="section-label mb-1">{label}</p>
        <p className="text-3xl font-bold tabular-nums" style={{ fontFamily: "var(--font-syne)", color: "var(--text-primary)" }}>
          {value}
        </p>
        {sub && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(0,217,255,0.08)", color: "var(--accent-cyan)" }}
      >
        {icon}
      </div>
    </div>
  );
}

/* ---- ConflictAlert ---- */
export function ConflictAlert({ count }: { count: number }) {
  if (!count) return null;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
      style={{
        background: "rgba(255,71,87,0.08)",
        border: "1px solid rgba(255,71,87,0.2)",
        color: "var(--accent-red)",
      }}
    >
      <AlertCircle size={16} className="shrink-0" />
      <span><strong>{count} unresolved conflict{count !== 1 ? "s" : ""}</strong> — review required.</span>
    </div>
  );
}
