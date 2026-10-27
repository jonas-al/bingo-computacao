# Especificação de design — Software de sorteio do Bingo de Tópicos

## Objetivo

Alinhar o visual do software de sorteio ao design das cartelas de bingo impressas (cartelas 3x3 por tópico). Quem joga deve reconhecer na tela, imediatamente, o mesmo quadrado colorido + ícone + nome que está na sua cartela.

**Regra principal:** cada tópico tem UMA cor e UM ícone fixos. Use exatamente as cores e os SVGs desta especificação — não substitua por outra biblioteca de ícones, não altere tons e não use emojis.

Esta especificação descreve apenas o design. Não altere a lógica de sorteio existente, exceto onde indicado em "Comportamento".

---

## 1. Tokens de design

### 1.1 Cores base

| Token | Valor | Uso |
|---|---|---|
| `--bg-app` | `#F4F1EA` | Fundo geral da aplicação (bege claro) |
| `--surface` | `#FFFFFF` | Cartões/painéis |
| `--ink` | `#1F1D2B` | Texto principal, bordas, fundo do coringa |
| `--ink-muted` | `#5A5766` | Texto secundário |
| `--on-tile` | `#FFFFFF` | Texto e ícones sobre os quadrados coloridos |
| `--star` | `#F5C542` | Estrela do coringa |

### 1.2 Cores dos tópicos

| Chave | Tópico (texto exato) | Cor |
|---|---|---|
| `db` | Banco de dados | `#1E6FB8` (azul) |
| `bug` | Bug/Erro | `#C62F2F` (vermelho) |
| `ask` | Investigação/Diagnóstico | `#2E8B4E` (verde) |
| `algo` | Algoritmo | `#B4540A` (laranja) |
| `sec` | Cybersegurança | `#1F3A5F` (azul-marinho) |
| `ihc` | IHC | `#7B4FC9` (roxo) |
| `ia` | IA | `#0B7A7A` (verde-petróleo) |
| `net` | Redes | `#8A6D00` (mostarda) |
| `hw` | Hardware e Componentes | `#5D6470` (cinza) |
| `sw` | Software em geral | `#A3367A` (magenta) |
| `bully` | Cyberbullying | `#6D4C41` (marrom) |
| `star` | Coringa | fundo `#1F1D2B`, estrela `#F5C542` |

Todas as cores de tópico têm contraste suficiente com texto branco. Não clareie esses tons.

### 1.3 Tipografia

- Fonte: **Fredoka** (Google Fonts), pesos 500, 600 e 700.
  `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">`
- Fallback: `system-ui, sans-serif`.
- Escala:
  - Título "BINGO": 700, `letter-spacing` ~0.13em, `line-height: 1`
  - Nome do tópico sorteado (destaque): 600–700, grande (ex.: 40–64 px conforme a tela)
  - Nome do tópico em quadrados pequenos: 600, 12–14 px, `line-height: 1.15`
  - Texto de interface: 500

### 1.4 Formas e espaçamento

- Painéis/cartões: fundo branco, borda `3px solid #1F1D2B`, `border-radius: 24px`, padding 24 px.
- Quadrados de tópico: `border-radius` ≈ 13% do lado (14 px num quadrado de 110 px; 64 px num de 512 px).
- Selos/pílulas (ex.: "Nº 01", contador): borda `2px solid #1F1D2B`, `border-radius: 999px`, padding `8px 14px`, peso 600.
- Espaçamento entre quadrados: ~9% do lado (10 px em quadrados de 110 px).
- Visual chapado: **sem gradientes, sem sombras fortes, sem brilhos.** Cores sólidas e contornos escuros.

---

## 2. Componente principal: Quadrado de Tópico (`TopicTile`)

É o mesmo quadrado da cartela. Use-o em todos os lugares onde um tópico aparece.

