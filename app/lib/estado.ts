import { categorias } from "./dados";

// Registro de um card sorteado na sessão.
export type Registro = {
  ordem: number;
  id: string;
  categoria: string;
  descricao: string;
  horario: string; // ISO 8601
};

export type Estado = {
  historico: Registro[];
  atualId: string | null;
  dicasReveladas: number;
  respostaRevelada: boolean;
  categoriasAtivas: string[];
  ignorarDuplicados: boolean;
};

const CHAVE = "sorteio-cards-computacao:v1";

export const estadoInicial: Estado = {
  historico: [],
  atualId: null,
  dicasReveladas: 0,
  respostaRevelada: false,
  categoriasAtivas: categorias.map((c) => c.id),
  ignorarDuplicados: false,
};

const ouvintes = new Set<() => void>();

// Cópia em memória, usada se o localStorage estiver indisponível.
let memoria: Estado = estadoInicial;
let brutoEmCache: string | null = null;
let estadoEmCache: Estado = estadoInicial;

function lerBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function interpretar(bruto: string): Estado {
  try {
    const salvo = JSON.parse(bruto) as Partial<Estado>;
    return {
      ...estadoInicial,
      ...salvo,
      historico: Array.isArray(salvo.historico) ? salvo.historico : [],
      categoriasAtivas: Array.isArray(salvo.categoriasAtivas)
        ? salvo.categoriasAtivas
        : estadoInicial.categoriasAtivas,
    };
  } catch {
    return estadoInicial;
  }
}

export function obterEstado(): Estado {
  const bruto = lerBruto();
  if (bruto === null) return memoria;
  if (bruto !== brutoEmCache) {
    brutoEmCache = bruto;
    estadoEmCache = interpretar(bruto);
  }
  return estadoEmCache;
}

export function obterEstadoServidor(): Estado | null {
  return null;
}

export function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  // Mantém abas diferentes sincronizadas.
  const aoMudarStorage = (e: StorageEvent) => {
    if (e.key === CHAVE || e.key === null) ouvinte();
  };
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

export function atualizar(mudanca: (e: Estado) => Estado): void {
  const novo = mudanca(obterEstado());
  memoria = novo;
  const bruto = JSON.stringify(novo);
  try {
    window.localStorage.setItem(CHAVE, bruto);
    brutoEmCache = bruto;
    estadoEmCache = novo;
  } catch {
    // Sem localStorage: segue apenas em memória.
  }
  ouvintes.forEach((o) => o());
}

export function reiniciar(): void {
  // Apaga o registro, mas mantém os filtros escolhidos.
  atualizar((e) => ({
    ...estadoInicial,
    categoriasAtivas: e.categoriasAtivas,
    ignorarDuplicados: e.ignorarDuplicados,
  }));
}
