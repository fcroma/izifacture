"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ── Scroll-reveal hook ─────────────────────────────────────────────────── */
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(28px)",
      transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
    },
  };
}

/* ── Star row ───────────────────────────────────────────────────────────── */
function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Zap icon ───────────────────────────────────────────────────────────── */
function ZapIcon({ cls = "w-4 h-4" }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="bg-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

      {/* ── Global CSS ───────────────────────────────────────────────────── */}
      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-9px) rotate(-1deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        .fa{animation:floatA 6s ease-in-out infinite}
        .fb{animation:floatB 5s ease-in-out infinite 1s}
        .fc{animation:floatC 4s ease-in-out infinite 2s}
        .gradient-text{background:linear-gradient(130deg,#7C3AED 0%,#A855F7 55%,#EC4899 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .gradient-btn{background:linear-gradient(135deg,#7C3AED,#9333EA);box-shadow:0 8px 24px rgba(124,58,237,.35)}
        .gradient-btn:hover{opacity:.9;box-shadow:0 12px 32px rgba(124,58,237,.45)}
        .hero-bg{background:radial-gradient(ellipse 80% 60% at 70% 40%,rgba(124,58,237,.07) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 20% 80%,rgba(168,85,247,.05) 0%,transparent 60%),#F9F8FF}
        .card-up{transition:transform .25s ease,box-shadow .25s ease}
        .card-up:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.09)}
        .pro-card{background:linear-gradient(145deg,#6D28D9,#7C3AED,#8B5CF6)}
        .shimmer{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%}
        .nav-a::after{content:'';display:block;height:2px;background:#7C3AED;transform:scaleX(0);transition:transform .25s ease}
        .nav-a:hover::after{transform:scaleX(1)}
        .step-line{background:linear-gradient(180deg,#7C3AED,#E2E8F0)}
      `}</style>

      {/* ══ NAVBAR ════════════════════════════════════════════════════════ */}
      <nav className="fixed inset-x-0 top-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md shadow-violet-500/30">
              <ZapIcon cls="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              izi<span className="text-violet-600">Facture</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            {[["Fonctionnalités","#fonctionnalites"],["Tarifs","#tarifs"],["Témoignages","#temoignages"]].map(([l,h])=>(
              <a key={l} href={h} className="nav-a hover:text-slate-900 transition-colors">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Connexion
            </Link>
            <Link href="/signup" className="gradient-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95">
              Commencer
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
              {menuOpen
                ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-slate-100 px-4 py-3 space-y-1 shadow-lg">
            {[["Fonctionnalités","#fonctionnalites"],["Tarifs","#tarifs"],["Témoignages","#temoignages"],["Connexion","/login"]].map(([l,h])=>(
              <a key={l} href={h} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="hero-bg min-h-screen pt-16 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-violet-700">Nouveau · Disponible en FCFA</span>
            </div>

            <div>
              <h1 className="text-[3.25rem] sm:text-[4rem] font-black leading-[1.06] tracking-tight text-slate-900">
                Faites-vous payer<br />
                <span className="gradient-text">immédiatement.</span>
              </h1>
              <p className="mt-5 text-lg sm:text-xl text-slate-500 leading-relaxed max-w-lg">
                Fini les factures sur Word et Excel. Créez des factures professionnelles en 2 clics, TVA 18 % calculée automatiquement, et suivez chaque paiement en temps réel.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="gradient-btn inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-95">
                Commencer gratuitement
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#demo" className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 font-bold text-base hover:border-violet-300 hover:bg-violet-50 transition-all">
                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Voir la démo
              </a>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[["A","#7C3AED"],["K","#0EA5E9"],["M","#10B981"],["F","#F59E0B"]].map(([l,c],i)=>(
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: c }}>{l}</div>
                ))}
              </div>
              <div>
                <Stars />
                <p className="text-xs text-slate-500 mt-0.5"><strong className="text-slate-800">2 000+</strong> entrepreneurs font confiance</p>
              </div>
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative hidden lg:flex justify-center items-center min-h-[420px]" id="demo">
            {/* Main invoice card */}
            <div className="fa bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 w-72 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest">FACTURE</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">INV-202605-042</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Payée ✓</span>
              </div>
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between"><span className="text-slate-400">Client</span><span className="font-semibold text-slate-800">Konan & Fils</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Sous-total</span><span className="font-semibold">380 000 FCFA</span></div>
                <div className="flex justify-between"><span className="text-slate-400">TVA 18 %</span><span className="font-semibold text-violet-600">68 400 FCFA</span></div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total TTC</span>
                  <span className="font-black text-lg text-slate-900">448 400 FCFA</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Notification: payment received */}
            <div className="fb absolute -top-6 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3 z-20">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Paiement reçu !</p>
                <p className="text-xs font-black text-emerald-600">+ 448 400 FCFA</p>
              </div>
            </div>

            {/* Stat bubble: invoices this month */}
            <div className="fc absolute -bottom-4 left-4 rounded-2xl shadow-xl px-4 py-3 text-white z-20" style={{ background: "linear-gradient(135deg,#7C3AED,#9333EA)" }}>
              <p className="text-[10px] font-semibold opacity-80">Ce mois</p>
              <p className="text-3xl font-black leading-none">12</p>
              <p className="text-[10px] opacity-80 mt-0.5">factures envoyées</p>
            </div>

            {/* Client mini-bubble */}
            <div className="fb absolute bottom-16 -right-4 bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2.5 flex items-center gap-2 z-20">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-black">D</div>
              <div>
                <p className="text-xs font-bold text-slate-900">Diallo & Co</p>
                <p className="text-[10px] text-slate-400">3 factures actives</p>
              </div>
            </div>

            {/* Background decorative circle */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle,rgba(124,58,237,.08) 0%,transparent 70%)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ LOGO STRIP ════════════════════════════════════════════════════ */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-7">Ils font confiance à iziFacture</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 opacity-40">
            {["Freelance Hub","StartupAfrica","BusinessCam","Pro Dakar","CI Consulting","CamerTech"].map(n => (
              <span key={n} className="text-sm font-black text-slate-600 tracking-wider uppercase">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROBLEME ══════════════════════════════════════════════════════ */}
      <section id="probleme" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ProbSection />
        </div>
      </section>

      {/* ══ FONCTIONNALITES ═══════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FeaturesSection />
        </div>
      </section>

      {/* ══ COMMENT CA MARCHE ═════════════════════════════════════════════ */}
      <section id="comment" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <HowSection />
        </div>
      </section>

      {/* ══ TEMOIGNAGES ═══════════════════════════════════════════════════ */}
      <section id="temoignages" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <TestimonialsSection />
        </div>
      </section>

      {/* ══ TARIFICATION ══════════════════════════════════════════════════ */}
      <section id="tarifs" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <PricingSection />
        </div>
      </section>

      {/* ══ CTA FINAL ═════════════════════════════════════════════════════ */}
      <FinalCTA />

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}

/* ── SECTION: Problème ──────────────────────────────────────────────────── */
function ProbSection() {
  const a0 = useFadeIn(0);
  const a1 = useFadeIn(0);
  const a2 = useFadeIn(120);
  const a3 = useFadeIn(240);

  const problems = [
    {
      emoji: "📄",
      color: "bg-red-50 border-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      title: "Factures non professionnelles",
      desc: "Un document Word bricolé à la dernière minute ne donne pas confiance à vos clients et peut vous faire rater de gros contrats.",
    },
    {
      emoji: "🧮",
      color: "bg-orange-50 border-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      title: "Calculs de TVA manuels",
      desc: "18 % de TVA calculé à la main, c'est une erreur sur deux. Et une erreur de TVA, c'est un contentieux avec l'administration fiscale.",
    },
    {
      emoji: "📊",
      color: "bg-amber-50 border-amber-100",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Suivi des paiements impossible",
      desc: "Vous ne savez plus qui vous doit quoi. Des factures restent impayées pendant des mois parce que vous avez perdu le fil.",
    },
  ];

  return (
    <div>
      <div {...a0} className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-100 mb-4">Le problème</span>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          La facturation vous<br />prend trop de temps ?
        </h2>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          Vous n&apos;êtes pas seul. 73 % des entrepreneurs africains perdent des revenus à cause de processus de facturation archaïques.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {[a1, a2, a3].map((a, i) => (
          <div key={i} {...a} className={`card-up rounded-3xl border p-8 ${problems[i].color}`}>
            <div className={`w-12 h-12 rounded-2xl ${problems[i].iconBg} flex items-center justify-center text-2xl mb-5`}>
              {problems[i].emoji}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{problems[i].title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{problems[i].desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SECTION: Fonctionnalités ───────────────────────────────────────────── */
function FeaturesSection() {
  const head = useFadeIn(0);
  const fa0 = useFadeIn(0);
  const fa1 = useFadeIn(100);
  const fa2 = useFadeIn(200);
  const fa3 = useFadeIn(300);
  const featureAnims = [fa0, fa1, fa2, fa3];

  const features = [
    {
      icon: "📋",
      color: "from-violet-500 to-purple-600",
      title: "Factures pro en 2 clics",
      desc: "Sélectionnez un client, ajoutez vos lignes, envoyez. Le design professionnel est inclus d'office — plus de bricolage sur Word.",
    },
    {
      icon: "🧮",
      color: "from-blue-500 to-cyan-600",
      title: "TVA 18 % automatique",
      desc: "Le montant de TVA est calculé et affiché instantanément. Zéro erreur, zéro stress, toujours conforme à la réglementation.",
    },
    {
      icon: "🔔",
      color: "from-emerald-500 to-teal-600",
      title: "Suivi en temps réel",
      desc: "Voyez en un coup d'œil quelles factures sont payées, en attente ou en retard. Relancez d'un clic depuis le tableau de bord.",
    },
    {
      icon: "👥",
      color: "from-rose-500 to-pink-600",
      title: "Gestion clients intégrée",
      desc: "Carnet d'adresses, historique des factures, montants cumulés — toutes vos informations clients au même endroit.",
    },
  ];

  return (
    <div>
      <div {...head} className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 mb-4">Fonctionnalités</span>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Tout ce dont vous avez<br />besoin, rien de plus.
        </h2>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          Conçu pour les entrepreneurs africains qui veulent aller à l&apos;essentiel et facturer comme des pros.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <div key={i} {...featureAnims[i]} className="card-up bg-white rounded-3xl border border-slate-100 p-7 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl shadow-md`}>
              {f.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SECTION: Comment ça marche ─────────────────────────────────────────── */
function HowSection() {
  const head = useFadeIn(0);
  const ha0 = useFadeIn(0);
  const ha1 = useFadeIn(130);
  const ha2 = useFadeIn(260);
  const stepAnims = [ha0, ha1, ha2];

  const steps = [
    { n: "01", icon: "✍️", title: "Inscris-toi", desc: "Crée ton compte en 30 secondes. Pas de carte bancaire requise. Tu accèdes immédiatement à toutes les fonctionnalités." },
    { n: "02", icon: "📄", title: "Crée ta première facture", desc: "Sélectionne un client, ajoute tes prestations. La TVA est calculée automatiquement. La facture est prête en moins de 2 minutes." },
    { n: "03", icon: "🚀", title: "Envoie et suis les paiements", desc: "Envoie ta facture par email ou imprime-la. Suis les paiements depuis ton tableau de bord et relance en un clic si besoin." },
  ];

  return (
    <div>
      <div {...head} className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 mb-4">Simple comme bonjour</span>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Opérationnel en<br />moins de 3 minutes.
        </h2>
      </div>

      <div className="relative">
        {/* Connecting line (desktop) */}
        <div className="hidden sm:block absolute top-10 left-[calc(16.7%+28px)] right-[calc(16.7%+28px)] h-px bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" />

        <div className="grid sm:grid-cols-3 gap-10 sm:gap-6">
          {steps.map((s, i) => (
            <div key={i} {...stepAnims[i]} className="flex flex-col items-center text-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-3xl shadow-xl shadow-violet-500/25 relative z-10">
                  {s.icon}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-white border-2 border-violet-200 flex items-center justify-center text-xs font-black text-violet-600 shadow-sm">
                  {i + 1}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SECTION: Témoignages ───────────────────────────────────────────────── */
function TestimonialsSection() {
  const head = useFadeIn(0);
  const ta0 = useFadeIn(0);
  const ta1 = useFadeIn(110);
  const ta2 = useFadeIn(220);
  const testimAnims = [ta0, ta1, ta2];

  const testimonials = [
    {
      name: "Aminata Diallo",
      role: "Graphiste freelance · Dakar, Sénégal",
      avatar: "A",
      color: "#7C3AED",
      quote: "Avant iziFacture, je passais 2 heures à faire une facture sur Excel. Maintenant c'est 3 minutes et mes clients me disent que mes factures font très professionnel.",
    },
    {
      name: "Kouassi Brou",
      role: "Consultant business · Abidjan, Côte d'Ivoire",
      avatar: "K",
      color: "#0EA5E9",
      quote: "La TVA calculée automatiquement m'a sauvé la vie. J'avais fait des erreurs pendant des années sans le savoir. iziFacture m'a évité un redressement fiscal.",
    },
    {
      name: "Jean-Claude Mbarga",
      role: "Entrepreneur · Douala, Cameroun",
      avatar: "J",
      color: "#10B981",
      quote: "J'ai 12 clients réguliers. Avant je ne savais jamais qui m'avait payé ou pas. Avec iziFacture, je vois tout en temps réel. J'ai récupéré 850 000 FCFA d'impayés en 1 mois.",
    },
  ];

  return (
    <div>
      <div {...head} className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 mb-4">Témoignages</span>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Ils ont transformé<br />leur facturation.
        </h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} {...testimAnims[i]} className="card-up bg-white rounded-3xl border border-slate-100 p-7 flex flex-col gap-5">
            <Stars />
            <p className="text-sm text-slate-700 leading-relaxed flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: t.color }}>
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SECTION: Tarification ──────────────────────────────────────────────── */
function PricingSection() {
  const head = useFadeIn(0);
  const pa0 = useFadeIn(0);
  const pa1 = useFadeIn(100);
  const pa2 = useFadeIn(200);
  const pricingAnims = [pa0, pa1, pa2];

  const plans = [
    {
      name: "Gratuit",
      price: "0",
      period: "pour toujours",
      desc: "Parfait pour démarrer",
      features: ["5 factures par mois", "1 utilisateur", "Gestion clients de base", "TVA calculée automatiquement", "Export PDF"],
      cta: "Commencer gratuitement",
      href: "/signup",
      pro: false,
    },
    {
      name: "Pro",
      price: "5 000",
      period: "FCFA / mois",
      desc: "Pour les pros actifs",
      features: ["Factures illimitées", "1 utilisateur", "Tableau de bord avancé", "Relances automatiques", "Support prioritaire", "Historique illimité"],
      cta: "Essayer 14 jours gratuit",
      href: "/signup",
      pro: true,
    },
    {
      name: "Business",
      price: "15 000",
      period: "FCFA / mois",
      desc: "Pour les équipes",
      features: ["Factures illimitées", "Jusqu'à 10 utilisateurs", "Multi-entreprises", "Rapports avancés", "API disponible", "Support dédié 24/7"],
      cta: "Contacter l'équipe",
      href: "/signup",
      pro: false,
    },
  ];

  return (
    <div>
      <div {...head} className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 mb-4">Tarification</span>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Des prix taillés pour<br />l&apos;Afrique.
        </h2>
        <p className="mt-4 text-lg text-slate-500">Commencez gratuitement. Évoluez selon vos besoins.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 items-center">
        {plans.map((p, i) => {
          const a = pricingAnims[i];
          if (p.pro) {
            return (
              <div key={i} {...a} className="pro-card rounded-3xl p-8 relative shadow-2xl shadow-violet-500/30 sm:-my-4 z-10">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-bold text-white">⚡ Populaire</span>
                </div>
                <p className="text-xs font-bold text-violet-200 uppercase tracking-widest mb-1">{p.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{p.price}</span>
                  <span className="text-sm text-violet-200 pb-1">{p.period}</span>
                </div>
                <p className="text-sm text-violet-200 mb-7">{p.desc}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-white">
                      <svg className="w-4 h-4 text-violet-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className="block w-full py-3.5 rounded-2xl bg-white text-violet-700 text-sm font-black text-center hover:bg-violet-50 transition-colors">
                  {p.cta}
                </Link>
              </div>
            );
          }
          return (
            <div key={i} {...a} className="card-up bg-white rounded-3xl border border-slate-200 p-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{p.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-slate-900">{p.price}</span>
                <span className="text-sm text-slate-400 pb-1">{p.period}</span>
              </div>
              <p className="text-sm text-slate-500 mb-7">{p.desc}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className="block w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 text-sm font-bold text-center hover:border-violet-300 hover:bg-violet-50 transition-all">
                {p.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── SECTION: CTA Final ─────────────────────────────────────────────────── */
function FinalCTA() {
  const a = useFadeIn(0);
  return (
    <section className="py-24 overflow-hidden" style={{ background: "linear-gradient(135deg,#4C1D95,#7C3AED,#9333EA)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center" {...a}>
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <span className="text-sm font-bold text-white">🏆 Rejoins les entrepreneurs qui facturent comme des pros</span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6">
          Prêt à vous faire payer<br />
          <span style={{ color: "#C4B5FD" }}>sans attendre ?</span>
        </h2>
        <p className="text-xl text-violet-200 mb-10 max-w-xl mx-auto leading-relaxed">
          Rejoignez 2 000+ entrepreneurs africains qui ont dit adieu aux factures sur Word et Excel.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup" className="inline-flex items-center gap-2.5 px-8 py-4.5 py-[1.125rem] rounded-2xl bg-white text-violet-700 font-black text-base hover:bg-violet-50 transition-all shadow-xl hover:shadow-2xl active:scale-95">
            Commencer gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-all">
            J&apos;ai déjà un compte
          </Link>
        </div>
        <p className="mt-6 text-sm text-violet-300">Aucune carte bancaire requise · Annulation à tout moment</p>
      </div>
    </section>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <ZapIcon cls="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">izi<span className="text-violet-400">Facture</span></span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              La solution de facturation moderne pour les entrepreneurs africains.
            </p>
            <div className="flex gap-3 mt-5">
              {["twitter","linkedin","facebook","instagram"].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-violet-600 transition-colors">
                  <span className="text-xs font-bold text-slate-400 hover:text-white capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Produit", links: ["Fonctionnalités","Tarifs","Changelog","Roadmap"] },
            { title: "Entreprise", links: ["À propos","Blog","Carrières","Presse"] },
            { title: "Support", links: ["Centre d'aide","Contact","Statut","Confidentialité"] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2026 iziFacture. Tous droits réservés.</p>
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <span>🌍</span>
            Fait avec fierté en Afrique
            <span className="text-red-500">♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
