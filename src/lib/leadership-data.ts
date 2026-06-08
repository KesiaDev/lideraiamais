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

export type PerfilDISC = "D" | "I" | "S" | "C";

export const PERFIS_DISC: Record<PerfilDISC, {
  titulo: string;
  subtitulo: string;
  cor: string;
  descricao: string;
  caracteristicas: string[];
  pontosFortes: string[];
  pontosAtencao: string[];
  comoLider: string;
  emoji: string;
}> = {
  D: {
    titulo: "Executor",
    subtitulo: "Perfil D — Dominância",
    cor: "#ef4444",
    emoji: "⚡",
    descricao:
      "Você é direto, decidido e orientado a resultados. Como Executor, você não espera as coisas acontecerem — você as faz acontecer. Sua determinação e energia são sua maior força em ambientes de alta pressão.",
    caracteristicas: ["Direto", "Competitivo", "Rápido", "Orientado para resultados"],
    pontosFortes: [
      "Tomada de decisão ágil",
      "Coragem para enfrentar desafios",
      "Capacidade de execução sob pressão",
      "Liderança em situações de crise",
    ],
    pontosAtencao: [
      "Impaciência com processos lentos",
      "Excesso de cobrança sobre a equipe",
      "Dificuldade em desacelerar e ouvir",
    ],
    comoLider:
      "Seu perfil predominante é Executor. Você tende a buscar resultados rapidamente, assumir responsabilidades e tomar decisões com agilidade. Como líder, seu desafio será desenvolver escuta ativa, empatia e paciência com pessoas que possuem ritmos diferentes do seu.",
  },
  I: {
    titulo: "Comunicador",
    subtitulo: "Perfil I — Influência",
    cor: "#f59e0b",
    emoji: "✨",
    descricao:
      "Você é sociável, entusiasmado e naturalmente influente. Como Comunicador, você conecta pessoas, gera energia no ambiente e sabe como engajar equipes em torno de ideias e causas.",
    caracteristicas: ["Sociável", "Persuasivo", "Entusiasmado", "Otimista"],
    pontosFortes: [
      "Comunicação clara e envolvente",
      "Capacidade de influenciar e inspirar",
      "Relacionamento interpessoal forte",
      "Criatividade e pensamento inovador",
    ],
    pontosAtencao: [
      "Falta de organização e foco",
      "Dispersão entre muitas ideias",
      "Dificuldade em concluir projetos",
    ],
    comoLider:
      "Seu perfil predominante é Comunicador. Você tende a engajar e inspirar pessoas com facilidade, construindo conexões genuínas. Como líder, seu desafio será desenvolver disciplina operacional e transformar entusiasmo em entrega concreta e consistente.",
  },
  S: {
    titulo: "Planejador",
    subtitulo: "Perfil S — Estabilidade",
    cor: "#10b981",
    emoji: "🤝",
    descricao:
      "Você é colaborativo, paciente e confiável. Como Planejador, você é a âncora da equipe — o tipo de pessoa que todos sabem que podem contar quando precisam de apoio real e consistência.",
    caracteristicas: ["Colaborativo", "Paciente", "Estável", "Leal"],
    pontosFortes: [
      "Trabalho em equipe e cooperação",
      "Relacionamento e construção de confiança",
      "Consistência e confiabilidade nas entregas",
      "Capacidade de escuta profunda",
    ],
    pontosAtencao: [
      "Resistência a mudanças rápidas",
      "Dificuldade em impor limites",
      "Tendência a evitar conflitos necessários",
    ],
    comoLider:
      "Seu perfil predominante é Planejador. Você tende a apoiar a equipe com consistência e lealdade, criando ambientes de confiança e cooperação. Como líder, seu desafio será desenvolver assertividade — aprender a dar feedbacks diretos e tomar decisões difíceis mesmo quando gera desconforto.",
  },
  C: {
    titulo: "Analista",
    subtitulo: "Perfil C — Conformidade",
    cor: "#6366f1",
    emoji: "🔬",
    descricao:
      "Você é organizado, detalhista e orientado à qualidade. Como Analista, você pensa antes de agir, questiona antes de decidir e entrega com precisão. Sua força está na profundidade e na excelência.",
    caracteristicas: ["Organizado", "Detalhista", "Metódico", "Analítico"],
    pontosFortes: [
      "Qualidade e precisão nas entregas",
      "Análise criteriosa de dados e riscos",
      "Planejamento estruturado",
      "Identificação de falhas e inconsistências",
    ],
    pontosAtencao: [
      "Perfeccionismo que pode travar a execução",
      "Dificuldade em delegar tarefas",
      "Excesso de análise antes de agir",
    ],
    comoLider:
      "Seu perfil predominante é Analista. Você tende a entregar com qualidade e precisão, analisando riscos antes de agir. Como líder, seu desafio será aprender a tomar decisões com informações incompletas e desenvolver tolerância à imperfeição controlada — velocidade e qualidade precisam coexistir.",
  },
};

