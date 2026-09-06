---
id: traces
title: Traces
sidebar_position: 3
description: A anatomia de uma requisição — onde ela passou e onde gastou o tempo.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor instrumenta spans com granularidade útil e lê um trace para
  localizar onde o tempo foi gasto.
prerequisites: [observability]
related: [distributed-tracing, logs, metrics]
canonical_for: [trace, span, atributo de span, evento de span]
content_version: 1
last_reviewed: 2026-08-28
---

# Traces

## Visão Geral

Um trace é o registro do caminho de uma requisição: por onde ela passou, em que ordem,
e quanto tempo gastou em cada etapa.

Ele é composto de **spans** — unidades de trabalho com início, fim e relação de pai e
filho — que formam uma árvore.

O que ele responde e os outros sinais não: **onde o tempo foi**. Métricas dizem que a
requisição levou 3 segundos; logs dizem que ela falhou; o trace mostra que 2,7 segundos
foram numa chamada a um serviço que ninguém suspeitava.

## Problema

Uma requisição lenta atravessa oito serviços. Cada um tem métricas de latência, e todos
parecem normais.

O motivo: a lentidão está numa combinação — uma chamada que normalmente é rápida,
executada dezenas de vezes; ou uma dependência que responde bem em média e mal para
aquele tipo de entrada.

Sem trace, a investigação é por eliminação, serviço a serviço. Com trace, é uma
visualização.

## Conceitos Centrais

### Span é a unidade

```text
span
  nome            o que representa — "consultar_estoque"
  início e fim    duração
  pai             de qual span veio
  atributos       contexto — rota, resultado, tamanho, identificadores
  eventos         marcos dentro do span
  status          sucesso ou erro
```

A árvore de spans mostra a estrutura: o que aconteceu em sequência, o que aconteceu em
paralelo, e onde estão as esperas.

Um span sem atributos é quase inútil — ele diz que algo levou 200 ms, sem dizer o quê.
Os atributos são o que permite responder "por que **esta** execução foi lenta?".

### Granularidade: nem demais, nem de menos

```text
grosso demais   um span por serviço → sabe-se qual serviço, não o que dentro dele
fino demais     um span por função → milhares de spans, custo alto, ruído
adequado        um span por operação significativa
```

O critério prático: um span para cada coisa que pode ser lenta ou falhar de forma
independente.

```text
sim   chamada de rede, consulta ao banco, operação de disco,
      processamento pesado, aquisição de bloqueio
não   validação em memória, mapeamento de objeto, laço simples
```

A regra que funciona bem: instrumente as fronteiras — tudo que sai do processo — e as
operações internas caras. O resto entra como atributo ou evento do span pai.

### Ler um trace: procure as lacunas

O padrão de leitura que localiza problemas rapidamente:

```text
span longo com filhos que somam quase tudo  → o tempo está nos filhos, desça
span longo com filhos que somam pouco       → o tempo está nele mesmo — processamento,
                                              espera por bloqueio, fila interna
muitos spans irmãos curtos e sequenciais    → o problema N+1
espaços vazios entre spans                  → espera não instrumentada
```

A segunda linha é a mais informativa: uma lacuna entre a soma dos filhos e a duração do
pai indica tempo gasto em algo que não foi instrumentado — frequentemente espera por
recurso, coleta de lixo, ou serialização.

A terceira revela o problema N+1 visualmente, de forma que nenhuma métrica revela. Ver
[GraphQL](/08-integration-architecture/graphql.md) e
[bancos de documentos](/07-data-architecture/document-databases.md).

### Traces e logs se complementam

```text
trace   estrutura e tempo — onde
log     contexto e motivo — o quê e por quê
```

A prática madura os conecta: os logs carregam o identificador do trace e do span, e a
ferramenta permite saltar de um para o outro.

Isso elimina a etapa mais tediosa da investigação — encontrar os logs correspondentes ao
trace que se está olhando. Ver
[identificadores de correlação](/13-observability/correlation-ids.md).

E, na direção inversa, spans podem carregar eventos — registros com carimbo de tempo
dentro do span — que substituem logs de progresso.

### Instrumentação automática cobre a maior parte

Bibliotecas de instrumentação automática criam spans para operações comuns — chamadas
HTTP, consultas a banco, publicação em fila — sem alteração de código.

Isso cobre boa parte do valor com custo baixíssimo, e é o ponto de partida certo.

O que ela **não** faz: nomear spans com significado de negócio, adicionar atributos de
domínio, e instrumentar operações internas caras.

A combinação usual: automática para as fronteiras, manual para o que importa no
domínio.

### O erro precisa marcar o span

Um span com status de erro, com a exceção como evento, torna traces com falha
localizáveis por consulta.

Sem isso, encontrar "traces onde algo deu errado" exige inspecionar cada um — o que
anula boa parte da utilidade.

E o status precisa propagar: um span filho com erro deveria marcar o pai, para que a
falha seja visível no topo da árvore.

## Modelo Mental

**O trace mostra onde o tempo foi.** Métricas dizem quanto, logs dizem por quê, o trace
diz onde.

