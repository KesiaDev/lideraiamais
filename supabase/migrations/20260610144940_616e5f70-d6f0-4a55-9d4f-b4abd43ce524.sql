
-- 1) is_admin flag on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2) Security definer helper to check admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user AND is_admin = true)
$$;

-- Prevent non-admins from self-promoting via profile update
CREATE OR REPLACE FUNCTION public.prevent_is_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can change is_admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_no_admin_escalation ON public.profiles;
CREATE TRIGGER trg_profiles_no_admin_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_is_admin_escalation();

-- Admins can read all profiles
DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
CREATE POLICY "admins read all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- 3) atividades
CREATE TABLE IF NOT EXISTS public.atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_por uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text NOT NULL,
  categoria text NOT NULL,
  pontos integer NOT NULL DEFAULT 20,
  prazo date,
  publicada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alunos veem atividades publicadas" ON public.atividades
FOR SELECT TO authenticated
USING (publicada = true OR public.is_admin(auth.uid()));

CREATE POLICY "admins inserem atividades" ON public.atividades
FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) AND criado_por = auth.uid());

CREATE POLICY "admins atualizam atividades" ON public.atividades
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins excluem atividades" ON public.atividades
FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_atividades_updated_at
BEFORE UPDATE ON public.atividades
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) respostas_atividades
CREATE TABLE IF NOT EXISTS public.respostas_atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id uuid NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resposta text NOT NULL,
  nota numeric,
  feedback text,
  avaliado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (atividade_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.respostas_atividades TO authenticated;
GRANT ALL ON public.respostas_atividades TO service_role;

ALTER TABLE public.respostas_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aluno le sua resposta ou admin le todas" ON public.respostas_atividades
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "aluno cria propria resposta" ON public.respostas_atividades
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "aluno edita resposta ou admin avalia" ON public.respostas_atividades
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "aluno apaga propria resposta" ON public.respostas_atividades
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_respostas_atividades_updated_at
BEFORE UPDATE ON public.respostas_atividades
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
