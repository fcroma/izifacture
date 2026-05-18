"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DbMsg = { id: string; from_role: "operator" | "support"; text: string; created_at: string; sender_name: string };
type ChatMsg = { id: string; role: "operator" | "support"; text: string; time: string; name: string };

function dbToMsg(row: DbMsg): ChatMsg {
  return {
    id: row.id,
    role: row.from_role,
    text: row.text,
    name: row.sender_name,
    time: new Date(row.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function SupportChatPage() {
  const ROOM = "support";
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", ROOM)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data.map(dbToMsg));
      });

    const channel = supabase
      .channel(`support-room:${ROOM}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${ROOM}` },
        (payload) => {
          setMessages((prev) => {
            const msg = dbToMsg(payload.new as DbMsg);
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
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
      from_role: "support",
      sender_name: "Support IT",
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

  const operatorMessages = messages.filter((m) => m.role === "operator").length;
  const supportMessages = messages.filter((m) => m.role === "support").length;

  return (
    <div className="h-dvh flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
        <Link href="/help" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">Console Support · Salle {ROOM}</p>
          <p className="text-xs text-slate-500">Interface ingénieur IT — Izifacture</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">{operatorMessages} msg. client · {supportMessages} réponses</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">En ligne</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Aucun message pour l&apos;instant</p>
              <p className="text-xs text-slate-400 mt-0.5">Les messages des opérateurs apparaîtront ici en temps réel</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2.5", msg.role === "support" ? "justify-end" : "justify-start")}>
            {msg.role === "operator" && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            )}
            <div className="max-w-[72%] space-y-0.5">
              <p className={cn("text-2xs font-medium px-1", msg.role === "support" ? "text-right text-slate-400" : "text-slate-400")}>
                {msg.name}
              </p>
              <div className={cn(
                "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                msg.role === "support"
                  ? "bg-primary-600 text-white rounded-br-sm"
                  : "bg-white text-slate-800 border border-slate-100 shadow-sm rounded-bl-sm"
              )}>
                <p>{msg.text}</p>
                <p className={cn("text-2xs mt-1", msg.role === "support" ? "text-primary-200 text-right" : "text-slate-400")}>
                  {msg.time}
                </p>
              </div>
            </div>
            {msg.role === "support" && (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-5">
                <span className="text-2xs font-bold text-primary-700">IT</span>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Répondre à l'opérateur..."
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
  );
}
