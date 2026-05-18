"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCompany } from "@/lib/use-company";
import { formatFCFA, todayISO } from "@/lib/formatters";
import { InvoicePreview } from "./invoice-preview";
import { Plus, Trash2, Eye, EyeOff, ChevronDown, Check, X, User } from "lucide-react";
import { clientAvatar } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Client } from "@/types";

// ─── Add Client Modal ────────────────────────────────────────────────────────

function AddClientModal({ onAdd, onClose, companyId }: { onAdd: (c: Client) => void; onClose: () => void; companyId: string | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    if (!companyId) { setError("Impossible de récupérer l'entreprise."); setSaving(false); return; }
    const { data, error: err } = await supabase
      .from("clients")
      .insert({ company_id: companyId, name: name.trim(), email: email.trim() || null, phone: phone.trim() || null, address: address.trim() || null })
      .select()
      .single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    if (data) { onAdd(data as Client); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-card-lg w-full sm:max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Nouveau client</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-3">
          {[
            { label: "Nom *", value: name, set: setName, placeholder: "Nom du client ou de l'entreprise", auto: true },
            { label: "Email", value: email, set: setEmail, placeholder: "email@exemple.com", type: "email" },
            { label: "Téléphone", value: phone, set: setPhone, placeholder: "+221 77 000 00 00" },
            { label: "Adresse", value: address, set: setAddress, placeholder: "Ville, Pays" },
          ].map(({ label, value, set, placeholder, type, auto }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
              <input
                autoFocus={!!auto}
                type={type ?? "text"}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
          ))}
        </div>
        {error && (
          <p className="px-5 pb-2 text-xs text-red-600 font-medium">{error}</p>
        )}
        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={submit} disabled={!name.trim() || saving} className="flex-1">
            {saving ? "Enregistrement..." : "Ajouter le client"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Client Dropdown ──────────────────────────────────────────────────────────

function ClientDropdown({ clients, value, onChange, onAddClient }: { clients: Client[]; value: string; onChange: (id: string) => void; onAddClient: () => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = clients.find((c) => c.id === value);
  const filtered = clients.filter((c) => search === "" || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium text-slate-700 block mb-1.5">Client *</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn("w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all bg-white", open ? "border-primary-400 ring-2 ring-primary-500/20" : "border-slate-200 hover:border-slate-300", !selected && "text-slate-400")}
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", clientAvatar(selected.name).color)}>{clientAvatar(selected.name).initials}</div>
            <span className="text-slate-900 font-medium truncate">{selected.name}</span>
            {selected.email && <span className="text-xs text-slate-400 truncate hidden sm:block">{selected.email}</span>}
          </div>
        ) : <span>Sélectionner un client...</span>}
        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-card-md overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? <p className="px-4 py-3 text-sm text-slate-400 text-center">Aucun client trouvé</p> : filtered.map((c) => {
              const av = clientAvatar(c.name);
              return (
                <button key={c.id} type="button" onClick={() => { onChange(c.id); setOpen(false); setSearch(""); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left", c.id === value && "bg-primary-50")}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", av.color)}>{av.initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                    {c.email && <p className="text-xs text-slate-400 truncate">{c.email}</p>}
                  </div>
                  {c.id === value && <Check className="w-4 h-4 text-primary-600 shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 p-2">
            <button type="button" onClick={() => { setOpen(false); onAddClient(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors">
              <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center"><Plus className="w-3.5 h-3.5 text-primary-600" /></div>
              Nouveau client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Line item types ──────────────────────────────────────────────────────────

interface LineItem { id: string; description: string; quantity: number; unit_price: number; }
const generateId = () => Math.random().toString(36).slice(2);
const defaultItem = (): LineItem => ({ id: generateId(), description: "", quantity: 1, unit_price: 0 });

function generateInvoiceNumber(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `INV-${ym}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

export function InvoiceForm({ initialInvoice }: { initialInvoice?: Partial<{ id: string; invoice_number: string; client_id: string; issue_date: string; due_date: string; notes: string; items: LineItem[] }> } = {}) {
  const router = useRouter();
  const companyId = useCompany();
  const [showPreview, setShowPreview] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [saving, setSaving] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoice?.invoice_number ?? generateInvoiceNumber());
  const [clientId, setClientId] = useState(initialInvoice?.client_id ?? "");
  const [issueDate, setIssueDate] = useState(initialInvoice?.issue_date ?? todayISO());
  const [dueDate, setDueDate] = useState(initialInvoice?.due_date ?? "");
  const [notes, setNotes] = useState(initialInvoice?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(initialInvoice?.items ?? [defaultItem()]);

  useEffect(() => {
    supabase.from("clients").select("*").order("name").then(({ data }) => {
      setClients((data as Client[]) ?? []);
    });
  }, []);

  const handleAddClient = (c: Client) => {
    setClients((prev) => [...prev, c]);
    setClientId(c.id);
  };

  const VAT_RATE = 0.18;
  const updateItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: field === "description" ? value : Number(value) } : item));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_price), 0);
  const vatAmount = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vatAmount;

  const selectedClient = clients.find((c) => c.id === clientId);
  const invoiceData = {
    invoice_number: invoiceNumber,
    client: selectedClient,
    issue_date: issueDate,
    due_date: dueDate,
    notes,
    items: items.map((item) => ({ ...item, amount: Math.round(item.quantity * item.unit_price) })),
    subtotal,
    vat_rate: 18,
    vat_amount: vatAmount,
    total,
  };

  const handleSave = async (status: "draft" | "sent") => {
    if (!clientId) { alert("Veuillez sélectionner un client"); return; }
    setSaving(true);

    if (!companyId) { setSaving(false); return; }
    const payload = { company_id: companyId, client_id: clientId, invoice_number: invoiceNumber, status, issue_date: issueDate, due_date: dueDate || null, notes: notes || null, subtotal, vat_rate: 18, vat_amount: vatAmount, total };

    let invoiceId = initialInvoice?.id;
    if (invoiceId) {
      await supabase.from("invoices").update(payload).eq("id", invoiceId);
      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    } else {
      const { data } = await supabase.from("invoices").insert(payload).select().single();
      invoiceId = data?.id;
    }

    if (invoiceId) {
      await supabase.from("invoice_items").insert(
        items.map((item, idx) => ({ invoice_id: invoiceId, description: item.description, quantity: item.quantity, unit_price: item.unit_price, amount: Math.round(item.quantity * item.unit_price), sort_order: idx }))
      );
    }

    setSaving(false);
    router.push("/invoices");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Informations de la facture</h3>
          </div>
          <div className="px-4 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <ClientDropdown clients={clients} value={clientId} onChange={setClientId} onAddClient={() => setShowAddClient(true)} />
            </div>
            <Input label="Date d'émission *" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            <Input label="Date d'échéance" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Numéro de facture" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-202601-001" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Articles / Services</h3>
            <span className="text-xs text-slate-500">Devise : FCFA</span>
          </div>
          <div className="px-4 sm:px-6 py-5 space-y-3">
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-3 text-right">Prix unitaire</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1" />
            </div>
            {items.map((item, idx) => {
              const lineTotal = Math.round(item.quantity * item.unit_price);
              return (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <div className="col-span-12 sm:hidden text-xs font-medium text-slate-500 -mb-1">Article {idx + 1}</div>
                  <div className="col-span-12 sm:col-span-5">
                    <input type="text" placeholder="Description du service..." value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                  </div>
                  <div className="col-span-8 sm:col-span-3">
                    <input type="number" min="0" step="500" value={item.unit_price} onChange={(e) => updateItem(item.id, "unit_price", e.target.value)} placeholder="0" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                  </div>
                  <div className="col-span-11 sm:col-span-1 text-right">
                    <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{lineTotal.toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => { if (items.length > 1) setItems((p) => p.filter((i) => i.id !== item.id)); }} disabled={items.length === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setItems((p) => [...p, defaultItem()])} className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors mt-2">
              <Plus className="w-4 h-4" />Ajouter un article
            </button>
          </div>
          <div className="border-t border-slate-100 px-4 sm:px-6 py-5">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600"><span>Sous-total</span><span className="font-medium">{formatFCFA(subtotal)}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-600"><span>TVA (18%)</span><span className="font-medium">{formatFCFA(vatAmount)}</span></div>
              <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200"><span>Total TTC</span><span className="text-primary-600">{formatFCFA(total)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card px-4 sm:px-6 py-5">
          <label className="text-sm font-medium text-slate-700 block mb-2">Notes (optionnel)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Conditions de paiement, informations bancaires..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
          <button type="button" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 xl:hidden">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "Masquer" : "Aperçu"} la facture
          </button>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => router.push("/invoices")} className="flex-1 sm:flex-none" disabled={saving}>Annuler</Button>
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => handleSave("draft")} disabled={saving}>{saving ? "..." : "Brouillon"}</Button>
            <Button className="flex-1 sm:flex-none" onClick={() => handleSave("sent")} disabled={saving}>{saving ? "..." : "Envoyer"}</Button>
          </div>
        </div>

        {showPreview && <div className="xl:hidden"><InvoicePreview invoice={invoiceData} /></div>}
      </div>

      <div className="hidden xl:block xl:w-96 shrink-0">
        <div className="sticky top-6"><InvoicePreview invoice={invoiceData} /></div>
      </div>

      {showAddClient && <AddClientModal onAdd={handleAddClient} onClose={() => setShowAddClient(false)} companyId={companyId} />}
    </div>
  );
}