## Quando Usar

- Requisições que atravessam múltiplos componentes.
- Investigação de latência.
- Identificação de dependências não documentadas.
- Detecção de problemas N+1.
- Entendimento de sistemas herdados.

## Quando Não Usar

**Span por função.** Custo e ruído.

**Sem atributos.** Um span sem contexto responde pouco.

**Como substituto de métricas** para tendência.

**Como substituto de logs** para contexto detalhado.

**Sem marcar erros.**

**Em sistema de componente único**, onde um perfilador local resolve melhor.

## Alternativas

- **Perfilador** — para entender onde o tempo vai **dentro** de um processo. Trace
  mostra entre componentes; perfilador mostra dentro.
- **[Logs](/13-observability/logs.md) com duração por etapa** — o evento canônico com tempos por etapa
  cobre parte do valor, sem a estrutura de árvore.
- **[Métricas](/13-observability/metrics.md) por dependência** — mostram tendência por chamada, sem
  ligar à requisição individual.
- **Perfilamento contínuo** — amostragem de pilha em produção; complementa traces para
  o tempo dentro do processo.

## Trade-offs

| Traces | Logs |
|---|---|
| Estrutura e tempo | Contexto e motivo |
| Visualização da árvore | Linhas |
| Amostragem comum | Frequentemente completo |
| Custo por span | Por linha |

| Instrumentação automática | Manual |
|---|---|
| Sem alterar código | Exige trabalho |
| Nomes técnicos | Significado de negócio |
| Cobre fronteiras | Cobre o que importa |

## Modos de Falha

**Trace incompleto.** Um serviço da cadeia não propaga o contexto.

**Spans sem atributos.**

**Granularidade errada.** Grossa demais para localizar, fina demais para ler.

**Erros não marcados.**

**Lacunas não explicadas.** Tempo entre spans sem instrumentação.

**Custo alto por excesso de spans.**

**Traces sem ligação com logs.** Investigação em duas ferramentas desconectadas.

## Erros Comuns

**Instrumentar funções internas triviais.**

**Não adicionar atributos de domínio.**

**Não marcar status de erro.**

**Não conectar traces a logs.**

**Depender só da instrumentação automática.**

**Não instrumentar esperas** — bloqueios, filas internas, aquisição de conexão.

## Exemplo Real

Uma plataforma de saúde tinha uma tela que levava 4 segundos para carregar. As métricas
de todos os serviços envolvidos mostravam latências normais.

A instrumentação com traces levou uma semana e mostrou o problema no primeiro trace
inspecionado:

A requisição gerava **147 spans**. A tela consultava a lista de exames de um paciente e,
para cada exame, buscava o laboratório correspondente — um problema N+1 clássico,
invisível nas métricas porque cada chamada individual levava 22 ms.

```text
consultar_exames        45 ms
  buscar_laboratorio    22 ms   ×  146 vezes  = 3.212 ms
```

Nenhuma métrica revelaria isso: a latência do serviço de laboratórios estava em 22 ms,
excelente. O problema era a quantidade de chamadas.

A correção foi uma consulta em lote: de 147 spans para 3, e de 4 segundos para 180 ms.

A instrumentação revelou mais três coisas na mesma semana:

**Dependência não documentada.** Um serviço chamava um sistema legado que ninguém do
time atual sabia que existia.

**Chamada duplicada.** Duas camadas consultavam o mesmo dado independentemente, por um
histórico de refatoração incompleta.

**Espera por bloqueio.** Uma lacuna de 400 ms num span sem filhos correspondia à
aquisição de uma conexão de banco — o pool estava subdimensionado. Ver
[escala de banco de dados](/11-scalability/database-scaling.md).

Nenhum dos três aparecia em métricas ou logs. Os três foram visíveis no primeiro dia de
traces.

O que a equipe registra: eles tinham métricas e logs maduros, e passaram meses
investigando a lentidão por eliminação. O trace respondeu em minutos porque mostrava a
estrutura, que era exatamente a informação que faltava.

## Conceitos Relacionados

- [Rastreamento Distribuído](/13-observability/distributed-tracing.md) — a propagação e a amostragem.
- [Logs](/13-observability/logs.md) e [Métricas](/13-observability/metrics.md) — os complementos.
- [Identificadores de Correlação](/13-observability/correlation-ids.md).
- [Depurabilidade](/13-observability/debuggability.md).

## Exercício Prático

Instrumente uma rota do seu sistema com traces e inspecione um trace real.

Procure lacunas entre a duração do span pai e a soma dos filhos — elas apontam para
tempo gasto onde ninguém está olhando.

## Perguntas de Entrevista

- O que traces respondem que métricas e logs não respondem?
- Como um trace revela o problema N+1?
- O que uma lacuna entre pai e filhos indica?

## Para Aprofundar

- Sigelman, Benjamin et al. *Dapper, a Large-Scale Distributed Systems Tracing
  Infrastructure*. Google, 2010.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- OpenTelemetry — especificação de traces.
