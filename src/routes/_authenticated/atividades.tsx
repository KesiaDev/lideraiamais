import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ClipboardList, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/atividades")({ component: Atividades });

function Atividades() {
  const qc = useQueryClient();
  const [respostas, setRespostas] = useState<Record<string, Record<string, string>>>({});

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: Infinity,
  });

  const { data: perfil } = useQuery({
    queryKey: ["perfil-nome", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("nome, email").eq("id", session!.user.id).single();
      return data;
    },
    staleTime: Infinity,
  });

  const { data: atividades, isLoading } = useQuery({
    queryKey: ["atividades"],
    queryFn: async () => {
      const { data } = await supabase
        .from("atividades")
        .select("*")
        .eq("ativa", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: respondidas } = useQuery({
    queryKey: ["respondidas", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("respostas_atividades")
        .select("atividade_id")
        .eq("user_id", session!.user.id);
      return new Set((data ?? []).map((r: any) => r.atividade_id));
    },
  });

  const enviar = useMutation({
    mutationFn: async ({ atividadeId }: { atividadeId: string }) => {
      const resp = respostas[atividadeId] ?? {};
      const { error } = await supabase.from("respostas_atividades").insert({
        atividade_id: atividadeId,
        user_id: session!.user.id,
        nome_aluno: perfil?.nome || perfil?.email || session?.user.email || "Aluno",
        respostas: resp,
      });
      if (error) throw error;
    },
    onSuccess: (_, { atividadeId }) => {
      toast.success("Respostas enviadas com sucesso!");
      qc.invalidateQueries({ queryKey: ["respondidas"] });
      setRespostas((prev) => { const n = { ...prev }; delete n[atividadeId]; return n; });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="h-40 rounded-2xl bg-muted animate-pulse" />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
        <p className="mt-1 text-muted-foreground">Responda as atividades propostas pela sua professora.</p>
      </div>

      {!atividades || atividades.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">Nenhuma atividade disponível no momento.</p>
          <p className="text-sm text-muted-foreground mt-1">Sua professora ainda não publicou atividades.</p>
        </div>
      ) : (
        atividades.map((ativ: any) => {
          const jaRespondeu = respondidas?.has(ativ.id) ?? false;
          const perguntas: string[] = ativ.perguntas ?? [];
          const resps = respostas[ativ.id] ?? {};
          const todasRespondidas = perguntas.every((p) => resps[p]?.trim());

          return (
            <div key={ativ.id} className="rounded-2xl border bg-card p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">{ativ.titulo}</h2>
                  {ativ.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">{ativ.descricao}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(ativ.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {jaRespondeu && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Respondida
                  </span>
                )}
              </div>

              {jaRespondeu ? (
                <p className="text-sm text-muted-foreground border rounded-lg p-4 bg-muted/30">
                  Você já enviou suas respostas para esta atividade.
                </p>
              ) : (
                <div className="space-y-5">
                  {perguntas.map((pergunta: string, i: number) => (
                    <div key={i} className="space-y-2">
                      <p className="text-sm font-medium">{pergunta}</p>
                      <Textarea
                        placeholder="Escreva sua resposta aqui..."
                        rows={3}
                        value={resps[pergunta] ?? ""}
                        onChange={(e) =>
                          setRespostas((prev) => ({
                            ...prev,
                            [ativ.id]: { ...(prev[ativ.id] ?? {}), [pergunta]: e.target.value },
                          }))
                        }
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      if (!todasRespondidas) return toast.error("Responda todas as perguntas antes de enviar.");
                      enviar.mutate({ atividadeId: ativ.id });
                    }}
                    disabled={enviar.isPending}
                    className="w-full sm:w-auto"
                  >
                    Enviar respostas
                  </Button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
