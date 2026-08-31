---
id: denormalization
title: Desnormalização
sidebar_position: 14
description: Duplicar de propósito — quando o custo de junção supera o custo de manter cópias em dia.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor desnormaliza com medição e plano de manutenção, em vez de
  por intuição de desempenho.
prerequisites: [normalization]
related: [olap, data-modeling, indexing]
canonical_for: [desnormalização, duplicação controlada]
content_version: 1
last_reviewed: 2026-08-27
---

# Desnormalização

## Visão Geral

Desnormalizar é duplicar dados de propósito para evitar junções na leitura.

É uma decisão legítima e frequentemente correta. O que a torna arriscada é ser
tomada por intuição — "junções são lentas" — em vez de por medição, e sem plano
para manter as cópias coerentes.

A pergunta que a governa: **quando o original mudar, o que acontece com as
cópias?**

## Problema

Modelos [normalizados](/07-data-architecture/normalization.md) exigem junções, e junções custam. Em
consulta analítica sobre milhões de linhas, elas dominam o tempo.

Desnormalizar resolve isso e cria um problema novo: a mesma informação passa a
existir em vários lugares, e mantê-los coerentes vira responsabilidade da
aplicação.

O erro comum não é desnormalizar — é desnormalizar sem responder o que acontece na
atualização, e descobrir a resposta em produção.

## Conceitos Centrais

### Duas categorias que se confundem

**Cópia de valor histórico.** O preço cobrado, o endereço da entrega, a alíquota
aplicada. Esses valores **não devem** mudar quando o cadastro muda — são fatos
diferentes do dado atual.

Isso não é desnormalização: é modelagem correta. Ver
[normalização](/07-data-architecture/normalization.md).

**Cópia de valor vivo.** O nome do cliente copiado no pedido para evitar junção.
Quando o cliente muda de nome, as cópias ficam desatualizadas.

Só a segunda é desnormalização de verdade, e só ela exige plano de manutenção.
Separar as duas resolve boa parte da confusão sobre o tema.

### As formas de desnormalizar

**Copiar atributo.** O nome junto do identificador.

**Pré-calcular agregado.** Total do pedido, contagem de itens, saldo.

**Achatar hierarquia.** Categoria e subcategoria direto no produto.

**Repetir a linha inteira.** Modelo dimensional — a dimensão inteira junto do
fato.

Os agregados pré-calculados são os mais valiosos e os mais propensos a divergir,
porque dependem de toda escrita passar pelo mesmo caminho.

### Manter em dia: três estratégias

**Na mesma transação.** Atualizar original e cópia atomicamente. Coerência
garantida, ao custo de escrita mais cara e de acoplamento entre as escritas.

**Assíncrona.** Um evento propaga a mudança. Escrita rápida, coerência eventual, e
exige [idempotência](/06-distributed-systems/idempotency.md).

**Recalcular periodicamente.** Um processo reconstrói. Simples, com janela de
divergência maior.

A escolha depende de quanto tempo de divergência o negócio aceita — pergunta que
precisa ser feita ao negócio, não decidida tecnicamente.

### Verificação de divergência é obrigatória

Qualquer estratégia falha eventualmente: um evento perdido, um caminho de escrita
que esqueceu de atualizar, uma correção manual no banco.

Sem verificação, a divergência é silenciosa e permanente. Um processo periódico que
compara o agregado com o cálculo a partir da origem e alerta na diferença é o
controle que separa desnormalização sustentável de bomba-relógio.

Ele quase nunca existe.

### Medir antes

"Junções são lentas" é verdade em analítico e frequentemente falso em
transacional, onde uma junção indexada de poucos registros custa quase nada.

Antes de desnormalizar num sistema transacional, verifique o plano de execução. A
causa mais comum de consulta lenta é [índice](/07-data-architecture/indexing.md) ausente — e
desnormalizar para contornar índice ausente adiciona complexidade permanente para
resolver algo que uma linha resolveria.

### O caminho de escrita precisa ser único

Se três serviços podem alterar o original e apenas um sabe atualizar a cópia, a
divergência é questão de tempo.

Desnormalização exige que toda escrita passe por um ponto que conhece as cópias —
o que é um requisito de arquitetura, não de implementação.

## Modelo Mental

**Desnormalizar move custo da leitura para a escrita e para a manutenção.** Vale
quando se lê muito mais do que se escreve.

## Quando Usar

- Modelo analítico. Ver [OLAP](/07-data-architecture/olap.md).
- Leitura desproporcionalmente mais frequente que escrita.
- A junção foi medida e é o gargalo.
- O dado copiado muda raramente.
- Armazenamento sem junção eficiente.
- Agregado consultado com muito mais frequência do que atualizado.

## Quando Não Usar

**Sem medir.** O gargalo pode ser índice.

**Sem plano de manutenção.**

