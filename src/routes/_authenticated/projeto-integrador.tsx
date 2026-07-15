import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PERFIS_DISC, type PerfilDISC } from "@/lib/leadership-data";
import {
  Sparkles, Compass, BarChart3, Target, Maximize2, Pencil, Trophy,
  CheckCircle2, Circle, FileDown, ChevronLeft, ChevronRight, Award,
  BookOpen, Rocket, Heart, GraduationCap, Quote,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  perfil_lideranca: "",
  cha_destaque: "",
  plano_desenvolvimento: "",
  aplicacao_ia: "",
  aprendizado_transformador: "",
  carta_futuro: "",
  compromisso: "",
};

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
      const [proj, cha, disc, pdi] = await Promise.all([
        supabase.from("projeto_integrador").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("avaliacoes_cha").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("testes_lideranca").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("pdi").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);
      return {
        userId: uid,
        projeto: proj.data,
        cha: cha.data,
        disc: disc.data,
        pdi: pdi.data ?? [],
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

  const requiredKeys: (keyof FormState)[] = [
    "perfil_lideranca", "cha_destaque", "plano_desenvolvimento", "aplicacao_ia", "aprendizado_transformador",
  ];
  const canSave = requiredKeys.every((k) => form[k].trim().length > 0);

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
      pontos_creditados: creditar ? true : true,
    };

    const { error } = await supabase
      .from("projeto_integrador")
      .upsert(payload, { onConflict: "user_id" });
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

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  const jaEnviado = !!data?.projeto;
  const mostrarForm = !jaEnviado || editing;

  if (presenting && jaEnviado) {
    return <ModoApresentacao form={form} nomeAluno={undefined} onSair={() => setPresenting(false)} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Projeto Integrador</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Atividade final do curso — integre tudo que você construiu (DISC, CHA e PDI) em uma apresentação de liderança.
        </p>
      </div>

      {/* Cards de contexto */}
      <div className="grid gap-4 md:grid-cols-3">
        <ContextoDISC disc={data?.disc} />
        <ContextoCHA cha={data?.cha} />
        <ContextoPDI pdi={data?.pdi ?? []} />
      </div>

      {jaEnviado && !editing && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setPresenting(true)} size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" /> Iniciar apresentação
          </Button>
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" /> Editar respostas
          </Button>
        </div>
      )}

      {mostrarForm && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-[image:var(--gradient-card)] p-6">
            <h2 className="text-lg font-semibold">Complete as frases abaixo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use suas próprias reflexões — não há resposta certa. Cinco perguntas obrigatórias e duas bônus.
            </p>
          </div>

          <CampoObrigatorio
            n={1}
            titulo="Meu perfil de líder hoje"
            dica="Como eu me enxergo enquanto líder neste momento? Qual estilo (DISC) mais aparece em mim?"
            value={form.perfil_lideranca}
            onChange={(v) => setForm({ ...form, perfil_lideranca: v })}
            placeholder="Hoje eu me percebo como um líder..."
          />
          <CampoObrigatorio
            n={2}
            titulo="Meu ponto forte + meu gap do CHA"
            dica="Cite um Conhecimento, Habilidade ou Atitude que se destaca — e outro que ainda é uma lacuna."
            value={form.cha_destaque}
            onChange={(v) => setForm({ ...form, cha_destaque: v })}
            placeholder="Meu maior ponto forte é... e o gap que preciso trabalhar é..."
          />
          <CampoObrigatorio
            n={3}
            titulo="Meu foco de desenvolvimento + critério de evolução"
            dica="Qual competência do PDI é prioridade? Como você vai medir se evoluiu?"
            value={form.plano_desenvolvimento}
            onChange={(v) => setForm({ ...form, plano_desenvolvimento: v })}
            placeholder="Vou focar em desenvolver... e saberei que evoluí quando..."
          />
          <CampoObrigatorio
            n={4}
            titulo="Uma aplicação concreta de IA na minha liderança"
            dica="Escolha um caso real: feedback, comunicação, conflito, decisão... e diga como usaria a IA."
            value={form.aplicacao_ia}
            onChange={(v) => setForm({ ...form, aplicacao_ia: v })}
            placeholder="Vou usar IA para me apoiar em..."
          />
          <CampoObrigatorio
            n={5}
            titulo="O aprendizado mais transformador do curso"
            dica="Uma ideia, ferramenta ou reflexão que mudou seu jeito de liderar."
            value={form.aprendizado_transformador}
            onChange={(v) => setForm({ ...form, aprendizado_transformador: v })}
            placeholder="O que mais me transformou foi..."
          />

          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <div>
              <h3 className="font-semibold">Bônus ✨</h3>
              <p className="text-sm text-muted-foreground">Opcionais — mas dão profundidade à sua apresentação.</p>
            </div>
            <CampoOpcional
              titulo="Carta para o Eu do Futuro"
              dica="Escreva algumas linhas para o líder que você quer ser daqui a 1 ano."
              value={form.carta_futuro}
              onChange={(v) => setForm({ ...form, carta_futuro: v })}
              placeholder="Querido eu do futuro..."
            />
            <CampoOpcional
              titulo="Meu Compromisso de Liderança"
              dica="Uma frase que resume o líder que você se compromete a ser."
              value={form.compromisso}
              onChange={(v) => setForm({ ...form, compromisso: v })}
              placeholder="Eu me comprometo a..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" disabled={!canSave} onClick={salvar}>
              {jaEnviado ? "Salvar alterações" : "Concluir Projeto Integrador"}
            </Button>
            {jaEnviado && editing && (
              <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
            )}
          </div>
          {!canSave && (
            <p className="text-xs text-muted-foreground">Preencha as 5 questões obrigatórias para liberar o envio.</p>
          )}
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
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seu perfil DISC</p>
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
        <Link to="/teste" className="text-sm text-primary hover:underline">Você ainda não fez o teste DISC →</Link>
      )}
    </div>
  );
}

