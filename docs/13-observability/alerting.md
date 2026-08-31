---
id: alerting
title: Alertas
sidebar_position: 7
description: O que merece acordar alguém — e por que a maioria dos alertas existentes não merece.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor mantém apenas alertas acionáveis, baseados em sintoma, e
  elimina os que produzem fadiga.
prerequisites: [golden-signals]
related: [golden-signals, slo, sre-concepts]
canonical_for: [alerta acionável, fadiga de alerta, sintoma versus causa, alerta baseado em SLO]
content_version: 1
last_reviewed: 2026-08-28
---

# Alertas

## Visão Geral

Um alerta interrompe uma pessoa. Esse é o custo, e ele é real: atenção, contexto
perdido, sono, desgaste.

O critério que justifica esse custo é estreito: **algo está afetando usuários, ou vai
afetar em breve, e há uma ação humana que resolve.**

A maioria dos alertas de um sistema típico não passa nesse teste. Eles existem porque
alguém, em algum momento, quis saber de algo — e ninguém revisou depois.

## Problema

A dinâmica que produz excesso de alertas é conhecida:

Um incidente acontece. A análise conclui que um alerta teria ajudado. O alerta é criado.
Repete-se dezenas de vezes ao longo dos anos.

Ninguém remove. O resultado é um volume que ninguém consegue processar, e a resposta
humana previsível: **ignorar**.

A partir daí, os alertas param de funcionar — inclusive os bons. Um time que recebe
quarenta notificações por dia não reage à quadragésima primeira, mesmo que ela seja a
importante.

Fadiga de alerta não é um problema de disciplina. É a consequência esperada de um
sistema que interrompe demais.

## Conceitos Centrais

### Os três testes

Todo alerta que acorda alguém precisa passar nos três:

```text
urgente     precisa de ação agora, não pode esperar o horário comercial
acionável   existe algo que a pessoa pode fazer
relevante   afeta usuários, ou vai afetar
```

Falhar em qualquer um significa que o alerta deveria ser outra coisa: uma tarefa
priorizada, um item de painel, ou nada.

O teste de acionabilidade é o mais eficaz. Um alerta cuja resposta é "olhar e ver que
passou" não é acionável — ele é ruído com aparência de informação.

### Alerte no sintoma, não na causa

```text
causa      "CPU acima de 80%"
sintoma    "a taxa de erro do checkout está acima do limite"
```

Alertar em causas produz dois problemas: dispara quando não há impacto — CPU alta pode
ser normal — e não dispara quando há impacto por uma causa que ninguém previu.

Alertar em sintoma cobre todas as causas, inclusive as desconhecidas, e só dispara
quando importa.

As causas continuam sendo medidas — elas aparecem no painel e são usadas para
diagnóstico. Elas simplesmente não acordam ninguém.

A exceção legítima: causas com previsibilidade alta e prazo — "certificado expira em 14
dias", "disco cheio em 6 horas". Elas são acionáveis e evitam o sintoma.

### Baseie no orçamento de erro

Ver [SLO](/12-reliability/slo.md). Alertar quando o orçamento está sendo consumido
rápido demais substitui os limiares arbitrários:

```text
limiar     "taxa de erro > 1%"  → dispara em picos irrelevantes,
                                   não dispara em degradação lenta
consumo    "no ritmo atual, o orçamento do mês acaba em 20 horas"
```

O segundo é proporcional ao impacto real e permite graduar a resposta: consumo rápido
acorda alguém; consumo moderado e prolongado vira tarefa priorizada.

É a mudança que mais reduz volume de alertas sem reduzir cobertura.

### Nem tudo precisa acordar alguém

Três destinos, e a maioria dos alertas atuais pertence aos dois últimos:

```text
acordar         urgente, acionável, afetando usuários
ticket          precisa de ação, pode esperar o horário comercial
painel          informação de contexto, sem ação
```

A pergunta que classifica: **se isso disparar às 3h, alguém precisa levantar?** Se a
resposta for não, não é alerta de sobreaviso.

Rebaixar alertas para ticket é a intervenção mais rápida para reduzir fadiga, e ela não
perde nada — o trabalho continua sendo feito, em horário razoável.

### Todo alerta precisa de contexto

Uma notificação que diz "erro no serviço de pedidos" obriga a pessoa a começar do zero,
às 3h, sem contexto.

O que um alerta útil traz:

```text
o que está acontecendo, em termos de impacto
desde quando
qual a magnitude
link para o painel relevante
link para o procedimento, se houver
o que mudou recentemente — implantações, alterações de configuração
```

O último item resolve uma fração alta dos incidentes sozinho, porque a maioria é
causada por mudança recente.

### Revisar é parte do trabalho

Alertas envelhecem: o sistema muda, os limiares ficam errados, a causa foi corrigida.

A prática que sustenta: revisão periódica, com dados.

```text
alertas que dispararam e não geraram ação   → candidatos a remoção
alertas que nunca dispararam em 12 meses    → verificar se ainda fazem sentido
alertas que disparam com frequência alta    → o problema deveria ser corrigido
incidentes sem alerta correspondente        → lacuna de cobertura
```

A terceira linha é a mais importante: um alerta que dispara toda semana não é um alerta,
é um problema conhecido que ninguém priorizou.

## Modelo Mental

**Alerta é uma interrupção com custo humano.** Se não há ação urgente, ele é outra
coisa.

## Quando Usar

