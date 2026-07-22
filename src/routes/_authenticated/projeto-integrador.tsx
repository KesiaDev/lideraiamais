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
  Brain, MessagesSquare, HandHeart, Handshake, Scale, Leaf,
  Users, Flame, Lightbulb, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/projeto-integrador")({ component: ProjetoIntegrador });

type Respostas = Record<string, string>;

type Questao = {
  key: string;
  n: number;
  capitulo: 1 | 2 | 3 | 4;
  aula: string;
  titulo: string;
  dica: string;
  entregaveis: string[]; // sub-itens obrigatórios (tipo checklist mental)
  placeholder: string;
  obrigatoria: boolean;
  minPalavras: number;
  icon: any;
};

const CAPITULOS = [
  { n: 1, titulo: "Autoconhecimento", subtitulo: "Quem eu sou como líder", icon: Compass, aulas: "Aulas 1-3" },
  { n: 2, titulo: "Eu Liderando Pessoas", subtitulo: "Como desenvolvo, engajo e resolvo", icon: Users, aulas: "Aulas 5-9" },
  { n: 3, titulo: "Eu Liderando Organizações", subtitulo: "Decisão, ética e sustentabilidade", icon: Scale, aulas: "Aulas 10-13" },
  { n: 4, titulo: "IA & Legado", subtitulo: "O líder que escolho ser", icon: Award, aulas: "Síntese final" },
] as const;

