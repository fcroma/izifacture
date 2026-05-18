"use client";
import { cn } from "@/lib/utils";
import { InvoiceStatus } from "@/types";

const statusConfig: Record<InvoiceStatus, { label: string; className: string; dot: string }> = {
  draft:   { label: "Brouillon", className: "bg-slate-50 text-slate-600 border border-slate-200",    dot: "bg-slate-400" },
  sent:    { label: "Envoyée",   className: "bg-amber-50 text-amber-700 border border-amber-200",    dot: "bg-amber-500" },
  paid:    { label: "Payée",     className: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  overdue: { label: "En retard", className: "bg-red-50 text-red-700 border border-red-200",          dot: "bg-red-500" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide",
      cfg.className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 border border-primary-200",
      className
    )}>
      {children}
    </span>
  );
}
