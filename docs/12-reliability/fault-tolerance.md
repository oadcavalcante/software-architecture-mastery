---
id: fault-tolerance
title: Tolerância a Falhas
sidebar_position: 3
description: Continuar correto apesar da falha de componentes — detectar, isolar, recuperar.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta os três estágios da tolerância e reconhece o que
  precisa ser detectado antes de poder ser tolerado.
prerequisites: [reliability-basics]
related: [redundancy, resilience, circuit-breakers]
canonical_for: [tolerância a falhas, isolamento de falha, recuperação automática, falha silenciosa]
content_version: 1
last_reviewed: 2026-08-28
---

# Tolerância a Falhas

## Visão Geral

Tolerância a falhas é a capacidade de continuar entregando serviço **correto** apesar
da falha de componentes.

Ela se decompõe em três estágios, e cada um é um ponto onde a tolerância pode falhar:

```text
detectar   perceber que algo falhou
isolar     impedir que a falha se propague
recuperar  voltar ao estado correto
```

O primeiro é o mais negligenciado. Não se tolera o que não se percebe — e falhas
silenciosas são a categoria que mais causa dano prolongado.

## Problema

Um sistema sem tolerância tem confiabilidade igual ao produto da confiabilidade das
partes: quanto mais componentes, pior.

```text
10 componentes com 99,9% cada, sem tolerância → 99,0%
```

Adicionar funcionalidade significa adicionar componentes, o que significa piorar a
confiabilidade — a menos que o sistema tolere a falha deles.

Isso torna a tolerância não uma otimização, mas o que permite ao sistema crescer sem
degradar.

## Conceitos Centrais

### Detectar é o estágio que decide

Uma falha não detectada não pode ser tolerada. E as formas de detecção têm alcances
diferentes:

```text
verificação de saúde     detecta parada; não detecta lentidão nem resposta errada
timeout                  detecta parada e lentidão
verificação semântica    detecta resposta errada — comparar, validar invariantes
reconciliação            detecta divergência acumulada
```

A terceira e a quarta raramente existem, e são as únicas que detectam a categoria mais
danosa: o componente que responde, rápido, com o dado errado. Ver
[fundamentos de confiabilidade](/12-reliability/reliability-basics.md).

Ver também [detecção de falhas](/06-distributed-systems/failure-detection.md).

### Isolar impede a propagação

Detectada a falha, o objetivo é que ela não alcance o resto:

```text
bulkhead          recursos separados por dependência
circuit breaker   para de chamar o que está falhando
timeout           limita o tempo de exposição
descarte de carga rejeita em vez de acumular
```

Ver [bulkheads](/12-reliability/bulkheads.md) e [circuit breakers](/12-reliability/circuit-breakers.md).

Sem isolamento, uma falha localizada consome recursos compartilhados e o sistema inteiro
para — o modo de falha mais comum em arquiteturas com muitas dependências.

### Recuperar precisa ser automático onde possível

```text
reiniciar          o mais simples e frequentemente suficiente
substituir         recriar a instância em vez de consertar
failover           trocar para a cópia reserva
reprocessar        refazer o trabalho perdido
reconciliar        corrigir divergência
```

A segunda merece destaque: em infraestrutura programável, substituir é mais confiável
que consertar. Uma instância recriada a partir de código está em estado conhecido; uma
consertada está em estado que ninguém descreveu.

### Falha silenciosa é a categoria pior

Um componente que falha ruidosamente é tratado. Um que falha em silêncio opera degradado
indefinidamente.

Os casos característicos:

```text
consumidor de fila parado      nada gera erro; o efeito simplesmente não acontece
réplica que parou de replicar  responde leituras de dados congelados
tarefa agendada que não roda   ausência não gera evento
cache servindo dado inválido   respostas rápidas e erradas
verificação desabilitada       a proteção sumiu
```

O padrão comum: **a ausência de algo não gera sinal**. Detectá-la exige monitorar o que
deveria acontecer, não apenas o que acontece — atraso de consumidor, última execução de
tarefa, defasagem de réplica.

### Tolerar tem custo, e ele nem sempre se paga

Cada mecanismo adiciona complexidade, e complexidade adiciona modos de falha próprios.

O critério: o custo de tolerar deve ser menor que o custo esperado da falha.

```text
componente crítico, falha frequente   → tolerar
componente crítico, falha rara        → talvez recuperar rápido baste
componente não crítico                 → degradar. Ver degradação graciosa
```

A segunda linha é a mais mal resolvida na prática: investe-se em tolerância elaborada
para cenários raros, quando reduzir o tempo de recuperação teria retorno maior. Ver
[métricas de disponibilidade](/12-reliability/availability-metrics.md).

### Tolerância mascara problema

Efeito colateral que precisa ser gerenciado: um sistema que tolera bem esconde a
frequência real de falhas.

Uma dependência que falha 5% das vezes, com retentativa e circuit breaker, produz
experiência boa — e a degradação subjacente fica invisível até piorar o suficiente para
vencer a proteção.

Por isso a instrumentação dos próprios mecanismos importa: contagem de retentativas,
aberturas de circuito, acionamentos de degradação. Sem ela, a piora só aparece na queda.
Ver [tempestades de retentativa](/12-reliability/retry-storms.md).

### Tolerar exige decidir o que é "correto" sob falha

Um ponto que precede os três estágios: para tolerar, é preciso saber qual estado é
aceitável quando o componente ideal não está disponível.

```text
dado de 5 minutos atrás     aceitável para catálogo, inaceitável para saldo
resposta parcial            aceitável para busca, inaceitável para extrato
operação enfileirada        aceitável para notificação, inaceitável para autorização
recusa                      aceitável quando o alternativo é resultado errado
```