Estrutura:
- Quadrado com fundo na cor do tópico.
- Conteúdo centralizado na vertical e na horizontal, em coluna: **ícone em cima, nome embaixo**.
- Ícone branco em traço (stroke), com cerca de 30% do lado do quadrado.
- Nome em branco, centralizado, com quebra de linha permitida (`overflow-wrap: anywhere`; o texto nunca pode sair do quadrado).
- "Investigação/Diagnóstico" quebra a linha depois da barra: `Investigação/` + `Diagnóstico`.

Tamanhos:
- `sm`: 64–80 px (histórico, lista de tópicos)
- `md`: 110–160 px
- `lg`: 280–420 px (tópico recém-sorteado)

Estados:
- **Normal:** como descrito acima.
- **Já sorteado (no painel de tópicos):** opacidade 100%, com um selo de check branco no canto ou a borda `#1F1D2B` de 3 px.
- **Ainda não sorteado (no painel de tópicos):** opacidade ~35% ou versão em contorno (fundo branco, borda e ícone na cor do tópico). Não use só a cor para indicar o estado: inclua o check ou um texto.

Coringa: fundo `#1F1D2B`, estrela amarela preenchida `#F5C542`, texto "Coringa". O coringa **não entra no sorteio** (é o espaço livre central das cartelas). Pode aparecer na legenda ou na tela de regras.

---

## 3. Ícones (SVG)

Todos usam `viewBox="0 0 24 24"`. Atributos padrão para os ícones de tópico:

```
fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
```

Use `color: #FFFFFF` sobre o quadrado colorido, ou `color: <cor do tópico>` sobre fundo branco.

```html
<!-- db: Banco de dados -->
<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>

<!-- bug: Bug/Erro -->
<path d="M8 2l1.9 1.9"/><path d="M14.1 3.9L16 2"/><path d="M9 7.1V6a3 3 0 1 1 6 0v1.1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.5 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M21 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>

<!-- ask: Investigação/Diagnóstico -->
<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>

<!-- algo: Algoritmo -->
<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"/><path d="M12 13v2"/>

<!-- sec: Cybersegurança -->
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11"/>

<!-- ihc: IHC -->
<path d="M4 4l7 17 2.5-7.5L21 11z"/><path d="M14 14l6 6"/>

<!-- ia: IA -->
<path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8z"/><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/>

<!-- net: Redes -->
<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V12"/><path d="M12 12l-5.3 5"/><path d="M12 12l5.3 5"/><path d="M7.5 19h9"/>

<!-- hw: Hardware e Componentes -->
<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>

<!-- sw: Software em geral -->
<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><path d="M9.5 11.5L7 14l2.5 2.5"/><path d="M14.5 11.5L17 14l-2.5 2.5"/>

<!-- bully: Cyberbullying -->
<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
```

Coringa (preenchido, não em traço):

```html
<svg viewBox="0 0 24 24" fill="#F5C542" stroke="#F5C542" stroke-width="1.5" stroke-linejoin="round">
  <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>
</svg>
```

Os mesmos ícones também existem em PNG de 512×512 (`icones-bingo.zip`, nas versões `com-fundo` e `sem-fundo`), se o projeto preferir imagens.

---

## 4. Fonte única dos dados dos tópicos

Centralize os tópicos num único arquivo/constante e gere toda a interface a partir dele:

```json
[
  { "key": "db",    "label": "Banco de dados",           "color": "#1E6FB8" },
  { "key": "bug",   "label": "Bug/Erro",                 "color": "#C62F2F" },
  { "key": "ask",   "label": "Investigação/Diagnóstico", "color": "#2E8B4E" },
  { "key": "algo",  "label": "Algoritmo",                "color": "#B4540A" },
  { "key": "sec",   "label": "Cybersegurança",           "color": "#1F3A5F" },
  { "key": "ihc",   "label": "IHC",                      "color": "#7B4FC9" },
  { "key": "ia",    "label": "IA",                       "color": "#0B7A7A" },
  { "key": "net",   "label": "Redes",                    "color": "#8A6D00" },
  { "key": "hw",    "label": "Hardware e Componentes",   "color": "#5D6470" },
  { "key": "sw",    "label": "Software em geral",        "color": "#A3367A" },
  { "key": "bully", "label": "Cyberbullying",            "color": "#6D4C41" }
]
```

