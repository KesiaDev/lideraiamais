import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TESTE_PERGUNTAS, calcularPerfil, PERFIS_DISC, type PerfilDISC } from "@/lib/leadership-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Loader2, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/teste")({ component: Teste });

const LABELS = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente",
];

type ResultState = {
  predominante: PerfilDISC;
  totais: Record<PerfilDISC, number>;
  relatorio: string;
};

async function gerarRelatorioIA(perfil: string, totais: Record<string, number>): Promise<string> {
  try {
    const prompt = `Sou aluno(a) de um curso de Liderança no SENAC. Acabei de descobrir meu perfil comportamental DISC. Meu perfil predominante é ${perfil} com as seguintes pontuações (escala 6–30 por dimensão): D=${totais.D} I=${totais.I} S=${totais.S} C=${totais.C}.

Gere um relatório individual de liderança personalizado com exatamente 3 parágrafos:
1. Como esse perfil impacta minha forma natural de liderar e trabalhar em equipe
2. Qual é o meu maior desafio como líder com esse perfil e por que é importante trabalhar nisso
3. Uma recomendação prática e específica para meu desenvolvimento nos próximos 30 dias

Escreva em segunda pessoa, tom encorajador mas realista e direto. Use dados concretos do perfil DISC. Separe os parágrafos com linha em branco.`;

    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });
    const data = await r.json();
    return data.reply as string;
  } catch {
    return "Não foi possível gerar o relatório de IA neste momento. Consulte seu perfil, pontos fortes e de atenção acima para orientar seu desenvolvimento.";
  }
}

