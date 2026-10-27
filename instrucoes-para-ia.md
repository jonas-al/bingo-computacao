# Especificação – Software de Sorteio de Cards (aula de Computação)

## Objetivo
Criar um software para ser projetado na sala de aula que **sorteia um card**, mostra a **descrição** (situação ou problema) e permite revelar as **dicas** uma a uma. Os alunos tentam adivinhar a **categoria** do card (a resposta).

## Dados
Todo o conteúdo está em `cards.json` (76 cards, 11 categorias). Não invente nem altere textos; use o arquivo como fonte única.

Estrutura de cada card:
```json
{
  "id": "REDES-03",
  "categoria": "redes",          // id da categoria (ver lista "categorias")
  "cor": "rosa",                 // moldura do card: azul | amarelo | laranja | rosa (hex em "cores")
  "tipo": "problema",            // "problema" (mostrar selo PROBLEMA) ou "situacao"
  "descricao": "Rompimento de um cabo submarino...",
  "dicas": ["...", "...", "..."], // 1 a 3 dicas
  "duplicado_de": "SW-01"        // opcional: card repetido no PDF original
}
```

## Fluxo sugerido
1. Tela inicial com botão **Sortear**.
2. Ao sortear: animação curta, depois exibir o card com selo "PROBLEMA" quando `tipo = problema`, e a descrição. A categoria fica **oculta**.

## Visual
**Não é preciso reproduzir o visual dos cartões originais.** O design é livre; o campo `cor` pode ser usado ou ignorado. A prioridade é legibilidade no projetor.
3. Botão **Próxima dica**: revela uma dica por vez.
4. Botão **Revelar resposta**: mostra o nome da categoria (`categorias[].nome`).
5. Cards já sorteados não se repetem até reiniciar; mostrar contador (ex.: 12/76).

## Registro dos cards sorteados (obrigatório)
O software deve manter um **registro de todos os cards já sorteados** na sessão:
- Guardar, para cada sorteio: ordem, `id`, categoria, descrição e horário.
- Exibir esse histórico em uma lista ou painel acessível durante a aula, permitindo reabrir um card já sorteado.
- O registro deve **persistir** se a página for recarregada ou fechada por engano (ex.: `localStorage`), sendo apagado apenas pelo botão "Reiniciar sorteio", com confirmação.
- O sorteio usa esse registro para nunca repetir um card até o reinício.

## Recursos desejáveis
- Filtro por categoria (sortear só de algumas).
- Opção de ignorar cards com `duplicado_de`.
- Texto grande e alto contraste (uso em projetor), funcionando em tela cheia.
- Botão "Reiniciar sorteio".
- Funcionar offline, de preferência como uma única página HTML.

## Observações sobre os dados
- `SW-05` é cópia exata de `SW-01` (repetido no PDF).
- Alguns cards de categorias iguais compartilham as mesmas dicas (ex.: `REDES-01`/`REDES-05`, `INVEST-01`/`INVEST-03`, `CYBERBULLYING-01`/`02`).
- Pequenos erros de digitação do PDF foram corrigidos (ex.: "ocódigo", "cm servidores", "residencia", "Requer testes minuciosos retificar").