function ContextoCHA({ cha }: { cha: any }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sua avaliação CHA</p>
      </div>
      {cha ? (
        <div className="space-y-1 text-sm">
          <p>Conhecimentos: <strong>{Number(cha.conhecimentos).toFixed(1)}</strong></p>
          <p>Habilidades: <strong>{Number(cha.habilidades).toFixed(1)}</strong></p>
          <p>Atitudes: <strong>{Number(cha.atitudes).toFixed(1)}</strong></p>
          <p className="pt-1 text-xs text-muted-foreground">Geral: {Number(cha.pontuacao_geral).toFixed(1)}/5</p>
        </div>
      ) : (
        <Link to="/cha" className="text-sm text-primary hover:underline">Você ainda não fez a avaliação CHA →</Link>
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
        <Link to="/pdi" className="text-sm text-primary hover:underline">Você ainda não criou seu PDI →</Link>
      )}
    </div>
  );
}

// ── Campos ────────────────────────────────────
function CampoObrigatorio({ n, titulo, dica, value, onChange, placeholder }: {
  n: number; titulo: string; dica: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{n}</span>
        <div className="flex-1">
          <Label className="text-base font-semibold">{titulo}</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{dica}</p>
        </div>
      </div>
      <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function CampoOpcional({ titulo, dica, value, onChange, placeholder }: {
  titulo: string; dica: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{titulo}</Label>
      <p className="text-xs text-muted-foreground">{dica}</p>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

// ── Modo Apresentação ─────────────────────────
function ModoApresentacao({ form, nomeAluno, onSair }: { form: FormState; nomeAluno?: string; onSair: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = [
    { titulo: "Meu perfil de líder hoje", texto: form.perfil_lideranca, icon: Compass },
    { titulo: "Meu ponto forte + meu gap (CHA)", texto: form.cha_destaque, icon: BarChart3 },
    { titulo: "Meu foco de desenvolvimento", texto: form.plano_desenvolvimento, icon: Target },
    { titulo: "IA na minha liderança", texto: form.aplicacao_ia, icon: Sparkles },
    { titulo: "O aprendizado mais transformador", texto: form.aprendizado_transformador, icon: Trophy },
    ...(form.carta_futuro ? [{ titulo: "Carta para o Eu do Futuro", texto: form.carta_futuro, icon: Sparkles }] : []),
    ...(form.compromisso ? [{ titulo: "Meu Compromisso de Liderança", texto: form.compromisso, icon: Trophy }] : []),
  ];

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  return (
    <div ref={containerRef} className="min-h-full bg-background">
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Projeto Integrador</p>
            <h1 className="text-2xl font-bold md:text-3xl">Minha jornada de liderança{nomeAluno ? ` — ${nomeAluno}` : ""}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSair} className="gap-2"><Pencil className="h-4 w-4" /> Editar</Button>
            <Button onClick={toggleFullscreen} className="gap-2"><Maximize2 className="h-4 w-4" /> Tela cheia</Button>
          </div>
        </div>

        <div className="grid gap-5">
          {slides.map((s, i) => (
            <div key={i} className="rounded-2xl border bg-[image:var(--gradient-card)] p-8 shadow-[var(--shadow-elegant)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </span>
                <h2 className="text-xl font-bold md:text-2xl">{s.titulo}</h2>
              </div>
              <p className="whitespace-pre-wrap text-base leading-relaxed md:text-lg">{s.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}