import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pdi")({ component: PDI });

const STATUS = { nao_iniciado: "Não iniciado", em_andamento: "Em andamento", concluido: "Concluído" } as const;

function PDI() {
  const qc = useQueryClient();
  const [f, setF] = useState({ competencia: "", objetivo: "", acao: "", prazo: "" });
  const { data: itens = [] } = useQuery({
    queryKey: ["pdi"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.from("pdi").select("*").eq("user_id", session!.user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.competencia || !f.objetivo || !f.acao) return toast.error("Preencha competência, objetivo e ação");
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("pdi").insert({ ...f, user_id: session!.user.id, prazo: f.prazo || null });
    if (error) return toast.error(error.message);
    setF({ competencia: "", objetivo: "", acao: "", prazo: "" });
    qc.invalidateQueries({ queryKey: ["pdi"] });
    toast.success("Item adicionado ao PDI");
  }

  async function updateStatus(item: any, status: string) {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("pdi").update({ status }).eq("id", item.id);
    if (status === "concluido" && !item.pontos_creditados) {
      await supabase.from("pdi").update({ pontos_creditados: true }).eq("id", item.id);
      await supabase.rpc("add_pontos", { p_user: session!.user.id, p_pontos: 30 });
      toast.success("Ação concluída! +30 pontos");
    }
    qc.invalidateQueries({ queryKey: ["pdi"] });
  }

  const total = itens.length;
  const concl = itens.filter((i: any) => i.status === "concluido").length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Plano de Desenvolvimento Individual</h1>
        <p className="text-muted-foreground">Defina competências e ações concretas para evoluir.</p>
      </div>

      {total > 0 && (
        <div className="rounded-2xl border bg-[image:var(--gradient-card)] p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Progresso geral</span><span className="font-semibold">{concl}/{total}</span>
          </div>
          <Progress value={(concl / total) * 100} />
        </div>
      )}

      <form onSubmit={add} className="grid gap-4 rounded-2xl border bg-card p-6 md:grid-cols-2">
        <div className="space-y-2"><Label>Competência</Label><Input value={f.competencia} onChange={(e) => setF({ ...f, competencia: e.target.value })} /></div>
        <div className="space-y-2"><Label>Prazo</Label><Input type="date" value={f.prazo} onChange={(e) => setF({ ...f, prazo: e.target.value })} /></div>
        <div className="space-y-2 md:col-span-2"><Label>Objetivo</Label><Textarea rows={2} value={f.objetivo} onChange={(e) => setF({ ...f, objetivo: e.target.value })} /></div>
        <div className="space-y-2 md:col-span-2"><Label>Ação prática</Label><Textarea rows={2} value={f.acao} onChange={(e) => setF({ ...f, acao: e.target.value })} /></div>
        <Button type="submit" className="md:col-span-2">Adicionar</Button>
      </form>

      <div className="space-y-3">
        {itens.map((i: any) => (
          <div key={i.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold">{i.competencia}</h3>
                <p className="text-sm text-muted-foreground">{i.objetivo}</p>
                <p className="mt-2 text-sm"><strong>Ação:</strong> {i.acao}</p>
                {i.prazo && <p className="text-xs text-muted-foreground">Prazo: {new Date(i.prazo).toLocaleDateString("pt-BR")}</p>}
              </div>
              <Select value={i.status} onValueChange={(v) => updateStatus(i, v)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}