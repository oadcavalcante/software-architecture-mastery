---
id: sre-concepts
title: Conceitos de SRE
sidebar_position: 9
description: O vocabulário e as práticas que organizam operação em escala — e o que se perde ao adotar só o nome.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece as práticas de SRE que se aplicam ao seu contexto e
  as que dependem de escala que ele não tem.
prerequisites: [observability]
related: [slo, alerting, resilience]
canonical_for: [SRE, trabalho manual, análise de incidente, sobreaviso sustentável]
content_version: 1
last_reviewed: 2026-08-28
---

# Conceitos de SRE

## Visão Geral

Engenharia de confiabilidade de sistemas é uma abordagem para operação que trata
confiabilidade como problema de engenharia de software, não de administração de
sistemas.

Ela trouxe um conjunto de práticas e um vocabulário que se difundiram amplamente —
[SLO](/12-reliability/slo.md), orçamento de erro, análise de incidente sem culpado,
redução de trabalho manual.

E se difundiu também o padrão de adotar o **nome** sem as práticas: renomear o time de
operações para SRE e continuar operando igual.

## Problema

As práticas de SRE nasceram num contexto específico — escala muito grande, times de
engenharia dedicados, sistemas com milhares de máquinas.

Nem tudo transfere. Algumas práticas exigem escala; outras exigem autonomia
organizacional que a empresa não tem; outras se aplicam a qualquer contexto.

Adotar tudo indiscriminadamente produz cerimônia. Adotar só o nome produz frustração.

O trabalho é distinguir.

## Conceitos Centrais

### O que transfere para praticamente qualquer contexto

```text
SLO com orçamento de erro     alvo acordado e regra do que fazer ao esgotá-lo
alertar em sintoma            ver alertas
análise sem busca de culpado  a informação só aparece sem medo
reduzir trabalho manual       automatizar o repetitivo
sobreaviso sustentável        rotação, compensação, limite de interrupções
```

Essas cinco não dependem de escala. Elas dependem de decisão organizacional, e são as
que mais mudam o dia a dia de um time pequeno.

Ver [SLO](/12-reliability/slo.md) e [alertas](/13-observability/alerting.md).

### O que depende de escala

```text
time de SRE separado          exige volume que justifique especialização
engajamento com critério      SRE assume a operação se o serviço atender requisitos
projeto de plataforma própria custa um time
automação sofisticada          o retorno depende de repetição em volume
```

Numa empresa de trinta engenheiros, um time de SRE separado costuma criar a divisão
que a abordagem queria eliminar — quem constrói e quem opera.

Ali, o modelo que funciona é o time que constrói operar o que constrói, com práticas de
SRE aplicadas por ele mesmo.

### Trabalho manual: o que conta e por que limitar

Trabalho manual, no vocabulário de SRE, tem definição precisa:

```text
manual        exige uma pessoa
repetitivo    já foi feito antes, será feito de novo
automatizável não exige julgamento
sem valor duradouro  o sistema não fica melhor depois
cresce com o serviço  mais tráfego, mais desse trabalho
```

Nem todo trabalho operacional é trabalho manual nesse sentido: investigar um incidente
novo exige julgamento e produz aprendizado.

O critério que a prática estabelece — limitar o trabalho manual a uma fração do tempo,
tipicamente metade — existe porque ele cresce naturalmente até consumir todo o tempo
disponível, e aí não sobra capacidade para eliminá-lo.

Medir a fração é o primeiro passo, e costuma revelar números desconfortáveis.

### Análise de incidente sem busca de culpado

A prática é frequentemente mal compreendida. Ela não é sobre ser gentil.

É sobre **obter informação**: se as pessoas temem consequência, elas omitem — e a
análise fica errada, produzindo correções que não atacam a causa.

O que caracteriza uma análise que funciona:

```text
foco em condições      "por que essa ação pareceu razoável no momento?"
linha do tempo factual  o que se sabia, quando
múltiplas causas        raramente há uma só
ações com dono e prazo  sem isso, nada muda
publicada               o aprendizado é da organização
```

A segunda linha é o teste: uma análise que conclui "o engenheiro errou" não explica
nada. Todo erro pareceu razoável para quem o cometeu, com a informação que ele tinha —
e entender por quê é o que permite mudar o sistema.

### Sobreaviso precisa ser sustentável

Uma prática que é ética e operacional ao mesmo tempo: pessoas exaustas decidem pior no
momento em que a decisão importa mais.

```text
rotação suficiente     não mais de uma semana a cada quatro ou cinco
volume limitado        um número máximo de interrupções por turno
compensação            reconhecimento formal do ônus
procedimentos          reduzem carga cognitiva
tempo para corrigir    quem foi acordado tem tempo para atacar a causa
```

O último item é o que fecha o ciclo: sem tempo alocado para corrigir o que causou o
acionamento, o mesmo alerta volta na semana seguinte.

E o limite de interrupções é o que torna o excesso de alertas visível como problema, em
vez de ser absorvido silenciosamente pelas pessoas. Ver
[alertas](/13-observability/alerting.md).

### Confiabilidade compete com funcionalidade

O orçamento de erro existe para tornar essa competição explícita e resolvível por
regra, em vez de por negociação política a cada trimestre.

