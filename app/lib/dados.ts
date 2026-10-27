import dados from "@/cards.json";

export type Card = {
  id: string;
  categoria: string;
  cor: string;
  tipo: string;
  descricao: string;
  dicas: string[];
  duplicado_de?: string;
};

export type Categoria = {
  id: string;
  nome: string;
  nome_completo?: string;
};

export const cards: Card[] = dados.cards;
export const categorias: Categoria[] = dados.categorias;
export const cores: Record<string, string> = dados.cores;
export const titulo: string = dados.titulo;

const cardsPorId = new Map(cards.map((c) => [c.id, c]));
const categoriasPorId = new Map(categorias.map((c) => [c.id, c]));

export function buscarCard(id: string): Card | undefined {
  return cardsPorId.get(id);
}

export function nomeCategoria(id: string): string {
  return categoriasPorId.get(id)?.nome ?? id;
}

export function nomeCompletoCategoria(id: string): string | undefined {
  return categoriasPorId.get(id)?.nome_completo;
}
