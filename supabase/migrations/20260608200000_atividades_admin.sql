
-- ============================================================
-- ATIVIDADES: feature de atividades para professora/alunos
-- ============================================================

-- 1. Coluna is_admin em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Função auxiliar para checar admin sem recursão de RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Admin pode ler todos os perfis (para mostrar nome dos alunos)
CREATE POLICY "admin reads all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- 4. Tabela atividades (criada pela professora)
CREATE TABLE public.atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  perguntas JSONB NOT NULL DEFAULT '[]',
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users ON DELETE SET NULL
);
GRANT SELECT ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Alunos leem apenas ativas
CREATE POLICY "students read active atividades" ON public.atividades FOR SELECT TO authenticated
  USING (ativa = true);

-- Admin gerencia tudo (INSERT/UPDATE/DELETE também)
CREATE POLICY "admin all atividades" ON public.atividades FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Tabela respostas dos alunos
CREATE TABLE public.respostas_atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  atividade_id UUID NOT NULL REFERENCES public.atividades ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  nome_aluno TEXT,
  respostas JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (atividade_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.respostas_atividades TO authenticated;
GRANT ALL ON public.respostas_atividades TO service_role;
ALTER TABLE public.respostas_atividades ENABLE ROW LEVEL SECURITY;

-- Aluno gerencia suas próprias respostas
CREATE POLICY "own respostas" ON public.respostas_atividades FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin lê todas as respostas
CREATE POLICY "admin read all respostas" ON public.respostas_atividades FOR SELECT TO authenticated
  USING (public.is_admin());