Ver [SLO](/12-reliability/slo.md). Sem ele, a discussão "precisamos estabilizar" contra
"precisamos entregar" se repete indefinidamente, e a segunda ganha por falta de
argumento numérico da primeira.

## Modelo Mental

**SRE trata operação como engenharia.** Adote as práticas que não dependem de escala; as
outras exigem contexto que talvez você não tenha.

## Quando Usar

- Sistemas com operação contínua e sobreaviso.
- Onde confiabilidade compete com entrega sem critério de decisão.
- Onde o trabalho operacional consome capacidade de engenharia.
- Onde incidentes se repetem sem aprendizado.

## Quando Não Usar

**Renomeando o time sem mudar as práticas.**

**Time de SRE separado** em organização pequena.

**Adotando todas as práticas** independentemente do contexto.

**Análise de incidente com busca de culpado.** Pior que não fazer.

**Sem autonomia para agir.** Um time que não pode priorizar correções não pode
sustentar orçamento de erro.

**Sobreaviso sem compensação nem limite.**

## Alternativas

- **Time que constrói opera o que constrói** — o modelo adequado à maioria das
  organizações.
- **Plataforma interna** — reduz o trabalho operacional de todos os times sem criar
  divisão. Ver
  [DevOps e plataforma](/14-devops-and-platform/index.md).
- **Adoção parcial** — as cinco práticas que transferem, sem a estrutura.

## Trade-offs

| Time de SRE separado | Cada time opera o seu |
|---|---|
| Especialização | Contexto do produto |
| Risco de recriar a divisão | Sem barreira |
| Exige escala | Funciona em qualquer tamanho |
| Padronização | Variação entre times |

| Orçamento de erro | Negociação caso a caso |
|---|---|
| Regra acordada antes | Discussão a cada vez |
| Exige alvo e medição | Nada |

## Modos de Falha

**Nome sem prática.** Operações renomeada.

**Orçamento sem consequência.** Esgota e nada muda.

**Análise que culpa.** A informação some.

**Trabalho manual consumindo todo o tempo.** Sem capacidade de eliminá-lo.

**Sobreaviso insustentável.** Rotatividade e decisões piores.

**Práticas adotadas sem autonomia.** O time mede e não pode agir.

## Erros Comuns

**Adotar o vocabulário sem as decisões.**

**Criar time separado prematuramente.**

**Não medir a fração de trabalho manual.**

**Não alocar tempo para corrigir** o que causou acionamentos.

**Análise de incidente sem ações rastreadas.**

**Não limitar interrupções por turno.**

## Exemplo Real

Uma empresa de tecnologia com 80 engenheiros criou um time de SRE de cinco pessoas,
transferindo para ele a operação de todos os serviços.

Dezoito meses depois, o resultado era o oposto do pretendido:

**O time de SRE virou gargalo.** Toda implantação e toda mudança de infraestrutura
passavam por ele.

**A divisão voltou.** Os times de produto pararam de se preocupar com operação — "isso é
do SRE" —, e a qualidade operacional do que era construído piorou.

**Trabalho manual dominava.** Uma medição informal apontou que cerca de 80% do tempo do
time era operação repetitiva. Não sobrava capacidade para automatizar.

**Rotatividade.** Três das cinco pessoas saíram no período.

A reformulação abandonou a estrutura e manteve as práticas:

**Cada time opera o que constrói**, com sobreaviso próprio.

**O time de plataforma** — o que restou do SRE, com duas pessoas e depois quatro —
passou a construir ferramentas, não a operar serviços: esteiras, telemetria
padronizada, painéis gerados, procedimentos.

**SLOs por serviço**, definidos com produto, com regra de congelamento acordada.

**Análise de incidente sem culpado**, publicada internamente, com ações rastreadas.

**Limite de interrupções**: mais de cinco acionamentos noturnos num turno de uma semana
dispara revisão obrigatória dos alertas daquele serviço.

**Tempo alocado**: quem esteve de sobreaviso tem os dois primeiros dias da semana
seguinte para corrigir o que o acordou.

Nos doze meses seguintes, os acionamentos noturnos caíram 70%, e a fração de trabalho
manual do time de plataforma foi de 80% para cerca de 30%.

O ponto que a equipe sublinha: as práticas eram corretas desde o início; a estrutura estava
errada para o tamanho da empresa. E a última mudança — tempo alocado para corrigir — foi
a que mais reduziu acionamentos, porque fechou o ciclo entre ser acordado e eliminar a
causa.

## Conceitos Relacionados

- [SLO](/12-reliability/slo.md) — o mecanismo central.
- [Alertas](/13-observability/alerting.md) — o sobreaviso sustentável.
- [Resiliência](/12-reliability/resilience.md) — o aprendizado.
- [DevOps e Plataforma](/14-devops-and-platform/index.md).

## Exercício Prático

Meça a fração do tempo do seu time gasta em trabalho repetitivo, automatizável e sem
valor duradouro, durante duas semanas.

Se passar de metade, não há capacidade para eliminá-lo — e ele vai crescer.

## Perguntas de Entrevista

- Quais práticas de SRE transferem para qualquer contexto, e quais dependem de escala?
- O que caracteriza trabalho manual, e por que limitá-lo?
- Por que análise sem busca de culpado é sobre informação, não sobre gentileza?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- Allspaw, John. *Blameless PostMortems and a Just Culture*, 2012.
