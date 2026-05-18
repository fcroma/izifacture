"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatFCFA, formatDate } from "@/lib/formatters";
import { Invoice, InvoiceStatus } from "@/types";
import { Plus, Search, Eye, Pencil, Trash2, Download, FileText, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientAvatar } from "@/lib/design-tokens";

const statusTabs: { value: "all" | InvoiceStatus; label: string }[] = [
  { value: "all",     label: "Toutes" },
  { value: "draft",   label: "Brouillons" },
  { value: "sent",    label: "Envoyées" },
  { value: "paid",    label: "Payées" },
  { value: "overdue", label: "En retard" },
];

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
        <div className="absolute z-40 top-full mt-1.5 right-0 bg-white rounded-xl border border-slate-200 shadow-card-md min-w-[150px] overflow-hidden">
          <p className="px-3 pt-2.5 pb-1 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Changer en</p>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors", opt.bg, opt.value === status ? "opacity-40 cursor-default" : "cursor-pointer")}
              disabled={opt.value === status}
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

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as InvoiceStatus | null) ?? "all";
  const [activeTab, setActiveTab] = useState<"all" | InvoiceStatus>(initialStatus);
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("invoices")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setInvoices((data as Invoice[]) ?? []);
        setLoading(false);
      });
  }, []);

  const changeStatus = async (id: string, newStatus: InvoiceStatus) => {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: newStatus } : inv));
    await supabase.from("invoices").update({ status: newStatus }).eq("id", id);
  };

  const filtered = useMemo(() => invoices.filter((inv) => {
    const matchStatus = activeTab === "all" || inv.status === activeTab;
    const matchSearch = search === "" ||
      inv.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  }), [activeTab, search, invoices]);

  return (
    <DashboardShell title="Factures">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Factures</h2>
          <p className="text-sm text-slate-500 mt-0.5">{invoices.length} factures au total</p>
        </div>
        <Link href="/invoices/new">
          <Button size="md">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle facture</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-3 sm:px-5 pt-4 pb-0 border-b border-slate-100">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {statusTabs.map((tab) => {
              const count = tab.value === "all" ? invoices.length : invoices.filter((i) => i.status === tab.value).length;
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5",
                    active ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                  )}
                >
                  {tab.label}
                  <span className={cn("text-2xs px-1.5 py-0.5 rounded-full font-semibold", active ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3 sm:px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 hover:border-slate-300 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par client ou numéro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-50">
              {filtered.length === 0 ? <EmptyState /> : filtered.map((inv) => {
                const av = clientAvatar(inv.client?.name ?? "?");
                return (
                  <div
                    key={inv.id}
                    className="px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50/60 active:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", av.color)}>
                      {av.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{inv.client?.name ?? "—"}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-400">{formatDate(inv.issue_date)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                    <th className="text-left px-5 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">N° Facture</th>
                    <th className="text-left px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Client</th>
                    <th className="text-left px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest hidden md:table-cell">Émission</th>
                    <th className="text-left px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Échéance</th>
                    <th className="text-right px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Montant</th>
                    <th className="text-center px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest">Statut</th>
                    <th className="px-5 py-3 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7}><EmptyState /></td></tr>
                  ) : filtered.map((inv) => {
                    const av = clientAvatar(inv.client?.name ?? "?");
                    return (
                      <tr
                        key={inv.id}
                        className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{inv.invoice_number}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", av.color)}>{av.initials}</div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{inv.client?.name ?? "—"}</p>
                              {inv.client?.email && <p className="text-xs text-slate-400 hidden lg:block">{inv.client.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell"><span className="text-sm text-slate-500">{formatDate(inv.issue_date)}</span></td>
                        <td className="px-4 py-4 hidden lg:table-cell"><span className="text-sm text-slate-500">{inv.due_date ? formatDate(inv.due_date) : "—"}</span></td>
                        <td className="px-4 py-4 text-right"><span className="text-sm font-bold text-slate-900">{formatFCFA(Number(inv.total))}</span></td>
                        <td className="px-4 py-4 text-center">
                          <StatusChanger status={inv.status} onChange={(s) => changeStatus(inv.id, s)} />
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/invoices/${inv.id}`}>
                              <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                            </Link>
                            <Link href={`/invoices/${inv.id}/edit`}>
                              <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                            </Link>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm("Supprimer cette facture ?")) return;
                                await supabase.from("invoices").delete().eq("id", inv.id);
                                setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <FileText className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">Aucune facture trouvée</p>
      <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou créez une nouvelle facture.</p>
      <Link href="/invoices/new" className="mt-4">
        <Button size="sm" variant="secondary"><Plus className="w-3.5 h-3.5" />Créer une facture</Button>
      </Link>
    </div>
  );
}
