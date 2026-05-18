"use client";
import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Building2, Upload, Save, CheckCircle, FileText, Check, Clock, AlignLeft, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { pageClasses } from "@/lib/design-tokens";

// ─── Invoice template options ─────────────────────────────────────────────────

const templates = [
  {
    id: "classic",
    label: "Classique",
    desc: "Sobre et professionnel",
    preview: (
      <div className="w-full h-full p-2 space-y-1.5">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
            <div className="w-7 h-1 bg-slate-300 rounded-full" />
          </div>
          <div className="w-8 h-5 border border-slate-200 rounded flex items-center justify-center">
            <div className="w-5 h-1 bg-slate-400 rounded-full" />
          </div>
        </div>
        <div className="border-t border-slate-100 pt-1.5 space-y-0.5">
          <div className="w-full h-1 bg-slate-100 rounded-full" />
          <div className="w-4/5 h-1 bg-slate-100 rounded-full" />
          <div className="w-full h-1 bg-slate-100 rounded-full" />
        </div>
        <div className="flex justify-end pt-0.5">
          <div className="w-12 h-3 bg-slate-800 rounded-sm flex items-center justify-center">
            <div className="w-8 h-1 bg-white rounded-full opacity-80" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "modern",
    label: "Moderne",
    desc: "Avec bandeau coloré",
    preview: (
      <div className="w-full h-full overflow-hidden rounded">
        <div className="h-6 bg-violet-600 px-2 flex items-center justify-between">
          <div className="w-8 h-1.5 bg-white/80 rounded-full" />
          <div className="w-5 h-1 bg-white/50 rounded-full" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="space-y-0.5">
            <div className="w-full h-1 bg-slate-100 rounded-full" />
            <div className="w-3/4 h-1 bg-slate-100 rounded-full" />
            <div className="w-full h-1 bg-slate-100 rounded-full" />
          </div>
          <div className="flex justify-end">
            <div className="w-12 h-3 bg-violet-600 rounded-sm flex items-center justify-center">
              <div className="w-8 h-1 bg-white rounded-full opacity-80" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    label: "Minimaliste",
    desc: "Épuré, sans fioritures",
    preview: (
      <div className="w-full h-full p-2 space-y-1.5">
        <div className="border-l-2 border-slate-800 pl-1.5 space-y-0.5">
          <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
          <div className="w-6 h-1 bg-slate-300 rounded-full" />
        </div>
        <div className="pt-1 space-y-0.5">
          <div className="w-full h-1 bg-slate-100 rounded-full" />
          <div className="w-4/5 h-1 bg-slate-100 rounded-full" />
          <div className="w-full h-1 bg-slate-100 rounded-full" />
        </div>
        <div className="border-t border-slate-800 pt-1 flex justify-end">
          <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
        </div>
      </div>
    ),
  },
];

const paymentTerms = [
  { value: "0",  label: "À réception" },
  { value: "15", label: "15 jours" },
  { value: "30", label: "30 jours" },
  { value: "45", label: "45 jours" },
  { value: "60", label: "60 jours" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Company fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Invoice model fields
  const [template, setTemplate] = useState("classic");
  const [paymentDelay, setPaymentDelay] = useState("30");
  const [footerNote, setFooterNote] = useState("Merci pour votre confiance. Paiement par virement bancaire ou mobile money.");
  const [emailSubject, setEmailSubject] = useState("Facture {{numero}} — {{entreprise}}");

  const [saved, setSaved] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("companies").select("*").single().then(({ data }) => {
      if (data) {
        setCompanyId(data.id);
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
        setFooterNote(data.footer_note ?? "Merci pour votre confiance. Paiement par virement bancaire ou mobile money.");
        setEmailSubject(data.email_subject ?? "Facture {{numero}} — {{entreprise}}");
      }
    });
  }, []);

  const handleSave = async () => {
    if (!companyId) return;
    await supabase.from("companies").update({ name, email, phone, address, footer_note: footerNote, email_subject: emailSubject }).eq("id", companyId);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardShell title="Paramètres">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className={pageClasses.title}>Paramètres</h2>
          <p className={pageClasses.subtitle}>Configurez votre entreprise et vos modèles de facturation.</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* ── Company identity ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Identité de l'entreprise</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-50 border-2 border-dashed border-primary-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-600">IS</span>
                </div>
                <div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                      <Upload className="w-4 h-4" />
                      Changer le logo
                    </span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                  <p className="text-xs text-slate-400 mt-1.5">PNG, JPG ou SVG · Max 2 Mo</p>
                </div>
              </div>
            </div>

            <Input
              label="Nom de l'entreprise *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ma Société SARL"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@masociete.sn"
              />
              <Input
                label="Téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 33 000 00 00"
              />
            </div>

            <Input
              label="Adresse"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="15 Rue du Commerce, Dakar, Sénégal"
            />
          </div>
        </div>

        {/* ── Invoice billing preferences ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Préférences de facturation</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Devise</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="text-sm text-slate-600 font-medium">FCFA (XOF)</span>
                  <span className="ml-auto text-xs text-slate-400">Non modifiable</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Taux TVA</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="text-sm text-slate-600 font-medium">18%</span>
                  <span className="ml-auto text-xs text-slate-400">Standard Afrique de l'Ouest</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Préfixe des numéros de facture</label>
              <div className="flex items-center gap-0">
                <span className="px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-mono">INV-</span>
                <input
                  type="text"
                  defaultValue="YYYYMM"
                  className="flex-1 rounded-r-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
              <p className="text-xs text-slate-400">Exemple : INV-202601-001</p>
            </div>
          </div>
        </div>

        {/* ── Invoice model ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Modèle de facturation</h3>
              <p className="text-xs text-slate-400 mt-0.5">Apparence et contenu par défaut de vos factures</p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* Template picker */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-3">Style de la facture</label>
              <div className="grid grid-cols-3 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all",
                      template === t.id
                        ? "border-primary-500 shadow-md shadow-primary-500/10"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className={cn(
                      "h-20 w-full bg-slate-50 p-1",
                      template === t.id && "bg-primary-50/40"
                    )}>
                      {t.preview}
                    </div>

                    {/* Label */}
                    <div className="px-2.5 py-2 text-left bg-white">
                      <p className="text-xs font-semibold text-slate-900">{t.label}</p>
                      <p className="text-2xs text-slate-400">{t.desc}</p>
                    </div>

                    {/* Check indicator */}
                    {template === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shadow">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment terms */}
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Délai de paiement par défaut
              </label>
              <div className="flex flex-wrap gap-2">
                {paymentTerms.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setPaymentDelay(pt.value)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all",
                      paymentDelay === pt.value
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                La date d'échéance sera calculée automatiquement à la création de chaque facture.
              </p>
            </div>

            {/* Footer note */}
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <AlignLeft className="w-4 h-4 text-slate-400" />
                Note de bas de page
              </label>
              <textarea
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                rows={3}
                placeholder="Coordonnées bancaires, conditions de règlement, message de remerciement..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-1.5">Apparaît en bas de chaque facture imprimée ou PDF.</p>
            </div>

            {/* Email subject */}
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Objet d'email par défaut
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Facture {{numero}} — {{entreprise}}"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {["{{numero}}", "{{client}}", "{{entreprise}}", "{{montant}}", "{{echeance}}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEmailSubject((v) => v + " " + tag)}
                    className="px-2 py-0.5 rounded-md bg-primary-50 border border-primary-100 text-2xs font-mono text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Cliquez sur une variable pour l'insérer dans l'objet.</p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pb-2">
          <Button onClick={handleSave} className="gap-2">
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Enregistré !" : "Enregistrer les modifications"}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Modifications sauvegardées.
            </span>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
