"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  buscarCard,
  cards,
  categorias,
  nomeCategoria,
  titulo,
  type Card,
} from "./lib/dados";
import {
  assinar,
  atualizar,
  obterEstado,
  obterEstadoServidor,
  reiniciar,
  type Estado,
} from "./lib/estado";
import { topicoDe, topicos } from "./lib/topicos";
import { CoringaTile, IconeTopico, TopicTile } from "./topic-tile";

const DURACAO_ANIMACAO = 1400;
const duplicados = cards.filter((c) => c.duplicado_de).map((c) => c.id);
const subtitulo = titulo.replace(/^bingo\s*/i, "");

function cardsDoFiltro(estado: Estado): Card[] {
  const ativas = new Set(estado.categoriasAtivas);
  return cards.filter(
    (c) =>
      ativas.has(c.categoria) && !(estado.ignorarDuplicados && c.duplicado_de),
  );
}

function sortearUm<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarOrdem(ordem: number): string {
  return String(ordem).padStart(2, "0");
}

function rotuloCategoria(categoria: string): string {
  return topicoDe(categoria)?.label ?? nomeCategoria(categoria);
}

function movimentoReduzido(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- Tela cheia ---------------------------------------------------------

function assinarTelaCheia(ouvinte: () => void) {
  document.addEventListener("fullscreenchange", ouvinte);
  return () => document.removeEventListener("fullscreenchange", ouvinte);
}

function useTelaCheia() {
  return useSyncExternalStore(
    assinarTelaCheia,
    () => document.fullscreenElement !== null,
    () => false,
  );
}

function alternarTelaCheia() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

// --- Componente principal ------------------------------------------------

export default function Sorteio() {
  const estado = useSyncExternalStore(
    assinar,
    obterEstado,
    obterEstadoServidor,
  );
  const telaCheia = useTelaCheia();
  const [sorteando, setSorteando] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const temporizadores = useRef<number[]>([]);

  useEffect(() => {
    const t = temporizadores.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const pronto = estado !== null;
  const e = estado ?? {
    historico: [],
    atualId: null,
    dicasReveladas: 0,
    respostaRevelada: false,
    categoriasAtivas: [],
    ignorarDuplicados: false,
  };

  const filtro = cardsDoFiltro(e);
  const jaSorteados = new Set(e.historico.map((r) => r.id));
  const restantes = filtro.filter((c) => !jaSorteados.has(c.id));
  const sorteadosNoFiltro = filtro.length - restantes.length;
  const atual = e.atualId ? buscarCard(e.atualId) : undefined;

  // Os tópicos sorteados só são conferidos quando alguém completa o bingo,
  // então a tela de sorteio nunca mostra o tópico de um card: ele aparece
  // apenas no histórico.

  function limparTemporizadores() {
    temporizadores.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    temporizadores.current = [];
  }

  function registrar(escolhido: Card) {
    atualizar((s) => {
      // Proteção extra: nunca registrar o mesmo card duas vezes.
      if (s.historico.some((r) => r.id === escolhido.id)) return s;
      return {
        ...s,
        historico: [
          ...s.historico,
          {
            ordem: s.historico.length + 1,
            id: escolhido.id,
            categoria: escolhido.categoria,
            descricao: escolhido.descricao,
            horario: new Date().toISOString(),
          },
        ],
        atualId: escolhido.id,
        dicasReveladas: 0,
        respostaRevelada: false,
      };
    });
  }

  function sortear() {
    if (sorteando || restantes.length === 0) return;
    const escolhido = sortearUm(restantes);
    if (movimentoReduzido()) {
      registrar(escolhido);
      return;
    }

    setSorteando(true);
    const fim = window.setTimeout(() => {
      limparTemporizadores();
      setSorteando(false);
      registrar(escolhido);
    }, DURACAO_ANIMACAO);
    temporizadores.current.push(fim);
  }

  function proximaDica() {
    if (!atual || sorteando) return;
    atualizar((s) => ({
      ...s,
      dicasReveladas: Math.min(s.dicasReveladas + 1, atual.dicas.length),
    }));
  }

  function reabrir(id: string) {
    if (sorteando) return;
    atualizar((s) => ({
      ...s,
      atualId: id,
      dicasReveladas: 0,
      respostaRevelada: false,
    }));
  }

  function confirmarReinicio() {
    const total = e.historico.length;
    const mensagem =
      total === 0
        ? "Reiniciar o sorteio?"
        : `Apagar o registro de ${total} card${total > 1 ? "s" : ""} sorteado${total > 1 ? "s" : ""} e reiniciar o sorteio?\n\nEssa ação não pode ser desfeita.`;
    if (!window.confirm(mensagem)) return;
    limparTemporizadores();
    setSorteando(false);
    reiniciar();
  }

  const aoTeclar = useEffectEvent((ev: KeyboardEvent) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (ev.target instanceof HTMLInputElement) return;
    if (ev.key === "Escape") {
      setFiltrosAbertos(false);
      setHistoricoAberto(false);
      return;
    }
    if (filtrosAbertos) return;
    switch (ev.key.toLowerCase()) {
      case "s":
        sortear();
        break;
      case "d":
        proximaDica();
        break;
      case "h":
        setHistoricoAberto((v) => !v);
        break;
      case "f":
        alternarTelaCheia();
        break;
      default:
        return;
    }
    ev.preventDefault();
  });

  useEffect(() => {
    const ouvinte = (ev: KeyboardEvent) => aoTeclar(ev);
    window.addEventListener("keydown", ouvinte);
    return () => window.removeEventListener("keydown", ouvinte);
  }, []);

  const ordemAtual = atual
    ? e.historico.find((r) => r.id === atual.id)?.ordem
    : undefined;
  const anuncio =
    !atual || sorteando
      ? ""
      : `Card sorteado${ordemAtual !== undefined ? ` nº ${ordemAtual}` : ""}`;

  return (
    // No projetor (lg+), tudo cabe na altura da tela: os botões ficam sempre
    // visíveis e, se preciso, só o card rola por dentro.
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      {/* Cabeçalho */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <h1 className="mr-auto flex items-baseline gap-3">
          <span className="text-4xl leading-none font-bold tracking-[0.13em] sm:text-5xl">
            BINGO
          </span>
          {subtitulo && (
            <span className="text-xl font-semibold text-ink-muted sm:text-2xl">
              {subtitulo}
            </span>
          )}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Pilula titulo="Cards sorteados / total de cards no filtro atual">
            Cards: {pronto ? `${sorteadosNoFiltro}/${filtro.length}` : "–"}
          </Pilula>
        </div>
        <nav className="flex flex-wrap gap-2">
          <BotaoSecundario
            onClick={() => setFiltrosAbertos(true)}
            disabled={!pronto}
          >
            Filtros
            {pronto && e.categoriasAtivas.length < categorias.length && (
              <span className="ml-2 rounded-full bg-ink px-2 text-sm text-on-tile">
                {e.categoriasAtivas.length}
              </span>
            )}
          </BotaoSecundario>
          <BotaoSecundario
            onClick={() => setHistoricoAberto((v) => !v)}
            ativo={historicoAberto}
            disabled={!pronto}
          >
            Histórico ({e.historico.length})
          </BotaoSecundario>
          <BotaoSecundario onClick={alternarTelaCheia}>
            {telaCheia ? "Sair da tela cheia" : "Tela cheia"}
          </BotaoSecundario>
          <BotaoSecundario onClick={confirmarReinicio} disabled={!pronto}>
            Reiniciar
          </BotaoSecundario>
        </nav>
      </header>

      <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-6 px-4 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        {/* Card atual */}
        <main className="flex min-h-0 min-w-0 flex-col gap-6">
          {!pronto ? (
            <Painel className="flex flex-1 items-center justify-center">
              <p className="text-2xl text-ink-muted">Carregando…</p>
            </Painel>
          ) : sorteando ? (
            <Animacao />
          ) : atual ? (
            <CardExibido
              key={atual.id}
              card={atual}
              ordem={ordemAtual}
              dicasReveladas={e.dicasReveladas}
            />
          ) : (
            <TelaInicial
              restantes={restantes.length}
              semCategorias={e.categoriasAtivas.length === 0}
              onSortear={sortear}
            />
          )}

          {pronto && (atual || sorteando) && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <BotaoSecundario
                onClick={proximaDica}
                disabled={
                  sorteando || !atual || e.dicasReveladas >= atual.dicas.length
                }
                atalho="D"
                grande
              >
                Próxima dica
                {atual && (
                  <span className="ml-2 tabular-nums opacity-70">
                    ({e.dicasReveladas}/{atual.dicas.length})
                  </span>
                )}
              </BotaoSecundario>
              <BotaoSortear
                onClick={sortear}
                disabled={sorteando || restantes.length === 0}
              >
                {restantes.length === 0
                  ? "Todos os cards foram sorteados"
                  : "Sortear próximo"}
              </BotaoSortear>
            </div>
          )}
        </main>

        {/* Painel lateral. O histórico só aparece pelo botão "Histórico" ou tecla H. */}
        <aside className="flex min-h-0 min-w-0 flex-col gap-6 lg:overflow-y-auto">
          <PainelTopicos />
        </aside>
      </div>

      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>

      {historicoAberto && pronto && (
        <PainelHistorico
          estado={e}
          onReabrir={reabrir}
          onFechar={() => setHistoricoAberto(false)}
          bloqueado={sorteando}
        />
      )}

      {filtrosAbertos && pronto && (
        <PainelFiltros
          estado={e}
          onFechar={() => setFiltrosAbertos(false)}
        />
      )}
    </div>
  );
}

// --- Telas ---------------------------------------------------------------

function TelaInicial({
  restantes,
  semCategorias,
  onSortear,
}: {
  restantes: number;
  semCategorias: boolean;
  onSortear: () => void;
}) {
  const aviso = semCategorias
    ? "Nenhuma categoria selecionada. Abra os filtros para escolher."
    : restantes === 0
      ? "Todos os cards do filtro atual já foram sorteados. Reinicie o sorteio ou altere os filtros."
      : null;

  return (
    <Painel className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto text-center">
      <div className="flex aspect-square w-[clamp(160px,min(28vw,34dvh),360px)] shrink-0 items-center justify-center rounded-[13%] border-[3px] border-dashed border-ink bg-surface p-6">
        <p className="text-[clamp(1.25rem,2.2vw,2rem)] leading-tight font-semibold">
          {aviso ? "Nada para sortear" : "Clique em Sortear"}
        </p>
      </div>
      <p className="max-w-2xl text-xl leading-snug text-ink-muted sm:text-2xl">
        Sorteie um card, leia a situação e descubra o{" "}
        <strong className="font-semibold text-ink">tópico</strong> com a ajuda
        das dicas.
      </p>
      {aviso ? (
        <p className="max-w-2xl rounded-3xl border-[3px] border-ink px-6 py-4 text-xl font-semibold">
          {aviso}
        </p>
      ) : (
        <BotaoSortear onClick={onSortear}>Sortear</BotaoSortear>
      )}
      <p className="text-base text-ink-muted">
        Atalhos: <Tecla>S</Tecla> sortear · <Tecla>D</Tecla> dica ·{" "}
        <Tecla>H</Tecla> histórico · <Tecla>F</Tecla> tela cheia
      </p>
    </Painel>
  );
}

// Animação neutra: não passa por nenhum tópico, para não sugerir resposta.
function Animacao() {
  return (
    <Painel className="flex flex-1 flex-col items-center justify-center gap-6">
      <p className="text-2xl font-semibold text-ink-muted">Sorteando…</p>
      <div className="animate-balanco flex aspect-square w-[clamp(160px,min(26vw,40dvh),340px)] items-center justify-center rounded-[13%] bg-ink text-on-tile">
        <span className="text-[clamp(5rem,10vw,9rem)] leading-none font-bold">
          ?
        </span>
      </div>
    </Painel>
  );
}

// O tópico (e o id, que carrega o prefixo do tópico) nunca aparece aqui:
// só no histórico.
function CardExibido({
  card,
  ordem,
  dicasReveladas,
}: {
  card: Card;
  ordem?: number;
  dicasReveladas: number;
}) {
  return (
    <Painel className="animate-pulo flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="m-auto flex w-full max-w-5xl flex-col gap-4 xl:gap-6">
        <div className="flex flex-wrap items-center gap-3">
          {ordem !== undefined && (
            <Pilula>Nº {formatarOrdem(ordem)}</Pilula>
          )}
          {card.tipo === "problema" && (
            <span className="rounded-full border-2 border-ink bg-ink px-3.5 py-2 leading-none font-semibold tracking-widest text-on-tile">
              PROBLEMA
            </span>
          )}
        </div>

        <p className="text-[clamp(1.375rem,min(2.8vw,5dvh),3.25rem)] leading-tight font-semibold">
          {card.descricao}
        </p>

        <ol className="flex flex-col gap-2 xl:gap-3">
          {card.dicas.map((dica, i) =>
            i < dicasReveladas ? (
              <li
                key={i}
                className="animate-surgir flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-2xl bg-app px-5 py-3 text-[clamp(1.0625rem,min(1.8vw,3dvh),1.875rem)] leading-snug"
              >
                <span className="font-bold">Dica {i + 1}</span>
                <span className="min-w-0 flex-1">{dica}</span>
              </li>
            ) : (
              <li
                key={i}
                className="rounded-2xl border-2 border-dashed border-ink/40 px-5 py-3 text-[clamp(1.0625rem,min(1.8vw,3dvh),1.875rem)] text-ink-muted"
              >
                Dica {i + 1}
              </li>
            ),
          )}
        </ol>
      </div>
    </Painel>
  );
}

// --- Painéis -------------------------------------------------------------

// Legenda neutra dos tópicos da cartela: não indica quais já saíram.
// A partir de lg (projetor), a grade 3×4 é dimensionada pela altura da tela
// para ficar o maior possível sem rolagem: 250px é o que sobra de cabeçalho,
// título e espaçamentos; 14vw garante espaço para o card ao lado.
function PainelTopicos() {
  return (
    <Painel className="lg:p-5">
      <h2 className="mb-4 text-2xl font-bold">Tópicos da cartela</h2>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-[repeat(3,var(--lado))] lg:[--lado:clamp(88px,calc((100dvh-250px)/4),14vw)]">
        {topicos.map((t) => (
          <li key={t.key}>
            <TopicTile topico={t.key} />
          </li>
        ))}
        <li title="O coringa é o espaço livre da cartela e não é sorteado.">
          <CoringaTile />
          <span className="sr-only">espaço livre, não é sorteado</span>
        </li>
      </ul>
    </Painel>
  );
}

function PainelHistorico({
  estado,
  onReabrir,
  onFechar,
  bloqueado,
}: {
  estado: Estado;
  onReabrir: (id: string) => void;
  onFechar: () => void;
  bloqueado: boolean;
}) {
  const lista = [...estado.historico].reverse();
  return (
    <div className="fixed inset-0 z-10 flex justify-end bg-ink/50" onClick={onFechar}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-historico"
        className="flex h-full w-full max-w-md flex-col border-l-[3px] border-ink bg-surface"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink px-6 py-4">
          <h2 id="titulo-historico" className="text-2xl font-bold">
            Cards sorteados ({estado.historico.length})
          </h2>
          <BotaoFechar onClick={onFechar} rotulo="Fechar histórico" />
        </div>
        {lista.length === 0 ? (
          <p className="p-6 text-lg text-ink-muted">
            Nenhum card sorteado ainda.
          </p>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {lista.map((r) => {
              const ativo = r.id === estado.atualId;
              const topico = topicoDe(r.categoria);
              return (
                <li key={r.ordem} className="border-b-2 border-app">
                  <button
                    type="button"
                    onClick={() => onReabrir(r.id)}
                    disabled={bloqueado}
                    className={`flex w-full gap-4 px-6 py-4 text-left transition hover:bg-app disabled:opacity-60 ${
                      ativo ? "bg-app" : ""
                    }`}
                    title="Reabrir este card"
                  >
                    {topico ? (
                      <span
                        className="flex size-12 shrink-0 items-center justify-center rounded-[13%] text-on-tile"
                        style={{ backgroundColor: topico.color }}
                      >
                        <IconeTopico topico={topico.key} className="size-6" />
                      </span>
                    ) : (
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-[13%] border-[3px] border-dashed border-ink text-xl font-bold">
                        ?
                      </span>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-baseline gap-2 text-base">
                        <span className="font-bold tabular-nums">
                          Nº {formatarOrdem(r.ordem)}
                        </span>
                        <span className="text-ink-muted">{r.id}</span>
                        <span className="ml-auto text-ink-muted tabular-nums">
                          {formatarHora(r.horario)}
                        </span>
                      </span>
                      <span className="font-semibold">
                        {rotuloCategoria(r.categoria)}
                      </span>
                      <span className="line-clamp-2 text-ink-muted">
                        {r.descricao}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}

function PainelFiltros({
  estado,
  onFechar,
}: {
  estado: Estado;
  onFechar: () => void;
}) {
  const ativas = new Set(estado.categoriasAtivas);

  function alternarCategoria(id: string) {
    atualizar((s) => ({
      ...s,
      categoriasAtivas: s.categoriasAtivas.includes(id)
        ? s.categoriasAtivas.filter((c) => c !== id)
        : [...s.categoriasAtivas, id],
    }));
  }

  function definirTodas(marcar: boolean) {
    atualizar((s) => ({
      ...s,
      categoriasAtivas: marcar ? categorias.map((c) => c.id) : [],
    }));
  }

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-ink/50 p-4"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-filtros"
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-surface"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink px-6 py-4">
          <h2 id="titulo-filtros" className="text-2xl font-bold">
            Filtros do sorteio
          </h2>
          <BotaoFechar onClick={onFechar} rotulo="Fechar filtros" />
        </div>
        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-5">
          <section>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h3 className="mr-auto text-lg font-semibold">
                Sortear somente destes tópicos
              </h3>
              <BotaoSecundario onClick={() => definirTodas(true)}>
                Marcar todos
              </BotaoSecundario>
              <BotaoSecundario onClick={() => definirTodas(false)}>
                Desmarcar todos
              </BotaoSecundario>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {categorias.map((cat) => {
                const topico = topicoDe(cat.id);
                const daCategoria = cards.filter(
                  (c) =>
                    c.categoria === cat.id &&
                    !(estado.ignorarDuplicados && c.duplicado_de),
                );
                return (
                  <li key={cat.id}>
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl bg-app px-4 py-2.5 text-lg">
                      <input
                        type="checkbox"
                        checked={ativas.has(cat.id)}
                        onChange={() => alternarCategoria(cat.id)}
                        className="size-5 shrink-0 accent-ink"
                      />
                      {topico && (
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-[13%] text-on-tile"
                          style={{ backgroundColor: topico.color }}
                        >
                          <IconeTopico topico={topico.key} className="size-5" />
                        </span>
                      )}
                      <span className="mr-auto leading-tight">
                        {topico?.label ?? cat.nome}
                      </span>
                      {/* Só o total: mostrar quantos restam revelaria os tópicos sorteados. */}
                      <span
                        className="text-base text-ink-muted tabular-nums"
                        title="Total de cards do tópico"
                      >
                        {daCategoria.length}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
          {duplicados.length > 0 && (
            <label className="flex min-h-14 cursor-pointer flex-wrap items-center gap-3 rounded-2xl bg-app px-4 py-2.5 text-lg">
              <input
                type="checkbox"
                checked={estado.ignorarDuplicados}
                onChange={(ev) =>
                  atualizar((s) => ({
                    ...s,
                    ignorarDuplicados: ev.target.checked,
                  }))
                }
                className="size-5 shrink-0 accent-ink"
              />
              Ignorar cards duplicados
              <span className="text-base text-ink-muted">
                ({duplicados.join(", ")})
              </span>
            </label>
          )}
        </div>
        <div className="flex justify-end border-t-[3px] border-ink px-6 py-4">
          <BotaoSortear onClick={onFechar} compacto>
            Concluir
          </BotaoSortear>
        </div>
      </div>
    </div>
  );
}

// --- Elementos básicos ---------------------------------------------------

function Painel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border-[3px] border-ink bg-surface p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function Pilula({
  children,
  titulo,
}: {
  children: ReactNode;
  titulo?: string;
}) {
  return (
    <span
      className="rounded-full border-2 border-ink bg-surface px-3.5 py-2 leading-none font-semibold tabular-nums"
      title={titulo}
    >
      {children}
    </span>
  );
}

function BotaoSortear({
  children,
  onClick,
  disabled,
  compacto,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  compacto?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // Borda inferior sólida (sem desfoque) dá volume de botão físico;
      // ao pressionar, o botão "afunda" sobre ela.
      className={`flex items-center gap-3 rounded-full bg-ink font-semibold text-on-tile transition-[transform,box-shadow,background-color] duration-100 enabled:hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40 ${
        compacto
          ? "min-h-11 px-6 text-lg shadow-[0_4px_0_var(--ink-muted)] enabled:active:translate-y-1 enabled:active:shadow-none"
          : "min-h-14 px-6 py-2 text-xl shadow-[0_6px_0_var(--ink-muted)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_0_var(--ink-muted)] enabled:active:translate-y-1.5 enabled:active:shadow-none xl:min-h-16 xl:px-9 xl:py-3 xl:text-[clamp(1.375rem,2.2vw,2rem)]"
      }`}
    >
      {!compacto && <IconeDado className="size-[1.2em] shrink-0" />}
      <span>{children}</span>
      {/* Abaixo de xl a coluna do card é estreita: a tecla some para os botões caberem numa linha. */}
      {!compacto && !disabled && (
        <span className="hidden xl:contents">
          <Tecla>S</Tecla>
        </span>
      )}
    </button>
  );
}

function IconeDado({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" strokeWidth="3" />
    </svg>
  );
}

function BotaoSecundario({
  children,
  onClick,
  disabled,
  ativo,
  atalho,
  grande,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ativo?: boolean;
  atalho?: string;
  grande?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ativo}
      className={`flex items-center gap-3 rounded-full border-2 border-ink font-semibold transition enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        ativo
          ? "bg-ink text-on-tile"
          : "bg-surface text-ink enabled:hover:bg-app"
      } ${grande ? "min-h-14 px-5 text-lg xl:px-6 xl:text-xl" : "min-h-11 px-4 text-base"}`}
    >
      <span>{children}</span>
      {atalho && (
        <span className="hidden xl:contents">
          <Tecla>{atalho}</Tecla>
        </span>
      )}
    </button>
  );
}

function BotaoFechar({
  onClick,
  rotulo,
}: {
  onClick: () => void;
  rotulo: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink text-2xl leading-none hover:bg-app"
    >
      ×
    </button>
  );
}

function Tecla({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border-2 border-current px-1.5 py-0.5 text-sm leading-none font-semibold opacity-70">
      {children}
    </kbd>
  );
}
