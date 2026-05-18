/**
 * Design tokens shared across all components.
 * Import from here — never redefine inline.
 */

// ─── Client avatar ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];

export function clientAvatar(name: string): { initials: string; color: string } {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  return {
    initials: name.slice(0, 2).toUpperCase(),
    color: AVATAR_COLORS[idx],
  };
}

// ─── Alert banner color map ───────────────────────────────────────────────────

export const alertVariants = {
  error:   { bg: "bg-red-50",    border: "border-red-100",    text: "text-red-800",    sub: "text-red-600",    icon: "text-red-500",    action: "text-red-700 hover:text-red-800" },
  warning: { bg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-800",  sub: "text-amber-600",  icon: "text-amber-500",  action: "text-amber-700 hover:text-amber-800" },
  info:    { bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-800",   sub: "text-blue-600",   icon: "text-blue-500",   action: "text-blue-700 hover:text-blue-800" },
  success: { bg: "bg-emerald-50",border: "border-emerald-100",text: "text-emerald-800",sub: "text-emerald-600",icon: "text-emerald-500",action: "text-emerald-700 hover:text-emerald-800" },
} as const;

// ─── Stat card accent gradients ───────────────────────────────────────────────

export const statAccents = {
  primary: "bg-gradient-to-r from-primary-400 to-primary-600",
  emerald: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  amber:   "bg-gradient-to-r from-amber-400 to-amber-500",
  blue:    "bg-gradient-to-r from-blue-400 to-blue-600",
  red:     "bg-gradient-to-r from-red-400 to-red-600",
} as const;

// ─── Icon container variants ──────────────────────────────────────────────────

export const iconContainers = {
  primary: { bg: "bg-primary-50",  color: "text-primary-600" },
  emerald: { bg: "bg-emerald-50",  color: "text-emerald-600" },
  amber:   { bg: "bg-amber-50",    color: "text-amber-600"   },
  blue:    { bg: "bg-blue-50",     color: "text-blue-600"    },
  red:     { bg: "bg-red-50",      color: "text-red-500"     },
  slate:   { bg: "bg-slate-100",   color: "text-slate-500"   },
} as const;

// ─── Table constants ──────────────────────────────────────────────────────────

export const tableClasses = {
  wrapper:   "bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden",
  thead:     "border-b border-slate-100",
  th:        "text-2xs font-semibold text-slate-400 uppercase tracking-widest text-left",
  thPadding: "px-5 py-3",
  thPaddingInner: "px-4 py-3",
  tbody:     "",
  tr:        "group border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer",
  td:        "text-sm text-slate-600",
  tdPrimary: "text-sm font-medium text-slate-900",
  tdPadding: "px-4 py-4",
  tdPaddingOuter: "px-5 py-4",
  actions:   "flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
} as const;

// ─── Card constants ───────────────────────────────────────────────────────────

export const cardClasses = {
  base:        "bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden",
  hoverable:   "bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden",
  header:      "px-5 py-4 border-b border-slate-100 flex items-center justify-between",
  headerTitle: "text-sm font-semibold text-slate-900",
  body:        "p-5",
} as const;

// ─── Page layout constants ────────────────────────────────────────────────────

export const pageClasses = {
  title:    "text-xl sm:text-2xl font-bold text-slate-900 tracking-tight",
  subtitle: "text-sm text-slate-500 mt-0.5",
  header:   "flex items-center justify-between gap-3 mb-6",
} as const;
