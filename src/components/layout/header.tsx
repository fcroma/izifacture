"use client";
import { Menu, Bell, Search, ChevronDown, Settings, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const router = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [userName, setUserName] = useState("Utilisateur");
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
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100/80 px-4 lg:px-6 h-14 flex items-center gap-3 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-slate-800 truncate lg:text-base">{title}</h1>

      {/* Search — desktop */}
      <div className="hidden lg:flex flex-1 max-w-56 items-center gap-2 h-8 bg-slate-50 rounded-lg px-2.5 border border-slate-200 ml-3 group hover:border-primary-300 hover:bg-white transition-all duration-150 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-white cursor-text">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 group-focus-within:text-primary-500 transition-colors" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
        />
        <kbd className="hidden xl:flex items-center gap-0.5 text-2xs text-slate-400 font-mono bg-slate-100 border border-slate-200 rounded px-1 py-0.5 shrink-0">⌘K</kbd>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Notification bell */}
        <button className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full border-2 border-white" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className={cn(
              "flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg transition-colors hover:bg-slate-100",
              avatarOpen && "bg-slate-100"
            )}
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <span className="hidden lg:block text-xs font-medium text-slate-700">{userName.split(" ")[0]}</span>
            <ChevronDown className={cn("hidden lg:block w-3.5 h-3.5 text-slate-400 transition-transform duration-150", avatarOpen && "rotate-180")} />
          </button>

          {avatarOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAvatarOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-card-lg border border-slate-100 overflow-hidden z-20 animate-fade-in">
                <div className="px-3 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: User,     label: "Mon profil" },
                    { icon: Settings, label: "Paramètres" },
                  ].map(({ icon: Icon, label }) => (
                    <button key={label} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                      <Icon className="w-4 h-4 text-slate-400" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
