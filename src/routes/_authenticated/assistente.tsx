import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PROMPTS_RAPIDOS } from "@/lib/leadership-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Bot, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assistente")({ component: Assistente });

type Msg = { role: "user" | "assistant"; content: string };

function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!r.ok) throw new Error(await r.text());
      const { reply } = await r.json();
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error("Erro ao consultar a IA: " + (e?.message ?? "tente novamente"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col" style={{ minHeight: "calc(100vh - 8rem)" }}>
      <div className="mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="h-7 w-7 text-primary" />Assistente IA</h1>
        <p className="text-muted-foreground">Seu copiloto de liderança 24/7.</p>
      </div>

      {msgs.length === 0 && (
        <div className="mb-4 grid gap-2 md:grid-cols-2">
          {PROMPTS_RAPIDOS.map((p) => (
            <button key={p.titulo} onClick={() => send(p.prompt)}
              className="rounded-xl border bg-card p-3 text-left text-sm transition hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]">
              <p className="font-medium">{p.titulo}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.prompt}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border bg-card p-4">
        {msgs.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Comece com um dos prompts ou faça sua pergunta.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-hero)]"><Bot className="h-4 w-4 text-primary-foreground" /></div>}
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.content}</div>
            {m.role === "user" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary"><UserIcon className="h-4 w-4" /></div>}
          </div>
        ))}
        {loading && <p className="text-sm text-muted-foreground">Pensando…</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
        <Textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Pergunte ao assistente de liderança…" />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}