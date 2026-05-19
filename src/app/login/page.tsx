"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Zap, ArrowRight, AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_ATTEMPTS = 3;
const LOCK_MS = 5 * 60 * 1000;
const ATTEMPTS_KEY = "izi_login_attempts";
const LOCK_KEY = "izi_lock_until";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [lockCountdown, setLockCountdown] = useState(0);

  useEffect(() => {
    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0");
    const lockUntil = parseInt(localStorage.getItem(LOCK_KEY) || "0");
    if (lockUntil > Date.now()) {
      setLockCountdown(Math.ceil((lockUntil - Date.now()) / 1000));
    } else {
      setAttemptsLeft(MAX_ATTEMPTS - attempts);
    }
  }, []);

  useEffect(() => {
    if (lockCountdown <= 0) return;
    const t = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(LOCK_KEY);
          localStorage.removeItem(ATTEMPTS_KEY);
          setAttemptsLeft(MAX_ATTEMPTS);
          setError("");
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockCountdown]);

  const isLocked = lockCountdown > 0;
  const lockMin = Math.floor(lockCountdown / 60);
  const lockSec = lockCountdown % 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || loading) return;
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const prev = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0");
      const next = prev + 1;
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_MS;
        localStorage.setItem(LOCK_KEY, String(until));
        localStorage.removeItem(ATTEMPTS_KEY);
        setLockCountdown(Math.ceil(LOCK_MS / 1000));
      } else {
        localStorage.setItem(ATTEMPTS_KEY, String(next));
        setAttemptsLeft(MAX_ATTEMPTS - next);
        setError("Email ou mot de passe incorrect.");
      }
      setLoading(false);
      return;
    }

    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCK_KEY);

    // Check if MFA is required
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setMfaFactorId(factors?.totp[0]?.id ?? null);
      setStep("mfa");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || loading) return;
    setLoading(true);
    setError("");

    const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
    if (!challenge) {
      setError("Impossible de créer le défi MFA. Réessayez.");
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challenge.id,
      code: totpCode.replace(/\s/g, ""),
    });

    if (verifyError) {
      setError("Code incorrect. Vérifiez votre application d'authentification.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.08),transparent_60%)]" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Izifacture</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-10">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Gérez vos factures<br />
              <span className="text-primary-200">en toute simplicité.</span>
            </h1>
            <p className="text-primary-300/80 mt-4 text-base leading-relaxed max-w-xs">
              La solution de facturation conçue pour les entrepreneurs africains. Rapide, claire, professionnelle.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { emoji: "⚡", title: "Factures en 2 minutes", desc: "Créez et envoyez des factures professionnelles instantanément" },
              { emoji: "📊", title: "Suivi en temps réel", desc: "Dashboard avec statuts et revenus toujours à jour" },
              { emoji: "🔒", title: "Sécurisé & fiable", desc: "Données protégées, disponibles partout, tout le temps" },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-primary-300/70 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="bg-white/8 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
            <p className="text-sm text-white/90 leading-relaxed italic">
              &ldquo;Izifacture m&apos;a fait gagner des heures chaque semaine. Mes clients reçoivent leurs factures en quelques clics.&rdquo;
            </p>
            <div className="flex items-center gap-2.5 mt-3">
              <div className="w-7 h-7 rounded-full bg-primary-400 flex items-center justify-center text-xs font-bold text-white">A</div>
              <div>
                <p className="text-xs font-semibold text-white">Aminata D.</p>
                <p className="text-2xs text-primary-300/70">Consultante, Dakar</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-primary-400/50 text-xs relative z-10">© 2025 Izifacture · Tous droits réservés</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Logo — links back to landing page */}
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              izi<span className="text-primary-600">Facture</span>
            </span>
          </Link>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {step === "mfa" ? "Vérification en deux étapes" : "Connexion"}
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm">
              {step === "mfa"
                ? "Entrez le code de votre application d'authentification."
                : "Entrez vos identifiants pour accéder à votre espace."
              }
            </p>
          </div>

          {/* Lockout banner */}
          {isLocked && step === "password" && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Compte temporairement bloqué</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Trop de tentatives échouées. Réessayez dans{" "}
                  <span className="font-mono font-semibold">
                    {lockMin > 0 ? `${lockMin}:${String(lockSec).padStart(2, "0")}` : `${lockSec}s`}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ── Password step ── */}
          {step === "password" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLocked}
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all",
                    isLocked ? "opacity-50 cursor-not-allowed border-slate-200" : "border-slate-200 hover:border-slate-300"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                  <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLocked}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all",
                      isLocked ? "opacity-50 cursor-not-allowed border-slate-200" : "border-slate-200 hover:border-slate-300"
                    )}
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
              </div>

              {error && !isLocked && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700">{error}</p>
                    {attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">
                        {attemptsLeft} tentative{attemptsLeft > 1 ? "s" : ""} restante{attemptsLeft > 1 ? "s" : ""} avant blocage (5 min)
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isLocked || !email || !password}
                className="w-full py-3.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Se connecter</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          )}

          {/* ── MFA step ── */}
          {step === "mfa" && (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3.5">
                <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0" />
                <p className="text-sm text-primary-700">
                  Ouvrez votre application d'authentification (Google Authenticator, Authy…) et saisissez le code.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Code de vérification (6 chiffres)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  autoFocus
                  placeholder="000000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || totpCode.length < 6}
                className="w-full py-3.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ShieldCheck className="w-4 h-4" /><span>Vérifier</span></>
                }
              </button>

              <button
                type="button"
                onClick={() => { setStep("password"); setError(""); setTotpCode(""); }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Retour à la connexion
              </button>
            </form>
          )}

          {step === "password" && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">ou</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <p className="text-sm text-slate-500 text-center">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  Créer un compte
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
