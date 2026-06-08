import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CHA_QUESTIONS } from "@/lib/leadership-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/cha")({ component: CHA });

function CHA() {
  const [resp, setResp] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);

  const allQuestions = [
    ...CHA_QUESTIONS.conhecimentos.map((q) => ({ q, cat: "conhecimentos" as const })),
    ...CHA_QUESTIONS.habilidades.map((q) => ({ q, cat: "habilidades" as const })),
    ...CHA_QUESTIONS.atitudes.map((q) => ({ q, cat: "atitudes" as const })),
  ];

  async function submit() {
    if (Object.keys(resp).length < allQuestions.length) return toast.error("Responda todas as perguntas");
    const avg = (arr: string[]) => arr.reduce((s, q) => s + (resp[q] ?? 0), 0) / arr.length;
    const conh = avg(CHA_QUESTIONS.conhecimentos);
    const hab = avg(CHA_QUESTIONS.habilidades);
    const ati = avg(CHA_QUESTIONS.atitudes);
    const geral = (conh + hab + ati) / 3;

    const allItems = allQuestions.map((q) => ({ texto: q.q, nota: resp[q.q] }));
    const pontosFortes = allItems.filter((i) => i.nota >= 4).map((i) => i.texto);
    const oportunidades = allItems.filter((i) => i.nota <= 2).map((i) => i.texto);

    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("avaliacoes_cha").insert({
      user_id: u.user!.id, respostas: resp, pontuacao_geral: geral,
      conhecimentos: conh, habilidades: hab, atitudes: ati,
      pontos_fortes: pontosFortes, oportunidades,
    });
    if (error) return toast.error(error.message);
    await supabase.rpc("add_pontos", { p_user: u.user!.id, p_pontos: 10 });
    setResult({ conh, hab, ati, geral, pontosFortes, oportunidades });
    toast.success("Avaliação salva! +10 pontos");
  }

  if (result) {
    const chartData = [
      { eixo: "Conhecimentos", v: result.conh },
      { eixo: "Habilidades", v: result.hab },
      { eixo: "Atitudes", v: result.ati },
    ];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Seu resultado CHA</h1>
        <div className="rounded-2xl border bg-card p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="eixo" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar dataKey="v" stroke="oklch(0.55 0.21 270)" fill="oklch(0.55 0.21 270)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-lg font-semibold">Pontuação geral: {result.geral.toFixed(1)} / 5</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-2 font-semibold text-emerald-600">Pontos fortes</h3>
            {result.pontosFortes.length ? <ul className="list-disc pl-5 text-sm">{result.pontosFortes.map((x: string) => <li key={x}>{x}</li>)}</ul> : <p className="text-sm text-muted-foreground">Nenhum ainda — desenvolva-se!</p>}
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-2 font-semibold text-amber-600">Oportunidades de melhoria</h3>
            {result.oportunidades.length ? <ul className="list-disc pl-5 text-sm">{result.oportunidades.map((x: string) => <li key={x}>{x}</li>)}</ul> : <p className="text-sm text-muted-foreground">Excelente nível em todos os pontos!</p>}
          </div>
        </div>
        <Button variant="outline" onClick={() => { setResult(null); setResp({}); }}>Refazer</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Avaliação CHA</h1>
      <p className="mt-1 text-muted-foreground">Conhecimentos, Habilidades e Atitudes — escala 1 (discordo) a 5 (concordo totalmente).</p>
      <div className="mt-6 space-y-6">
        {(["conhecimentos", "habilidades", "atitudes"] as const).map((cat) => (
          <div key={cat} className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-semibold capitalize">{cat}</h2>
            <div className="space-y-4">
              {CHA_QUESTIONS[cat].map((q) => (
                <div key={q}>
                  <p className="mb-2 text-sm">{q}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setResp({ ...resp, [q]: n })}
                        className={`h-10 w-10 rounded-lg border text-sm font-medium transition ${resp[q] === n ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={submit} size="lg" className="w-full">Finalizar avaliação</Button>
      </div>
    </div>
  );
}