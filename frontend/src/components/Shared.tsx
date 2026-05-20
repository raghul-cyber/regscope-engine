import React from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, ChevronRight, AlertCircle } from 'lucide-react';

// ================================================================
//  SKELETON LOADERS
// ================================================================
export const SkeletonText = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton h-4 rounded ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card space-y-4">
    <div className="flex justify-between items-start">
      <div className="skeleton h-5 w-20 rounded-full" />
      <div className="skeleton h-4 w-16 rounded" />
    </div>
    <div className="space-y-2">
      <SkeletonText className="w-full" />
      <SkeletonText className="w-5/6" />
      <SkeletonText className="w-4/6" />
    </div>
    <div className="flex gap-2">
      <div className="skeleton h-6 w-16 rounded-full" />
      <div className="skeleton h-6 w-24 rounded-full" />
    </div>
  </div>
);

export const SkeletonStatCard = () => (
  <div className="card flex items-center justify-between">
    <div className="space-y-2 flex-1">
      <div className="skeleton h-3 w-28 rounded" />
      <div className="skeleton h-9 w-20 rounded" />
    </div>
    <div className="skeleton w-12 h-12 rounded-xl" />
  </div>
);

// ================================================================
//  EMPTY STATES
// ================================================================
type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
};

export const EmptyState = ({ icon = '🔍', title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-6">
    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-3xl mb-5 border border-[var(--border-base)]">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
    <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">{description}</p>
    {action && (
      <div className="mt-5">
        {action.href ? (
          <Link href={action.href} className="btn btn-primary">{action.label}</Link>
        ) : (
          <button onClick={action.onClick} className="btn btn-primary">{action.label}</button>
        )}
      </div>
    )}
  </div>
);

// ================================================================
//  STAT CARD
// ================================================================
type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'purple';
  trend?: { value: number; label: string };
};

const colorMap = {
  blue:   { icon: 'bg-[var(--blue-glow)] text-[var(--blue-400)]',   val: 'text-[var(--blue-400)]' },
  green:  { icon: 'bg-[var(--green-glow)] text-[var(--green-400)]', val: 'text-[var(--green-400)]' },
  amber:  { icon: 'bg-[var(--amber-glow)] text-[var(--amber-400)]', val: 'text-[var(--amber-400)]' },
  purple: { icon: 'bg-[rgba(139,92,246,0.1)] text-[var(--purple-400)]', val: 'text-[var(--purple-400)]' },
};

export const StatCard = ({ label, value, icon, color = 'blue', trend }: StatCardProps) => {
  const c = colorMap[color];
  return (
    <div className="card flex items-start justify-between gap-4 hover:translate-y-[-2px]">
      <div className="space-y-1 flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">{label}</p>
        <p className={`text-3xl font-black tabular-nums ${c.val}`}>{value}</p>
        {trend && (
          <p className={`text-xs font-medium ${trend.value >= 0 ? 'text-[var(--green-400)]' : 'text-[var(--red-400)]'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        {icon}
      </div>
    </div>
  );
};

// ================================================================
//  PILLAR TAG
// ================================================================
export const PillarTag = ({ pillar }: { pillar: string }) => {
  const configs: Record<string, string> = {
    pillar_6: 'badge-blue',
    pillar_7: 'badge-green',
    both:     'badge-purple',
    other:    'badge-slate',
  };
  return (
    <span className={`badge ${configs[pillar] || 'badge-slate'}`}>
      {pillar.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// ================================================================
//  CONFIDENCE METER
// ================================================================
export const ConfidenceMeter = ({ confidence }: { confidence: number }) => {
  const pct = (confidence * 100).toFixed(0);
  const barColor = confidence >= 0.85
    ? 'bg-[var(--green-500)]'
    : confidence >= 0.6
    ? 'bg-[var(--amber-500)]'
    : 'bg-[var(--red-500)]';
  return (
    <div className="flex items-center gap-2.5" data-tooltip={`Confidence: ${pct}%`}>
      <div className="w-20 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className="text-xs font-mono text-[var(--text-faint)]">{pct}%</span>
    </div>
  );
};

// ================================================================
//  CITATION BADGE
// ================================================================
export const CitationBadge = ({ text }: { text: string }) => (
  <span className="badge badge-slate gap-1">
    <FileText size={10} />
    {text}
  </span>
);

// ================================================================
//  CLAUSE CARD
// ================================================================
export const ClauseCard = ({ clause }: { clause: any }) => {
  const clauseTypeColors: Record<string, string> = {
    prohibition: 'badge-red',
    obligation:  'badge-blue',
    permission:  'badge-green',
    right:       'badge-purple',
    other:       'badge-slate',
  };

  return (
    <div className="card group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <PillarTag pillar={clause.pillar || 'other'} />
          <span className={`badge ${clauseTypeColors[clause.clause_type] || 'badge-slate'}`}>
            {clause.clause_type}
          </span>
          {clause.flags?.length > 0 && (
            <span className="badge badge-amber">
              <AlertCircle size={9} /> {clause.flags.length} flag{clause.flags.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ConfidenceMeter confidence={clause.confidence ?? 0} />
      </div>

      <blockquote className="text-sm font-mono leading-relaxed text-[var(--text-secondary)] border-l-2 border-[var(--blue-500)]/30 pl-3 mb-4 line-clamp-3">
        {clause.raw_text}
      </blockquote>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(clause.topics || []).map((t: string) => (
            <span key={t} className="badge badge-slate">
              {t.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-faint)]">
          {clause.citations?.length > 0 && (
            <span>{clause.citations.length} citation{clause.citations.length !== 1 ? 's' : ''}</span>
          )}
          <Link
            href={`/clauses/${clause.id}`}
            className="inline-flex items-center gap-1 text-[var(--blue-400)] font-semibold hover:text-[var(--blue-300)] transition-colors"
          >
            Audit trail <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  CONFLICT ALERT
// ================================================================
export const ConflictAlert = ({ count }: { count: number }) => {
  if (!count) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--red-glow)] border border-[rgba(239,68,68,0.2)] text-[var(--red-400)]">
      <AlertCircle size={16} className="shrink-0" />
      <span className="text-sm">
        <strong>{count} unresolved conflict{count !== 1 ? 's' : ''}</strong> detected — review required for consistent reporting.
      </span>
    </div>
  );
};

// ================================================================
//  SPINNER / LOADER
// ================================================================
export const Loader = ({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) => {
  const dims = { sm: 'w-5 h-5 border-[1.5px]', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${dims[size]} border-[var(--border-base)] border-t-[var(--blue-500)] rounded-full animate-spin`} />
      {text && <p className="text-xs text-[var(--text-faint)]">{text}</p>}
    </div>
  );
};

// ================================================================
//  PAGE HEADER
// ================================================================
export const PageHeader = ({
  title, subtitle, actions
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
      {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

// ================================================================
//  PAGINATION
// ================================================================
export const Pagination = ({
  page, totalPages, onChange
}: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-6 border-t border-[var(--border-base)]">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn btn-secondary btn-sm"
      >
        ← Previous
      </button>
      <span className="text-xs text-[var(--text-muted)] font-medium">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="btn btn-secondary btn-sm"
      >
        Next →
      </button>
    </div>
  );
};
