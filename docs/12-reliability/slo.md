---
id: slo
title: SLO
sidebar_position: 11
description: O alvo acordado — e o orçamento de erro, que transforma confiabilidade em decisão operacional.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define SLOs com o negócio e usa o orçamento de erro para
  decidir entre entregar e estabilizar.
prerequisites: [sli]
related: [sli, sla, availability-metrics]
canonical_for: [SLO, objetivo de nível de serviço, orçamento de erro, taxa de consumo]
content_version: 1
last_reviewed: 2026-08-28
---

# SLO

## Visão Geral

Um SLO — objetivo de nível de serviço — é o **alvo** para um [SLI](sli.md): "99,9% das
requisições de checkout atendidas em menos de 4 segundos, medido em 28 dias".

Ele é a decisão que falta na maioria dos sistemas. Sem alvo, "confiável" é opinião, e
qualquer incidente parece igualmente grave.

E o SLO traz junto o mecanismo que o torna operacional: o **orçamento de erro** — a
quantidade de falha permitida pelo alvo. Ele transforma confiabilidade de aspiração em
número que se gasta.

## Problema

Sem alvo definido, duas dinâmicas ruins aparecem.

**Todo incidente é urgente.** Não há critério para distinguir o que exige interromper o
roteiro do que pode esperar. O time reage a tudo, e o roteiro nunca avança.

**Ou nada é.** Sem número, a confiabilidade compete com funcionalidades sem argumento
próprio, e perde sempre.

O SLO resolve as duas ao dar um limite: acima dele, o sistema está bom o suficiente e o
trabalho vai para produto; abaixo, a confiabilidade tem prioridade — e isso foi
acordado antes, não negociado durante a crise.

## Conceitos Centrais

### O orçamento de erro é o mecanismo

```text
SLO de 99,9% em 28 dias
  → 0,1% de falha permitida
  → cerca de 40 minutos de indisponibilidade no período
  → esse é o orçamento
```

O orçamento é para ser **gasto**. Um sistema que fica em 99,99% quando o alvo é 99,9%
está sobre-investindo em confiabilidade — recursos que poderiam estar em produto.

E o consumo do orçamento vira regra operacional:

```text
orçamento restante > 50%   → risco liberado, implantar com frequência
orçamento entre 10% e 50%  → cautela, revisar mudanças arriscadas
orçamento esgotado         → congelar funcionalidades, priorizar estabilidade
```

Essa é a contribuição prática mais importante do conceito: uma regra acordada
antecipadamente sobre quando parar de entregar e começar a consertar — que evita a
discussão política durante o incidente.

### O alvo vem do negócio, com o custo na mesa

Cada nove adicional custa desproporcionalmente mais:

```text
99%      3,7 dias/ano de indisponibilidade   arquitetura simples
99,9%    8,8 horas/ano                       redundância, automação
99,99%   53 minutos/ano                      multi-zona, failover automatizado
99,999%  5 minutos/ano                       multi-região, engenharia dedicada
```

A conversa correta não é "queremos o máximo". É: "de 99,9% para 99,99% custa X por ano;
a indisponibilidade evitada vale Y?".

E há um teto que a engenharia não controla: **um sistema não pode ser mais disponível
que suas dependências síncronas**. Prometer 99,99% dependendo de um serviço externo com
99,9% é impossível.

### Cem por cento é o alvo errado

Perseguir zero falha é caro, impossível e contraproducente.

Impossível porque as dependências falham — inclusive o provedor de nuvem, a rede do
usuário, o DNS.

Contraproducente porque o esforço marginal para eliminar a última fração de falha
supera qualquer valor entregue, e porque um alvo inatingível deixa de orientar
decisões — se nunca é atingido, o orçamento nunca informa nada.

E há um efeito perverso: se o usuário experimenta 99,9% por causa da rede dele, subir o
serviço de 99,9% para 99,99% não muda nada que ele perceba.

### A janela importa tanto quanto o número

```text
99,9% em 24 horas   → 86 segundos de orçamento. Um incidente estoura.
99,9% em 28 dias    → 40 minutos. Absorve um incidente médio.
99,9% em 90 dias    → 2 horas. Muito frouxo para reagir.
```

Janela curta demais faz o orçamento oscilar e perder valor de sinal. Longa demais
esconde degradação recente.

Vinte e oito dias é a escolha usual: absorve variação semanal e reage em prazo útil.

### Taxa de consumo é o alerta útil

Alertar quando o orçamento acaba avisa tarde. O alerta que funciona é sobre a
**velocidade** com que ele está sendo consumido:

```text
consumindo 1× o esperado   normal
consumindo 6×              o orçamento do mês acaba em 5 dias
consumindo 36×             acaba em 20 horas — página alguém agora
```

Isso substitui o alerta por limiar — "taxa de erro acima de 1%" — que dispara em
picos irrelevantes e não dispara em degradação lenta e sustentada.

E permite graduar a resposta: consumo alto e rápido acorda alguém; consumo moderado e
prolongado vira tarefa priorizada.

### SLO não é SLA

Ver [SLA](sla.md). Resumidamente:

```text
SLO  alvo interno, sem penalidade, ambicioso
SLA  compromisso com o cliente, com penalidade, conservador
```

O SLO deve ser **mais rigoroso** que o SLA, com folga. Se os dois forem iguais,
qualquer falta ao alvo já é quebra de contrato.

## Modelo Mental

