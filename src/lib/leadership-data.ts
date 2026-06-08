export const CHA_QUESTIONS = {
  conhecimentos: [
    "Conheço técnicas de liderança",
    "Conheço estratégias de comunicação",
    "Conheço gestão de equipes",
  ],
  habilidades: [
    "Sei dar feedback",
    "Sei resolver conflitos",
    "Sei delegar atividades",
  ],
  atitudes: [
    "Tenho iniciativa",
    "Sou colaborativo",
    "Busco aprendizado contínuo",
  ],
};

export type PerfilLideranca =
  | "Democrático"
  | "Situacional"
  | "Servidor"
  | "Coach"
  | "Estratégico";

export const PERFIS_DESC: Record<PerfilLideranca, { titulo: string; descricao: string; pontosFortes: string[]; cuidados: string[] }> = {
  Democrático: {
    titulo: "Líder Democrático",
    descricao:
      "Você valoriza a participação da equipe nas decisões, promove o diálogo e busca consenso. Líderes democráticos geram alto engajamento e senso de pertencimento, especialmente em equipes maduras e criativas.",
    pontosFortes: ["Constrói confiança", "Estimula a criatividade coletiva", "Desenvolve autonomia da equipe"],
    cuidados: ["Decisões podem demorar em contextos de urgência", "Cuidado para não diluir responsabilidades"],
  },
  Situacional: {
    titulo: "Líder Situacional",
    descricao:
      "Inspirado em Hersey e Blanchard, você adapta seu estilo (direcionar, treinar, apoiar, delegar) ao nível de maturidade e ao contexto de cada liderado. Ótimo para equipes heterogêneas.",
    pontosFortes: ["Flexibilidade", "Leitura de contexto apurada", "Desenvolve pessoas no ritmo certo"],
    cuidados: ["Exige autoconhecimento alto", "Pode parecer inconsistente sem comunicação clara"],
  },
  Servidor: {
    titulo: "Líder Servidor",
    descricao:
      "Conceito de Robert Greenleaf: você coloca o desenvolvimento e bem-estar da equipe à frente da sua autopromoção. Cria culturas de confiança, propósito e cooperação.",
    pontosFortes: ["Empatia profunda", "Foco em propósito e pessoas", "Cultura de confiança"],
    cuidados: ["Risco de sobrecarregar-se", "Precisa equilibrar empatia com responsabilização"],
  },
  Coach: {
    titulo: "Líder Coach",
    descricao:
      "Você lidera fazendo perguntas poderosas, dando feedbacks construtivos e ajudando cada pessoa a encontrar suas próprias respostas. Acelera o desenvolvimento individual.",
    pontosFortes: ["Desenvolve talentos", "Feedback contínuo", "Estimula autonomia"],
    cuidados: ["Exige tempo dedicado a 1:1s", "Não substitui decisões executivas firmes"],
  },
  Estratégico: {
    titulo: "Líder Estratégico",
    descricao:
      "Você conecta o dia a dia da equipe à visão de longo prazo, prioriza com clareza e toma decisões baseadas em dados e impacto. Essencial para escalar resultados.",
    pontosFortes: ["Visão sistêmica", "Prioriza com clareza", "Decide com base em impacto"],
    cuidados: ["Pode parecer distante do operacional", "Cuidado com excesso de planejamento sem execução"],
  },
};

export type TestePergunta = {
  id: number;
  texto: string;
  // peso para cada perfil em uma escala 1-5
  pesos: Record<PerfilLideranca, number>;
};

