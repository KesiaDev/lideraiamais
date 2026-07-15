import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PERFIS_DISC, type PerfilDISC } from "@/lib/leadership-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Compass, BarChart3, Target, Maximize2, Pencil, Trophy,
  CheckCircle2, FileDown, ChevronLeft, ChevronRight, Award,
  Rocket, Heart, Quote, BookOpen, Presentation, Lock,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/projeto-integrador")({ component: ProjetoIntegrador });

type FormState = {
  perfil_lideranca: string;
  cha_destaque: string;
  plano_desenvolvimento: string;
  aplicacao_ia: string;
  aprendizado_transformador: string;
  carta_futuro: string;
  compromisso: string;
};

const EMPTY: FormState = {
  perfil_lideranca: "", cha_destaque: "", plano_desenvolvimento: "",
  aplicacao_ia: "", aprendizado_transformador: "", carta_futuro: "", compromisso: "",
};

type Questao = {
  key: keyof FormState;
  n: number;
  capitulo: 1 | 2 | 3 | 4;
  titulo: string;
  dica: string;
  placeholder: string;
  obrigatoria: boolean;
  minPalavras: number;
  icon: any;
};

const QUESTOES: Questao[] = [
  { key: "perfil_lideranca", n: 1, capitulo: 1, obrigatoria: true, minPalavras: 40, icon: Compass,
    titulo: "Meu perfil de líder hoje",
    dica: "Como eu me enxergo enquanto líder neste momento? Qual estilo (DISC) mais aparece em mim e em quais situações?",
    placeholder: "Hoje eu me percebo como um líder..." },
  { key: "cha_destaque", n: 2, capitulo: 1, obrigatoria: true, minPalavras: 40, icon: BarChart3,
    titulo: "Meu ponto forte + meu gap do CHA",
    dica: "Cite um Conhecimento, Habilidade ou Atitude que se destaca — e outro que ainda é uma lacuna a desenvolver.",
    placeholder: "Meu maior ponto forte é... e o gap que preciso trabalhar é..." },
  { key: "plano_desenvolvimento", n: 3, capitulo: 2, obrigatoria: true, minPalavras: 50, icon: Target,
    titulo: "Meu foco de desenvolvimento + critério de evolução",
    dica: "Qual competência do PDI é prioridade nos próximos 90 dias? Como você vai medir que evoluiu?",
    placeholder: "Vou focar em desenvolver... e saberei que evoluí quando..." },
  { key: "aplicacao_ia", n: 4, capitulo: 2, obrigatoria: true, minPalavras: 50, icon: Sparkles,
    titulo: "Uma aplicação concreta de IA na minha liderança",
    dica: "Escolha um caso real (feedback, comunicação, conflito, decisão) e descreva como a IA vai te apoiar.",
    placeholder: "Vou usar IA para me apoiar em..." },
  { key: "aprendizado_transformador", n: 5, capitulo: 3, obrigatoria: true, minPalavras: 40, icon: Rocket,
    titulo: "O aprendizado mais transformador do curso",
    dica: "Uma ideia, ferramenta ou reflexão que mudou seu jeito de liderar — e por quê.",
    placeholder: "O que mais me transformou foi..." },
  { key: "carta_futuro", n: 6, capitulo: 4, obrigatoria: false, minPalavras: 40, icon: Heart,
    titulo: "Carta para o Eu do Futuro",
    dica: "Escreva algumas linhas para o líder que você quer ser daqui a 1 ano.",
    placeholder: "Querido eu do futuro..." },
  { key: "compromisso", n: 7, capitulo: 4, obrigatoria: false, minPalavras: 10, icon: Quote,
    titulo: "Meu Compromisso de Liderança",
    dica: "Uma frase-manifesto que resume o líder que você se compromete a ser.",
    placeholder: "Eu me comprometo a..." },
];

const CAPITULOS = [
  { n: 1, titulo: "Diagnóstico", subtitulo: "De onde eu parto", icon: Compass },
  { n: 2, titulo: "Plano de Ação", subtitulo: "Para onde eu vou", icon: Target },
  { n: 3, titulo: "Transformação", subtitulo: "O que mudou em mim", icon: Rocket },
  { n: 4, titulo: "Legado", subtitulo: "O líder que escolho ser", icon: Award },
] as const;

