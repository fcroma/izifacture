"use client";
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart,
} from "recharts";

const data = [
  { month: "Oct", revenue: 890000,  paid: 650000,  pending: 240000 },
  { month: "Nov", revenue: 1200000, paid: 950000,  pending: 250000 },
  { month: "Déc", revenue: 780000,  paid: 600000,  pending: 180000 },
  { month: "Jan", revenue: 1450000, paid: 1100000, pending: 350000 },
  { month: "Fév", revenue: 1100000, paid: 849600,  pending: 250400 },
  { month: "Mar", revenue: 1472000, paid: 1062400, pending: 409600 },
];

function formatK(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + "k";
  return String(v);
}

interface TooltipEntry { dataKey: string; name: string; value: number; color: string; }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-card-md px-3 py-2.5 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: TooltipEntry) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-900">{p.value.toLocaleString("fr-FR")} FCFA</span>
        </div>
      ))}
    </div>
  );
};

export function RevenueChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Revenus mensuels</h3>
          <p className="text-xs text-slate-400 mt-0.5">6 derniers mois</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary-600 shrink-0" />
            Payé
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary-200 shrink-0" />
            En attente
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} barGap={2} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatK}
            tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.04)", radius: 6 }} />
          <Bar dataKey="paid"    name="Payé"       fill="#7C3AED" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" name="En attente" fill="#DDD6FE" radius={[4, 4, 0, 0]} />
          <Line dataKey="revenue" name="Total" stroke="#6D28D9" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