O ícone de cada tópico é escolhido pela `key` (seção 3).

---

## 5. Layout das telas

### 5.1 Tela de sorteio (principal)

- Fundo `#F4F1EA`.
- **Cabeçalho:** "BINGO" (Fredoka 700, `#1F1D2B`) à esquerda; à direita, uma pílula com o contador "Sorteados: X/11".
- **Centro — último tópico sorteado:** `TopicTile` tamanho `lg`, com o nome em destaque. Antes do primeiro sorteio, mostre um quadrado vazio (fundo branco, borda tracejada `#1F1D2B`) com o texto "Clique em Sortear".
- **Botão "Sortear":** fundo `#1F1D2B`, texto branco Fredoka 600, `border-radius: 999px`, altura mínima de 56 px. Hover: fundo `#33303F`. Foco visível: contorno `3px` em `#F5C542` com `outline-offset: 3px`. Use um `<button>` de verdade.
- **Painel "Tópicos":** grade com os 11 `TopicTile` tamanho `sm`/`md`, na ordem da seção 4, mostrando quais já saíram (estados da seção 2).
- **Histórico:** fileira com os sorteados em ordem, do mais recente ao mais antigo, em tamanho `sm`.
- **Botão "Reiniciar":** secundário (fundo branco, borda `2px #1F1D2B`, texto `#1F1D2B`, pílula).

### 5.2 Responsividade

- Telão/projetor (≥1280 px): tópico sorteado à esquerda e grande; painel de tópicos e histórico à direita.
- Notebook/tablet: tudo em coluna, com o sorteado no topo.
- Celular: o painel de tópicos vira uma grade de 3 colunas. Não pode haver rolagem horizontal.

---

## 6. Comportamento visual

- **Sorteio:** ao clicar em "Sortear", faça uma animação curta (≤1,5 s) alternando rapidamente entre quadrados de tópicos, terminando no sorteado com um leve "pulo" de escala (1 → 1,06 → 1). Respeite `prefers-reduced-motion`: nesse caso, mostre o resultado direto, sem animação.
- **Sem repetição:** um tópico já sorteado não sai de novo até reiniciar. Quando os 11 saírem, desabilite "Sortear" e mostre "Todos os tópicos foram sorteados".
- O coringa nunca é sorteado.

---

## 7. Acessibilidade

- O texto branco sobre as cores de tópico já tem contraste adequado. Não troque por tons mais claros.
- O estado "sorteado" / "não sorteado" deve ter um indicador além da cor (check ou texto).
- Anuncie o tópico sorteado para leitores de tela com uma região `aria-live="polite"` ("Tópico sorteado: Redes").
- SVGs decorativos dentro do quadrado (o nome já aparece em texto): `aria-hidden="true"`.
- Botões com área de toque mínima de 44 px.

---

## 8. O que NÃO fazer

- Não usar emojis no lugar dos ícones.
- Não usar gradientes, sombras fortes, *glassmorphism* ou neon.
- Não mudar os nomes dos tópicos (copie exatamente da seção 4, com acentos).
- Não inventar cores novas para os tópicos nem reaproveitar a mesma cor em dois tópicos.
- Não colocar o texto fora do quadrado: ele quebra a linha dentro dele.

---

## 9. Checklist de aceite

- [ ] Fonte Fredoka carregada e aplicada em toda a interface
- [ ] Fundo `#F4F1EA`; painéis brancos com borda escura de 3 px e cantos arredondados
- [ ] 11 tópicos com as cores e os ícones exatos desta especificação
- [ ] O quadrado do tópico é igual ao da cartela (ícone em cima, nome embaixo, texto branco)
- [ ] O coringa não participa do sorteio
- [ ] Sem repetição até reiniciar; contador "X/11"
- [ ] Funciona em telão e no celular, sem rolagem horizontal
- [ ] Animação respeita `prefers-reduced-motion`; resultado anunciado com `aria-live`