function contarPalavras(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function ProjetoIntegrador() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [presenting, setPresenting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["projeto-integrador"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session!.user.id;
      const [proj, cha, disc, pdi, profile] = await Promise.all([
        supabase.from("projeto_integrador").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("avaliacoes_cha").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("testes_lideranca").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("pdi").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("profiles").select("nome, email, cargo, empresa").eq("id", uid).maybeSingle(),
      ]);
      return {
        userId: uid,
        projeto: proj.data,
        cha: cha.data,
        disc: disc.data,
        pdi: pdi.data ?? [],
        profile: profile.data,
      };
    },
  });

  useEffect(() => {
    if (data?.projeto) {
      setForm({
        perfil_lideranca: data.projeto.perfil_lideranca ?? "",
        cha_destaque: data.projeto.cha_destaque ?? "",
        plano_desenvolvimento: data.projeto.plano_desenvolvimento ?? "",
        aplicacao_ia: data.projeto.aplicacao_ia ?? "",
        aprendizado_transformador: data.projeto.aprendizado_transformador ?? "",
        carta_futuro: data.projeto.carta_futuro ?? "",
        compromisso: data.projeto.compromisso ?? "",
      });
    }
  }, [data?.projeto]);

  const obrigatorias = QUESTOES.filter((q) => q.obrigatoria);
  const preenchidasObr = obrigatorias.filter((q) => form[q.key].trim().length > 0).length;
  const preenchidasTotal = QUESTOES.filter((q) => form[q.key].trim().length > 0).length;
  const canSave = preenchidasObr === obrigatorias.length;
  const progresso = Math.round((preenchidasTotal / QUESTOES.length) * 100);

  const preRequisitos = useMemo(() => ([
    { label: "Teste DISC", ok: !!data?.disc, to: "/teste" },
    { label: "Avaliação CHA", ok: !!data?.cha, to: "/cha" },
    { label: "PDI", ok: (data?.pdi?.length ?? 0) > 0, to: "/pdi" },
  ]), [data]);

  async function salvar() {
    if (!canSave || !data) return;
    const uid = data.userId;
    const jaSalvou = !!data.projeto;
    const creditar = !jaSalvou || !data.projeto?.pontos_creditados;

    const payload = {
      user_id: uid,
      perfil_lideranca: form.perfil_lideranca.trim(),
      cha_destaque: form.cha_destaque.trim(),
      plano_desenvolvimento: form.plano_desenvolvimento.trim(),
      aplicacao_ia: form.aplicacao_ia.trim(),
      aprendizado_transformador: form.aprendizado_transformador.trim(),
      carta_futuro: form.carta_futuro.trim() || null,
      compromisso: form.compromisso.trim() || null,
      pontos_creditados: true,
    };

    const { error } = await supabase.from("projeto_integrador").upsert(payload, { onConflict: "user_id" });
    if (error) return toast.error(error.message);

    if (creditar) {
      await supabase.rpc("add_pontos", { p_user: uid, p_pontos: 100 });
      toast.success("Projeto Integrador concluído! +100 pontos 🎉");
    } else {
      toast.success("Respostas atualizadas");
    }
    setEditing(false);
    qc.invalidateQueries({ queryKey: ["projeto-integrador"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  if (isLoading) return <p className="text-muted-foreground">Carregando projeto...</p>;

  const jaEnviado = !!data?.projeto;
  const mostrarForm = !jaEnviado || editing;
  const nomeAluno = data?.profile?.nome ?? undefined;
  const dataConclusao = data?.projeto?.created_at ? new Date(data.projeto.created_at) : null;

  if (presenting && jaEnviado) {
    return <ModoApresentacao form={form} nomeAluno={nomeAluno} disc={data?.disc} onSair={() => setPresenting(false)} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      {/* HERO ─────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border bg-[image:var(--gradient-hero)] p-8 md:p-12 text-primary-foreground shadow-[var(--shadow-glow)]">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-90">
            <Trophy className="h-4 w-4" /> Atividade Final · Aula 16
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">Projeto Integrador de Liderança</h1>
            <p className="max-w-2xl text-sm opacity-90 md:text-base">
              Este é o marco final do curso. Aqui você integra seu <strong>perfil DISC</strong>, sua avaliação <strong>CHA</strong> e
              seu <strong>PDI</strong> em uma narrativa autoral sobre o líder que você está se tornando — pronta para ser apresentada.
            </p>
          </div>

          {jaEnviado ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="gap-1 border-white/40 bg-white/20 text-primary-foreground hover:bg-white/25">
                <CheckCircle2 className="h-3.5 w-3.5" /> Projeto concluído
              </Badge>
              <Badge variant="secondary" className="gap-1">+100 pontos creditados</Badge>
              {dataConclusao && (
                <span className="text-xs opacity-80">
                  Entregue em {dataConclusao.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          ) : (
            <div className="max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-90">Progresso da entrega</span>
                <span className="font-semibold">{progresso}%</span>
              </div>
              <Progress value={progresso} className="h-2 bg-white/20" />
              <p className="text-xs opacity-80">
                {preenchidasObr}/{obrigatorias.length} obrigatórias · {preenchidasTotal - preenchidasObr}/{QUESTOES.length - obrigatorias.length} bônus
              </p>
            </div>
          )}
        </div>
      </section>

      {/* PRÉ-REQUISITOS ─────────────────────── */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Materiais que você já construiu</h2>
          <span className="text-xs text-muted-foreground">Base do seu projeto</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ContextoDISC disc={data?.disc} />
          <ContextoCHA cha={data?.cha} />
          <ContextoPDI pdi={data?.pdi ?? []} />
        </div>
        {preRequisitos.some((p) => !p.ok) && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-200">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Você ainda pode escrever o projeto agora, mas ele fica muito mais rico quando você conclui DISC, CHA e PDI antes.</p>
          </div>
        )}
      </section>

      {/* AÇÕES QUANDO JÁ ENVIADO ─────────────────────── */}
      {jaEnviado && !editing && (
        <section className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setPresenting(true)}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 text-left transition hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Presentation className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Iniciar apresentação</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Modo slide por slide, com navegação por teclado e tela cheia. Ideal para apresentar para a turma.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Apresentar <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </button>
          <button
            onClick={() => window.print()}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 text-left transition hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileDown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Exportar em PDF</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Gera uma versão do seu projeto pronta para salvar ou imprimir (usa o diálogo de impressão do navegador).
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Baixar PDF <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </button>
          <div className="md:col-span-2">
            <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
              <Pencil className="h-4 w-4" /> Editar respostas
            </Button>
          </div>
        </section>
      )}

      {/* FORMULÁRIO POR CAPÍTULOS ─────────────────────── */}
      {mostrarForm && (
        <div className="space-y-10">
          <div className="rounded-2xl border bg-[image:var(--gradient-card)] p-6 md:p-7">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-4 w-4" /> Como funciona
            </div>
            <h2 className="mt-2 text-xl font-bold">Sua entrega em 4 capítulos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              5 reflexões obrigatórias e 2 bônus. Não há resposta certa — o que importa é a sua verdade.
              Sugerimos entre 40 e 120 palavras por resposta.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CAPITULOS.map((c) => {
                const questoesDoCap = QUESTOES.filter((q) => q.capitulo === c.n);
                const done = questoesDoCap.every((q) => !q.obrigatoria || form[q.key].trim().length > 0);
                return (
                  <div key={c.n} className="rounded-xl border bg-card/60 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : c.n}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{c.titulo}</p>
                        <p className="text-[11px] text-muted-foreground">{c.subtitulo}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {CAPITULOS.map((cap) => {
            const questoesDoCap = QUESTOES.filter((q) => q.capitulo === cap.n);
            return (
              <section key={cap.n} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <cap.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Capítulo {cap.n}
                    </p>
                    <h3 className="text-xl font-bold leading-tight">{cap.titulo}</h3>
                    <p className="text-xs text-muted-foreground">{cap.subtitulo}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {questoesDoCap.map((q) => (
                    <CampoQuestao
                      key={q.key}
                      q={q}
                      value={form[q.key]}
                      onChange={(v) => setForm({ ...form, [q.key]: v })}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <div className="sticky bottom-4 z-10 rounded-2xl border bg-card/95 p-4 shadow-[var(--shadow-elegant)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-[220px] flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{preenchidasObr}/{obrigatorias.length} obrigatórias preenchidas</span>
                  <span className="text-muted-foreground">{progresso}%</span>
                </div>
                <Progress value={progresso} className="mt-2 h-2" />
              </div>
              <div className="flex flex-wrap gap-2">
                {jaEnviado && editing && (
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                )}
                <Button size="lg" disabled={!canSave} onClick={salvar} className="gap-2">
                  {jaEnviado ? "Salvar alterações" : <>Concluir e ganhar 100 pontos <Trophy className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cards de contexto ─────────────────────────
function ContextoDISC({ disc }: { disc: any }) {
  const perfil = disc?.perfil_predominante ? PERFIS_DISC[disc.perfil_predominante as PerfilDISC] : null;
  return (
    <div className="rounded-2xl border bg-card p-6" style={perfil ? { borderColor: perfil.cor + "40", background: perfil.cor + "08" } : {}}>
      <div className="mb-2 flex items-center gap-2">
        <Compass className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Perfil DISC</p>
      </div>
      {perfil ? (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{perfil.emoji}</span>
            <p className="text-lg font-bold" style={{ color: perfil.cor }}>{perfil.titulo}</p>
          </div>
          <p className="text-xs text-muted-foreground">{perfil.subtitulo}</p>
        </div>
      ) : (
        <Link to="/teste" className="text-sm text-primary hover:underline">Faça o teste DISC →</Link>
      )}
    </div>
  );
}

function ContextoCHA({ cha }: { cha: any }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avaliação CHA</p>
      </div>
      {cha ? (
        <div className="space-y-1 text-sm">
          <p>Conhecimentos: <strong>{Number(cha.conhecimentos).toFixed(1)}</strong></p>
          <p>Habilidades: <strong>{Number(cha.habilidades).toFixed(1)}</strong></p>
          <p>Atitudes: <strong>{Number(cha.atitudes).toFixed(1)}</strong></p>
          <p className="pt-1 text-xs text-muted-foreground">Geral: {Number(cha.pontuacao_geral).toFixed(1)}/5</p>
        </div>
      ) : (
        <Link to="/cha" className="text-sm text-primary hover:underline">Faça a avaliação CHA →</Link>
      )}
    </div>
  );
}

function ContextoPDI({ pdi }: { pdi: any[] }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seu PDI</p>
      </div>
      {pdi.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {pdi.slice(0, 4).map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="truncate">{p.competencia}</span>
            </li>
          ))}
          {pdi.length > 4 && <li className="text-xs text-muted-foreground">+ {pdi.length - 4} outros</li>}
        </ul>
      ) : (
        <Link to="/pdi" className="text-sm text-primary hover:underline">Crie seu PDI →</Link>
      )}
    </div>
  );
}

// ── Campo de Questão ──────────────────────────
function CampoQuestao({ q, value, onChange }: { q: Questao; value: string; onChange: (v: string) => void }) {
  const palavras = contarPalavras(value);
  const preenchida = value.trim().length > 0;
  const atingiuMinimo = palavras >= q.minPalavras;

  return (
    <div className={`rounded-2xl border bg-card p-6 space-y-3 transition ${preenchida ? "border-primary/40" : ""}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${preenchida ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
          {preenchida ? <CheckCircle2 className="h-5 w-5" /> : q.n}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-base font-semibold">{q.titulo}</Label>
            {q.obrigatoria ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Obrigatória</span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Bônus ✨</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{q.dica}</p>
        </div>
        <q.icon className="hidden h-5 w-5 shrink-0 text-muted-foreground/60 md:block" />
      </div>
      <Textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} className="resize-y" />
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Sugerimos ao menos {q.minPalavras} palavras.</span>
        <span className={`font-medium ${preenchida ? (atingiuMinimo ? "text-primary" : "text-amber-600 dark:text-amber-400") : "text-muted-foreground"}`}>
          {palavras} palavras
        </span>
      </div>
    </div>
  );
}

// ── Modo Apresentação (slide por slide) ───────
function ModoApresentacao({ form, nomeAluno, disc, onSair }: {
  form: FormState; nomeAluno?: string; disc: any; onSair: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const perfilDisc = disc?.perfil_predominante ? PERFIS_DISC[disc.perfil_predominante as PerfilDISC] : null;
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const slides = useMemo(() => {
    const base = [
      {
        tipo: "cover" as const,
        kicker: "Projeto Integrador de Liderança",
        titulo: "Minha jornada de líder",
        subtitulo: nomeAluno ? `por ${nomeAluno}` : undefined,
        rodape: hoje,
      },
      ...QUESTOES.filter((q) => form[q.key].trim().length > 0).map((q) => ({
        tipo: "conteudo" as const,
        kicker: `Capítulo ${q.capitulo} · Reflexão ${q.n}`,
        titulo: q.titulo,
        texto: form[q.key],
        icon: q.icon,
      })),
      {
        tipo: "encerramento" as const,
        kicker: "Obrigado",
        titulo: form.compromisso?.trim() ? form.compromisso : "É isso que me move.",
        subtitulo: nomeAluno,
      },
    ];
    return base;
  }, [form, nomeAluno, hoje]);

  const total = slides.length;
  const atual = slides[idx];

  function proximo() { setIdx((i) => Math.min(i + 1, total - 1)); }
  function anterior() { setIdx((i) => Math.max(i - 1, 0)); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); proximo(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); anterior(); }
      else if (e.key === "Escape") { document.exitFullscreen?.().catch(() => {}); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  return (
    <div ref={containerRef} className="min-h-full bg-slate-950 text-slate-50">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2 text-xs opacity-80">
          <Presentation className="h-4 w-4" /> Apresentação · {idx + 1} / {total}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="text-slate-50 hover:bg-white/10" onClick={anterior} disabled={idx === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-50 hover:bg-white/10" onClick={proximo} disabled={idx === total - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-50 hover:bg-white/10" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-50 hover:bg-white/10" onClick={onSair}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slide */}
      <div className="flex min-h-[calc(100vh-3.25rem)] items-center justify-center p-6 md:p-12">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-8 shadow-2xl md:p-16">
          <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

          {atual.tipo === "cover" && (
            <div className="relative space-y-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">{atual.kicker}</p>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">{atual.titulo}</h1>
              {atual.subtitulo && <p className="text-lg text-slate-300 md:text-2xl">{atual.subtitulo}</p>}
              {perfilDisc && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  <span>{perfilDisc.emoji}</span>
                  <span className="font-semibold" style={{ color: perfilDisc.cor }}>{perfilDisc.titulo}</span>
                </div>
              )}
              <p className="pt-6 text-xs uppercase tracking-widest text-slate-400">{atual.rodape}</p>
            </div>
          )}

          {atual.tipo === "conteudo" && (
            <div className="relative space-y-6">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70">
                <atual.icon className="h-4 w-4" /> {atual.kicker}
              </div>
              <h2 className="text-3xl font-bold leading-tight md:text-5xl">{atual.titulo}</h2>
              <div className="h-px w-16 bg-primary/60" />
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-200 md:text-2xl">{atual.texto}</p>
            </div>
          )}

          {atual.tipo === "encerramento" && (
            <div className="relative space-y-6 text-center">
              <Quote className="mx-auto h-8 w-8 text-primary/70" />
              <p className="mx-auto max-w-3xl text-2xl font-semibold leading-snug md:text-4xl">"{atual.titulo}"</p>
              {atual.subtitulo && <p className="text-slate-400">— {atual.subtitulo}</p>}
              <div className="pt-8 text-xs uppercase tracking-[0.3em] text-slate-500">Fim · LideraIA</div>
            </div>
          )}

          {/* barrinha de progresso */}
          <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}