**O SLO define o quanto de falha é aceitável, e o orçamento é essa quantidade em
forma de saldo.** Ele existe para ser gasto, não para ser preservado.

## Quando Usar

- Existem jornadas críticas com [SLI](sli.md) definido.
- É preciso decidir entre entregar e estabilizar.
- Há compromisso contratual a sustentar.
- O investimento em confiabilidade precisa de justificativa.
- Vários times precisam de critério comum de prioridade.

## Quando Não Usar

**Sem SLI que meça a experiência.**

**Cem por cento como alvo.**

**Definido pela engenharia sozinha.** É decisão de negócio.

**Prometendo mais que as dependências permitem.**

**Sem regra acordada** sobre o que fazer quando o orçamento esgota. Aí ele vira número
decorativo.

**Janela curta demais.** O orçamento oscila e perde sinal.

## Alternativas

- **Alerta por limiar** — mais simples, dispara em ruído e perde degradação lenta.
- **Acompanhamento de incidentes** — contagem e duração, sem alvo. Descreve o passado,
  não orienta decisão.
- **SLO por classe de serviço** — alvos diferentes para jornadas de criticidade
  diferente. Frequentemente o desenho certo.

## Trade-offs

| SLO rigoroso | Frouxo |
|---|---|
| Menos falha tolerada | Mais |
| Custo alto | Baixo |
| Congelamentos frequentes | Raros |
| Pouca margem para risco | Muita |

| Janela curta | Longa |
|---|---|
| Reage rápido | Absorve variação |
| Oscila | Estável |
| Um incidente estoura | Esconde degradação |

## Modos de Falha

**Orçamento sem consequência.** Esgota e nada muda.

**Alvo inatingível.** Perde valor de orientação.

**Alvo frouxo demais.** Nunca é atingido, e a degradação real não aparece.

**Definido sem o negócio.** Ninguém respeita o congelamento.

**Igual ao SLA.** Sem folga para erro.

**Alerta só no esgotamento.** Avisa quando não há mais o que fazer.

**Excesso de SLOs.** Vinte alvos que ninguém acompanha.

## Erros Comuns

**Perseguir cem por cento.**

**Não acordar a regra de congelamento antes.**

**Alertar por limiar em vez de taxa de consumo.**

**Definir o alvo sem verificar as dependências.**

**Não revisar o alvo** quando o negócio muda.

**Tratar orçamento como algo a preservar.**

## Exemplo Real

Uma plataforma de logística tinha uma tensão recorrente entre produto e engenharia:
produto pedia velocidade de entrega; engenharia dizia que o sistema estava instável.

Nenhum lado tinha número, e a discussão se repetia a cada trimestre sem resolução.

A introdução de SLOs mudou o formato:

**Três jornadas com SLI e SLO**, definidos com a diretoria:

```text
criar remessa       99,95% em 28 dias, latência < 2s
rastrear remessa    99,9%,  latência < 1s
relatório gerencial 99,0%,  latência < 30s
```

Os alvos foram derivados de impacto: uma hora sem criar remessa para a operação dos
clientes; rastreamento indisponível gera chamados; relatório atrasado é inconveniente.

**Regra de orçamento acordada** e assinada pela diretoria: orçamento esgotado significa
congelar funcionalidades daquela jornada até recuperar 25%.

**Alerta por taxa de consumo**, em dois níveis: consumo acima de 14 vezes acorda o
sobreaviso; acima de 3 vezes por seis horas gera tarefa priorizada.

O que aconteceu nos primeiros seis meses:

**Rastreamento estourou o orçamento duas vezes.** O congelamento aconteceu — sem
discussão, porque a regra estava acordada. As duas causas eram a mesma: uma dependência
externa de geolocalização sem circuit breaker. Corrigida, a jornada estabilizou.

**Criação de remessa ficou em 99,98%** — bem acima do alvo. Isso revelou
sobre-investimento: havia redundância e verificações que o alvo não exigia. Parte do
esforço foi realocado.

**Relatório gerencial ficou em 98,2%**, abaixo do alvo — e a análise mostrou que ninguém
se importava. O alvo foi renegociado para 97%, e o time parou de tratar as falhas dali
como urgentes.

O que a equipe aprendeu: o efeito mais valioso não foi técnico. Foi a discussão
trimestral entre produto e engenharia deixar de existir, porque passou a haver um
número acordado que respondia à pergunta.

E o terceiro caso — reduzir um alvo — foi o mais difícil de aceitar culturalmente, e o
que mais liberou capacidade.

## Conceitos Relacionados

- [SLI](sli.md) — o que é medido.
- [SLA](sla.md) — o compromisso externo.
- [Métricas de Disponibilidade](availability-metrics.md).
- [Engenharia do Caos](chaos-engineering.md) — verifica se o alvo se sustenta.

## Exercício Prático

Para a jornada mais crítica do seu produto, proponha um SLO e calcule o orçamento de
erro em minutos por mês.

Depois pergunte ao negócio: se gastarmos esse orçamento inteiro num mês, isso é
aceitável? A resposta calibra o alvo melhor que qualquer discussão técnica.

## Perguntas de Entrevista

- Por que o orçamento de erro existe para ser gasto?
- Por que alertar por taxa de consumo é melhor que por limiar?
- Por que cem por cento é o alvo errado?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulos 3 e 4.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018 — capítulos 2 a 5.
- Google. *SRE Workbook: Alerting on SLOs*.
