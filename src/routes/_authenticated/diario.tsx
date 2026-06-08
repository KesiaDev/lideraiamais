import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/diario")({ component: Diario });

function Diario() {
  const qc = useQueryClient();
  const [f, setF] = useState({ aprendi: "", insight: "", aplicarei: "", habilidade: "" });
  const { data: lista = [] } = useQuery({
    queryKey: ["diario"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("diario_lider").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.aprendi.trim()) return toast.error("Preencha pelo menos 'O que aprendi'");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("diario_lider").insert({ ...f, user_id: u.user!.id });
    if (error) return toast.error(error.message);
    await supabase.rpc("add_pontos", { p_user: u.user!.id, p_pontos: 10 });
    setF({ aprendi: "", insight: "", aplicarei: "", habilidade: "" });
    qc.invalidateQueries({ queryKey: ["diario"] });
    toast.success("Reflexão salva! +10 pontos");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Diário do Líder</h1>
        <p className="text-muted-foreground">Registre o que aprendeu e como vai aplicar.</p>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-2xl border bg-card p-6">
        {[
          ["aprendi", "O que aprendi hoje?"],
          ["insight", "Qual foi meu principal insight?"],
          ["aplicarei", "Como aplicarei isso no trabalho?"],
          ["habilidade", "Que habilidade preciso desenvolver?"],
        ].map(([k, l]) => (
          <div key={k} className="space-y-2">
            <Label>{l}</Label>
            <Textarea rows={2} value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          </div>
        ))}
        <Button type="submit">Salvar Reflexão</Button>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
        <div className="space-y-3">
          {lista.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma reflexão ainda.</p>}
          {lista.map((r: any) => (
            <div key={r.id} className="rounded-xl border bg-card p-4 text-sm">
              <p className="mb-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</p>
              <p><strong>Aprendi:</strong> {r.aprendi}</p>
              {r.insight && <p><strong>Insight:</strong> {r.insight}</p>}
              {r.aplicarei && <p><strong>Aplicarei:</strong> {r.aplicarei}</p>}
              {r.habilidade && <p><strong>Habilidade:</strong> {r.habilidade}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}