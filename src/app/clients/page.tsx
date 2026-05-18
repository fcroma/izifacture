"use client";
import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useCompany } from "@/lib/use-company";
import { Client } from "@/types";
import { clientAvatar } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, Mail, Phone, MapPin, X } from "lucide-react";

function ClientForm({ initial, onSave, onCancel }: { initial?: Client; onSave: (c: Omit<Client, "id" | "company_id">) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, email, phone, address });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nom *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Agence Cansaas" required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@exemple.sn" />
      <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" />
      <Input label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="15 Rue Carnot, Dakar" />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1">Enregistrer</Button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const companyId = useCompany();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoiceCounts, setInvoiceCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("invoices").select("client_id"),
    ]).then(([{ data: clientData }, { data: invoiceData }]) => {
      setClients((clientData as Client[]) ?? []);
      const counts: Record<string, number> = {};
      (invoiceData ?? []).forEach((inv: { client_id: string | null }) => {
        if (inv.client_id) counts[inv.client_id] = (counts[inv.client_id] ?? 0) + 1;
      });
      setInvoiceCounts(counts);
      setLoading(false);
    });
  }, []);

  const filtered = clients.filter((c) => search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? "").toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (data: Omit<Client, "id" | "company_id">) => {
    if (!companyId) return;
    const { data: newClient } = await supabase.from("clients").insert({ ...data, company_id: companyId }).select().single();
    if (newClient) setClients((prev) => [...prev, newClient as Client]);
    setShowForm(false);
  };

  const handleEdit = async (data: Omit<Client, "id" | "company_id">) => {
    if (!editClient) return;
    await supabase.from("clients").update(data).eq("id", editClient.id);
    setClients((prev) => prev.map((c) => c.id === editClient.id ? { ...c, ...data } : c));
    setEditClient(null);
  };

  const handleDelete = async () => {
    if (!deleteClient) return;
    await supabase.from("clients").delete().eq("id", deleteClient.id);
    setClients((prev) => prev.filter((c) => c.id !== deleteClient.id));
    setDeleteClient(null);
  };

  return (
    <DashboardShell title="Clients">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Clients</h2>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} clients enregistrés</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Nouveau client</Button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-card max-w-sm mb-5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input type="text" placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const av = clientAvatar(client.name);
            const count = invoiceCounts[client.id] ?? 0;
            return (
              <div key={client.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-card-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0", av.color)}>{av.initials}</div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{client.name}</p>
                      <p className="text-xs text-slate-400">{count} facture{count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditClient(client)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteClient(client)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  {client.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span className="truncate">{client.email}</span></div>}
                  {client.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span>{client.phone}</span></div>}
                  {client.address && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span className="truncate">{client.address}</span></div>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="col-span-full text-center py-16 text-sm text-slate-400">Aucun client trouvé.</div>}
        </div>
      )}

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Nouveau client</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <ClientForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Modifier le client</h3>
              <button onClick={() => setEditClient(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <ClientForm initial={editClient} onSave={handleEdit} onCancel={() => setEditClient(null)} />
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Supprimer le client</h3>
            <p className="text-sm text-slate-600 mb-6">Êtes-vous sûr de vouloir supprimer <strong>{deleteClient.name}</strong> ? Les factures associées ne seront pas supprimées.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteClient(null)}>Annuler</Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