export type TestePergunta = {
  id: number;
  texto: string;
  perfil: PerfilDISC;
};

export const TESTE_PERGUNTAS: TestePergunta[] = [
  // D — Executor (Dominância)
  { id: 1,  perfil: "D", texto: "Prefiro tomar decisões rápidas, mesmo sem todas as informações disponíveis." },
  { id: 2,  perfil: "D", texto: "Em situações de pressão, costumo assumir o controle e liderar o grupo naturalmente." },
  { id: 3,  perfil: "D", texto: "Metas desafiadoras me motivam muito mais do que tarefas rotineiras e previsíveis." },
  { id: 4,  perfil: "D", texto: "Não tenho medo de defender minha opinião, mesmo quando ela é impopular." },
  { id: 5,  perfil: "D", texto: "Me incomoda quando as coisas avançam lentamente ou há excesso de burocracia." },
  { id: 6,  perfil: "D", texto: "Prefiro agir e corrigir o curso depois a esperar pelo plano perfeito." },
  // I — Comunicador (Influência)
  { id: 7,  perfil: "I", texto: "Tenho facilidade em criar conexões com pessoas que acabei de conhecer." },
  { id: 8,  perfil: "I", texto: "Costumo animar o ambiente com meu entusiasmo e energia positiva." },
  { id: 9,  perfil: "I", texto: "Gosto de convencer e influenciar pessoas para aderirem a novas ideias." },
  { id: 10, perfil: "I", texto: "Prefiro trabalhar em equipe a trabalhar sozinho na maioria das situações." },
  { id: 11, perfil: "I", texto: "Costumo manter o otimismo mesmo quando enfrento adversidades." },
  { id: 12, perfil: "I", texto: "As pessoas me descrevem como alguém comunicativo, carismático e animado." },
  // S — Planejador (Estabilidade)
  { id: 13, perfil: "S", texto: "Prefiro ambientes estáveis e previsíveis para trabalhar com mais qualidade." },
  { id: 14, perfil: "S", texto: "Tenho paciência para ouvir as pessoas até o fim, sem interromper." },
  { id: 15, perfil: "S", texto: "Prefiro concluir o que começo antes de iniciar algo novo." },
  { id: 16, perfil: "S", texto: "Sinto satisfação genuína em apoiar minha equipe, mesmo sem destaque pessoal." },
  { id: 17, perfil: "S", texto: "Mudanças muito rápidas ou repentinas me causam desconforto." },
  { id: 18, perfil: "S", texto: "Sou reconhecido pela consistência, lealdade e comprometimento com as pessoas." },
  // C — Analista (Conformidade)
  { id: 19, perfil: "C", texto: "Antes de tomar uma decisão, preciso analisar dados e detalhes com cuidado." },
  { id: 20, perfil: "C", texto: "Erros causados por falta de atenção me incomodam profundamente." },
  { id: 21, perfil: "C", texto: "Prefiro fazer algo com qualidade do que entregar rápido e com falhas." },
  { id: 22, perfil: "C", texto: "Sou organizado e sigo processos e procedimentos com disciplina." },
  { id: 23, perfil: "C", texto: "Questiono ideias e propostas com base em lógica e evidências concretas." },
  { id: 24, perfil: "C", texto: "Tarefas que exigem precisão e atenção a detalhes me satisfazem muito." },
];

export function calcularPerfil(respostas: Record<number, number>) {
  const totais: Record<PerfilDISC, number> = { D: 0, I: 0, S: 0, C: 0 };
  for (const q of TESTE_PERGUNTAS) {
    totais[q.perfil] += respostas[q.id] ?? 0;
  }
  const predominante = (Object.entries(totais).sort((a, b) => b[1] - a[1])[0][0]) as PerfilDISC;
  return { totais, predominante };
}

// GAMIFICAÇÃO
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
