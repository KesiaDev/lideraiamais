
ALTER TABLE public.projeto_integrador
  ADD COLUMN IF NOT EXISTS nota NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS observacoes_admin TEXT,
  ADD COLUMN IF NOT EXISTS avaliado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avaliado_por UUID REFERENCES auth.users(id);

ALTER TABLE public.projeto_integrador
  DROP CONSTRAINT IF EXISTS projeto_integrador_nota_check;
ALTER TABLE public.projeto_integrador
  ADD CONSTRAINT projeto_integrador_nota_check CHECK (nota IS NULL OR (nota >= 0 AND nota <= 10));

DROP POLICY IF EXISTS "Admins update projetos" ON public.projeto_integrador;
CREATE POLICY "Admins update projetos"
  ON public.projeto_integrador
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