const QUESTOES: Questao[] = [
  // ── Capítulo 1 · Autoconhecimento (Aulas 1-3) ─────────────────
  {
    key: "estilo_lideranca", n: 1, capitulo: 1, aula: "Aula 1 · Tipologia de líderes", obrigatoria: true, minPalavras: 90, icon: Compass,
    titulo: "Meu estilo dominante e meu estilo secundário",
    dica: "Entre os estilos clássicos (autocrático, democrático, liberal) e modernos (situacional, servidor, coach, transformacional), quais dois mais aparecem em você hoje?",
    entregaveis: [
      "Nomear o estilo dominante e o secundário",
      "1 situação real em que o dominante te ajudou",
      "1 situação real em que ele te atrapalhou",
      "Que estilo você quer desenvolver e por quê",
    ],
    placeholder: "Meu estilo dominante hoje é... e meu secundário é... Uma situação em que...",
  },
  {
    key: "disc_integrado", n: 2, capitulo: 1, aula: "Aula 2 · Inteligência Emocional & DISC", obrigatoria: true, minPalavras: 90, icon: Brain,
    titulo: "Meu perfil DISC na prática",
    dica: "Vá além do rótulo (D, I, S ou C): mostre como ele se manifesta em decisões, sob pressão e em relacionamentos.",
    entregaveis: [
      "Perfil predominante e nível dos outros 3",
      "Como ele aparece em decisões do dia a dia",
      "Como ele aparece sob pressão / conflito",
      "1 armadilha típica desse perfil que você já viveu",
    ],
    placeholder: "Meu perfil predominante é... Em decisões, isso significa que...",
  },
  {
    key: "gatilhos_autogestao", n: 3, capitulo: 1, aula: "Aula 2 · Autogestão emocional", obrigatoria: true, minPalavras: 80, icon: Flame,
    titulo: "Meus 3 gatilhos emocionais + estratégia de autogestão",
    dica: "Liste três situações que te tiram do sério no trabalho e a estratégia concreta que você vai usar para não reagir no automático.",
    entregaveis: [
      "3 gatilhos claros (o que + com quem + em que contexto)",
      "Sinal do corpo/emoção que aparece antes da reação",
      "1 estratégia de autogestão para cada gatilho (pausa, respiração, reframe, adiar resposta...)",
    ],
    placeholder: "Gatilho 1: quando... Sinto... Vou reagir com...",
  },
  {
    key: "diag_comunicacao", n: 4, capitulo: 1, aula: "Aula 3 · Comunicação de líder", obrigatoria: true, minPalavras: 80, icon: MessagesSquare,
    titulo: "Meu diagnóstico de comunicação (verbal, não-verbal e digital)",
    dica: "Onde sua comunicação hoje é forte e onde ela falha? Cubra os três canais.",
    entregaveis: [
      "Um ponto forte e um ponto fraco na comunicação verbal (face a face)",
      "Um sinal não-verbal seu que ajuda e um que atrapalha",
      "1 exemplo de mal-entendido digital (WhatsApp/e-mail) que você já causou ou sofreu",
      "1 ajuste concreto que você vai testar nas próximas 2 semanas",
    ],
    placeholder: "No verbal eu sou forte em... e falho em... Meu corpo denuncia que...",
  },
  {
    key: "cnv_reescrita", n: 5, capitulo: 1, aula: "Aula 3 · Comunicação Não Violenta", obrigatoria: true, minPalavras: 70, icon: HandHeart,
    titulo: "CNV na prática: reescrevendo uma frase pesada",
    dica: "Escolha uma frase dura que você já disse (ou quase disse) para alguém do trabalho e reescreva usando o modelo Observação-Sentimento-Necessidade-Pedido.",
    entregaveis: [
      "A frase original (dura, no automático)",
      "Observação (fato, sem julgamento)",
      "Sentimento (o que eu sinto)",
      "Necessidade (o que eu preciso)",
      "Pedido claro, específico e realizável",
    ],
    placeholder: "Frase original: \"...\"\nReescrita CNV: Quando eu vejo... eu me sinto... porque preciso de... Você poderia...?",
  },

  // ── Capítulo 2 · Eu Liderando Pessoas (Aulas 5-9) ─────────────
  {
    key: "cha_detalhado", n: 6, capitulo: 2, aula: "Aula 5 · Modelo CHA", obrigatoria: true, minPalavras: 100, icon: BarChart3,
    titulo: "Meu CHA em profundidade",
    dica: "Vá muito além da nota geral: separe o que você tem e o que te falta em cada dimensão.",
    entregaveis: [
      "2 Conhecimentos fortes + 1 Conhecimento a desenvolver",
      "2 Habilidades fortes + 1 Habilidade a desenvolver",
      "2 Atitudes fortes + 1 Atitude a desenvolver",
      "Qual das três dimensões é seu maior gap hoje e por quê",
    ],
    placeholder: "Conhecimentos: sei bem sobre... mas preciso aprender... Habilidades: sei fazer... mas ainda travo em... Atitudes: costumo... e falho em...",
  },
  {
    key: "cha_liderado", n: 7, capitulo: 2, aula: "Aula 6 · Desenvolvimento de talentos", obrigatoria: true, minPalavras: 90, icon: Users,
    titulo: "Análise CHA de um liderado real",
    dica: "Escolha uma pessoa da sua equipe (ou colega, se você ainda não lidera formalmente) e aplique a lente do CHA nela.",
    entregaveis: [
      "Iniciais/apelido e função da pessoa",
      "O que ela tem de forte (C, H ou A) — dê exemplos",
      "O gap principal e se é C, H ou A",
      "1 ação de desenvolvimento coerente com o gap (treinamento, mentoria, coaching ou desafio)",
    ],
    placeholder: "Pessoa: J. — analista de... É muito forte em... mas o gap é...",
  },
  {
    key: "pdi_90_dias", n: 8, capitulo: 2, aula: "Aula 6 · PDI real", obrigatoria: true, minPalavras: 110, icon: Target,
    titulo: "Meu PDI dos próximos 90 dias",
    dica: "Escolha 3 competências prioritárias, com ações, prazos e indicadores de evolução. Nada genérico.",
    entregaveis: [
      "3 competências prioritárias (do CHA / DISC)",
      "Para cada uma: objetivo, 1-2 ações práticas, prazo e indicador mensurável",
      "Quem vai te apoiar / cobrar (mentor, gestor, par)",
      "Marco de revisão aos 30 e 60 dias",
    ],
    placeholder: "Competência 1: ... Objetivo: ... Ações: ... Prazo: ... Indicador: ...",
  },
  {
    key: "motivacao_equipe", n: 9, capitulo: 2, aula: "Aula 7 · Motivação e propósito", obrigatoria: true, minPalavras: 90, icon: Rocket,
    titulo: "Diagnóstico de motivação da equipe",
    dica: "Olhe para a sua equipe (real ou futura) com honestidade: o que move essas pessoas hoje?",
    entregaveis: [
      "Nível geral de engajamento (alto, médio, baixo) e por quê",
      "1 fator higiênico problemático (salário, ambiente, chefia)",
      "1 fator motivacional forte (propósito, reconhecimento, autonomia, evolução)",
      "2 ações concretas de reconhecimento não-financeiro que você vai implementar",
    ],
    placeholder: "Hoje a equipe está... Isso acontece porque... Vou implementar...",
  },
  {
    key: "feedback_sbi", n: 10, capitulo: 2, aula: "Aula 8 · Feedback SBI + Feedforward", obrigatoria: true, minPalavras: 100, icon: MessagesSquare,
    titulo: "Um feedback real estruturado em SBI + Feedforward",
    dica: "Escolha uma pessoa a quem você precisa dar um feedback difícil (ou merecido positivo) e escreva o roteiro.",
    entregaveis: [
      "Contexto: quem, quando, tipo (positivo ou corretivo)",
      "S – Situação específica",
      "B – Comportamento observado (sem julgamento)",
      "I – Impacto gerado (em pessoas, cliente, resultado)",
      "Feedforward: 1 pedido concreto para o futuro",
    ],
    placeholder: "Para: J. Feedback corretivo. Situação: na reunião de terça... Comportamento: você... Impacto: isso fez com que... Pedido para o futuro: ...",
  },
  {
    key: "conflito_ganha_ganha", n: 11, capitulo: 2, aula: "Aula 9 · Negociação e conflitos", obrigatoria: true, minPalavras: 100, icon: Handshake,
    titulo: "Um conflito real analisado em ganha-ganha",
    dica: "Descreva um conflito atual ou recente e resolva-o no papel, separando posições de interesses.",
    entregaveis: [
      "Descrição breve do conflito (partes envolvidas + gatilho)",
      "Posição de cada lado (o que cada um DIZ que quer)",
      "Interesse real de cada lado (o que cada um PRECISA)",
      "1 alternativa ganha-ganha que atende os interesses dos dois",
      "Como você conduziria a conversa de mediação (3 passos)",
    ],
    placeholder: "Conflito entre... A posição de A é... mas o interesse real é... A posição de B é... o interesse real é... Alternativa ganha-ganha:...",
  },

  // ── Capítulo 3 · Eu Liderando Organizações (Aulas 10-13) ──────
  {
    key: "decisao_incerteza", n: 12, capitulo: 3, aula: "Aula 10 · Decisão em cenários de incerteza", obrigatoria: true, minPalavras: 100, icon: Lightbulb,
    titulo: "Uma decisão difícil, decidida com método",
    dica: "Traga uma decisão real que você precisa (ou precisou) tomar com dados incompletos e aplique uma ferramenta.",
    entregaveis: [
      "Contexto e por que a decisão é difícil (dados, prazos, interesses)",
      "2 alternativas em análise com prós e contras",
      "1 viés cognitivo que estava te empurrando para o lado errado",
      "Ferramenta usada (matriz de decisão, 5 porquês, pré-mortem, custo x impacto)",
      "Decisão final + critério de reavaliação",
    ],
    placeholder: "Preciso decidir entre... É difícil porque... O viés que me atrapalha é... Usando a matriz... Decisão: ... vou reavaliar em ...",
  },
  {
    key: "etica_diversidade", n: 13, capitulo: 3, aula: "Aula 11 · Ética, diversidade e segurança psicológica", obrigatoria: true, minPalavras: 100, icon: ShieldCheck,
    titulo: "Meu compromisso com ética, diversidade e segurança psicológica",
    dica: "Além do discurso: o que você vai fazer, de verdade, para criar um ambiente onde as pessoas possam ser quem são e ainda assim colaborar?",
    entregaveis: [
      "1 dilema ético real que você viu (ou viveu) e como agiria hoje",
      "1 prática concreta para acolher diversidade (contratação, escuta, distribuição de voz)",
      "1 prática concreta para gerar segurança psicológica (como você reage a erros e discordâncias)",
      "1 comportamento seu que precisa mudar para ser um líder mais inclusivo",
    ],
    placeholder: "Já vi uma situação em que... Hoje eu agiria... Para diversidade, vou... Para segurança psicológica, vou parar de... e começar a...",
  },
  {
    key: "ods_sustentavel", n: 14, capitulo: 3, aula: "Aula 13 · ODS e liderança sustentável", obrigatoria: true, minPalavras: 90, icon: Leaf,
    titulo: "Meu impacto em ODS e minha liderança sustentável",
    dica: "Escolha 1 ou 2 Objetivos de Desenvolvimento Sustentável em que seu trabalho realmente toca — e mostre como você evita greenwashing.",
    entregaveis: [
      "1-2 ODS diretamente conectados ao seu trabalho / equipe",
      "1 prática interna (cuidar das pessoas: saúde mental, jornada, equidade)",
      "1 prática externa (cuidar do entorno: cliente, comunidade, planeta)",
      "1 armadilha de greenwashing que você compromete-se a evitar",
    ],
    placeholder: "Meu trabalho impacta os ODS ... Internamente vou... Externamente vou... A armadilha que me comprometo a evitar é...",
  },

  // ── Capítulo 4 · IA & Legado ──────────────────────────────────
  {
    key: "aplicacoes_ia", n: 15, capitulo: 4, aula: "Síntese · IA aplicada à liderança", obrigatoria: true, minPalavras: 100, icon: Sparkles,
    titulo: "3 aplicações concretas de IA na minha liderança",
    dica: "Nada de \"vou usar IA para produtividade\". Escolha três casos reais e descreva o prompt / uso.",
    entregaveis: [
      "Caso 1 – Comunicação (ex.: reescrever um feedback em CNV)",
      "Caso 2 – Desenvolvimento (ex.: gerar plano de PDI, roteiro de 1:1)",
      "Caso 3 – Decisão (ex.: matriz de risco, pré-mortem, análise de cenários)",
      "Um limite ético que você define para o uso da IA",
    ],
    placeholder: "Caso 1: vou pedir à IA para... com o prompt \"...\". Caso 2: ... Caso 3: ... Meu limite ético: nunca vou...",
  },
  {
    key: "aprendizado_transformador", n: 16, capitulo: 4, aula: "Síntese", obrigatoria: true, minPalavras: 70, icon: Rocket,
    titulo: "O aprendizado mais transformador do curso",
    dica: "Uma ideia, ferramenta ou reflexão que mudou seu jeito de liderar — e o que você já fez diferente por causa dela.",
    entregaveis: [
      "Qual foi o aprendizado",
      "Em qual aula/conteúdo ele apareceu",
      "O que você já mudou (ou vai mudar) no comportamento por causa dele",
    ],
    placeholder: "O que mais me transformou foi... Isso apareceu na aula... Desde então venho...",
  },
  {
    key: "carta_futuro", n: 17, capitulo: 4, aula: "Legado", obrigatoria: false, minPalavras: 80, icon: Heart,
    titulo: "Carta para o Eu do Futuro (1 ano)",
    dica: "Escreva uma carta ao líder que você quer ser daqui a 12 meses. Fale sobre o que você espera ter conquistado e superado.",
    entregaveis: [
      "3 conquistas que você espera ter",
      "1 medo que você espera ter superado",
      "1 pedido honesto ao seu eu do futuro",
    ],
    placeholder: "Querido eu de daqui a 1 ano...",
  },
  {
    key: "compromisso", n: 18, capitulo: 4, aula: "Manifesto", obrigatoria: false, minPalavras: 15, icon: Quote,
    titulo: "Meu compromisso-manifesto de liderança",
    dica: "Uma única frase que resume, com força, o líder que você se compromete a ser.",
    entregaveis: ["Uma frase curta, autoral, em primeira pessoa"],
    placeholder: "Eu me comprometo a...",
  },
];

