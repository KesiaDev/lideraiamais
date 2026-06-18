-- Conceder privilégios do Data API que estavam faltando
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes_cha TO authenticated;
GRANT ALL ON public.avaliacoes_cha TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.testes_lideranca TO authenticated;
GRANT ALL ON public.testes_lideranca TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diario_lider TO authenticated;
GRANT ALL ON public.diario_lider TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdi TO authenticated;
GRANT ALL ON public.pdi TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.desafios TO authenticated;
GRANT SELECT ON public.desafios TO anon;
GRANT ALL ON public.desafios TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.desafios_concluidos TO authenticated;
GRANT ALL ON public.desafios_concluidos TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.respostas_atividades TO authenticated;
GRANT ALL ON public.respostas_atividades TO service_role;