- Sintoma afetando usuários, com ação disponível.
- Consumo acelerado de orçamento de erro.
- Condição previsível com prazo — certificado, cota, disco.
- Falha de mecanismo de proteção.
- Ausência de algo que deveria acontecer — tarefa não executada, tráfego cessado.

## Quando Não Usar

**Em causas** sem impacto direto.

**Sem ação possível.**

**Para o que pode esperar o horário comercial.**

**Com limiar arbitrário**, quando orçamento de erro está disponível.

**Sem contexto na notificação.**

**Sem revisão periódica.**

## Alternativas

- **Ticket priorizado** — para o que precisa de ação sem urgência.
- **Item de painel** — para contexto.
- **Alerta baseado em [SLO](/12-reliability/slo.md)** — proporcional ao impacto.
- **Correção automática** — quando a ação é sempre a mesma, automatize em vez de
  alertar. O melhor alerta é o que deixa de existir.

## Trade-offs

| Poucos alertas | Muitos |
|---|---|
| Cada um é levado a sério | Ignorados |
| Risco de lacuna | Cobertura ampla |
| Revisão necessária | Acumulação |

| Sintoma | Causa |
|---|---|
| Cobre causas desconhecidas | Só as previstas |
| Dispara quando importa | Também quando não |
| Diagnóstico ainda necessário | Aponta a causa |

## Modos de Falha

**Fadiga.** O volume torna todos ignoráveis.

**Alerta sem ação.** A pessoa acorda e não faz nada.

**Limiar errado.** Dispara em condição normal, ou não dispara em anormal.

**Lacuna de cobertura.** Incidente sem alerta.

**Alerta em cascata.** Uma causa dispara vinte alertas de serviços dependentes.

**Silenciado permanentemente.** Alguém silenciou durante um incidente e não reativou.

**Alerta sobre o próprio sistema de alertas.** Quando ele falha, ninguém sabe.

## Erros Comuns

**Alertar em causas.** CPU alta pode ser normal; o que precisa acordar alguém é sintoma com impacto — usuário sem conseguir concluir. Alertar em causa gera ruído e treina o time a ignorar.

**Não classificar entre acordar, ticket e painel.** Tratar tudo como urgente esgota o plantão, e o alerta importante chega junto com trinta que não eram.

**Não revisar.** Alertas acumulam por incidentes passados e nunca são removidos. Sem revisão periódica, a maioria dos disparos passa a ser de regras que já não fazem sentido.

**Notificação sem contexto.** Um alerta que não diz o impacto, o que verificar e onde olhar transfere para quem foi acordado o trabalho de descobrir por que foi acordado.

**Não alertar sobre ausência.** Um processo que parou de rodar não gera erro. Só a verificação pela expectativa — devia ter acontecido e não aconteceu — detecta isso.

**Não agrupar alertas em cascata.** Uma causa raiz dispara quarenta notificações de serviços dependentes, e o sinal da causa se perde no meio das consequências.

## Exemplo Real

Uma plataforma de logística tinha 214 alertas configurados. O sobreaviso recebia, em
média, **31 notificações por dia**.

A consequência era previsível: as notificações eram silenciadas em massa, e dois
incidentes reais tinham passado despercebidos por horas.

A revisão, feita com doze meses de dados:

```text
disparam e ninguém age            118 alertas → removidos
nunca dispararam em 12 meses       47 alertas → 31 removidos, 16 corrigidos
disparam semanalmente              22 alertas → problemas conhecidos, priorizados
acionáveis e urgentes              27 alertas → mantidos
```

Os 22 da terceira linha foram o achado mais interessante: cada um representava um
problema recorrente que a equipe tinha aprendido a conviver, respondendo ao alerta e
executando a mesma ação. Onze deles foram automatizados; os outros onze viraram tarefas
de correção.

A reformulação:

**27 alertas mantidos**, todos baseados em sintoma.

**Alertas por orçamento de erro** para as três jornadas críticas, substituindo nove
alertas de limiar.

**Rebaixamento para ticket** de 34 condições que precisavam de ação sem urgência.

**Agrupamento de cascata**: quando uma dependência falha, os alertas dos serviços que
dependem dela são suprimidos e agrupados na notificação da causa.

**Contexto na notificação**: impacto, magnitude, duração, link para painel, e as
mudanças das últimas duas horas.

**Revisão trimestral** com os mesmos quatro critérios.

Resultado: de 31 notificações por dia para **1,4**. E o tempo médio de resposta caiu,
porque cada notificação passou a ser levada a sério.

O aprendizado que ficou: os 118 alertas removidos tinham sido criados por pessoas
razoáveis, cada um em resposta a um incidente real. Nenhum foi um erro individual — o
erro foi nunca revisar.

## Conceitos Relacionados

- [Sinais Dourados](/13-observability/golden-signals.md) — a base.
- [SLO](/12-reliability/slo.md) — o alerta proporcional.
- [Conceitos de SRE](/13-observability/sre-concepts.md).
- [Painéis](/13-observability/dashboards.md) — o destino do que não é alerta.

## Exercício Prático

Pegue os alertas que dispararam no último mês e classifique cada um: gerou ação urgente,
gerou ação adiável, ou não gerou ação?

A terceira categoria costuma ser a maior — e removê-la é a intervenção de maior retorno
disponível.

## Perguntas de Entrevista

- Quais os três testes que um alerta de sobreaviso precisa passar?
- Por que alertar em sintoma e não em causa?
- O que significa um alerta que dispara toda semana?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 6.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018 — capítulo 5.
- Ewaschuk, Rob. *My Philosophy on Alerting*, 2013.
