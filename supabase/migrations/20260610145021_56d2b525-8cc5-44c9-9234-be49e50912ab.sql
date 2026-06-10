
DROP TABLE IF EXISTS public.respostas_atividades CASCADE;
DROP TABLE IF EXISTS public.atividades CASCADE;

CREATE TABLE public.atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  perguntas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alunos veem ativas, admins veem tudo" ON public.atividades
FOR SELECT TO authenticated
USING (ativa = true OR public.is_admin(auth.uid()));

CREATE POLICY "admins criam atividades" ON public.atividades
FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "admins editam atividades" ON public.atividades
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins excluem atividades" ON public.atividades
FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_atividades_updated_at
BEFORE UPDATE ON public.atividades
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.respostas_atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id uuid NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_aluno text,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (atividade_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.respostas_atividades TO authenticated;
GRANT ALL ON public.respostas_atividades TO service_role;

ALTER TABLE public.respostas_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aluno ou admin le respostas" ON public.respostas_atividades
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "aluno cria propria resposta" ON public.respostas_atividades
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "aluno edita propria resposta" ON public.respostas_atividades
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "aluno apaga propria resposta" ON public.respostas_atividades
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
