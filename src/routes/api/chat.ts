import { createFileRoute } from "@tanstack/react-router";

const SYSTEM = `Você é o LideraIA, um copiloto de liderança para alunos do Senac em formação em Liderança e Gestão de Pessoas.
Seu tom é encorajador, claro e direto, em português brasileiro.
Use frameworks reconhecidos quando útil: SCI (Situação-Comportamento-Impacto) para feedback, Liderança Situacional (Hersey-Blanchard), Inteligência Emocional (Goleman), 5W2H, Matriz de Eisenhower, GROW para coaching.
Sempre responda de forma prática: bullets curtos, exemplos concretos, próximos passos.`;

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
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "system", content: SYSTEM }, ...messages],
          }),
        });

        if (r.status === 429) return Response.json({ reply: "Muitas requisições agora. Tente novamente em alguns segundos." }, { status: 200 });
        if (r.status === 402) return Response.json({ reply: "Créditos da IA esgotados. Avise o administrador para recarregar o workspace." }, { status: 200 });
        if (!r.ok) return new Response(`AI Gateway error: ${await r.text()}`, { status: 500 });

        const data = await r.json() as any;
        const reply = data.choices?.[0]?.message?.content ?? "Não consegui gerar uma resposta.";
        return Response.json({ reply });
      },
    },
  },
});