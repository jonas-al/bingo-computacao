// Fonte única dos tópicos do bingo: cor, nome e ícone iguais aos das cartelas.
// Ver especificacao-design-sorteio-bingo.md, seções 1.2 e 4.

export type TopicoKey =
  | "db"
  | "bug"
  | "ask"
  | "algo"
  | "sec"
  | "ihc"
  | "ia"
  | "net"
  | "hw"
  | "sw"
  | "bully";

export type Topico = {
  key: TopicoKey;
  label: string;
  color: string;
  // Quebras de linha fixas do nome dentro do quadrado (opcional).
  linhas?: string[];
};

export const topicos: Topico[] = [
  { key: "db", label: "Banco de dados", color: "#1E6FB8" },
  { key: "bug", label: "Bug/Erro", color: "#C62F2F" },
  {
    key: "ask",
    label: "Investigação/Diagnóstico",
    color: "#2E8B4E",
    linhas: ["Investigação/", "Diagnóstico"],
  },
  { key: "algo", label: "Algoritmo", color: "#B4540A" },
  { key: "sec", label: "Cybersegurança", color: "#1F3A5F" },
  { key: "ihc", label: "IHC", color: "#7B4FC9" },
  { key: "ia", label: "IA", color: "#0B7A7A" },
  { key: "net", label: "Redes", color: "#8A6D00" },
  { key: "hw", label: "Hardware e Componentes", color: "#5D6470" },
  { key: "sw", label: "Software em geral", color: "#A3367A" },
  { key: "bully", label: "Cyberbullying", color: "#6D4C41" },
];

// id da categoria em cards.json -> tópico da cartela.
const topicoDaCategoria: Record<string, TopicoKey> = {
  banco_de_dados: "db",
  bug_ou_erro: "bug",
  investigacao_diagnostico: "ask",
  algoritmo: "algo",
  ciberseguranca: "sec",
  ihc: "ihc",
  ia: "ia",
  redes: "net",
  hardware: "hw",
  software: "sw",
  cyberbullying: "bully",
};

const topicosPorKey = new Map(topicos.map((t) => [t.key, t]));

export function buscarTopico(key: TopicoKey): Topico {
  return topicosPorKey.get(key)!;
}

export function topicoDe(categoria: string): Topico | undefined {
  const key = topicoDaCategoria[categoria];
  return key ? topicosPorKey.get(key) : undefined;
}
