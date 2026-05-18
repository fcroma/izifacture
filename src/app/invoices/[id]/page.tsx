"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatFCFA, formatDate } from "@/lib/formatters";
import { Invoice, InvoiceStatus } from "@/types";
import { ArrowLeft, Pencil, Trash2, Send, CheckCircle, Download, Printer } from "lucide-react";

function buildPrintHTML(invoice: Invoice, status: InvoiceStatus): string {
  const statusLabels: Record<InvoiceStatus, string> = { draft: "Brouillon", sent: "Envoyée", paid: "Payée", overdue: "En retard" };
  const statusColors: Record<InvoiceStatus, string> = { draft: "#64748b", sent: "#f59e0b", paid: "#10b981", overdue: "#ef4444" };
  const items = (invoice.items ?? []).map((item) => `
    <tr>
      <td style="padding:10px 12px;color:#1e293b;">${item.description}</td>
      <td style="padding:10px 8px;text-align:center;color:#64748b;">${item.quantity}</td>
      <td style="padding:10px 8px;text-align:right;color:#64748b;">${Number(item.unit_price).toLocaleString("fr-FR")} FCFA</td>
      <td style="padding:10px 12px;text-align:right;font-weight:600;color:#1e293b;">${Number(item.amount).toLocaleString("fr-FR")} FCFA</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Facture ${invoice.invoice_number}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;font-size:14px}.page{max-width:800px;margin:0 auto;padding:40px}.header{background:#7c3aed;padding:28px 32px;border-radius:12px 12px 0 0;color:white;display:flex;justify-content:space-between;align-items:flex-start}.header-left .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#c4b5fd}.header-left .number{font-size:26px;font-weight:800;margin-top:4px}.header-right{text-align:right}.header-right .company{font-size:16px;font-weight:700}.header-right .sub{font-size:12px;color:#c4b5fd;margin-top:3px}.status-badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${statusColors[status]}22;color:${statusColors[status]};border:1px solid ${statusColors[status]}44;margin-top:8px}.body{border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:28px 32px}.meta{display:flex;justify-content:space-between;gap:24px;margin-bottom:24px}.meta-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:6px}.meta-value{font-size:15px;font-weight:700;color:#0f172a}.meta-sub{font-size:13px;color:#64748b;margin-top:2px}.meta-right{text-align:right}table{width:100%;border-collapse:collapse;margin:20px 0}thead tr{background:#f8fafc}thead th{padding:10px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;text-align:left}thead th:nth-child(2){text-align:center}thead th:nth-child(3),thead th:nth-child(4){text-align:right}tbody tr{border-bottom:1px solid #f1f5f9}.totals{border-top:1px solid #e2e8f0;padding-top:16px;margin-left:auto;max-width:260px}.total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#64748b}.total-row.grand{font-size:16px;font-weight:800;color:#0f172a;border-top:2px solid #e2e8f0;margin-top:8px;padding-top:12px}.total-row.grand .amount{color:#7c3aed}.notes{background:#f8fafc;border-radius:8px;padding:14px 16px;margin-top:20px;font-size:13px;color:#64748b}.notes strong{display:block;color:#374151;margin-bottom:4px}.footer{text-align:center;margin-top:32px;font-size:11px;color:#94a3b8}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
  </head><body><div class="page">
    <div class="header"><div class="header-left"><div class="label">Facture</div><div class="number">${invoice.invoice_number}</div><div class="status-badge">${statusLabels[status]}</div></div><div class="header-right"><div class="company">Izifacture SARL</div><div class="sub">contact@izifacture.sn</div><div class="sub">+221 33 800 00 00</div></div></div>
    <div class="body"><div class="meta"><div><div class="meta-label">Facturé à</div><div class="meta-value">${invoice.client?.name ?? "—"}</div>${invoice.client?.email ? `<div class="meta-sub">${invoice.client.email}</div>` : ""}${invoice.client?.phone ? `<div class="meta-sub">${invoice.client.phone}</div>` : ""}${invoice.client?.address ? `<div class="meta-sub">${invoice.client.address}</div>` : ""}</div><div class="meta-right"><div class="meta-label">Dates</div><div class="meta-sub">Émission : ${formatDate(invoice.issue_date)}</div>${invoice.due_date ? `<div class="meta-sub">Échéance : ${formatDate(invoice.due_date)}</div>` : ""}</div></div>
    <table><thead><tr><th>Description</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix unitaire</th><th style="text-align:right">Total</th></tr></thead><tbody>${items}</tbody></table>
    <div class="totals"><div class="total-row"><span>Sous-total</span><span>${Number(invoice.subtotal).toLocaleString("fr-FR")} FCFA</span></div><div class="total-row"><span>TVA (${invoice.vat_rate}%)</span><span>${Number(invoice.vat_amount).toLocaleString("fr-FR")} FCFA</span></div><div class="total-row grand"><span>Total TTC</span><span class="amount">${Number(invoice.total).toLocaleString("fr-FR")} FCFA</span></div></div>
    ${invoice.notes ? `<div class="notes"><strong>Notes</strong>${invoice.notes}</div>` : ""}
    </div><div class="footer">Izifacture — Document généré le ${new Date().toLocaleDateString("fr-FR")}</div></div>
  <script>window.onload=function(){window.print()}</script></body></html>`;
}

function printInvoice(invoice: Invoice, status: InvoiceStatus) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(buildPrintHTML(invoice, status));
  win.document.close();
}

