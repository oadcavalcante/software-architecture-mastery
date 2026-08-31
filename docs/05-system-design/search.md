---
id: search
title: Busca
sidebar_position: 15
description: Encontrar o que o usuário quer — e por que LIKE deixa de servir cedo.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor decide entre busca no banco e índice dedicado a partir do
  requisito real, e reconhece o custo de sincronizar um índice.
prerequisites: [pagination]
related: [caching, pagination, cqrs]
canonical_for: [busca, índice invertido, busca textual]
content_version: 1
last_reviewed: 2026-08-27
---

# Busca

## Visão Geral

Busca é encontrar registros a partir de um critério que o usuário fornece — e
raramente é uma consulta exata.

A diferença entre filtrar e buscar é o que decide a arquitetura: **filtrar é
comparar valores; buscar é ordenar por relevância**.

## Problema

A primeira implementação é sempre `WHERE nome LIKE '%termo%'`. Ela funciona com
poucos registros e falha de quatro formas previsíveis.

**Não usa índice.** O curinga à esquerda impede o uso de índice B-tree. A consulta
percorre a tabela inteira, e o custo cresce linearmente.

**Não tolera variação.** "São Paulo" não encontra "sao paulo"; "camiseta" não
encontra "camisetas"; um erro de digitação não encontra nada.

**Não ordena por relevância.** Um registro cujo título é exatamente o termo vem
misturado com outro que o menciona no meio de uma descrição.

**Não combina campos.** Buscar em título, descrição e etiquetas ao mesmo tempo,
com pesos diferentes, não cabe em `LIKE`.

Os quatro juntos são o que separa "filtro" de "busca". Muitos sistemas precisam
só do primeiro, e reconhecer isso evita adotar infraestrutura sem necessidade.

## Conceitos Centrais

### As opções, em ordem de custo

| Opção | Resolve | Custo |
|---|---|---|
| `LIKE` com curinga à direita | Prefixo, poucos registros | Nenhum; usa índice |
| Busca textual do banco | Tokenização, radicalização, relevância | Baixo; já existe |
| Índice invertido dedicado | Tudo, em escala | Alto: componente, sincronização |
| Busca vetorial | Semântica, similaridade | Alto, mais custo de embeddings |

A segunda linha é a mais subestimada. PostgreSQL, MySQL e outros têm busca textual
com tokenização, radicalização, ordenação por relevância e busca em múltiplos
campos. Para a maioria dos sistemas, ela basta — e não adiciona componente,
sincronização nem consistência eventual.

Pular direto para índice dedicado é o erro mais comum desta área.

### O índice invertido

O mecanismo por trás de qualquer busca séria: em vez de mapear documento →
palavras, mapeia **palavra → documentos**.

```text
"arquitetura" → [12, 45, 891, 1203]
"software"    → [12, 45, 77]
```

Buscar "arquitetura software" vira interseção de listas — operação rápida
independentemente do tamanho do acervo.

O que o índice faz antes de indexar decide a qualidade: separar em tokens,
normalizar acentos e caixa, reduzir à raiz — "correndo", "correu" e "correr" viram
o mesmo termo — e descartar palavras sem valor discriminante.

Sem essas etapas, a busca é literal e frustra.

### Relevância é o que diferencia

Encontrar é fácil; **ordenar** é o problema. Os fatores usuais: frequência do termo
no documento, raridade do termo no acervo, tamanho do documento, peso do campo, e
sinais de negócio — popularidade, recência, margem.

Os últimos são os que mais importam num sistema real e os que nenhum índice traz
pronto. Ajustar relevância é trabalho contínuo, orientado por dado de uso.

### O custo real é a sincronização

Adotar índice dedicado significa manter **duas cópias dos dados**. E isso traz
tudo que uma projeção traz: consistência eventual, reprocessamento, e a
possibilidade de divergência.

É [CQRS](/03-design-patterns/cqrs.md) de nível 3, com outro nome. As mesmas
perguntas se aplicam: quanto atraso é aceitável, e como reconstruir o índice do
zero quando ele corromper.

A capacidade de reindexar completamente não é opcional — é o que permite corrigir
qualquer divergência.

## Modelo Mental

**Se o usuário digita e espera relevância, é busca. Se ele seleciona e espera
correspondência, é filtro.** Filtro se resolve no banco.

## Quando Usar

**Busca textual do banco** quando:
- O acervo é de milhares a alguns milhões de registros.
- Os requisitos são tokenização, radicalização e relevância básica.
- Evitar mais um componente tem valor.

**Índice dedicado** quando:
- O acervo é grande e a latência de busca é requisito.
- Há necessidade de tolerância a erro de digitação, sugestão, agregação por
  faceta.
- A relevância precisa de ajuste fino com sinais de negócio.
- A carga de busca é alta o bastante para competir com a carga transacional.

## Quando Não Usar

