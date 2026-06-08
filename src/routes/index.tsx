import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, BarChart3, Compass, BookOpen, Target, Trophy, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LideraIA — Desenvolva sua liderança com IA" },
      { name: "description", content: "Laboratório de liderança com Inteligência Artificial: CHA, teste de perfil, diário do líder, PDI, desafios e assistente IA." },
      { property: "og:title", content: "LideraIA — Laboratório de Liderança" },
      { property: "og:description", content: "Desenvolva sua liderança com apoio da Inteligência Artificial." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: BarChart3, titulo: "Avaliação CHA", desc: "Mapeie Conhecimentos, Habilidades e Atitudes com gráfico radar." },
  { icon: Compass, titulo: "Teste de Liderança", desc: "Descubra seu perfil predominante entre 5 estilos clássicos." },
  { icon: BookOpen, titulo: "Diário do Líder", desc: "Registre reflexões e insights de cada aula." },
  { icon: Target, titulo: "PDI", desc: "Plano de Desenvolvimento Individual com prazos e progresso." },
  { icon: Trophy, titulo: "Desafios Semanais", desc: "Pratique liderança no mundo real e ganhe pontos." },
  { icon: Bot, titulo: "Assistente IA", desc: "Tire dúvidas, peça feedbacks e planos de ação 24/7." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="container mx-auto flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] shadow-[var(--shadow-glow)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">LideraIA</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Entrar</Link></Button>
          <Button asChild><Link to="/auth">Começar grátis</Link></Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pb-20 pt-12 md:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3 w-3" />
            Para alunos de Liderança e Gestão de Pessoas
          </div>
          <h1 className="bg-[image:var(--gradient-hero)] bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent md:text-7xl">
            Bem-vindo ao LideraIA
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Desenvolva sua liderança com apoio da Inteligência Artificial. Autoconhecimento, comunicação, inteligência emocional e gestão de pessoas em um único laboratório.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="shadow-[var(--shadow-elegant)]">
              <Link to="/auth">Começar agora <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Já tenho conta</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-6xl gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.titulo} className="group rounded-2xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-card)]">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold">{f.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        LideraIA · Laboratório de Liderança com Inteligência Artificial
      </footer>
    </div>
  );
}
