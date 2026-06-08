import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TESTE_PERGUNTAS, calcularPerfil, PERFIS_DESC } from "@/lib/leadership-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/teste")({ component: Teste });

function Teste() {
  const [resp, setResp] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  async function submit() {
    if (Object.keys(resp).length < TESTE_PERGUNTAS.length) return toast.error("Responda todas as 15 perguntas");
    const r = calcularPerfil(resp);
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("testes_lideranca").insert({
      user_id: u.user!.id, respostas: resp, perfil_predominante: r.predominante, pontuacoes: r.totais,
    });
    await supabase.rpc("add_pontos", { p_user: u.user!.id, p_pontos: 10 });
    setResult(r);
    toast.success("+10 pontos!");
  }

  if (result) {
    const perfil = PERFIS_DESC[result.predominante as keyof typeof PERFIS_DESC];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border bg-[image:var(--gradient-card)] p-8 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Seu perfil predominante</p>
          <h1 className="mt-2 text-4xl font-bold text-primary">{perfil.titulo}</h1>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm leading-relaxed">{perfil.descricao}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-emerald-600">Pontos fortes</h3>
              <ul className="list-disc pl-5 text-sm">{perfil.pontosFortes.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-amber-600">Cuidados</h3>
              <ul className="list-disc pl-5 text-sm">{perfil.cuidados.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => { setResult(null); setResp({}); }}>Refazer</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Teste de Liderança</h1>
      <p className="mt-1 text-muted-foreground">15 perguntas — escala 1 (discordo) a 5 (concordo totalmente).</p>
      <div className="mt-6 space-y-3">
        {TESTE_PERGUNTAS.map((q, i) => (
          <div key={q.id} className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-sm"><span className="text-muted-foreground">{i + 1}.</span> {q.texto}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setResp({ ...resp, [q.id]: n })}
                  className={`h-9 w-9 rounded-lg border text-sm font-medium transition ${resp[q.id] === n ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"}`}>{n}</button>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={submit} size="lg" className="w-full">Ver meu perfil</Button>
      </div>
    </div>
  );
}