async function downloadPDF(invoice: Invoice, status: InvoiceStatus) {
  const { default: jsPDF } = await import("jspdf");

  const statusLabels: Record<InvoiceStatus, string> = { draft: "Brouillon", sent: "Envoyée", paid: "Payée", overdue: "En retard" };
  const statusColors: Record<InvoiceStatus, [number, number, number]> = {
    draft: [100, 116, 139], sent: [245, 158, 11], paid: [16, 185, 129], overdue: [239, 68, 68],
  };

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 14;

  // Purple header
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, W, 38, "F");

  // Invoice number
  doc.setFontSize(9);
  doc.setTextColor(196, 181, 253);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", margin, 12);
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.invoice_number, margin, 22);

  // Status badge
  const [sr, sg, sb] = statusColors[status];
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(margin, 25, 28, 7, 2, 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(statusLabels[status].toUpperCase(), margin + 3, 30);

  // Company info (right)
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Izifacture SARL", W - margin, 13, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(196, 181, 253);
  doc.text("contact@izifacture.sn", W - margin, 19, { align: "right" });
  doc.text("+221 33 800 00 00", W - margin, 24, { align: "right" });

  // Client + dates block
  let y = 48;
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURÉ À", margin, y);
  doc.text("DATES", W - margin, y, { align: "right" });

  y += 5;
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client?.name ?? "—", margin, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  if (invoice.client?.email) { y += 4; doc.text(invoice.client.email, margin, y); }
  if (invoice.client?.phone) { y += 4; doc.text(invoice.client.phone, margin, y); }
  if (invoice.client?.address) { y += 4; doc.text(invoice.client.address, margin, y); }

  // Dates (right column)
  let dy = 53;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Émission : ${invoice.issue_date}`, W - margin, dy, { align: "right" });
  if (invoice.due_date) { dy += 5; doc.text(`Échéance : ${invoice.due_date}`, W - margin, dy, { align: "right" }); }

  // Items table
  y = Math.max(y, dy) + 10;
  const colX = [margin, 90, 130, 165];
  const rowH = 8;

  // Table header
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y - 5, W - margin * 2, rowH, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("DESCRIPTION", colX[0], y);
  doc.text("QTÉ", colX[1], y, { align: "center" });
  doc.text("PRIX UNITAIRE", colX[2], y, { align: "right" });
  doc.text("TOTAL", W - margin, y, { align: "right" });

  y += 3;
  doc.setDrawColor(241, 245, 249);

  for (const item of invoice.items ?? []) {
    y += rowH;
    doc.line(margin, y - 6, W - margin, y - 6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(item.description, colX[0], y - 1);
    doc.setTextColor(100, 116, 139);
    doc.text(String(item.quantity), colX[1], y - 1, { align: "center" });
    doc.text(`${Number(item.unit_price).toLocaleString("fr-FR")} FCFA`, colX[2], y - 1, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`${Number(item.amount).toLocaleString("fr-FR")} FCFA`, W - margin, y - 1, { align: "right" });
  }

  // Totals
  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(120, y - 4, W - margin, y - 4);

  const totals: [string, number][] = [
    ["Sous-total", Number(invoice.subtotal)],
    [`TVA (${invoice.vat_rate}%)`, Number(invoice.vat_amount)],
  ];
  for (const [label, amount] of totals) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, 130, y);
    doc.text(`${amount.toLocaleString("fr-FR")} FCFA`, W - margin, y, { align: "right" });
    y += 6;
  }

  // Grand total
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(120, y - 4, W - margin, y - 4);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Total TTC", 130, y);
  doc.setTextColor(124, 58, 237);
  doc.text(`${Number(invoice.total).toLocaleString("fr-FR")} FCFA`, W - margin, y, { align: "right" });

  // Notes
  if (invoice.notes) {
    y += 12;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y - 4, W - margin * 2, 16, 2, 2, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("Notes", margin + 3, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.notes, margin + 3, y + 7);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`Izifacture — Document généré le ${new Date().toLocaleDateString("fr-FR")}`, W / 2, 285, { align: "center" });

  doc.save(`${invoice.invoice_number}.pdf`);
}

const statusFlow: Record<InvoiceStatus, InvoiceStatus | null> = { draft: "sent", sent: "paid", paid: null, overdue: "paid" };
const statusLabels: Record<InvoiceStatus, string> = { draft: "Marquer envoyée", sent: "Marquer payée", paid: "Payée", overdue: "Marquer payée" };

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("invoices")
      .select("*, client:clients(*), items:invoice_items(*)")
      .eq("id", params.id as string)
      .single()
      .then(({ data }) => {
        if (data) {
          setInvoice(data as Invoice);
          setStatus(data.status as InvoiceStatus);
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setStatus(newStatus);
    await supabase.from("invoices").update({ status: newStatus }).eq("id", params.id as string);
  };

  const handleDelete = async () => {
    await supabase.from("invoices").delete().eq("id", params.id as string);
    router.push("/invoices");
  };

  if (loading) {
    return (
      <DashboardShell title="Facture">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!invoice) {
    return (
      <DashboardShell title="Facture">
        <div className="text-center py-20">
          <p className="text-slate-500">Facture introuvable.</p>
          <Link href="/invoices" className="text-primary-600 text-sm mt-2 inline-block">← Retour aux factures</Link>
        </div>
      </DashboardShell>
    );
  }

  const nextStatus = statusFlow[status];

  return (
    <DashboardShell title="Détail facture">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.push("/invoices")} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{invoice.invoice_number}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Émise le {formatDate(invoice.issue_date)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => printInvoice(invoice, status)}>
          <Printer className="w-4 h-4" />Imprimer
        </Button>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => downloadPDF(invoice, status)}>
          <Download className="w-4 h-4" />PDF
        </Button>
        {nextStatus && (
          <Button variant="secondary" size="sm" onClick={() => handleStatusChange(nextStatus)} className="shrink-0">
            {status === "draft" ? <Send className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {statusLabels[status]}
          </Button>
        )}
        <Link href={`/invoices/${invoice.id}/edit`} className="shrink-0">
          <Button variant="outline" size="sm"><Pencil className="w-4 h-4" />Modifier</Button>
        </Link>
        <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)} className="shrink-0">
          <Trash2 className="w-4 h-4" />Supprimer
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden w-full max-w-3xl">
        <div className="bg-primary-600 px-4 sm:px-8 py-5 sm:py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-200">Facture</p>
              <p className="text-xl sm:text-3xl font-bold mt-1 break-all">{invoice.invoice_number}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-white text-sm sm:text-lg">Izifacture SARL</p>
              <p className="text-primary-200 text-xs sm:text-sm mt-0.5">contact@izifacture.sn</p>
              <p className="text-primary-200 text-xs sm:text-sm hidden sm:block">+221 33 800 00 00</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Facturé à</p>
              <p className="font-bold text-slate-900">{invoice.client?.name}</p>
              {invoice.client?.email && <p className="text-slate-500 text-sm">{invoice.client.email}</p>}
              {invoice.client?.phone && <p className="text-slate-500 text-sm">{invoice.client.phone}</p>}
              {invoice.client?.address && <p className="text-slate-500 text-sm">{invoice.client.address}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Dates</p>
              <p className="text-sm text-slate-700"><span className="text-slate-500">Émission : </span>{formatDate(invoice.issue_date)}</p>
              {invoice.due_date && <p className="text-sm text-slate-700"><span className="text-slate-500">Échéance : </span>{formatDate(invoice.due_date)}</p>}
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[480px] px-4 sm:px-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-3 sm:px-4 py-3 font-semibold text-slate-600 rounded-l-lg">Description</th>
                    <th className="text-center px-3 py-3 font-semibold text-slate-600">Qté</th>
                    <th className="text-right px-3 py-3 font-semibold text-slate-600">Prix unitaire</th>
                    <th className="text-right px-3 sm:px-4 py-3 font-semibold text-slate-600 rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(invoice.items ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 sm:px-4 py-3 text-slate-900">{item.description}</td>
                      <td className="px-3 py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-3 py-3 text-right text-slate-600">{formatFCFA(Number(item.unit_price))}</td>
                      <td className="px-3 sm:px-4 py-3 text-right font-semibold text-slate-900">{formatFCFA(Number(item.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Sous-total</span><span className="font-medium">{formatFCFA(Number(invoice.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>TVA ({invoice.vat_rate}%)</span><span className="font-medium">{formatFCFA(Number(invoice.vat_amount))}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total TTC</span><span className="text-primary-600">{formatFCFA(Number(invoice.total))}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-700 mb-1">Notes</p>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full sm:max-w-md">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Supprimer la facture</h3>
            <p className="text-sm text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{invoice.invoice_number}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">Annuler</Button>
              <Button variant="danger" onClick={handleDelete} className="flex-1">Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
