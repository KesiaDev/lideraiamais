
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- add_pontos: switch to SECURITY INVOKER (user updating own pontuacao is allowed by RLS)
CREATE OR REPLACE FUNCTION public.add_pontos(p_user UUID, p_pontos INT)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET pontuacao = pontuacao + p_pontos WHERE id = p_user AND id = auth.uid();
END; $$;