**Sem verificação de divergência.**

**Quando o dado copiado muda com frequência.** O custo de propagação supera o
ganho.

**Quando há múltiplos caminhos de escrita não controlados.**

**Em modelo transacional, por hábito.**

## Alternativas

- **[Índice](/07-data-architecture/indexing.md) adequado** — verifique primeiro, sempre.
- **Visão materializada** — o banco mantém a cópia e a atualiza; menos código e
  menos risco de divergência.
- **Cache** — duplicação com prazo, e a expiração cuida da coerência.
- **[CQRS](/06-distributed-systems/distributed-cqrs.md)** — separação explícita
  com projeção reconstruível.

A visão materializada é subutilizada: ela entrega o benefício da desnormalização
com a manutenção a cargo do banco.

## Trade-offs

| Desnormalizado | Normalizado |
|---|---|
| Leitura rápida | Junções |
| Escrita em vários lugares | Um lugar |
| Risco de divergência | Sem risco |
| Espaço maior | Menor |
| Otimizado para o previsto | Consultas não previstas |
| Manutenção por código | Garantida pelo banco |

| Síncrono | Assíncrono | Periódico |
|---|---|---|
| Sempre coerente | Eventual | Janela maior |
| Escrita mais lenta | Rápida | Rápida |
| Acoplado | Desacoplado | Desacoplado |
| Sem divergência | Se um evento se perde | Até o próximo ciclo |

## Modos de Falha

**Divergência silenciosa.** A cópia e o original discordam e ninguém sabe.

**Agregado errado.** Um total pré-calculado que não bate com a soma dos itens.

**Atualização em massa.** Um valor copiado em milhões de linhas precisa mudar.

**Caminho de escrita esquecido.** Um serviço novo altera o original e ignora as
cópias.

**Correção manual no banco.** Alguém corrige o original com um comando direto, e
as cópias ficam para trás.

**Desnormalização acidental.** Duplicação que ninguém decidiu e ninguém mantém.

## Erros Comuns

**Desnormalizar sem medir.**

**Não implementar verificação de divergência.**

**Confundir cópia de valor histórico com desnormalização.**

**Não documentar quais campos são cópias.** Quem chega depois não distingue
original de cópia.

**Copiar dado que muda com frequência.**

## Exemplo Real

Um sistema de comércio guardava o total do pedido pré-calculado, para evitar somar
os itens em toda listagem.

Decisão correta: a listagem é consultada milhares de vezes por dia, e o pedido é
alterado poucas vezes.

O total era atualizado na mesma transação que alterava os itens. Funcionou por
quatro anos.

Então três caminhos novos de escrita apareceram, e nenhum atualizava o total:

**Cancelamento parcial** implementado por um time diferente, que removia itens
diretamente.

**Correção de suporte**, uma ferramenta interna que ajustava quantidades.

**Importação de pedidos** de um canal parceiro, que inseria itens em lote.

A divergência cresceu em silêncio. Quando foi finalmente medida — por acaso,
durante outra investigação — **1,8% dos pedidos** tinham total diferente da soma
dos itens. Alguns a mais, alguns a menos. O impacto financeiro acumulado foi
significativo e levou meses para ser conciliado.

As correções:

**Verificação diária** comparando o total com a soma, alertando na diferença. Foi
o que deveria ter existido desde o início, e custou meio dia para implementar.

**Ponto único de escrita.** Toda alteração de itens passa a usar o mesmo serviço,
que atualiza o total.

**Recálculo sob demanda** para pedidos com divergência detectada.

A leitura que a equipe faz: a desnormalização estava certa, a implementação inicial
estava certa, e o modelo apodreceu porque nada impedia caminhos novos de ignorar a
regra. Uma cópia sem verificação é uma aposta em disciplina permanente de todos os
times futuros.

## Conceitos Relacionados

- [Normalização](/07-data-architecture/normalization.md) — a decisão inversa.
- [Indexação](/07-data-architecture/indexing.md) — verifique antes.
- [OLAP](/07-data-architecture/olap.md) — onde desnormalizar é o padrão.
- [CQRS](/06-distributed-systems/distributed-cqrs.md).

## Exercício Prático

Liste os valores pré-calculados ou copiados do seu banco. Para cada um, escreva a
consulta que o recalcula a partir da origem e compare os resultados hoje.

A taxa de divergência que você encontrar é a medida de quanto a estratégia atual
está funcionando.

## Perguntas de Entrevista

- Qual a diferença entre copiar um valor histórico e desnormalizar?
- Por que verificação de divergência é obrigatória?
- O que verificar antes de desnormalizar num sistema transacional?

## Para Aprofundar

- Kimball, Ralph; Ross, Margy. *The Data Warehouse Toolkit*. 3ª ed. Wiley, 2013.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Fowler, Martin. *Patterns of Enterprise Application Architecture*, 2002.
