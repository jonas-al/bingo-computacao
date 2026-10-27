# Sorteio de Cards – Computação

Software para projetar em sala de aula: sorteia um card, mostra a situação/problema, revela as dicas uma a uma e, por fim, a categoria (a resposta).

Todo o conteúdo vem de [`cards.json`](cards.json).

## Como usar

```bash
npm install
npm run build
npm start        # http://localhost:3000
```

Para desenvolvimento: `npm run dev`.

Depois de carregada, a página funciona sem internet.

## Funcionalidades

- **Sortear**: animação curta e exibição do card (com selo PROBLEMA quando for o caso).
- **Próxima dica**: revela uma dica por vez.
- **O tópico de um card nunca aparece na tela de sorteio.** Os alunos marcam a cartela sem confirmação; os tópicos sorteados só são conferidos quando alguém fala que completou o bingo, abrindo o histórico.
- Cards sorteados não se repetem até reiniciar; contador `sorteados/total` do filtro atual.
- **Histórico** (fica oculto; abre pelo botão ou pela tecla `H`): ordem, id, tópico, descrição e horário de cada sorteio; clique para reabrir um card.
- O histórico, o card atual e os filtros ficam salvos no `localStorage` e sobrevivem a recarregar/fechar a página. Só são apagados por **Reiniciar sorteio** (com confirmação).
- **Filtros**: sortear só de algumas categorias e ignorar cards duplicados (`duplicado_de`).
- **Tela cheia** e atalhos de teclado: `S` sortear · `D` dica · `H` histórico · `F` tela cheia · `Esc` fecha painéis.

## Código

- [`app/sorteio.tsx`](app/sorteio.tsx) – interface e lógica do sorteio.
- [`app/lib/estado.ts`](app/lib/estado.ts) – estado persistido no `localStorage`.
- [`app/lib/dados.ts`](app/lib/dados.ts) – leitura e tipos de `cards.json`.
- [`app/lib/topicos.ts`](app/lib/topicos.ts) – cores e nomes dos 11 tópicos das cartelas (fonte única) e mapeamento das categorias de `cards.json`.
- [`app/topic-tile.tsx`](app/topic-tile.tsx) – ícones SVG e o quadrado de tópico (`TopicTile`), igual ao das cartelas.

O visual segue [`especificacao-design-sorteio-bingo.md`](especificacao-design-sorteio-bingo.md).
