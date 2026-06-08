import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/desafios")({ component: Desafios });

function Desafios() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["desafios"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const [d, c] = await Promise.all([
        supabase.from("desafios").select("*").eq("ativo", true).order("semana"),
        supabase.from("desafios_concluidos").select("*").eq("user_id", session!.user.id),
      ]);
      return { desafios: d.data ?? [], concluidos: new Set((c.data ?? []).map((x: any) => x.desafio_id)) };
    },
  });

  async function concluir(d: any) {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("desafios_concluidos").insert({ user_id: session!.user.id, desafio_id: d.id });
    if (error) return toast.error(error.message);
    await supabase.rpc("add_pontos", { p_user: session!.user.id, p_pontos: d.pontos });
    qc.invalidateQueries({ queryKey: ["desafios"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success(`Desafio concluído! +${d.pontos} pontos`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Desafios da Semana</h1>
        <p className="text-muted-foreground">Pratique liderança no mundo real.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data?.desafios.map((d: any) => {
          const feito = data.concluidos.has(d.id);
          return (
            <div key={d.id} className={`rounded-2xl border bg-card p-5 ${feito ? "opacity-70" : ""}`}>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{d.categoria}</Badge>
                <Badge className="bg-primary"><Trophy className="mr-1 h-3 w-3" /> {d.pontos} pts</Badge>
              </div>
              <h3 className="font-semibold">{d.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.descricao}</p>
              <Button className="mt-3 w-full" disabled={feito} onClick={() => concluir(d)}>
                {feito ? <><Check className="mr-2 h-4 w-4" /> Concluído</> : "Marcar como concluído"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}