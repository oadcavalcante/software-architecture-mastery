---
id: pagination
title: Paginação
sidebar_position: 14
description: Entregar resultado em partes — e por que offset quebra em escala.
doc_type: concept
level: 3
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor escolhe entre paginação por deslocamento e por cursor a
  partir do volume e da estabilidade do conjunto.
prerequisites: [apis]
related: [apis, search, database-scaling]
canonical_for: [paginação, cursor, offset]
content_version: 1
last_reviewed: 2026-08-27
---

# Paginação

## Visão Geral

Paginação entrega um conjunto grande de resultados em partes.

A decisão parece trivial e tem duas consequências que aparecem tarde: **desempenho
em página profunda** e **consistência quando o conjunto muda durante a leitura**.

## Problema

Devolver tudo não funciona: consome memória do servidor, banda, e o cliente
raramente precisa de tudo.

A solução óbvia é `LIMIT 20 OFFSET 40`. Ela funciona nas primeiras páginas e falha
de duas formas.

**Desempenho degrada com a profundidade.** `OFFSET 100000` faz o banco percorrer e
descartar 100 mil linhas antes de devolver 20. O custo cresce linearmente com a
página, e a última página é a mais cara.

**O conjunto se move.** Se um registro é inserido entre a leitura da página 1 e da
página 2, tudo desloca. O usuário vê um item repetido, ou nunca vê um item que
existia — e isso é silencioso.

Para uma tela de listagem com poucas páginas, nada disso importa. Para exportação,
sincronização ou conjuntos grandes, importa muito.

## Conceitos Centrais

### Deslocamento versus cursor

| | Deslocamento (`OFFSET`) | Cursor (chave) |
|---|---|---|
| Pular para página N | Direto | Impossível |
| Custo da página N | Cresce com N | Constante |
| Conjunto mudando | Itens repetidos ou pulados | Estável |
| Total de páginas | Calculável | Normalmente não |
| Complexidade | Trivial | Exige ordenação estável |

**Cursor** funciona guardando a posição pela chave, não pela contagem:

```text
página 1:  ... ORDER BY criado_em, id LIMIT 20
           → último item: (2026-03-14 10:22, id=8891)

página 2:  ... WHERE (criado_em, id) > ('2026-03-14 10:22', 8891)
           ORDER BY criado_em, id LIMIT 20
```

O banco usa o índice para posicionar diretamente. O custo é o mesmo na página 2 e
na página 5000.

### A ordenação precisa ser estável e total

Cursor exige que a ordenação seja **determinística**. Ordenar só por `criado_em`
falha se dois registros têm o mesmo instante — a posição fica ambígua e itens são
pulados ou repetidos.

A correção é sempre incluir um desempate único: `ORDER BY criado_em, id`. O `id`
garante ordem total.

Isso vale para deslocamento também, e é uma causa comum de "item aparece duas
vezes" que ninguém consegue reproduzir.

### O cursor é opaco

O cursor devolvido ao cliente deve ser tratado como opaco — tipicamente uma
codificação da chave. Isso permite mudar a estratégia interna sem quebrar
consumidores, e evita que alguém construa cursores à mão.

### Contagem total é cara

`COUNT(*)` sobre o conjunto filtrado percorre tudo. Numa tabela grande, custa mais
que a página em si.

Três saídas: não devolver total; devolver estimativa; ou devolver apenas se há
próxima página — buscando N+1 itens e devolvendo N.

A terceira resolve a maior parte das interfaces, porque o que elas precisam é
habilitar ou desabilitar o botão "próxima".

## Modelo Mental

**Deslocamento responde "me dê a página 5". Cursor responde "me dê o que vem
depois disto".** A segunda é a pergunta que sistemas grandes de fato fazem.

## Quando Usar

**Deslocamento** quando:
- O conjunto é pequeno — algumas centenas.
- O usuário precisa pular para uma página específica.
- O conjunto é estável durante a navegação.
- Simplicidade importa mais que escala.

**Cursor** quando:
- O conjunto é grande.
- Há inserção concorrente.
- O consumo é sequencial — exportação, sincronização, rolagem infinita.
- Consistência entre páginas importa.

## Quando Não Usar

**Paginar quando o conjunto é pequeno e fixo.** Devolver 50 itens de uma vez é
mais simples para todos.

**Cursor quando o usuário precisa navegar por número de página.** Ele não suporta
salto arbitrário; forçar isso produz gambiarra.

**Deslocamento em exportação de volume alto.** É onde a degradação é garantida.

**Devolver total quando ninguém usa.** Custo sem benefício.

## Alternativas

- **Rolagem infinita com cursor** — o padrão em interfaces modernas.
- **Filtro em vez de paginação** — se o usuário está paginando até a página 40 para
  achar algo, o que falta é busca.
