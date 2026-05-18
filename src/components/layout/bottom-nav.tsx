"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices",  label: "Factures",  icon: FileText },
  { href: "/clients",   label: "Clients",   icon: Users },
  { href: "/settings",  label: "Réglages",  icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 flex items-stretch safe-area-bottom">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
              active ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className={cn("w-5 h-5", active ? "text-primary-600" : "text-gray-400")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
