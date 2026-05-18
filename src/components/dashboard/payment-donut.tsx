"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatFCFA } from "@/lib/formatters";

interface PaymentDonutProps {
  paid: number;
  pending: number;
  overdue: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-card-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{payload[0].name}</p>
      <p className="text-slate-900 font-bold mt-0.5">{formatFCFA(payload[0].value)}</p>
    </div>
  );
};

export function PaymentDonut({ paid, pending, overdue }: PaymentDonutProps) {
  const total = paid + pending + overdue;
  const data = [
    { name: "Payé",       value: paid,    color: "#10B981" },
    { name: "En attente", value: pending, color: "#F59E0B" },
    { name: "En retard",  value: overdue, color: "#EF4444" },
  ].filter(d => d.value > 0);

  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Répartition paiements</h3>
        <p className="text-xs text-slate-400 mt-0.5">Toutes factures</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={46}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-slate-900 leading-none">{paidPct}%</span>
            <span className="text-2xs text-slate-400 font-medium mt-0.5">payé</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-slate-500 truncate">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-slate-800 shrink-0">{formatFCFA(d.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