Sem essa decisão, cada mecanismo de tolerância adota um comportamento implícito — e
comportamentos implícitos combinam mal. Um serviço serve dado velho, o seguinte
combina com dado atual, e o resultado é inconsistente sem que nada tenha falhado
visivelmente.

A decisão pertence ao domínio, não à infraestrutura. Ver
[degradação graciosa](/12-reliability/graceful-degradation.md).

## Modelo Mental

**Tolerância é detectar, isolar e recuperar.** O elo mais fraco costuma ser o
primeiro.

## Quando Usar

- Componentes cuja falha derrubaria o sistema.
- Dependências externas ou historicamente instáveis.
- Sistemas com muitos componentes, onde a composição degrada.
- Onde a falha é frequente o suficiente para o custo se pagar.
- Onde o tempo de recuperação manual é inaceitável.

## Quando Não Usar

**Sem detecção.** Não se tolera o que não se percebe.

**Para falhas raras** em que recuperação rápida bastaria.

**Sem instrumentar os mecanismos.**

**Quando o mecanismo é mais frágil que o componente** que ele protege.

**Mascarando um problema** que deveria ser corrigido na origem.

**Em componentes não críticos**, onde degradar é mais simples.

## Alternativas

- **Recuperação rápida** — em vez de tolerar, encurtar o tempo de retomada.
- **[Degradação graciosa](/12-reliability/graceful-degradation.md)** — operar sem o componente.
- **Simplificar** — menos componentes falham menos.
- **Substituir a dependência instável** — tratar a causa em vez do sintoma.

## Trade-offs

| Com tolerância | Sem |
|---|---|
| Falha absorvida | Propaga |
| Complexidade adicional | Menos peças |
| Modos de falha próprios | Menos |
| Problema pode ficar oculto | Visível |
| Custo permanente | Nenhum |

| Detecção profunda | Rasa |
|---|---|
| Encontra falha silenciosa | Só parada |
| Custo de verificação | Baixo |
| Risco de falso positivo | Menor |

## Modos de Falha

**Falha não detectada.** Opera degradado indefinidamente.

**Isolamento inexistente.** Uma dependência derruba tudo.

**Mecanismo de tolerância falhando.** O circuit breaker abre indevidamente; o failover
não funciona.

**Problema mascarado.** A degradação cresce invisível.

**Recuperação que não recupera.** Reiniciar não resolve a causa e o ciclo se repete.

**Complexidade excessiva.** Mais modos de falha que os que se queria tolerar.

## Erros Comuns

**Investir em isolamento sem detecção.**

**Verificação de saúde que só testa se o processo responde.**

**Não monitorar ausência** — consumidor parado, tarefa não executada.

**Não instrumentar os mecanismos de tolerância.**

**Tolerar em vez de corrigir a causa.**

**Não exercitar.** Ver [engenharia do caos](/12-reliability/chaos-engineering.md).

## Exemplo Real

Uma plataforma de faturamento tinha tolerância bem construída na camada de aplicação:
circuit breakers, retentativa com orçamento, degradação para serviços não essenciais.

Um problema passou onze meses sem ser detectado.

O consumidor que processava confirmações de pagamento de um dos gateways falhava em
cerca de 2% das mensagens, por um formato de resposta que ele não sabia interpretar. A
mensagem ia para a fila de mensagens mortas, que ninguém monitorava.

O efeito: 2% dos pagamentos confirmados pelo gateway nunca eram marcados como pagos.
Os clientes recebiam cobranças de faturas já pagas.

Nenhum alerta disparou em onze meses. O sistema estava disponível, rápido e correto em
98% dos casos — e a tolerância funcionou exatamente como projetada: isolou a falha e
seguiu.

A detecção veio do time de atendimento, ao notar um padrão nas reclamações.

As correções atacaram o estágio ausente:

**Monitoramento da fila de mensagens mortas**, com alerta em qualquer mensagem. Ver
[dead-letter queues](/06-distributed-systems/dead-letter-queues.md).

**Reconciliação diária** entre pagamentos confirmados pelo gateway e faturas marcadas
como pagas, com alerta na divergência. Essa foi a correção que teria detectado o
problema em um dia.

**Monitoramento de ausência**: alerta se o número de confirmações processadas cair fora
da faixa esperada.

**Instrumentação dos mecanismos**: contagem de aberturas de circuito, retentativas e
mensagens descartadas, com painel e alerta de tendência.

A avaliação posterior aponta: eles tinham investido bastante em isolar e recuperar, e quase
nada em detectar. A falha foi isolada com perfeição — e ficou isolada, silenciosa, por
onze meses.

## Conceitos Relacionados

- [Redundância](/12-reliability/redundancy.md) — o mecanismo mais comum.
- [Resiliência](/12-reliability/resilience.md) — a propriedade mais ampla.
- [Bulkheads](/12-reliability/bulkheads.md) e [Circuit Breakers](/12-reliability/circuit-breakers.md) — o isolamento.
- [Detecção de Falhas](/06-distributed-systems/failure-detection.md).

## Exercício Prático

Liste os mecanismos de tolerância do seu sistema e, para cada um, responda: existe
métrica de quantas vezes ele foi acionado?

Onde não existir, o mecanismo pode estar mascarando uma degradação crescente.

## Perguntas de Entrevista

- Quais os três estágios da tolerância, e qual costuma ser o mais fraco?
- Por que falha silenciosa é a categoria mais danosa?
- Por que tolerância bem-sucedida pode esconder um problema?

## Para Aprofundar

- Avizienis, Algirdas et al. *Basic Concepts and Taxonomy of Dependable and Secure
  Computing*. IEEE TDSC, 2004.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