function contarPalavras(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function ProjetoIntegrador() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Respostas>({});
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
      const respostas: Respostas = (data.projeto.respostas as any) ?? {};
      // fallback: migrar campos antigos para as novas chaves equivalentes
      const legacy: Respostas = {
        estilo_lideranca: data.projeto.perfil_lideranca ?? "",
        cha_detalhado: data.projeto.cha_destaque ?? "",
        pdi_90_dias: data.projeto.plano_desenvolvimento ?? "",
        aplicacoes_ia: data.projeto.aplicacao_ia ?? "",
        aprendizado_transformador: data.projeto.aprendizado_transformador ?? "",
        carta_futuro: data.projeto.carta_futuro ?? "",
        compromisso: data.projeto.compromisso ?? "",
      };
      const merged: Respostas = {};
      for (const q of QUESTOES) {
        merged[q.key] = respostas[q.key] ?? legacy[q.key] ?? "";
      }
      setForm(merged);
    } else {
      // inicializa vazio para todas as chaves
      const empty: Respostas = {};
      for (const q of QUESTOES) empty[q.key] = "";
      setForm(empty);
    }
  }, [data?.projeto]);

  const obrigatorias = QUESTOES.filter((q) => q.obrigatoria);
  const preenchidasObr = obrigatorias.filter((q) => (form[q.key] ?? "").trim().length > 0).length;
  const preenchidasTotal = QUESTOES.filter((q) => (form[q.key] ?? "").trim().length > 0).length;
  const canSave = preenchidasTotal > 0;
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

    const respostas: Respostas = {};
    for (const q of QUESTOES) {
      const v = (form[q.key] ?? "").trim();
      if (v) respostas[q.key] = v;
    }

    const payload = {
      user_id: uid,
      respostas,
      // espelha os principais para compatibilidade com telas antigas / admin
      perfil_lideranca: respostas.estilo_lideranca ?? null,
      cha_destaque: respostas.cha_detalhado ?? null,
      plano_desenvolvimento: respostas.pdi_90_dias ?? null,
      aplicacao_ia: respostas.aplicacoes_ia ?? null,
      aprendizado_transformador: respostas.aprendizado_transformador ?? null,
      carta_futuro: respostas.carta_futuro ?? null,
      compromisso: respostas.compromisso ?? null,
      pontos_creditados: true,
    };

    const { error } = await supabase.from("projeto_integrador").upsert(payload, { onConflict: "user_id" });
    if (error) return toast.error(error.message);

    if (creditar) {
      await supabase.rpc("add_pontos", { p_user: uid, p_pontos: 200 });
      toast.success("Projeto Integrador concluído! +200 pontos 🎉");
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
            <Trophy className="h-4 w-4" /> Capstone Final · Aula 16 · 18 reflexões
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Projeto Integrador de Liderança
            </h1>
            <p className="max-w-2xl text-sm opacity-90 md:text-base">
              O capstone do curso. Você vai integrar <strong>tudo</strong> — DISC, IE, comunicação, CHA, PDI, feedback, conflito,
              decisão, ética, ODS e IA — em uma entrega autoral, densa e apresentável.
              São <strong>16 reflexões obrigatórias</strong> (com sub-itens específicos) e 2 bônus. Não é pra fazer em 20 minutos.
            </p>
          </div>

          {jaEnviado ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="gap-1 border-white/40 bg-white/20 text-primary-foreground hover:bg-white/25">
                <CheckCircle2 className="h-3.5 w-3.5" /> Projeto concluído
              </Badge>
              <Badge variant="secondary" className="gap-1">+200 pontos creditados</Badge>
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
                {preenchidasObr}/{obrigatorias.length} obrigatórias preenchidas ·
                {" "}{preenchidasTotal - preenchidasObr}/{QUESTOES.length - obrigatorias.length} bônus
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
            <h2 className="mt-2 text-xl font-bold">Sua entrega em 4 capítulos · 18 reflexões</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                16 reflexões obrigatórias e 2 bônus. Cada questão traz uma lista de <strong>entregáveis</strong> —
                pontos sugeridos para enriquecer a sua resposta. Você pode salvar a qualquer momento, mesmo sem preencher tudo.
              </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CAPITULOS.map((c) => {
                const questoesDoCap = QUESTOES.filter((q) => q.capitulo === c.n);
                const totalObrCap = questoesDoCap.filter((q) => q.obrigatoria).length;
                const doneObrCap = questoesDoCap.filter((q) => q.obrigatoria && (form[q.key] ?? "").trim().length > 0).length;
                const done = doneObrCap === totalObrCap;
                return (
                  <div key={c.n} className="rounded-xl border bg-card/60 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : c.n}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{c.titulo}</p>
                        <p className="text-[11px] text-muted-foreground">{c.aulas} · {doneObrCap}/{totalObrCap} ok</p>
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
                      Capítulo {cap.n} · {cap.aulas}
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
                      value={form[q.key] ?? ""}
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
                  <span className="font-medium">
                    {preenchidasObr}/{obrigatorias.length} obrigatórias preenchidas
                  </span>
                  <span className="text-muted-foreground">{progresso}%</span>
                </div>
                <Progress value={progresso} className="mt-2 h-2" />
              </div>
              <div className="flex flex-wrap gap-2">
                {jaEnviado && editing && (
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                )}
                <Button size="lg" disabled={!canSave} onClick={salvar} className="gap-2">
                  {jaEnviado ? "Salvar alterações" : <>Concluir e ganhar 200 pontos <Trophy className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>
            {!canSave && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Preencha pelo menos uma resposta para salvar. Você pode voltar depois e continuar.
              </p>
            )}
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
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{q.aula}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{q.dica}</p>
          {q.entregaveis.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
              {q.entregaveis.map((e, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-primary">•</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <q.icon className="hidden h-5 w-5 shrink-0 text-muted-foreground/60 md:block" />
      </div>
      <Textarea rows={7} value={value} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} className="resize-y" />
      <div className="flex items-center justify-end text-[11px]">
        <span className={`font-medium ${preenchida ? "text-primary" : "text-muted-foreground"}`}>
          {palavras} palavras
        </span>
      </div>
    </div>
  );
}

// ── Modo Apresentação (slide por slide) ───────
function ModoApresentacao({ form, nomeAluno, disc, onSair }: {
  form: Respostas; nomeAluno?: string; disc: any; onSair: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const perfilDisc = disc?.perfil_predominante ? PERFIS_DISC[disc.perfil_predominante as PerfilDISC] : null;
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const slides = useMemo(() => {
    const conteudoSlides = QUESTOES
      .filter((q) => (form[q.key] ?? "").trim().length > 0)
      .map((q) => ({
        tipo: "conteudo" as const,
        kicker: `Capítulo ${q.capitulo} · ${q.aula}`,
        titulo: q.titulo,
        texto: form[q.key] ?? "",
        icon: q.icon,
      }));

    const divisores = CAPITULOS
      .filter((c) => QUESTOES.some((q) => q.capitulo === c.n && (form[q.key] ?? "").trim().length > 0))
      .map((c) => ({
        tipo: "divisor" as const,
        capitulo: c.n,
        titulo: c.titulo,
        subtitulo: c.subtitulo,
        aulas: c.aulas,
        icon: c.icon,
      }));

    // intercala: divisor de capítulo antes das questões daquele capítulo
    const intercalado: any[] = [];
    for (const c of CAPITULOS) {
      const qs = conteudoSlides.filter((s) => s.kicker.startsWith(`Capítulo ${c.n}`));
      if (qs.length === 0) continue;
      intercalado.push(divisores.find((d) => d.capitulo === c.n));
      intercalado.push(...qs);
    }

    return [
      {
        tipo: "cover" as const,
        kicker: "Capstone · Projeto Integrador de Liderança",
        titulo: "Minha jornada de líder",
        subtitulo: nomeAluno ? `por ${nomeAluno}` : undefined,
        rodape: hoje,
      },
      ...intercalado,
      {
        tipo: "encerramento" as const,
        kicker: "Obrigado",
        titulo: (form.compromisso ?? "").trim() ? (form.compromisso ?? "") : "É isso que me move.",
        subtitulo: nomeAluno,
      },
    ];
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

          {atual.tipo === "divisor" && (
            <div className="relative space-y-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">
                Capítulo {atual.capitulo} · {atual.aulas}
              </p>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <atual.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-4xl font-bold md:text-6xl">{atual.titulo}</h2>
              <p className="text-lg text-slate-300 md:text-2xl">{atual.subtitulo}</p>
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