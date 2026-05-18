import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default function NewInvoicePage() {
  return (
    <DashboardShell title="Nouvelle facture">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Créer une facture</h2>
        <p className="text-sm text-gray-500 mt-0.5">Créez et envoyez une nouvelle facture à votre client.</p>
      </div>
      <InvoiceForm />
    </DashboardShell>
  );
}
