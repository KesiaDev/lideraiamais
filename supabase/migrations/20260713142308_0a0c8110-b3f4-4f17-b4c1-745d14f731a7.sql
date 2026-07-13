
CREATE TABLE public.projeto_integrador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  perfil_lideranca TEXT NOT NULL,
  cha_destaque TEXT NOT NULL,
  plano_desenvolvimento TEXT NOT NULL,
  aplicacao_ia TEXT NOT NULL,
  aprendizado_transformador TEXT NOT NULL,
  carta_futuro TEXT,
  compromisso TEXT,
  pontos_creditados BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projeto_integrador TO authenticated;
GRANT ALL ON public.projeto_integrador TO service_role;

ALTER TABLE public.projeto_integrador ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projeto" ON public.projeto_integrador
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all projetos" ON public.projeto_integrador
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_projeto_integrador_updated_at
  BEFORE UPDATE ON public.projeto_integrador
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
