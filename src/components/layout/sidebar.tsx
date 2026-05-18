"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Receipt, Users2, Settings2,
  HelpCircle, X, Zap, ChevronLeft, ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

const sections = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Finances",
    items: [
      { href: "/invoices", label: "Factures", icon: Receipt },
      { href: "/clients",  label: "Clients",  icon: Users2 },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/settings", label: "Paramètres", icon: Settings2 },
      { href: "/help",     label: "Aide",        icon: HelpCircle },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
}

export function Sidebar({ collapsed = false, onCollapse, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur";
        setUserName(name);
        setUserEmail(user.email ?? "");
        const parts = name.split(" ");
        setInitials(parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase());
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-slate-100 transition-all duration-250 overflow-hidden",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-slate-100 shrink-0",
        collapsed ? "justify-center px-0 h-14" : "justify-between px-4 h-14"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0" onClick={onClose}>
          <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-900 text-base tracking-tight">izifacture</span>
          )}
        </Link>
        {onClose && !collapsed && (
          <button onClick={onClose} className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
        {sections.map((section) => (
          <div key={section.label} className={cn("mb-1", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <p className="px-2 mb-1 mt-1 text-2xs font-semibold text-slate-400 uppercase tracking-widest">
                {section.label}
              </p>
            )}
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5",
                    collapsed ? "justify-center w-10 h-10 mx-auto" : "px-2.5 py-2",
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {/* Active left bar */}
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-600 rounded-r-full" />
                  )}

                  <Icon className={cn(
                    "shrink-0 transition-colors",
                    collapsed ? "w-5 h-5" : "w-4 h-4",
                    active ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />

                  {!collapsed && <span>{label}</span>}

                  {/* Collapsed tooltip */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card + logout */}
      <div className={cn("border-t border-slate-100 shrink-0 space-y-2", collapsed ? "px-2 py-2" : "px-3 py-3")}>
        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName || "—"}</p>
              <p className="text-2xs text-slate-400 truncate">{userEmail || ""}</p>
            </div>
          </div>
        )}

        {/* Logout button — always visible */}
        {collapsed ? (
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors group relative"
          >
            <LogOut className="w-4 h-4" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
              Se déconnecter
            </div>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold hover:bg-red-100 hover:border-red-200 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        )}
      </div>

      {/* Collapse toggle — desktop only */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          className="hidden lg:flex items-center justify-center h-8 border-t border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      )}
    </div>
  );
}
