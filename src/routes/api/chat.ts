import { createFileRoute } from "@tanstack/react-router";

const SYSTEM = `Você é o LideraIA, um copiloto de liderança para alunos do SENAC em formação em Liderança e Gestão de Pessoas.

Contexto: Os alunos trabalham com a metodologia DISC (Dominância, Influência, Estabilidade, Conformidade) — os 4 perfis são Executor (D), Comunicador (I), Planejador (S) e Analista (C).

Seu tom é encorajador, claro e direto, em português brasileiro. Use frameworks reconhecidos quando útil:
- DISC para autoconhecimento e comunicação interpessoal
- SCI (Situação-Comportamento-Impacto) para feedback
- Liderança Situacional (Hersey-Blanchard) para adaptação de estilo
- Inteligência Emocional (Goleman) para autogestão
- 5W2H para planos de ação
- Matriz de Eisenhower para priorização
- GROW para coaching

Sempre responda de forma prática: bullets curtos, exemplos concretos, próximos passos acionáveis. Nunca use jargão desnecessário. Quando o aluno mencionar seu perfil DISC, personalize a resposta para esse perfil específico.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const { messages } = (await request.json()) as { messages: { role: string; content: string }[] };
        if (!Array.isArray(messages)) return new Response("Invalid messages", { status: 400 });

        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-preview",
            messages: [{ role: "system", content: SYSTEM }, ...messages],
          }),
        });

        if (r.status === 429) return Response.json({ reply: "Muitas requisições agora. Tente novamente em alguns segundos." }, { status: 200 });
        if (r.status === 402) return Response.json({ reply: "Créditos da IA esgotados. Avise o administrador para recarregar o workspace." }, { status: 200 });
        if (!r.ok) {
          const errorText = await r.text();
          console.error("AI Gateway error:", r.status, errorText);
          return Response.json({ reply: "Serviço de IA temporariamente indisponível. Tente novamente." }, { status: 200 });
        }

        const data = await r.json() as any;
        const reply = data.choices?.[0]?.message?.content ?? "Não consegui gerar uma resposta.";
        return Response.json({ reply });
      },
    },
  },
});
