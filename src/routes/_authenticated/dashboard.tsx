import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nivelAtual, PERFIS_DISC, type PerfilDISC } from "@/lib/leadership-data";
import { Trophy, Sparkles, Target, BookOpen, BarChart3, Compass } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const [profile, cha, ultimoDesafio, pdiAtivo, ultimoTeste] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("avaliacoes_cha").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("desafios_concluidos").select("*, desafios(*)").eq("user_id", uid).order("concluido_em", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("pdi").select("*").eq("user_id", uid).neq("status", "concluido"),
        supabase.from("testes_lideranca").select("perfil_predominante, pontuacoes").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        profile: profile.data,
        cha: cha.data,
        ultimoDesafio: ultimoDesafio.data,
        pdiAtivo: pdiAtivo.data ?? [],
        ultimoTeste: ultimoTeste.data,
      };
    },
  });

  const pontos = data?.profile?.pontuacao ?? 0;
  const { atual, proximo } = nivelAtual(pontos);
  const progresso = proximo ? Math.min(100, ((pontos - atual.min) / (proximo.min - atual.min)) * 100) : 100;

  const perfilDISC = data?.ultimoTeste?.perfil_predominante as PerfilDISC | undefined;
  const perfil = perfilDISC ? PERFIS_DISC[perfilDISC] : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {data?.profile?.nome ?? "líder"} 👋
        </h1>
        <p className="text-muted-foreground">Aqui está seu progresso no laboratório de liderança.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Nível */}
        <div className="rounded-2xl border bg-[image:var(--gradient-card)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nível atual</p>
              <p className="mt-1 text-xl font-bold">{atual.nome}</p>
            </div>
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div className="mt-4">
            <Progress value={progresso} />
            <p className="mt-2 text-xs text-muted-foreground">
              {proximo ? `${pontos}/${proximo.min} pts para ${proximo.nome}` : "Nível máximo!"}
            </p>
          </div>
        </div>

        {/* Pontuação */}
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pontuação</p>
          <p className="mt-1 text-3xl font-bold text-primary">{pontos}</p>
          <p className="text-xs text-muted-foreground">pontos acumulados</p>
        </div>

        {/* Perfil DISC */}
        <div
          className="rounded-2xl border bg-card p-6"
          style={perfil ? { borderColor: perfil.cor + "40", background: perfil.cor + "08" } : {}}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Perfil DISC</p>
          {perfil ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl">{perfil.emoji}</span>
              <div>
                <p className="text-xl font-bold" style={{ color: perfil.cor }}>{perfil.titulo}</p>
                <p className="text-xs text-muted-foreground">{perfil.subtitulo}</p>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Nenhum teste realizado</p>
              <Link to="/teste" className="mt-1 inline-block text-xs text-primary hover:underline">
                Descobrir meu perfil →
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Resultado CHA */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Resultado CHA</h2>
          </div>
          {data?.cha ? (
            <div className="space-y-2 text-sm">
              <Row label="Conhecimentos" value={Number(data.cha.conhecimentos)} />
              <Row label="Habilidades" value={Number(data.cha.habilidades)} />
              <Row label="Atitudes" value={Number(data.cha.atitudes)} />
              <div className="mt-3 border-t pt-2 text-sm">
                <strong>Geral:</strong> {Number(data.cha.pontuacao_geral).toFixed(1)} / 5
              </div>
            </div>
          ) : (
            <Link to="/cha" className="text-sm text-primary hover:underline">
              Fazer minha primeira avaliação →
            </Link>
          )}
        </div>

        {/* PDI */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Competências em desenvolvimento</h2>
          </div>
          {data?.pdiAtivo && data.pdiAtivo.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {data.pdiAtivo.slice(0, 5).map((p: any) => (
                <li key={p.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {p.competencia}
                </li>
              ))}
            </ul>
          ) : (
            <Link to="/pdi" className="text-sm text-primary hover:underline">
              Criar meu PDI →
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink to="/diario" icon={BookOpen} label="Registrar reflexão" />
        <QuickLink to="/teste" icon={Compass} label={perfil ? "Refazer teste DISC" : "Descobrir perfil DISC"} />
        <QuickLink to="/assistente" icon={Sparkles} label="Falar com Assistente IA" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs text-muted-foreground">{label}</span>
      <Progress value={(value / 5) * 100} className="flex-1" />
      <span className="w-10 text-right text-xs font-semibold">{value.toFixed(1)}</span>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: any) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-primary opacity-0 transition group-hover:opacity-100">→</span>
    </Link>
  );
}
