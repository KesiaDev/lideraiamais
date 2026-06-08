import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, MessageCircle, Users, HeartHandshake, Brain, Scale } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lideranca-ia")({ component: LiderancaIA });

const blocos = [
  { icon: MessageSquare, titulo: "Feedback", desc: "Use a IA para estruturar feedbacks pelo modelo SCI (Situação-Comportamento-Impacto).", exemplo: "Prompt: 'Reescreva este feedback de forma específica e construtiva: [seu rascunho]'." },
  { icon: MessageCircle, titulo: "Comunicação", desc: "Adapte mensagens para diferentes públicos e ajuste tom e clareza.", exemplo: "Prompt: 'Reescreva este comunicado para a equipe de operações, em tom acolhedor e direto.'" },
  { icon: Users, titulo: "Gestão de conflitos", desc: "Simule conversas difíceis e receba um roteiro de mediação.", exemplo: "Prompt: 'Simule uma conversa entre dois colaboradores em conflito sobre prazos. Atue como mediador.'" },
  { icon: HeartHandshake, titulo: "Desenvolvimento de equipes", desc: "Gere PDIs personalizados, planos de 1:1 e perguntas de coaching.", exemplo: "Prompt: 'Crie 10 perguntas de coaching para um analista em transição para coordenador.'" },
  { icon: Brain, titulo: "Inteligência emocional", desc: "Identifique gatilhos e treine respostas mais conscientes a situações desafiadoras.", exemplo: "Prompt: 'Me ajude a reformular esta reação impulsiva: [descreva a situação].'" },
  { icon: Scale, titulo: "Tomada de decisão", desc: "Use matrizes (Eisenhower, custo/benefício) e cenários para reduzir vieses.", exemplo: "Prompt: 'Liste 3 cenários (otimista, realista, pessimista) para esta decisão: [contexto].'" },
];

function LiderancaIA() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Liderança e IA</h1>
        <p className="mt-2 text-muted-foreground">Aplicações práticas da Inteligência Artificial no dia a dia de quem lidera pessoas.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {blocos.map((b) => (
          <div key={b.titulo} className="rounded-2xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-card)]">
              <b.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{b.titulo}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            <div className="mt-3 rounded-lg bg-secondary/60 p-3 text-xs italic">{b.exemplo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}