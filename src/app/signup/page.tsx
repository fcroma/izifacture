"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Zap, ArrowRight, AlertTriangle, CheckCircle2, User, Building2, Hash, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type Fields = {
  fullName: string;
  companyName: string;
  employeeId: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupPage() {
  const [fields, setFields] = useState<Fields>({
    fullName: "", companyName: "", employeeId: "", email: "", password: "", confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fields.password !== fields.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (fields.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: {
          full_name: fields.fullName,
          company_name: fields.companyName,
          employee_id: fields.employeeId,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const inputBase = cn(
    "w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400",
    "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all hover:border-slate-300"
  );

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Vérifiez votre email</h2>
              <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                Un email de confirmation a été envoyé à{" "}
                <span className="font-semibold text-slate-700">{fields.email}</span>.
                <br /><br />
                Cliquez sur le lien dans l&apos;email pour activer votre compte, puis connectez-vous.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-left">
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">Vous ne trouvez pas l&apos;email ?</span> Vérifiez vos spams ou dossiers promotions. Le lien expire après 24h.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
            >
              Aller à la connexion <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.08),transparent_60%)]" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Izifacture</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Commencez gratuitement<br />
              <span className="text-primary-200">dès aujourd&apos;hui.</span>
            </h1>
            <p className="text-primary-300/80 mt-4 text-base leading-relaxed max-w-xs">
              Rejoignez les entrepreneurs qui font confiance à Izifacture pour leur gestion financière.
            </p>
          </div>

          <div className="bg-white/8 rounded-2xl p-5 backdrop-blur-sm border border-white/10 space-y-4">
            <p className="text-sm font-semibold text-white">Inscription en 30 secondes</p>
            <div className="space-y-2.5">
              {[
                "Renseignez vos informations",
                "Confirmez votre adresse email",
                "Accédez immédiatement à votre espace",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-400/30 border border-primary-400/50 flex items-center justify-center shrink-0">
                    <span className="text-2xs font-bold text-primary-200">{i + 1}</span>
                  </div>
                  <p className="text-xs text-primary-200/80">{step}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2.5 pt-1 border-t border-white/10">
              <div className="flex -space-x-2">
                {["bg-emerald-400", "bg-amber-400", "bg-primary-300"].map((c, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-primary-800`} />
                ))}
              </div>
              <p className="text-xs text-primary-300/80">+500 entrepreneurs déjà inscrits</p>
            </div>
          </div>
        </div>

        <p className="text-primary-400/50 text-xs relative z-10">© 2025 Izifacture · Tous droits réservés</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-7 py-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Izifacture</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Créer un compte</h2>
            <p className="text-slate-500 mt-1.5 text-sm">Renseignez les informations de votre compte employé.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={fields.fullName}
                  onChange={set("fullName")}
                  required
                  autoComplete="name"
                  placeholder="Jean Dupont"
                  className={cn(inputBase, "pl-10 pr-4 py-3")}
                />
              </div>
            </div>

            {/* Company + Employee ID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Entreprise</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={fields.companyName}
                    onChange={set("companyName")}
                    required
                    placeholder="ACME Sarl"
                    className={cn(inputBase, "pl-9 pr-3 py-3")}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">ID employé</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={fields.employeeId}
                    onChange={set("employeeId")}
                    required
                    placeholder="EMP-001"
                    className={cn(inputBase, "pl-9 pr-3 py-3")}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={fields.email}
                  onChange={set("email")}
                  required
                  autoComplete="email"
                  placeholder="vous@entreprise.com"
                  className={cn(inputBase, "pl-10 pr-4 py-3")}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={fields.password}
                  onChange={set("password")}
                  required
                  autoComplete="new-password"
                  placeholder="8 caractères minimum"
                  className={cn(inputBase, "px-4 py-3 pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-md"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {fields.password.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all",
                        fields.password.length >= n * 2
                          ? fields.password.length >= 8 ? "bg-emerald-400" : "bg-amber-400"
                          : "bg-slate-200"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Confirmer le mot de passe</label>
              <input
                type={showPwd ? "text" : "password"}
                value={fields.confirmPassword}
                onChange={set("confirmPassword")}
                required
                autoComplete="new-password"
                placeholder="Répétez le mot de passe"
                className={cn(
                  inputBase,
                  "px-4 py-3",
                  fields.confirmPassword && fields.confirmPassword !== fields.password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : ""
                )}
              />
              {fields.confirmPassword && fields.confirmPassword !== fields.password && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !fields.fullName || !fields.email || !fields.password || !fields.confirmPassword}
              className="w-full py-3.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Créer mon compte</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              En vous inscrivant, vous acceptez nos{" "}
              <span className="text-primary-600 cursor-pointer hover:underline">conditions d&apos;utilisation</span>
              {" "}et notre{" "}
              <span className="text-primary-600 cursor-pointer hover:underline">politique de confidentialité</span>.
            </p>
          </form>

          <p className="text-sm text-slate-500 text-center">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