function Teste() {
  const [passo, setPasso] = useState(0);
  const [resp, setResp] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ResultState | null>(null);
  const [loadingIA, setLoadingIA] = useState(false);

  const total = TESTE_PERGUNTAS.length;
  const q = TESTE_PERGUNTAS[passo - 1];
  const respondidas = Object.keys(resp).length;

  async function finalizarTeste() {
    if (respondidas < total) {
      toast.error(`Faltam ${total - respondidas} respostas.`);
      return;
    }
    setLoadingIA(true);
    const r = calcularPerfil(resp);
    const nomePerfil = PERFIS_DISC[r.predominante].titulo;
    const relatorio = await gerarRelatorioIA(nomePerfil, r.totais);

    const { data: { session } } = await supabase.auth.getSession();
    if (u.user) {
      await supabase.from("testes_lideranca").insert({
        user_id: u.user.id,
        respostas: resp,
        perfil_predominante: r.predominante,
        pontuacoes: { ...r.totais, relatorio },
      });
      await supabase.rpc("add_pontos", { p_user: u.user.id, p_pontos: 15 });
      toast.success("+15 pontos conquistados!");
    }

    setResult({ predominante: r.predominante, totais: r.totais, relatorio });
    setLoadingIA(false);
  }

  function reiniciar() {
    setResult(null);
    setResp({});
    setPasso(0);
  }

  // ── Tela de carregamento IA ──────────────────────────────────────────────
  if (loadingIA) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 py-24 text-center">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Analisando seu perfil...</h2>
          <p className="mt-2 text-muted-foreground">
            A IA está gerando seu relatório individual personalizado. Aguarde alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  // ── Resultado ────────────────────────────────────────────────────────────
  if (result) {
    const perfil = PERFIS_DISC[result.predominante];
    const radarData = [
      { label: "Executor (D)", valor: result.totais.D },
      { label: "Comunicador (I)", valor: result.totais.I },
      { label: "Planejador (S)", valor: result.totais.S },
      { label: "Analista (C)", valor: result.totais.C },
    ];

    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        {/* Header de perfil */}
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${perfil.cor}18, transparent)`, borderColor: perfil.cor + "50" }}
        >
          <span className="text-6xl">{perfil.emoji}</span>
          <p className="mt-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {perfil.subtitulo}
          </p>
          <h1 className="mt-1 text-4xl font-extrabold" style={{ color: perfil.cor }}>
            {perfil.titulo}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {perfil.descricao}
          </p>
        </div>

        {/* Características · Pontos fortes · Pontos de atenção */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Características
            </h3>
            <div className="flex flex-wrap gap-2">
              {perfil.caracteristicas.map((c) => (
                <span
                  key={c}
                  className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: perfil.cor + "60", color: perfil.cor }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Pontos fortes
            </h3>
            <ul className="space-y-1.5">
              {perfil.pontosFortes.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pontos de atenção
            </h3>
            <ul className="space-y-1.5">
              {perfil.pontosAtencao.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-amber-500">!</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mapa DISC Radar */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="mb-1 font-semibold">Seu mapa DISC</h3>
          <p className="mb-4 text-xs text-muted-foreground">Pontuação por dimensão (máximo 30)</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
              <Radar
                dataKey="valor"
                fill={perfil.cor}
                fillOpacity={0.25}
                stroke={perfil.cor}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            {radarData.map((d) => (
              <span key={d.label}>
                <strong>{d.label.split(" ")[1]}</strong>: {d.valor}/30
              </span>
            ))}
          </div>
        </div>

        {/* Relatório IA */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-semibold">Relatório Individual — Gerado por IA</h3>
              <p className="text-xs text-muted-foreground">Análise personalizada com base nas suas respostas</p>
            </div>
          </div>
          <div className="space-y-3">
            {result.relatorio
              .split("\n\n")
              .filter((p) => p.trim())
              .map((p, i) => (
                <p key={i} className="rounded-xl bg-secondary/40 p-4 text-sm leading-relaxed">
                  {p.trim()}
                </p>
              ))}
          </div>
        </div>

        {/* Como líder */}
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: perfil.cor + "40", background: perfil.cor + "08" }}
        >
          <h3 className="mb-2 font-semibold" style={{ color: perfil.cor }}>
            Como líder, seu maior desafio
          </h3>
          <p className="text-sm leading-relaxed">{perfil.comoLider}</p>
        </div>

        <Button variant="outline" onClick={reiniciar} className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          Refazer o teste
        </Button>
      </div>
    );
  }

  // ── Intro ────────────────────────────────────────────────────────────────
  if (passo === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <div className="rounded-2xl border bg-[image:var(--gradient-card)] p-10">
          <p className="text-5xl">🧭</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Descubra seu Perfil Comportamental
          </h1>
          <p className="mt-2 text-muted-foreground">
            Questionário DISC com {total} perguntas para revelar como você age, decide e lidera naturalmente.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["D", "I", "S", "C"] as PerfilDISC[]).map((p) => (
              <div
                key={p}
                className="rounded-xl border bg-card p-3 text-center"
                style={{ borderColor: PERFIS_DISC[p].cor + "50" }}
              >
                <span className="text-2xl">{PERFIS_DISC[p].emoji}</span>
                <p className="mt-1 text-xs font-bold" style={{ color: PERFIS_DISC[p].cor }}>
                  {PERFIS_DISC[p].titulo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {PERFIS_DISC[p].caracteristicas.slice(0, 2).join(", ")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
            ⏱ Tempo estimado: 5 a 7 minutos &nbsp;·&nbsp; Não há resposta certa ou errada &nbsp;·&nbsp; Responda com sinceridade
          </div>
          <Button size="lg" className="mt-6 w-full" onClick={() => setPasso(1)}>
            Começar o teste <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Questão (passo 1..total) ─────────────────────────────────────────────
  const progresso = ((passo - 1) / total) * 100;
  const selecionado = resp[q.id];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Barra de progresso */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Pergunta <span className="text-foreground">{passo}</span> de {total}
          </span>
          <span className="text-xs text-muted-foreground">{respondidas} respondidas</span>
        </div>
        <Progress value={progresso} className="h-2" />
      </div>

      {/* Card da pergunta */}
      <div className="rounded-2xl border bg-card p-7">
        <p className="text-lg font-medium leading-snug">{q.texto}</p>
        <div className="mt-6 space-y-2">
          {LABELS.map((label, idx) => {
            const val = idx + 1;
            const ativo = selecionado === val;
            return (
              <button
                key={val}
                onClick={() => setResp({ ...resp, [q.id]: val })}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                  ativo
                    ? "border-primary bg-primary/10 font-medium"
                    : "hover:border-primary/40 hover:bg-secondary/50"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                    ativo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 text-muted-foreground"
                  }`}
                >
                  {val}
                </span>
                <span className={ativo ? "text-primary" : ""}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navegação */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setPasso(passo - 1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
        </Button>

        {passo < total ? (
          <Button
            className="flex-1"
            onClick={() => setPasso(passo + 1)}
            disabled={!selecionado}
          >
            Próxima <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={finalizarTeste}
            disabled={respondidas < total}
          >
            {respondidas < total
              ? `Faltam ${total - respondidas} respostas`
              : "Ver meu perfil ✨"}
          </Button>
        )}
      </div>

      {!selecionado && passo < total && (
        <p className="text-center text-xs text-muted-foreground">
          Selecione uma opção para avançar
        </p>
      )}
    </div>
  );
}
