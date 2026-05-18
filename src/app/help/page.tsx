"use client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { cardClasses, pageClasses } from "@/lib/design-tokens";
import {
  MessageCircle, FileText, Mail,
  ChevronDown, Zap, Receipt, Users2, Settings2, Phone, X, Send,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const faqs = [
  {
    q: "Comment créer une facture ?",
    a: "Cliquez sur « Nouvelle facture » depuis le dashboard ou la page Factures. Sélectionnez un client, ajoutez vos articles, puis cliquez sur « Envoyer » ou « Brouillon ».",
  },
  {
    q: "Comment ajouter un client ?",
    a: "Rendez-vous sur la page Clients, cliquez sur « Nouveau client » et remplissez le formulaire (nom, email, téléphone, adresse).",
  },
  {
    q: "Comment changer le statut d'une facture ?",
    a: "Ouvrez la facture concernée et utilisez le bouton d'action en haut (« Marquer envoyée », « Marquer payée »). Le statut se met à jour instantanément.",
  },
  {
    q: "Comment configurer mon entreprise ?",
    a: "Allez dans Paramètres pour renseigner le nom, l'adresse, le logo et les informations de contact de votre entreprise.",
  },
  {
    q: "Quelle est la TVA appliquée ?",
    a: "La TVA est fixée à 18%, conformément au taux standard en Afrique de l'Ouest. Elle est calculée automatiquement sur le sous-total de chaque facture.",
  },
  {
    q: "Comment télécharger une facture en PDF ?",
    a: "Sur la page de détail d'une facture, cliquez sur le bouton « PDF » pour télécharger la facture au format PDF.",
  },
];

const guides = [
  {
    icon: Receipt,
    title: "Créer votre première facture",
    desc: "Guide pas à pas pour créer et envoyer une facture en moins de 2 minutes.",
    steps: [
      { n: "1", text: "Cliquez sur « Nouvelle facture » dans le menu Factures ou depuis le bouton du Dashboard." },
      { n: "2", text: "Sélectionnez un client dans la liste déroulante. Si le client n'existe pas encore, cliquez sur « Nouveau client » pour le créer directement." },
      { n: "3", text: "Renseignez la date d'émission et la date d'échéance." },
      { n: "4", text: "Ajoutez vos articles/services : description, quantité et prix unitaire. Le total TTC est calculé automatiquement avec TVA 18%." },
      { n: "5", text: "Cliquez sur « Envoyer » pour créer la facture avec le statut Envoyée, ou « Brouillon » pour la sauvegarder sans l'envoyer." },
    ],
  },
  {
    icon: Users2,
    title: "Gérer vos clients",
    desc: "Ajoutez, modifiez et organisez votre base clients efficacement.",
    steps: [
      { n: "1", text: "Allez dans la section « Clients » du menu principal." },
      { n: "2", text: "Cliquez sur « Nouveau client » pour ajouter un client (nom, email, téléphone, adresse)." },
      { n: "3", text: "Utilisez l'icône crayon ✏️ sur une carte client pour modifier ses informations." },
      { n: "4", text: "Utilisez l'icône corbeille 🗑️ pour supprimer un client. Les factures associées ne seront pas supprimées." },
      { n: "5", text: "Vous pouvez aussi créer un client directement depuis le formulaire de facture via le menu déroulant client." },
    ],
  },
  {
    icon: Settings2,
    title: "Configurer votre entreprise",
    desc: "Logo, coordonnées, préférences de facturation — tout se passe dans Paramètres.",
    steps: [
      { n: "1", text: "Allez dans « Paramètres » depuis le menu de gauche." },
      { n: "2", text: "Renseignez le nom de votre entreprise, email, téléphone et adresse dans la section « Identité »." },
      { n: "3", text: "Uploadez votre logo (PNG, JPG ou SVG, max 2 Mo)." },
      { n: "4", text: "Dans « Modèle de facturation », choisissez votre template de facture (Classique, Moderne ou Minimaliste)." },
      { n: "5", text: "Définissez votre délai de paiement par défaut et votre note de bas de page, puis cliquez sur « Enregistrer »." },
    ],
  },
  {
    icon: FileText,
    title: "Suivre les paiements",
    desc: "Comprendre les statuts de facture et relancer vos clients en retard.",
    steps: [
      { n: "1", text: "Chaque facture a un statut : Brouillon → Envoyée → Payée. Une facture peut aussi passer en « En retard » si l'échéance est dépassée." },
      { n: "2", text: "Pour changer le statut : ouvrez la facture et cliquez sur le bouton d'action (ex. « Marquer payée »)." },
      { n: "3", text: "Depuis la liste des factures ou le Dashboard, cliquez directement sur le badge de statut pour le changer en un clic." },
      { n: "4", text: "Les factures en retard apparaissent dans une alerte orange en haut du Dashboard." },
      { n: "5", text: "Filtrez par statut depuis l'onglet « En retard » dans la page Factures pour identifier rapidement les impayés." },
    ],
  },
];

type ChatMessage = { id: string; from: "operator" | "support"; text: string; time: string };
type DbMsg = { id: string; from_role: "operator" | "support"; text: string; created_at: string; sender_name: string };

function nowTime() {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function dbToMsg(row: DbMsg): ChatMessage {
  return {
    id: row.id,
    from: row.from_role,
    text: row.text,
    time: new Date(row.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

const WELCOME: ChatMessage = {
  id: "welcome",
  from: "support",
  text: "👋 Bonjour ! Je suis le support Izifacture. Comment puis-je vous aider ?",
  time: nowTime(),
};

function LiveChatModal({ onClose }: { onClose: () => void }) {
  const ROOM = "support";
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", ROOM)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setMessages(data.map(dbToMsg));
      });

    const channel = supabase
      .channel(`room:${ROOM}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${ROOM}` },
        (payload) => {
          setMessages((prev) => {
            const msg = dbToMsg(payload.new as DbMsg);
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev.filter((m) => m.id !== "welcome"), msg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    await supabase.from("chat_messages").insert({
      room_id: ROOM,
      from_role: "operator",
      sender_name: "Opérateur",
      text,
    });
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-card-lg w-full sm:max-w-md animate-slide-up flex flex-col" style={{ height: "min(600px, 90dvh)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Support Izifacture</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">En ligne · répond en &lt; 5 min</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/40">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2", msg.from === "operator" ? "justify-end" : "justify-start")}>
              {msg.from === "support" && (
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              )}
              <div className={cn(
                "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                msg.from === "operator"
                  ? "bg-primary-600 text-white rounded-br-sm"
                  : "bg-white text-slate-800 border border-slate-100 shadow-sm rounded-bl-sm"
              )}>
                <p>{msg.text}</p>
                <p className={cn("text-2xs mt-1", msg.from === "operator" ? "text-primary-200 text-right" : "text-slate-400")}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Écrivez votre message..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none max-h-28 overflow-y-auto"
              style={{ minHeight: "40px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-2xs text-slate-400 mt-1.5 text-center">Entrée pour envoyer · Shift+Entrée pour nouvelle ligne</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <DashboardShell title="Aide & Support">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className={pageClasses.title}>Aide & Support</h2>
          <p className={pageClasses.subtitle}>Tout ce dont vous avez besoin pour utiliser Izifacture.</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Quick guides */}
        <div className={cardClasses.base}>
          <div className={cardClasses.header}>
            <h3 className={cardClasses.headerTitle}>Guides de démarrage</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {guides.map(({ icon: Icon, title, desc, steps }) => (
              <details key={title} className="group">
                <summary className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer list-none">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-open:bg-primary-100 transition-colors mt-0.5">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-5 pb-5 pt-1">
                  <div className="ml-13 pl-1 space-y-3 border-l-2 border-primary-100 ml-[52px]">
                    {steps.map(({ n, text }) => (
                      <div key={n} className="flex items-start gap-3 pl-4">
                        <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-2xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                        <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className={cardClasses.base}>
          <div className={cardClasses.header}>
            <h3 className={cardClasses.headerTitle}>Questions fréquentes</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group px-5 py-4">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                  <p className="text-sm font-medium text-slate-900">{q}</p>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className={cardClasses.base}>
          <div className={cardClasses.header}>
            <h3 className={cardClasses.headerTitle}>Nous contacter</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Email */}
            <a href="mailto:support@izifacture.sn" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                <Mail className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Email</p>
                <p className="text-xs text-slate-500">support@izifacture.sn</p>
              </div>
            </a>

            {/* Phone */}
            <a href="tel:+237674701313" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Appelez-nous</p>
                <p className="text-xs text-slate-500">+237 674 701 313</p>
              </div>
            </a>

            {/* Live chat */}
            <button onClick={() => setChatOpen(true)} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all group text-left">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors relative">
                <MessageCircle className="w-4 h-4 text-primary-600" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Chat en direct</p>
                <p className="text-xs text-slate-500">Lun–Ven, 8h–18h</p>
              </div>
            </button>
          </div>
        </div>

        {/* Version */}
        <div className="flex items-center gap-2 px-1 pb-2">
          <div className="w-5 h-5 bg-gradient-primary rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xs text-slate-400">Izifacture v1.0.0 — Plan Gratuit</span>
        </div>
      </div>

      {chatOpen && <LiveChatModal onClose={() => setChatOpen(false)} />}
    </DashboardShell>
  );
}
