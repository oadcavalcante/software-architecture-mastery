---
id: oltp
title: OLTP
sidebar_position: 7
description: Carga transacional — muitas operações pequenas sobre poucos registros, com latência baixa.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece a assinatura de uma carga OLTP e evita
  contaminá-la com consultas analíticas.
prerequisites: [data-architecture]
related: [olap, indexing, transactions]
canonical_for: [OLTP, carga transacional]
content_version: 1
last_reviewed: 2026-08-27
---

# OLTP

## Visão Geral

OLTP — processamento de transações em linha — descreve a carga de trabalho
característica de um sistema operacional: **muitas operações pequenas, cada uma
tocando poucos registros, com exigência de latência baixa e consistência**.

Cadastrar um cliente, registrar um pedido, debitar um saldo, consultar o próprio
extrato. São milhares por segundo, cada uma lendo ou escrevendo unidades de
registros.

Essa assinatura determina o modelo de dados, o índice, o armazenamento e a
estratégia de escala. Reconhecê-la é o primeiro passo de qualquer decisão desta
seção.

## Problema

O problema não é implementar OLTP — quase todo sistema começa assim, e bancos
relacionais servem essa carga muito bem.

O problema é o que acontece quando uma carga de perfil oposto passa a compartilhar
o mesmo armazenamento. Um relatório que varre a tabela de pedidos inteira roda ao
lado das transações e compete pelos mesmos recursos.

O sintoma é conhecido: o sistema fica lento no fim do mês, na hora do fechamento,
ou sempre que alguém abre determinado painel. E a reação típica — aumentar a
máquina — trata o sintoma e não a causa.

## Conceitos Centrais

### A assinatura

Uma carga OLTP tem características que aparecem juntas:

```text
volume de operações     alto (milhares/s)
registros por operação  poucos (unidades a dezenas)
acesso                  por chave ou índice seletivo
proporção               escrita significativa
latência exigida        milissegundos
dados                   o estado atual
consistência            geralmente forte
```

Quando alguma dessas foge do padrão — uma operação que varre milhões de linhas,
ou que tolera segundos de latência — vale perguntar se aquilo é mesmo OLTP.

### O modelo normalizado serve bem

Para essa assinatura, [normalização](normalization.md) é adequada: as operações
tocam poucos registros, então o custo de junção é baixo, e evitar duplicação
elimina uma classe de inconsistência.

É o inverso do que [OLAP](olap.md) precisa, e é por isso que os dois modelos
divergem.

### Índice é a diferença entre milissegundos e segundos

Como o acesso é seletivo — buscar um pedido, os pedidos de um cliente —
[índice](indexing.md) adequado é o que mantém a latência.

Sem ele, cada operação varre a tabela, e a degradação é proporcional ao
crescimento dos dados: o sistema funciona bem por meses e piora sozinho.

### Escrita concorrente é o gargalo real

Diferente de OLAP, OLTP escreve muito. Isso traz contenção: duas operações sobre
o mesmo registro serializam.

Por isso [transações](transactions.md) e níveis de isolamento importam aqui e
quase não importam em analítico. E por isso o gargalo de um sistema OLTP maduro
raramente é CPU — é bloqueio, contenção de índice e latência de gravação.

### Separar as cargas é a decisão que resolve

A resposta arquitetural para "o relatório derruba o sistema" não é otimizar o
relatório. É tirá-lo dali.

Uma [réplica de leitura](data-replication.md), um armazenamento analítico
separado, ou uma projeção — qualquer uma remove a competição.

Manter as duas cargas no mesmo lugar por simplicidade funciona até certo volume,
e o momento de separar chega antes do que a maioria dos times espera.

### O gargalo muda conforme o sistema amadurece

A causa dominante de lentidão numa carga OLTP não é a mesma ao longo do tempo, e
tratar sempre o mesmo suspeito é o que faz diagnósticos demorarem.

**Sistema novo.** Falta de índice. Quase sempre.

**Sistema em crescimento.** Consultas que eram baratas com mil linhas deixam de
ser, e planos de execução mudam conforme as estatísticas.

**Sistema maduro sob carga.** Contenção — bloqueios sobre registros quentes,
transações longas, esgotamento de conexões.

**Sistema maduro com carga misturada.** Competição entre operação e análise.

Há ainda um estágio final, menos comum: quando o volume de escrita concorrente
sobre uma mesma entidade excede o que um único nó consegue serializar. Aí a
resposta é redesenhar a modelagem para distribuir a contenção — dividir um
contador único em vários parciais somados na leitura, por exemplo — e não trocar
de armazenamento.