**Índice dedicado quando o banco resolve.** É o erro dominante: um componente a
mais, sincronização, consistência eventual e reindexação, para um acervo de 50 mil
registros que a busca textual do banco atende em milissegundos.

**Busca quando o caso é filtro.** Se o usuário escolhe categoria e faixa de preço,
isso é `WHERE` com índice, não busca.

**Sem estratégia de reindexação.** Um índice que não pode ser reconstruído trava no
primeiro erro de sincronização.

**Sem medir relevância.** Um índice bem configurado com relevância ruim entrega
resultados que ninguém clica — e ninguém percebe sem medição.

## Alternativas

- **Filtro com índice** — quando o critério é exato.
- **Busca textual nativa do banco** — o meio-termo que resolve a maioria dos
  casos.
- **Serviço de busca gerenciado** — quando o índice se justifica e operar um
  cluster não.
- **Pré-computar sugestões** — para autocompletar, uma estrutura simples de
  prefixos costuma bastar.

## Trade-offs

| Índice dedicado | Busca no banco |
|---|---|
| Relevância ajustável, facetas, tolerância a erro | Recursos básicos |
| Carga de busca isolada da transacional | Compartilhada |
| Escala independente | Junto com o banco |
| Duas cópias e sincronização | Uma fonte |
| Consistência eventual | Imediata |
| Mais um componente a operar | Nenhum |

## Modos de Falha

**Índice divergente da fonte.** Um evento de atualização perdido, e o resultado
mostra dado que não existe mais.

**Reindexação impossível.** Sem um caminho para reconstruir, a divergência é
permanente.

**Relevância ruim.** Encontra tudo e ordena mal; o usuário não acha o que procura
e a métrica de negócio cai sem causa aparente.

**Índice como fonte de verdade.** Alguém passa a ler dados do índice em vez do
banco — e a consistência eventual vira inconsistência de negócio.

**Explosão de facetas.** Agregações sobre campos de alta cardinalidade consomem
memória do cluster.

## Erros Comuns

**Adotar índice dedicado sem tentar o banco primeiro.**

**Não planejar reindexação.**

**Não medir relevância.** A métrica útil é quantas buscas terminam sem clique.

**Confundir busca com filtro.**

**Sincronizar em tempo real quando o negócio aceita minutos.** Sincronização
síncrona acopla a escrita ao índice — se ele está fora, a escrita falha.

## Exemplo Real

Um marketplace de peças automotivas tinha busca com `LIKE` sobre 400 mil produtos.
Cada busca levava 3 segundos e percorria a tabela.

A proposta inicial foi adotar um cluster de busca dedicado.

A análise mudou o caminho. Os requisitos reais, levantados com o time de produto:
encontrar por nome e por código de peça, tolerar plural e acento, e ordenar
colocando peças em estoque primeiro.

Nada disso exigia cluster. A busca textual nativa do banco, com índice adequado e
uma função de relevância que somava o peso do estoque, atendeu integralmente. A
latência caiu para 40 ms.

Dezoito meses depois, o requisito mudou: busca por compatibilidade — "peças que
servem no modelo X, ano Y" — com facetas por marca, categoria e faixa de preço, e
sugestão para erro de digitação em código de peça.

Aí o índice dedicado se justificou, e foi adotado com duas decisões que a equipe
registrou.

A sincronização é por evento, assíncrona, com atraso aceito de até 30 segundos —
negociado com o negócio, porque estoque em tempo real no índice teria acoplado a
escrita a ele.

E existe um comando de reindexação completa, testado mensalmente. Ele já foi usado
duas vezes: uma após um defeito no consumidor de eventos, outra ao mudar o esquema
do índice.

A sequência importa: o banco resolveu por dezoito meses, e o índice entrou quando
o requisito o exigiu — não quando alguém achou que a busca merecia infraestrutura
própria.

## Conceitos Relacionados

- [Paginação](/05-system-design/pagination.md) — resultados de busca são paginados por cursor.
- [Cache](/05-system-design/caching.md) — buscas frequentes se beneficiam.
- [CQRS](/03-design-patterns/cqrs.md) — o índice é uma projeção de leitura.
- [Arquitetura de Dados](/07-data-architecture/index.md).

## Exercício Prático

Meça a busca do seu sistema: qual a latência no percentil 95? Quantas buscas
terminam sem nenhum clique?

A segunda métrica é a que diz se a relevância está funcionando, e quase ninguém a
tem.

## Perguntas de Entrevista

- Qual a diferença entre filtro e busca?
- Por que `LIKE '%termo%'` não usa índice?
- Qual o custo real de adotar um índice de busca dedicado?

## Para Aprofundar

- Manning, Christopher; Raghavan, Prabhakar; Schütze, Hinrich. *Introduction to
  Information Retrieval*. Cambridge, 2008.
- Documentação de busca textual do PostgreSQL — o caminho intermediário mais
  subestimado.
