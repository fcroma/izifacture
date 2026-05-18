"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PaymentDonut } from "@/components/dashboard/payment-donut";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatFCFA } from "@/lib/formatters";
import { Invoice, InvoiceStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
  FileText, CircleDollarSign, CheckCircle, Clock,
  Plus, AlertTriangle, Calendar, ChevronDown, X, ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── helpers ────────────────────────────────────────────────────────────────

const sparkRevenue  = [40, 55, 48, 70, 62, 85, 75, 90, 80, 95];
const sparkPaid     = [30, 45, 55, 60, 70, 65, 80, 75, 85, 92];
const sparkPending  = [60, 50, 70, 45, 55, 40, 60, 50, 45, 55];
const sparkInvoices = [2, 3, 2, 4, 3, 5, 4, 5, 4, 6];

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function filterInvoices(invoices: Invoice[], from: string, to: string): Invoice[] {
  if (!from && !to) return invoices;
  return invoices.filter((inv) => {
    const d = inv.issue_date.slice(0, 10);
    if (from && !to)  return d === from;
    if (from && to)   return d >= from && d <= to;
    return true;
  });
}

// ─── date range picker ──────────────────────────────────────────────────────

const SHORTCUTS = [
  { label: "Aujourd'hui",     fn: () => { const t = toISO(new Date()); return [t, t]; } },
  { label: "Cette semaine",   fn: () => { const n = new Date(); const d = new Date(n); d.setDate(n.getDate() - ((n.getDay() + 6) % 7)); return [toISO(d), toISO(n)]; } },
  { label: "Ce mois",         fn: () => { const n = new Date(); return [toISO(new Date(n.getFullYear(), n.getMonth(), 1)), toISO(n)]; } },
  { label: "Mois dernier",    fn: () => { const n = new Date(); const s = new Date(n.getFullYear(), n.getMonth() - 1, 1); const e = new Date(n.getFullYear(), n.getMonth(), 0); return [toISO(s), toISO(e)]; } },
  { label: "Ce trimestre",    fn: () => { const n = new Date(); const s = new Date(n.getFullYear(), Math.floor(n.getMonth() / 3) * 3, 1); return [toISO(s), toISO(n)]; } },
  { label: "Cette année",     fn: () => { const n = new Date(); return [toISO(new Date(n.getFullYear(), 0, 1)), toISO(n)]; } },
];

function DateRangePicker({
  from, to, onChange,
}: {
  from: string; to: string;
  onChange: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef   = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // local display state (hint only — actual values read from refs on apply)
  const [localFrom, setLocalFrom] = useState("");
  const [localTo,   setLocalTo]   = useState("");

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleOpen = () => {
    // seed inputs with currently applied values
    setLocalFrom(from);
    setLocalTo(to);
    setOpen((v) => !v);
  };

  // keep DOM input values in sync when popover opens
  useEffect(() => {
    if (open) {
      if (fromRef.current) fromRef.current.value = from;
      if (toRef.current)   toRef.current.value   = to;
      setLocalFrom(from);
      setLocalTo(to);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => setLocalFrom(e.target.value);
  const handleToChange   = (e: React.ChangeEvent<HTMLInputElement>) => setLocalTo(e.target.value);

  const apply = () => {
    // read directly from DOM to avoid any controlled-input sync issues
    const f = fromRef.current?.value ?? localFrom;
    const t = toRef.current?.value   ?? localTo;
    onChange(f, t);
    setOpen(false);
  };

  const clearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLocalFrom(""); setLocalTo("");
    if (fromRef.current) fromRef.current.value = "";
    if (toRef.current)   toRef.current.value   = "";
    onChange("", "");
    setOpen(false);
  };

  const applyShortcut = (sf: string, st: string) => {
    setLocalFrom(sf); setLocalTo(st);
    onChange(sf, st);
    setOpen(false);
  };

  const hasFilter = !!from || !!to;
  const label = !from && !to
    ? "Sélectionner une période"
    : from && (!to || to === from)
    ? fmtDate(from)
    : `${fmtDate(from)} → ${fmtDate(to)}`;

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all cursor-pointer [color-scheme:light]";

  return (
    <div ref={wrapRef} className="relative">
      {/* ── trigger ── */}
      <button
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl border text-sm font-medium transition-all shadow-sm",
          hasFilter
            ? "bg-primary-50 border-primary-300 text-primary-700"
            : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-primary-50/60 hover:text-primary-700",
          open && "ring-2 ring-primary-500/20"
        )}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span className="max-w-[180px] truncate hidden sm:inline">{label}</span>
        <span className="sm:hidden text-xs">Période</span>
        {hasFilter ? (
          <span onClick={clearAll} className="ml-0.5 p-0.5 rounded hover:bg-primary-100 transition-colors">
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")} />
        )}
      </button>

      {/* ── popover ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl border border-slate-200 shadow-card-lg z-30 overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Filtrer par date</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Choisissez une date ou une plage, puis cliquez sur <strong className="text-slate-600">Appliquer</strong>.
            </p>
          </div>

          {/* Date inputs */}
          <div className="px-4 py-4 space-y-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Du</label>
                <input
                  ref={fromRef}
                  type="date"
                  defaultValue={from}
                  onChange={handleFromChange}
                  className={inputCls}
                />
              </div>
              <div className="pb-2.5 text-slate-300">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Au</label>
                <input
                  ref={toRef}
                  type="date"
                  defaultValue={to}
                  onChange={handleToChange}
                  className={inputCls}
                />
              </div>
            </div>

            {localFrom && !localTo && (
              <p className="text-xs text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                Seule la journée du <strong>{fmtDate(localFrom)}</strong> sera filtrée.
                Ajoutez une date de fin pour une plage.
              </p>
            )}
          </div>

          {/* Shortcuts */}
          <div className="px-4 pb-4 space-y-2">
            <p className="text-2xs font-semibold text-slate-400 uppercase tracking-widest">Raccourcis</p>
            <div className="grid grid-cols-3 gap-1.5">
              {SHORTCUTS.map((s) => {
                const [sf, st] = s.fn();
                const active = sf === from && st === to;
                return (
                  <button
                    key={s.label}
                    onClick={() => applyShortcut(sf, st)}
                    className={cn(
                      "text-xs px-2 py-1.5 rounded-lg font-medium transition-all text-center",
                      active
                        ? "bg-primary-600 text-white"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200"
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => clearAll()}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Effacer
            </button>
            <button
              onClick={apply}
              className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              Appliquer le filtre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── main dashboard content ─────────────────────────────────────────────────

export function DashboardContent({ invoices: all }: { invoices: Invoice[] }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const full = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
        setFirstName(full.split(" ")[0]);
      }
    });
  }, []);

  const invoices = filterInvoices(all, dateFrom, dateTo);

  const hasFilter = !!dateFrom || !!dateTo;
  const rangeLabel = !dateFrom && !dateTo
    ? "Toutes périodes"
    : dateFrom && (!dateTo || dateTo === dateFrom)
    ? fmtDate(dateFrom)
    : `${fmtDate(dateFrom)} → ${fmtDate(dateTo)}`;

  const totalAmount   = invoices.reduce((s, i) => s + Number(i.total), 0);
  const paidAmount    = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const sentAmount    = invoices.filter((i) => i.status === "sent").reduce((s, i) => s + Number(i.total), 0);
  const pendingAmount = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + Number(i.total), 0);
  const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + Number(i.total), 0);

  const statusCounts: Record<InvoiceStatus, number> = {
    draft:   invoices.filter((i) => i.status === "draft").length,
    sent:    invoices.filter((i) => i.status === "sent").length,
    paid:    invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  const overdueInvoices = all.filter((i) => i.status === "overdue");
  const recent = invoices.slice(0, 5);

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bienvenue{firstName ? `, ${firstName}` : ""} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => { setDateFrom(f); setDateTo(t); }}
          />
          <Link href="/invoices/new">
            <Button size="md">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle facture</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Overdue alert ── */}
      {overdueInvoices.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-800">
              {overdueInvoices.length} facture{overdueInvoices.length > 1 ? "s" : ""} en retard
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {overdueInvoices.map((i) => i.client?.name).join(", ")} — relancez vos clients.
            </p>
          </div>
          <Link href="/invoices?status=overdue" className="text-xs font-semibold text-red-700 hover:text-red-800 shrink-0 mt-0.5">
            Voir →
          </Link>
        </div>
      )}

      {/* ── Active filter badge ── */}
      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-primary-50 border border-primary-100 rounded-xl w-fit">
          <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
          <span className="text-xs font-medium text-primary-700">{rangeLabel}</span>
          <span className="text-xs text-primary-500">·</span>
          <span className="text-xs text-primary-600">{invoices.length} facture{invoices.length !== 1 ? "s" : ""}</span>
          <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="ml-1 text-primary-400 hover:text-primary-700 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard
          title="Total facturé"
          value={formatFCFA(totalAmount)}
          subtitle={rangeLabel}
          icon={CircleDollarSign}
          iconColor="text-primary-600"
          iconBg="bg-primary-50"
          trend={{ value: "8.2%", label: "vs mois préc.", positive: true }}
          sparkData={sparkRevenue}
          accent="bg-gradient-to-r from-primary-400 to-primary-600"
        />
        <StatCard
          title="Montant payé"
          value={formatFCFA(paidAmount)}
          subtitle="Encaissé"
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: "5.1%", label: "vs mois préc.", positive: true }}
          sparkData={sparkPaid}
          accent="bg-gradient-to-r from-emerald-400 to-emerald-600"
        />
        <StatCard
          title="En attente"
          value={formatFCFA(pendingAmount)}
          subtitle="À encaisser"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={{ value: "12%", label: "vs mois préc.", positive: false }}
          sparkData={sparkPending}
          accent="bg-gradient-to-r from-amber-400 to-amber-500"
        />
        <StatCard
          title="Factures"
          value={String(invoices.length)}
          subtitle={rangeLabel}
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend={{ value: String(invoices.filter((i) => i.status !== "draft").length), label: "envoyées", positive: true }}
          sparkData={sparkInvoices}
          accent="bg-gradient-to-r from-blue-400 to-blue-600"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <PaymentDonut paid={paidAmount} pending={sentAmount} overdue={overdueAmount} />
        </div>
      </div>

      {/* ── Status + recent invoices ── */}
      {invoices.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Par statut</h3>
                <span className="text-2xs text-slate-400 font-medium truncate max-w-[100px]">{rangeLabel}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {(["paid", "sent", "overdue", "draft"] as InvoiceStatus[]).map((status) => (
                  <Link key={status} href={`/invoices?status=${status}`}>
                    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                      <StatusBadge status={status} />
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{statusCounts[status]}</span>
                        <span className="text-slate-300">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="xl:col-span-2">
            <RecentInvoicesTable invoices={recent} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-2xl border border-slate-100 shadow-card">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Aucune facture sur cette période</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {hasFilter ? "Essayez une autre plage de dates." : "Créez votre première facture."}
          </p>
        </div>
      )}
    </>
  );
}