// 15 perguntas baseadas em literatura de liderança. Cada resposta (1-5)
// soma o valor multiplicado pelo peso ao respectivo perfil.
export const TESTE_PERGUNTAS: TestePergunta[] = [
  { id: 1, texto: "Antes de tomar decisões importantes, procuro ouvir a opinião da equipe.", pesos: { Democrático: 1, Situacional: 0.3, Servidor: 0.5, Coach: 0.5, Estratégico: 0.2 } },
  { id: 2, texto: "Adapto meu estilo de liderança conforme a maturidade de cada liderado.", pesos: { Democrático: 0.2, Situacional: 1, Servidor: 0.3, Coach: 0.5, Estratégico: 0.3 } },
  { id: 3, texto: "Sinto satisfação em remover obstáculos para que minha equipe avance.", pesos: { Democrático: 0.3, Situacional: 0.3, Servidor: 1, Coach: 0.4, Estratégico: 0.2 } },
  { id: 4, texto: "Faço mais perguntas do que dou respostas em conversas com liderados.", pesos: { Democrático: 0.4, Situacional: 0.3, Servidor: 0.4, Coach: 1, Estratégico: 0.2 } },
  { id: 5, texto: "Costumo conectar as tarefas diárias com a visão de longo prazo.", pesos: { Democrático: 0.2, Situacional: 0.3, Servidor: 0.2, Coach: 0.3, Estratégico: 1 } },
  { id: 6, texto: "Tomo decisões com base em dados e impacto esperado.", pesos: { Democrático: 0.2, Situacional: 0.3, Servidor: 0.1, Coach: 0.2, Estratégico: 1 } },
  { id: 7, texto: "Prezo pelo desenvolvimento individual de cada pessoa da equipe.", pesos: { Democrático: 0.4, Situacional: 0.5, Servidor: 0.7, Coach: 1, Estratégico: 0.2 } },
  { id: 8, texto: "Acredito que o líder existe para servir a equipe, não o contrário.", pesos: { Democrático: 0.4, Situacional: 0.2, Servidor: 1, Coach: 0.4, Estratégico: 0.1 } },
  { id: 9, texto: "Quando alguém está iniciando uma tarefa nova, dou instruções detalhadas.", pesos: { Democrático: 0.1, Situacional: 1, Servidor: 0.3, Coach: 0.3, Estratégico: 0.3 } },
  { id: 10, texto: "Construo consenso antes de avançar em mudanças importantes.", pesos: { Democrático: 1, Situacional: 0.4, Servidor: 0.5, Coach: 0.3, Estratégico: 0.3 } },
  { id: 11, texto: "Dou feedback frequente e específico para acelerar o aprendizado.", pesos: { Democrático: 0.4, Situacional: 0.5, Servidor: 0.5, Coach: 1, Estratégico: 0.3 } },
  { id: 12, texto: "Priorizo iniciativas pelo impacto estratégico, não pela urgência.", pesos: { Democrático: 0.2, Situacional: 0.3, Servidor: 0.1, Coach: 0.2, Estratégico: 1 } },
  { id: 13, texto: "Costumo delegar quando percebo maturidade suficiente no liderado.", pesos: { Democrático: 0.5, Situacional: 1, Servidor: 0.4, Coach: 0.6, Estratégico: 0.4 } },
  { id: 14, texto: "Reconheço e celebro publicamente o esforço da equipe.", pesos: { Democrático: 0.7, Situacional: 0.3, Servidor: 0.8, Coach: 0.5, Estratégico: 0.3 } },
  { id: 15, texto: "Encorajo discordâncias saudáveis para tomar melhores decisões.", pesos: { Democrático: 1, Situacional: 0.4, Servidor: 0.4, Coach: 0.6, Estratégico: 0.5 } },
];

export function calcularPerfil(respostas: Record<number, number>) {
  const totais: Record<PerfilLideranca, number> = {
    Democrático: 0, Situacional: 0, Servidor: 0, Coach: 0, Estratégico: 0,
  };
  for (const q of TESTE_PERGUNTAS) {
    const r = respostas[q.id] ?? 0;
    (Object.keys(q.pesos) as PerfilLideranca[]).forEach((p) => {
      totais[p] += r * q.pesos[p];
    });
  }
  const predominante = (Object.entries(totais).sort((a, b) => b[1] - a[1])[0][0]) as PerfilLideranca;
  return { totais, predominante };
}

// GAMIFICACAO
export const NIVEIS = [
  { nome: "Iniciante", min: 0 },
  { nome: "Líder em Desenvolvimento", min: 50 },
  { nome: "Líder Colaborativo", min: 150 },
  { nome: "Líder Estratégico", min: 300 },
  { nome: "Líder Transformador", min: 600 },
];

export function nivelAtual(pontos: number) {
  let atual = NIVEIS[0];
  let proximo: typeof NIVEIS[number] | null = null;
  for (let i = 0; i < NIVEIS.length; i++) {
    if (pontos >= NIVEIS[i].min) atual = NIVEIS[i];
    if (NIVEIS[i].min > pontos && !proximo) proximo = NIVEIS[i];
  }
  return { atual, proximo };
}

export const PROMPTS_RAPIDOS = [
  { titulo: "Criar feedback profissional", prompt: "Me ajude a estruturar um feedback profissional, específico e construtivo para um colaborador. Use o modelo SCI (Situação-Comportamento-Impacto)." },
  { titulo: "Resolver conflito entre colaboradores", prompt: "Tenho um conflito entre dois colaboradores da minha equipe. Como devo conduzir uma conversa de mediação eficaz? Dê um passo a passo." },
  { titulo: "Melhorar comunicação da equipe", prompt: "Quais práticas posso implementar nesta semana para melhorar a clareza e a frequência da comunicação dentro da minha equipe?" },
  { titulo: "Desenvolver liderança", prompt: "Quero evoluir como líder nos próximos 90 dias. Sugira um plano realista com 3 frentes de desenvolvimento, hábitos diários e indicadores." },
  { titulo: "Criar plano de ação", prompt: "Me ajude a criar um plano de ação 5W2H para [descreva sua meta]." },
  { titulo: "Elaborar PDI", prompt: "Me ajude a elaborar um PDI (Plano de Desenvolvimento Individual) com 3 competências, objetivos, ações práticas e prazos." },
];