- **Exportação assíncrona** — para conjuntos muito grandes, gerar um arquivo em
  background é melhor que paginar. Ver
  [processamento em background](background-processing.md).
- **Fluxo** — devolver resultados continuamente, quando o protocolo permite.

## Trade-offs

| Deslocamento | Cursor |
|---|---|
| Salto para qualquer página | Só sequencial |
| Total de páginas disponível | Normalmente não |
| Degrada com a profundidade | Custo constante |
| Instável sob concorrência | Estável |
| Trivial de implementar | Exige ordenação total |

## Modos de Falha

**Página profunda travando o banco.** Uma exportação percorrendo até a página
50000.

**Item repetido ou pulado.** Ordenação não determinística, ou inserção concorrente
com deslocamento.

**Cursor quebrado por mudança de ordenação.** Cursores antigos deixam de fazer
sentido.

**Contagem total dominando o custo.** A consulta da página é rápida e o `COUNT`
não.

**Sem limite máximo.** Um cliente pede 100 mil itens por página.

## Erros Comuns

**Não incluir desempate único na ordenação.** É a causa mais comum de itens
repetidos.

**Usar deslocamento para exportação.**

**Devolver total sem necessidade.**

**Não impor limite máximo de tamanho de página.**

**Expor a estrutura do cursor.** Impede mudar a estratégia depois.

## Exemplo Real

Uma API de pedidos usava `page` e `size`, com `COUNT` total em cada resposta.

Dois clientes causaram problemas diferentes.

**Um integrador** sincronizava todos os pedidos diariamente, paginando até o fim.
Com 2 milhões de pedidos, as últimas páginas levavam 40 segundos cada, e a
sincronização inteira ocupava o banco por horas. O `OFFSET` alto era o custo
dominante.

**A tela de listagem** mostrava pedidos repetidos ocasionalmente. Ninguém
conseguia reproduzir. A causa: a ordenação era só por `data_pedido`, e pedidos
criados no mesmo segundo tinham ordem indefinida entre consultas.

As correções, separadas por caso de uso.

A tela manteve deslocamento — são poucas páginas e o usuário quer pular. Ganhou
desempate por `id` na ordenação, o que eliminou a repetição. E o `COUNT` virou
estimativa, com o número exato só quando o filtro reduz muito o conjunto.

A sincronização ganhou um endpoint próprio, com cursor. A sincronização diária
caiu de horas para 4 minutos, com custo constante por página.

A leitura que a equipe faz: os dois casos de uso pareciam a mesma coisa — "listar
pedidos" — e tinham requisitos incompatíveis. Tentar servir aos dois com um
endpoint foi o erro original.

## Detalhes de implementação do cursor

Cursor parece simples e tem três detalhes que decidem se funciona.

**A ordenação precisa bater com o índice.** `ORDER BY criado_em, id` só é eficiente
se existir índice composto nessa ordem exata. Sem ele, o banco ordena o conjunto
inteiro a cada página — que é o problema que o cursor deveria evitar.

**A comparação precisa ser de tupla.** Comparar campo a campo com `OR` produz
resultado correto e plano de execução ruim:

```text
❌ WHERE criado_em > :d OR (criado_em = :d AND id > :i)
✅ WHERE (criado_em, id) > (:d, :i)
```

A segunda forma permite ao banco usar o índice composto diretamente. Nem todos os
bancos suportam comparação de tupla, e onde não suportam a primeira forma é
inevitável — vale conferir o plano.

**O cursor precisa ser versionado.** Se a ordenação mudar, cursores emitidos antes
deixam de fazer sentido. Codificar uma versão junto permite detectar e rejeitar
com erro claro, em vez de devolver resultado silenciosamente errado.

Um quarto detalhe, para ordenação decrescente: a comparação inverte para `<`, e
esquecer isso produz uma paginação que devolve sempre a mesma página — um defeito
que passa em teste com poucos registros.

## Conceitos Relacionados

- [APIs](apis.md) — paginação é parte do contrato.
- [Busca](search.md) — quando paginar não é a resposta.
- [Processamento em Background](background-processing.md) — para exportação
  grande.
- [Escalabilidade](../11-scalability/index.md).

## Exercício Prático

Encontre no seu sistema uma listagem paginada e verifique a ordenação: ela é
determinística? Existe desempate único?

Depois meça o tempo da primeira e da última página. Se a diferença for grande,
você tem deslocamento onde deveria ter cursor.

## Perguntas de Entrevista

- Por que `OFFSET` degrada com a profundidade?
- Que problema o cursor resolve além do desempenho?
- Por que a ordenação precisa ter desempate único?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Documentação de paginação por cursor de APIs públicas maduras — as de Stripe e
  GitHub são referências úteis.
