---
id: batch-integration
title: Integração em Lote
sidebar_position: 7
description: Processar muitos registros de uma vez — o estilo que move mais dados corporativos que todos os outros somados.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece quando lote é a resposta certa e projeta janelas
  reprocessáveis em vez de irrepetíveis.
prerequisites: [integration-architecture]
related: [file-integration, messaging-integration, data-lifecycle]
canonical_for: [integração em lote, janela de processamento, carga incremental]
content_version: 1
last_reviewed: 2026-08-27
---

# Integração em Lote

## Visão Geral

Integração em lote processa um conjunto grande de registros de uma vez, em
intervalos definidos.

É o estilo menos discutido e o mais usado: folha de pagamento, conciliação
bancária, faturamento, carga analítica, arquivos regulatórios. A maior parte dos
dados que atravessa fronteiras corporativas ainda anda assim.

Ele é frequentemente tratado como legado a ser substituído. Para uma classe grande
de problemas, ele é simplesmente a resposta certa — e substituí-lo por
processamento contínuo piora tudo.

## Problema

Nem todo processamento se beneficia de acontecer imediatamente.

Fechar o faturamento do mês exige que o mês tenha acabado. Conciliar com o banco
depende do arquivo que o banco envia uma vez por dia. Calcular comissões precisa
do conjunto completo de vendas do período.

Nesses casos, processar registro a registro não adianta latência — o resultado só
existe quando o conjunto está completo. E processar em lote é ordens de grandeza
mais eficiente: uma consulta que traz um milhão de registros custa muito menos que
um milhão de consultas.

## Conceitos Centrais

### O ganho é eficiência, não latência

Operações agrupadas amortizam custo fixo: uma conexão, uma transação, uma
consulta, uma escrita de arquivo.

```text
1.000.000 chamadas individuais    ~1.000.000 × (rede + transação + índice)
1.000 lotes de 1.000              ~1.000 × (rede + transação) + escrita agrupada
```

A diferença costuma ser de uma a duas ordens de grandeza. É por isso que carga
analítica e integração de alto volume continuam em lote mesmo onde há alternativa
contínua.

### A janela precisa ser reprocessável

O requisito que separa lote sustentável de lote frágil.

Uma execução vai falhar no meio. Quando falhar, a resposta correta é reexecutar —
e a reexecução precisa produzir o mesmo resultado, não o dobro.

```text
frágil        INSERT dos registros do dia
reprocessável DELETE da partição do dia, depois INSERT
```

A segunda forma é [idempotente](/06-distributed-systems/idempotency.md) e
transforma "falhou no meio" de incidente em nova tentativa.

Sem isso, cada falha exige análise manual de onde parou — e é onde surgem as
duplicações silenciosas descritas em
[data warehouses](/07-data-architecture/data-warehouses.md).

### Incremental exige uma marca confiável

Reprocessar tudo sempre é simples e não escala. A carga incremental processa só o
que mudou, e depende de saber o que mudou:

**Marca de tempo de alteração.** Simples, e falha quando os relógios divergem ou
quando uma transação longa confirma depois da marca já ter passado. Ver
[relógio e tempo](/06-distributed-systems/clock-and-time.md).

**Número de sequência.** Mais confiável, e exige que a origem o mantenha.

**Log de mudanças do banco.** O mais confiável, e o mais invasivo.

O modo de falha do primeiro é sutil e comum: uma transação iniciada antes do
recorte e confirmada depois nunca é capturada. Uma sobreposição deliberada da
janela — reprocessar alguns minutos a mais — cobre isso, e só é segura se o
processo for idempotente.

### O lote tem que caber na janela

Uma execução que leva 5 horas numa janela de 6 é uma bomba com data marcada: o
volume cresce, e um dia ela não termina antes do início do expediente.

A métrica a monitorar não é "terminou?" — é **quanto da janela foi consumido**. A
tendência dessa métrica avisa com meses de antecedência.

### Falha parcial precisa de política

Um lote de 100 mil registros com 12 inválidos: para tudo, ou processa 99.988 e
reporta 12?

Ambas são defensáveis, e a escolha é de negócio:

**Tudo ou nada** para dados financeiros, onde processar parcialmente produz
estado inconsistente.

**Continuar e reportar** para cargas em que os registros são independentes.

O que não é defensável é não decidir — e descobrir a política pelo comportamento
padrão da ferramenta, durante um incidente.

E, escolhida a segunda, os registros rejeitados precisam de destino: um arquivo,
uma tabela, um alerta. Rejeitados sem destino somem.

### Lote e contínuo convivem

A escolha não é global. Um sistema pode processar pagamentos continuamente e
conciliar em lote diário.

Substituir lote por contínuo onde não há requisito de latência troca simplicidade
operacional por complexidade sem benefício — e é uma modernização que aparece com
frequência em roteiros de arquitetura sem justificativa concreta.

## Modelo Mental

**Lote troca latência por eficiência e simplicidade.** Onde a latência não é
requisito, essa é uma troca favorável.

## Quando Usar

- O resultado só faz sentido com o conjunto completo — fechamentos, conciliações.
- Volume alto com latência tolerante.
- A origem só disponibiliza dados periodicamente.
- Eficiência de processamento importa.
- Requisito regulatório com periodicidade definida.
- Carga analítica. Ver [OLAP](/07-data-architecture/olap.md).

## Quando Não Usar

**Quando a latência é requisito.** Se o usuário espera o efeito agora.

