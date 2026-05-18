"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { formatFCFA, formatDate } from "@/lib/formatters";
import { Invoice, InvoiceStatus } from "@/types";
import { supabase } from "@/lib/supabase";
import { ArrowUpRight, Eye, Download, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientAvatar } from "@/lib/design-tokens";

const statusOptions: { value: InvoiceStatus; label: string; dot: string; bg: string; text: string }[] = [
  { value: "paid",    label: "Payée",     dot: "bg-emerald-500", bg: "hover:bg-emerald-50", text: "text-emerald-700" },
  { value: "sent",    label: "Envoyée",   dot: "bg-amber-500",   bg: "hover:bg-amber-50",   text: "text-amber-700"   },
  { value: "overdue", label: "En retard", dot: "bg-red-500",     bg: "hover:bg-red-50",     text: "text-red-700"     },
  { value: "draft",   label: "Brouillon", dot: "bg-slate-400",   bg: "hover:bg-slate-50",   text: "text-slate-600"   },
];

function StatusChanger({ status, onChange }: { status: InvoiceStatus; onChange: (s: InvoiceStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full hover:opacity-80 transition-opacity"
      >
        <StatusBadge status={status} />
        <ChevronDown className={cn("w-3 h-3 text-slate-400 -ml-0.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1.5 right-0 bg-white rounded-xl border border-slate-200 shadow-card-md min-w-[150px] overflow-hidden">
          <p className="px-3 pt-2.5 pb-1 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Changer en</p>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              disabled={opt.value === status}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors", opt.bg, opt.value === status ? "opacity-40 cursor-default" : "cursor-pointer")}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dot)} />
              <span className={cn("font-medium", opt.text)}>{opt.label}</span>
              {opt.value === status && <Check className="w-3.5 h-3.5 ml-auto text-slate-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecentInvoicesTable({ invoices: initial }: { invoices: Invoice[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initial);

  const changeStatus = async (id: string, newStatus: InvoiceStatus) => {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: newStatus } : inv));
    await supabase.from("invoices").update({ status: newStatus }).eq("id", id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Factures récentes</h2>
        <Link href="/invoices" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
          Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-slate-50">
        {invoices.map((inv) => {
          const av = clientAvatar(inv.client?.name ?? "?");
          return (
            <div key={inv.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
              <Link href={`/invoices/${inv.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", av.color)}>
                  {av.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{inv.client?.name ?? "—"}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{inv.invoice_number}</p>
                </div>
              </Link>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-sm font-bold text-slate-900">{formatFCFA(Number(inv.total))}</span>
                <StatusChanger status={inv.status} onChange={(s) => changeStatus(inv.id, s)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Facture</th>
              <th className="text-left px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Client</th>
              <th className="text-left px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest hidden md:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Montant</th>
              <th className="text-center px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Statut</th>
              <th className="px-5 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const av = clientAvatar(inv.client?.name ?? "?");
              return (
                <tr key={inv.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer">
                  <td className="px-5 py-4" onClick={() => window.location.href = `/invoices/${inv.id}`}>
                    <span className="font-mono text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                      {inv.invoice_number}
                    </span>
                  </td>
                  <td className="px-4 py-4" onClick={() => window.location.href = `/invoices/${inv.id}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", av.color)}>
                        {av.initials}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{inv.client?.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell" onClick={() => window.location.href = `/invoices/${inv.id}`}>
                    <span className="text-sm text-slate-500">{formatDate(inv.issue_date)}</span>
                  </td>
                  <td className="px-4 py-4 text-right" onClick={() => window.location.href = `/invoices/${inv.id}`}>
                    <span className="text-sm font-bold text-slate-900">{formatFCFA(Number(inv.total))}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusChanger status={inv.status} onChange={(s) => changeStatus(inv.id, s)} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/invoices/${inv.id}`}>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
