import { formatFCFA, formatDate } from "@/lib/formatters";
import { Client } from "@/types";

interface PreviewItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface PreviewData {
  invoice_number: string;
  client?: Client;
  issue_date: string;
  due_date?: string;
  notes?: string;
  items: PreviewItem[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
}

export function InvoicePreview({ invoice }: { invoice: PreviewData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
      {/* Header strip */}
      <div className="bg-primary-600 px-6 py-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-200">Facture</p>
            <p className="text-xl font-bold mt-0.5">{invoice.invoice_number || "INV-XXXXXX"}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-white">Izifacture SARL</p>
            <p className="text-primary-200 text-xs mt-0.5">contact@izifacture.sn</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5 text-sm">
        {/* Billed to + dates */}
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Facturé à</p>
            {invoice.client ? (
              <>
                <p className="font-semibold text-gray-900">{invoice.client.name}</p>
                {invoice.client.email && <p className="text-gray-500 text-xs">{invoice.client.email}</p>}
                {invoice.client.address && <p className="text-gray-500 text-xs">{invoice.client.address}</p>}
              </>
            ) : (
              <p className="text-gray-400 italic">Client non sélectionné</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Dates</p>
            <p className="text-gray-700">
              <span className="text-gray-500">Émission: </span>
              {invoice.issue_date ? formatDate(invoice.issue_date) : "—"}
            </p>
            {invoice.due_date && (
              <p className="text-gray-700">
                <span className="text-gray-500">Échéance: </span>
                {formatDate(invoice.due_date)}
              </p>
            )}
          </div>
        </div>

        {/* Items table */}
        <div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 rounded-lg">
                <th className="text-left px-3 py-2 font-semibold text-gray-500 rounded-l-lg">Description</th>
                <th className="text-center px-2 py-2 font-semibold text-gray-500">Qté</th>
                <th className="text-right px-2 py-2 font-semibold text-gray-500">P.U.</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500 rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.items.filter(i => i.description || i.unit_price > 0).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-gray-400 italic">Aucun article</td>
                </tr>
              ) : (
                invoice.items
                  .filter(i => i.description || i.unit_price > 0)
                  .map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-gray-700">{item.description || "—"}</td>
                      <td className="px-2 py-2 text-center text-gray-500">{item.quantity}</td>
                      <td className="px-2 py-2 text-right text-gray-500">{item.unit_price.toLocaleString("fr-FR")}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{item.amount.toLocaleString("fr-FR")}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-3 space-y-1.5">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span className="font-medium">{formatFCFA(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>TVA ({invoice.vat_rate}%)</span>
            <span className="font-medium">{formatFCFA(invoice.vat_amount)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total TTC</span>
            <span className="text-primary-600">{formatFCFA(invoice.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700 mb-1">Notes</p>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