**Sem reprocessamento idempotente.**

**Quando a janela já está apertada.** Sem plano de crescimento.

**Sem política de falha parcial.**

**Para eventos que precisam ser reagidos individualmente.** Ver
[integração orientada a eventos](/08-integration-architecture/event-driven-integration.md).

**Quando o volume por execução não cabe em memória** e o processo não foi escrito
para fluxo.

## Alternativas

- **[Mensageria](/08-integration-architecture/messaging-integration.md)** — quando cada registro precisa de
  tratamento individual e rápido.
- **Micro-lote** — janelas de minutos em vez de horas; meio-termo que resolve
  muitos casos de "quase tempo real".
- **Captura de mudanças do banco** — contínuo sem tocar a aplicação de origem.
- **[Integração por arquivo](/08-integration-architecture/file-integration.md)** — o transporte mais comum
  para lote entre organizações.

## Trade-offs

| Lote | Contínuo |
|---|---|
| Eficiente por registro | Custo fixo por registro |
| Latência de horas | Segundos |
| Reprocessar é natural | Exige mecanismo |
| Falha concentrada numa janela | Distribuída |
| Operação simples | Componentes a manter |
| Pico de carga concentrado | Distribuído |

| Completo | Incremental |
|---|---|
| Simples e autocorretivo | Precisa de marca confiável |
| Não escala | Escala |
| Sem risco de perder mudança | Risco de janela mal fechada |

## Modos de Falha

**Duplicação por reexecução.** O lote não era idempotente.

**Janela estourada.** O volume cresceu e a execução invadiu o expediente.

**Mudança perdida.** Transação confirmada após o recorte da janela.

**Rejeitados sem destino.**

**Memória esgotada.** O processo carrega tudo de uma vez.

**Dependência em cadeia.** Um lote atrasa e derruba os quatro que dependem dele.

**Falha silenciosa.** O lote não rodou, e ninguém monitora ausência de execução.

O último merece destaque: monitorar falha é comum; monitorar **não ter
executado** é raro, e é o modo que passa despercebido por mais tempo.

## Erros Comuns

**Não tornar reprocessável.**

**Não monitorar o consumo da janela como tendência.**

**Não sobrepor a janela incremental.**

**Não definir política de falha parcial.**

**Carregar tudo em memória.**

**Não alertar sobre execução ausente.**

## Exemplo Real

Uma financeira processava a conciliação bancária diária: comparar as transações
internas com o arquivo do banco, identificar divergências, gerar lançamentos.

O processo rodava às 2h e levava, originalmente, 40 minutos.

Ao longo de quatro anos, o volume quadruplicou e a execução chegou a 5h20 — numa
janela que terminava às 8h.

Quatro incidentes:

**Janela estourada.** Num dia de volume atípico, a execução terminou às 8h40. O
atendimento começou com dados de conciliação incompletos, e decisões de crédito
foram tomadas sobre saldo errado. A tendência estava visível havia dois anos, e
ninguém acompanhava a métrica.

**Reexecução duplicando.** Uma falha por indisponibilidade do banco levou à
reexecução manual. O processo inseria lançamentos sem apagar os do dia, e cerca de
18 mil lançamentos duplicaram. A correção levou três dias e envolveu a
contabilidade.

**Mudança perdida.** A carga incremental usava a marca de alteração. Transações de
longa duração — confirmadas depois do recorte — ficavam de fora permanentemente,
porque a janela seguinte partia do novo recorte. Cerca de 300 transações por mês
sumiam da conciliação.

**Execução ausente.** Uma falha de agendamento fez o processo simplesmente não
rodar numa segunda-feira. Não houve erro, porque não houve execução. A ausência só
foi notada na quarta.

As correções:

**Reprocessamento por partição** — apagar o dia e recarregar. A reexecução deixou
de ser operação de risco.

**Sobreposição de 30 minutos** na janela incremental, viável porque o processo
passou a ser idempotente. As transações perdidas foram a zero.

**Processamento em fluxo**, em blocos, em vez de carregar tudo. A execução caiu de
5h20 para 1h10 — a maior parte do tempo era pressão de memória, não trabalho útil.

**Alerta de ausência.** Se o lote não iniciar até 2h15, alerta. E monitoramento da
razão entre duração e janela, com alerta acima de 60%.

A lição registrada: a proposta na mesa era migrar para processamento
contínuo, estimada em oito meses. As quatro correções levaram cinco semanas,
resolveram todos os incidentes, e a conciliação continua sendo — corretamente — um
processo diário, porque o arquivo do banco chega uma vez por dia.

## Conceitos Relacionados

- [Integração por Arquivo](/08-integration-architecture/file-integration.md) — o transporte típico.
- [Integração por Mensageria](/08-integration-architecture/messaging-integration.md) — a alternativa contínua.
- [Idempotência](/06-distributed-systems/idempotency.md).
- [Particionamento de Dados](/07-data-architecture/data-partitioning.md).

## Exercício Prático

Pegue o lote mais importante do seu sistema e responda: se ele falhar na metade,
qual é o procedimento?

Se a resposta envolver alguém analisar onde parou, ele não é reprocessável — e
essa é a correção de maior retorno disponível.

## Perguntas de Entrevista

- O que torna um lote reprocessável, e por que isso importa?
- Por que a marca de tempo de alteração pode perder registros?
- Por que monitorar ausência de execução é diferente de monitorar falha?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 10.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
