
-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  empresa TEXT,
  cargo TEXT,
  tempo_experiencia TEXT,
  area_atuacao TEXT,
  pontuacao INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTO PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ADD PONTOS
CREATE OR REPLACE FUNCTION public.add_pontos(p_user UUID, p_pontos INT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET pontuacao = pontuacao + p_pontos WHERE id = p_user;
END; $$;
GRANT EXECUTE ON FUNCTION public.add_pontos(UUID, INT) TO authenticated;

-- AVALIACOES CHA
CREATE TABLE public.avaliacoes_cha (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  respostas JSONB NOT NULL,
  pontuacao_geral NUMERIC(4,2) NOT NULL,
  conhecimentos NUMERIC(4,2) NOT NULL,
  habilidades NUMERIC(4,2) NOT NULL,
  atitudes NUMERIC(4,2) NOT NULL,
  pontos_fortes TEXT[],
  oportunidades TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes_cha TO authenticated;
GRANT ALL ON public.avaliacoes_cha TO service_role;
ALTER TABLE public.avaliacoes_cha ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cha" ON public.avaliacoes_cha FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TESTES LIDERANCA
CREATE TABLE public.testes_lideranca (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  respostas JSONB NOT NULL,
  perfil_predominante TEXT NOT NULL,
  pontuacoes JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testes_lideranca TO authenticated;
GRANT ALL ON public.testes_lideranca TO service_role;
ALTER TABLE public.testes_lideranca ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own teste" ON public.testes_lideranca FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DIARIO LIDER
CREATE TABLE public.diario_lider (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  aprendi TEXT NOT NULL,
  insight TEXT,
  aplicarei TEXT,
  habilidade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diario_lider TO authenticated;
GRANT ALL ON public.diario_lider TO service_role;
ALTER TABLE public.diario_lider ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own diario" ON public.diario_lider FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PDI
CREATE TABLE public.pdi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  competencia TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  acao TEXT NOT NULL,
  prazo DATE,
  status TEXT NOT NULL DEFAULT 'nao_iniciado',
  pontos_creditados BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdi TO authenticated;
GRANT ALL ON public.pdi TO service_role;
ALTER TABLE public.pdi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pdi" ON public.pdi FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER pdi_updated_at BEFORE UPDATE ON public.pdi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DESAFIOS (catalogo)
CREATE TABLE public.desafios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  pontos INTEGER NOT NULL DEFAULT 20,
  semana INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.desafios TO authenticated;
GRANT ALL ON public.desafios TO service_role;
ALTER TABLE public.desafios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "desafios read all" ON public.desafios FOR SELECT TO authenticated USING (true);

-- DESAFIOS CONCLUIDOS
CREATE TABLE public.desafios_concluidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  desafio_id UUID NOT NULL REFERENCES public.desafios ON DELETE CASCADE,
  concluido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, desafio_id)
);
GRANT SELECT, INSERT, DELETE ON public.desafios_concluidos TO authenticated;
GRANT ALL ON public.desafios_concluidos TO service_role;
ALTER TABLE public.desafios_concluidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own concl" ON public.desafios_concluidos FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED desafios (conteúdo real baseado em literatura de liderança)
INSERT INTO public.desafios (titulo, descricao, categoria, pontos, semana) VALUES
('Feedback positivo intencional', 'Esta semana, ofereça um feedback positivo e específico para alguém da sua equipe sobre uma ação concreta que observou. Evite elogios genéricos como "bom trabalho".', 'Comunicação', 20, 1),
('Pratique escuta ativa', 'Em pelo menos uma conversa importante esta semana, pratique escuta ativa: não interrompa, faça perguntas para entender melhor, e reformule o que ouviu antes de responder.', 'Comunicação', 20, 2),
('Delegue uma tarefa significativa', 'Identifique uma tarefa que normalmente faz sozinho e delegue-a a alguém da equipe, explicando o "porquê" e o resultado esperado, sem microgerenciar.', 'Gestão de Pessoas', 25, 3),
('Reunião 1:1 de desenvolvimento', 'Marque um 1:1 de 30 minutos com um liderado focado exclusivamente no desenvolvimento dele(a) — não em entrega de tarefas.', 'Liderança', 25, 4),
('Resolva um conflito com curiosidade', 'Diante de uma divergência, faça três perguntas abertas antes de apresentar sua opinião. Busque entender a perspectiva do outro lado.', 'Inteligência Emocional', 25, 5),
('Reflexão diária por 7 dias', 'Reserve 5 minutos no fim de cada dia para anotar: o que aprendi, o que faria diferente, como me senti.', 'Autoconhecimento', 20, 6),
('Reconheça publicamente alguém', 'Faça um reconhecimento público (em reunião ou canal da equipe) sobre uma contribuição concreta de um colaborador.', 'Comunicação', 15, 7),
('Peça feedback sobre sua liderança', 'Solicite a 2 pessoas da equipe um feedback honesto sobre o que você poderia fazer melhor como líder.', 'Autoconhecimento', 30, 8);
