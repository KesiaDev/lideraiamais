import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({ component: Perfil });

function Perfil() {
  const [f, setF] = useState({ nome: "", empresa: "", cargo: "", tempo_experiencia: "", area_atuacao: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user!.id).maybeSingle();
      if (data) setF({
        nome: data.nome ?? "", empresa: data.empresa ?? "", cargo: data.cargo ?? "",
        tempo_experiencia: data.tempo_experiencia ?? "", area_atuacao: data.area_atuacao ?? "",
      });
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update(f).eq("id", u.user!.id);
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Perfil salvo!");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
      <p className="mt-1 text-muted-foreground">Conte-nos sobre seu contexto profissional.</p>
      <form onSubmit={save} className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
        {[
          ["nome", "Nome"], ["empresa", "Empresa"], ["cargo", "Cargo"],
          ["tempo_experiencia", "Tempo de experiência"], ["area_atuacao", "Área de atuação"],
        ].map(([k, label]) => (
          <div key={k} className="space-y-2">
            <Label htmlFor={k}>{label}</Label>
            <Input id={k} value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          </div>
        ))}
        <Button type="submit" disabled={loading}>Salvar Perfil</Button>
      </form>
    </div>
  );
}