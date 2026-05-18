import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Invoice } from "@/types";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, client:clients(*), items:invoice_items(*)")
    .order("created_at", { ascending: false });

  const allInvoices = (data ?? []) as Invoice[];

  return (
    <DashboardShell title="Dashboard">
      <DashboardContent invoices={allInvoices} />
    </DashboardShell>
  );
}
