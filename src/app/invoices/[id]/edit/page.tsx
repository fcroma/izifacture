import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, items:invoice_items(*)")
    .eq("id", params.id)
    .single();

  return (
    <DashboardShell title="Modifier la facture">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Modifier la facture</h2>
        <p className="text-sm text-slate-500 mt-0.5">{invoice?.invoice_number}</p>
      </div>
      <InvoiceForm
        initialInvoice={{
          id: invoice?.id,
          invoice_number: invoice?.invoice_number,
          client_id: invoice?.client_id,
          issue_date: invoice?.issue_date,
          due_date: invoice?.due_date ?? "",
          notes: invoice?.notes ?? "",
          items: invoice?.items?.map((item: { id: string; description: string; quantity: number; unit_price: number }) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }}
      />
    </DashboardShell>
  );
}