A progressão importa porque a resposta é diferente em cada estágio: índice,
revisão de consulta, redesenho de concorrência e separação de cargas,
respectivamente. Aumentar a máquina só ajuda de forma clara no segundo estágio, e
é a resposta aplicada em todos.

## Modelo Mental

**OLTP é sobre muitas operações pequenas com latência apertada.** Tudo o mais —
modelo, índice, isolamento — decorre disso.

## Quando Usar

- O sistema registra e consulta o estado atual do negócio.
- As operações tocam poucos registros identificados.
- Há escrita concorrente relevante.
- A latência precisa ser de milissegundos.
- Consistência importa para a operação.

## Quando Não Usar

**Para relatório e análise.** Ver [OLAP](olap.md) — a carga é oposta em todas as
dimensões.

**Para varredura de grandes volumes.** Agregações sobre o histórico inteiro.

**Para exportação em massa.** Vai competir com a operação.

**Como único armazenamento quando já há carga analítica relevante.** A separação
deixou de ser opcional.

## Alternativas

- **[OLAP](olap.md)** — para a carga analítica.
- **Réplica de leitura** — separação barata, mesmo modelo.
- **[CQRS](../06-distributed-systems/distributed-cqrs.md)** — modelos separados.
- **Cache** — para leitura repetida de dados quentes.

## Trade-offs

| OLTP | OLAP |
|---|---|
| Muitas operações pequenas | Poucas operações grandes |
| Acesso por chave | Varredura |
| Escrita significativa | Predominantemente leitura |
| Normalizado | Desnormalizado |
| Estado atual | Histórico |
| Latência de milissegundos | Segundos a minutos aceitáveis |
| Orientado a linha | Frequentemente colunar |

## Modos de Falha

**Contaminação analítica.** Um relatório pesado degrada a operação inteira.

**Degradação por crescimento.** Falta de índice aparece quando o volume cresce.

**Contenção de escrita.** Registros quentes serializam operações.

**Transação longa.** Segura bloqueios e trava o resto.

**Índice demais.** Cada índice é custo de escrita; excesso degrada o que deveria
acelerar.

## Erros Comuns

**Rodar relatório na base transacional.**

**Não separar as cargas até o sistema cair.**

**Criar índice para toda consulta lenta sem avaliar o custo de escrita.**

**Manter transação aberta durante chamada externa.**

**Escolher armazenamento por reputação em vez do padrão de acesso.**

## Exemplo Real

Um sistema de gestão de pedidos degradava todo dia 1º. As lentidões duravam de
duas a três horas, com tempo de resposta subindo de 80 ms para 4 segundos.

A causa foi encontrada rápido: o fechamento mensal disparava relatórios que
varriam a tabela de pedidos completa — 400 milhões de linhas — enquanto o sistema
operava.

A primeira reação foi aumentar a máquina. Ajudou por dois meses, até o volume
crescer de novo.

O que resolveu foi separar as cargas.

**Réplica de leitura** para os relatórios, com atraso de segundos — irrelevante
para fechamento mensal.

**Armazenamento colunar** para os três relatórios mais pesados, alimentado
diariamente. O que levava 40 minutos passou a levar 90 segundos, porque a carga
era analítica e finalmente estava num armazenamento analítico.

**Limite de tempo de consulta** na base transacional. Qualquer consulta acima de 5
segundos é interrompida. Isso quebrou dois relatórios internos, o que foi o
objetivo — eles não deveriam estar ali.

A equipe registra que o mais caro foi o tempo entre o primeiro incidente e o
diagnóstico correto: quase um ano tratando o problema como falta de capacidade,
quando era mistura de cargas.

## Conceitos Relacionados

- [OLAP](olap.md) — a carga oposta.
- [Indexação](indexing.md) — o que sustenta a latência.
- [Transações](transactions.md) — isolamento e contenção.
- [Normalização](normalization.md) — o modelo adequado.

## Exercício Prático

Liste as cinco consultas mais lentas do seu banco transacional. Para cada uma,
classifique: é OLTP — poucos registros por chave — ou é analítica disfarçada?

As analíticas não pertencem ali, e movê-las costuma render mais que qualquer
otimização.

## Perguntas de Entrevista

- Qual a assinatura de uma carga OLTP?
- Por que normalização serve OLTP e atrapalha OLAP?
- Qual o gargalo típico de um sistema OLTP maduro?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 3.
- Gray, Jim; Reuter, Andreas. *Transaction Processing*. Morgan Kaufmann, 1992.
- Winand, Markus. *SQL Performance Explained*, 2012.
