import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp, ShieldAlert, ToggleLeft, ToggleRight, GraduationCap, Save, CheckCircle2 } from "lucide-react";
import { QUESTOES } from "./projeto-integrador";

export const Route = createFileRoute("/_authenticated/admin")({ component: Admin });

function Admin() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: Infinity,
  });

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", session!.user.id).single();
      return data?.is_admin ?? false;
    },
    staleTime: Infinity,
  });

  if (checkingAdmin) return <div className="text-muted-foreground p-8">Verificando permissões...</div>;

  if (!isAdmin) return (
    <div className="mx-auto max-w-md py-24 text-center space-y-4">
      <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Acesso restrito</h1>
      <p className="text-muted-foreground text-sm">Esta área é exclusiva para administradores.</p>
    </div>
  );

  return <AdminPanel userId={session!.user.id} />;
}

function AdminPanel({ userId }: { userId: string }) {
  const [aba, setAba] = useState<"atividades" | "respostas" | "projetos">("atividades");
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="mt-1 text-muted-foreground">Crie atividades e acompanhe as respostas dos alunos.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["atividades", "respostas", "projetos"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setAba(tab); setCriando(false); setAtividadeSelecionada(null); }}
            className={`pb-2 px-1 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              aba === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "atividades" ? "Gerenciar Atividades" : tab === "respostas" ? "Ver Respostas" : "Projeto Integrador"}
          </button>
        ))}
      </div>

      {aba === "atividades" && (
        <AtividadesTab userId={userId} criando={criando} onCriar={() => setCriando(true)} onCancelar={() => setCriando(false)} />
      )}
      {aba === "respostas" && (
        <RespostasTab atividadeSelecionada={atividadeSelecionada} onSelect={setAtividadeSelecionada} />
      )}
      {aba === "projetos" && <ProjetosTab />}
    </div>
  );
}

// ── Tab: Gerenciar Atividades ──────────────────────────────
function AtividadesTab({ userId, criando, onCriar, onCancelar }: {
  userId: string; criando: boolean; onCriar: () => void; onCancelar: () => void;
}) {
  const qc = useQueryClient();

  const { data: atividades } = useQuery({
    queryKey: ["admin-atividades"],
    queryFn: async () => {
      const { data } = await supabase.from("atividades").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const toggleAtiva = useMutation({
    mutationFn: async ({ id, ativa }: { id: string; ativa: boolean }) => {
      const { error } = await supabase.from("atividades").update({ ativa }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-atividades"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("atividades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Atividade excluída.");
      qc.invalidateQueries({ queryKey: ["admin-atividades"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {!criando && (
        <Button onClick={onCriar} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Atividade
        </Button>
      )}

      {criando && <FormNovaAtividade userId={userId} onSalvo={() => { onCancelar(); qc.invalidateQueries({ queryKey: ["admin-atividades"] }); }} onCancelar={onCancelar} />}

      {atividades && atividades.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Atividades criadas ({atividades.length})
          </h2>
          {atividades.map((at: any) => (
            <div key={at.id} className="rounded-2xl border bg-card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{at.titulo}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${at.ativa ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {at.ativa ? "Ativa" : "Inativa"}
                  </span>
                </div>
                {at.descricao && <p className="text-sm text-muted-foreground mt-0.5 truncate">{at.descricao}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {(at.perguntas ?? []).length} perguntas · {new Date(at.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleAtiva.mutate({ id: at.id, ativa: !at.ativa })}
                  title={at.ativa ? "Desativar" : "Ativar"}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {at.ativa ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => { if (confirm("Excluir esta atividade e todas as respostas?")) excluir.mutate(at.id); }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Form: Nova Atividade ───────────────────────────────────
const PERGUNTAS_PADRAO = [
  "Quem me inspira profissionalmente?",
  "Onde quero chegar na minha carreira?",
  "Qual habilidade preciso desenvolver?",
  "Qual comportamento preciso melhorar?",
  "Que tipo de líder quero me tornar?",
];

function FormNovaAtividade({ userId, onSalvo, onCancelar }: { userId: string; onSalvo: () => void; onCancelar: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [perguntas, setPerguntas] = useState<string[]>(PERGUNTAS_PADRAO);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!titulo.trim()) throw new Error("Dê um título à atividade.");
      const perguntasValidas = perguntas.filter((p) => p.trim());
      if (perguntasValidas.length === 0) throw new Error("Adicione pelo menos uma pergunta.");
      const { error } = await supabase.from("atividades").insert({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        perguntas: perguntasValidas,
        ativa: true,
        created_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Atividade criada!"); onSalvo(); },
    onError: (e: any) => toast.error(e.message),
  });

  const addPergunta = () => setPerguntas((p) => [...p, ""]);
  const removePergunta = (i: number) => setPerguntas((p) => p.filter((_, idx) => idx !== i));
  const editPergunta = (i: number, v: string) => setPerguntas((p) => p.map((x, idx) => idx === i ? v : x));

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-5">
      <h2 className="font-semibold text-lg">Nova Atividade</h2>

      <div className="space-y-2">
        <Label htmlFor="titulo">Título da atividade</Label>
        <Input id="titulo" placeholder="Ex: Reflexão de carreira – Aula 08/06" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea id="descricao" placeholder="Instrução geral para os alunos..." rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Perguntas</Label>
          <Button variant="outline" size="sm" onClick={addPergunta} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Adicionar pergunta
          </Button>
        </div>
        {perguntas.map((p, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="mt-2.5 text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
            <Input value={p} onChange={(e) => editPergunta(i, e.target.value)} placeholder="Digite a pergunta..." className="flex-1" />
            {perguntas.length > 1 && (
              <button onClick={() => removePergunta(i)} className="mt-2.5 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando..." : "Publicar Atividade"}
        </Button>
        <Button variant="outline" onClick={onCancelar}>Cancelar</Button>
      </div>
    </div>
  );
}

// ── Tab: Ver Respostas ─────────────────────────────────────
function RespostasTab({ atividadeSelecionada, onSelect }: { atividadeSelecionada: string | null; onSelect: (id: string | null) => void }) {
  const { data: atividades } = useQuery({
    queryKey: ["admin-atividades"],
    queryFn: async () => {
      const { data } = await supabase.from("atividades").select("id, titulo, perguntas, created_at").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: respostas, isLoading } = useQuery({
    queryKey: ["admin-respostas", atividadeSelecionada],
    enabled: !!atividadeSelecionada,
    queryFn: async () => {
      const { data } = await supabase
        .from("respostas_atividades")
        .select("*")
        .eq("atividade_id", atividadeSelecionada!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const ativAtual = atividades?.find((a: any) => a.id === atividadeSelecionada);

  if (!atividades || atividades.length === 0) return (
    <p className="text-muted-foreground text-sm">Nenhuma atividade criada ainda.</p>
  );

  return (
    <div className="space-y-6">
      {/* Seletor de atividade */}
      <div className="space-y-2">
        <Label>Selecionar atividade</Label>
        <div className="grid gap-2">
          {atividades.map((at: any) => (
            <button
              key={at.id}
              onClick={() => onSelect(atividadeSelecionada === at.id ? null : at.id)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                atividadeSelecionada === at.id ? "border-primary bg-primary/5" : "bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm">{at.titulo}</p>
                {atividadeSelecionada === at.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(at.created_at).toLocaleDateString("pt-BR")}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Respostas da atividade selecionada */}
      {atividadeSelecionada && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Respostas — {ativAtual?.titulo}</h2>
            {respostas && <span className="text-sm text-muted-foreground">{respostas.length} aluno{respostas.length !== 1 ? "s" : ""}</span>}
          </div>

          {isLoading && <p className="text-muted-foreground text-sm">Carregando respostas...</p>}

          {respostas && respostas.length === 0 && (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhum aluno respondeu ainda.</p>
            </div>
          )}

          {respostas && respostas.map((r: any) => {
            const perguntas: string[] = (ativAtual?.perguntas as string[] | undefined) ?? [];
            return (
              <div key={r.id} className="rounded-2xl border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.nome_aluno || "Aluno"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="space-y-3">
                  {perguntas.map((pergunta: string) => (
                    <div key={pergunta} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{pergunta}</p>
                      <p className="text-sm bg-muted/40 rounded-lg px-3 py-2">{r.respostas?.[pergunta] || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: Projeto Integrador (Admin) ────────────────────────
function ProjetosTab() {
  const [aberto, setAberto] = useState<string | null>(null);

  const { data: projetos, isLoading } = useQuery({
    queryKey: ["admin-projetos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projeto_integrador")
        .select("*")
        .order("created_at", { ascending: false });
      if (!data || data.length === 0) return [];
      const ids = data.map((p) => p.user_id);
      const { data: perfis } = await supabase
        .from("profiles")
        .select("id, nome, email")
        .in("id", ids);
      const mapa = new Map((perfis ?? []).map((p: any) => [p.id, p]));
      return data.map((p: any) => ({ ...p, aluno: mapa.get(p.user_id) }));
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!projetos || projetos.length === 0) return (
    <div className="rounded-2xl border bg-card p-8 text-center">
      <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Nenhum aluno concluiu o Projeto Integrador ainda.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{projetos.length} projeto{projetos.length !== 1 ? "s" : ""} concluído{projetos.length !== 1 ? "s" : ""}.</p>
      {projetos.map((p: any) => {
        const isOpen = aberto === p.id;
        return (
          <div key={p.id} className="rounded-2xl border bg-card">
            <button
              onClick={() => setAberto(isOpen ? null : p.id)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <div>
                <p className="font-semibold">{p.aluno?.nome ?? "Aluno"}</p>
                <p className="text-xs text-muted-foreground">{p.aluno?.email} · Enviado em {new Date(p.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isOpen && (
              <div className="space-y-4 border-t p-5">
                <ProjetoCampo titulo="1. Perfil de líder hoje" texto={p.perfil_lideranca} />
                <ProjetoCampo titulo="2. Ponto forte + gap (CHA)" texto={p.cha_destaque} />
                <ProjetoCampo titulo="3. Foco de desenvolvimento (PDI)" texto={p.plano_desenvolvimento} />
                <ProjetoCampo titulo="4. Aplicação de IA na liderança" texto={p.aplicacao_ia} />
                <ProjetoCampo titulo="5. Aprendizado mais transformador" texto={p.aprendizado_transformador} />
                {p.carta_futuro && <ProjetoCampo titulo="Carta para o Eu do Futuro" texto={p.carta_futuro} />}
                {p.compromisso && <ProjetoCampo titulo="Compromisso de Liderança" texto={p.compromisso} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjetoCampo({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <p className="whitespace-pre-wrap rounded-lg bg-muted/40 px-3 py-2 text-sm">{texto}</p>
    </div>
  );
}
