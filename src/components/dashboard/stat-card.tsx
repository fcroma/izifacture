import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { MiniSparkline } from "./mini-sparkline";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: { value: string; label?: string; positive: boolean };
  sparkData?: number[];
  accent?: string;
}

export function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor, iconBg, trend, sparkData, accent,
}: StatCardProps) {
  return (
    <div className={cn(
      "group relative bg-white rounded-2xl border border-slate-100 shadow-card p-5",
      "hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 cursor-default overflow-hidden"
    )}>
      {/* Subtle top gradient accent */}
      {accent && (
        <div className={cn("absolute inset-x-0 top-0 h-0.5 rounded-t-2xl", accent)} />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight leading-none animate-count">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
                trend.positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              )}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
              {trend.label && (
                <span className="text-xs text-slate-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner-sm transition-transform duration-200 group-hover:scale-110",
            iconBg
          )}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          {sparkData && (
            <MiniSparkline data={sparkData} positive={trend?.positive ?? true} />
          )}
        </div>
      </div>
    </div>
  );
}
