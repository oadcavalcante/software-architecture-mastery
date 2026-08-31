---
id: architecture-roadmaps
title: Roteiros de Arquitetura
sidebar_position: 19
description: O que fazer e quando — e por que um roteiro sem entrega intermediária não sobrevive.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor constrói roteiros com entregas intermediárias e horizonte
  proporcional à previsibilidade.
prerequisites: [transition-architecture]
related: [transition-architecture, technical-strategy, target-architecture]
canonical_for: [roteiro de arquitetura, horizonte de roteiro, entrega intermediária]
content_version: 1
last_reviewed: 2026-08-28
---

# Roteiros de Arquitetura

## Visão Geral

Um roteiro de arquitetura organiza no tempo o que a
[estratégia](/15-enterprise-architecture/technical-strategy.md) escolheu e a
[transição](/15-enterprise-architecture/transition-architecture.md) descreveu.

Ele responde: **o que fazemos primeiro, e o que depende do quê.**

E falha de uma forma característica: um cronograma de dezoito meses com dependências em
cadeia, em que o valor só aparece no fim — e que não sobrevive à primeira mudança de
prioridade.

## Problema

O roteiro tradicional herda o formato de projeto: fases, marcos, datas, dependências.

Isso pressupõe que o plano será executado como escrito. Na prática:

```text
prioridades mudam
premissas se revelam erradas
aprendizados durante a execução mudam o desenho
pessoas entram e saem
```

Um roteiro que precisa ser executado inteiro para entregar algo é um roteiro que será
interrompido no meio, deixando trabalho investido sem retorno.

## Conceitos Centrais

### Entregas intermediárias, não fases

```text
fases            preparação → construção → migração → desligamento
                 valor apenas no fim
entregas         cada etapa entrega algo utilizável
                 parar em qualquer ponto deixa a organização melhor
```

Ver [arquitetura de transição](/15-enterprise-architecture/transition-architecture.md) — é o mesmo princípio,
expresso no tempo.

A pergunta que testa cada item do roteiro: **se pararmos aqui, o que foi entregue vale o
que foi gasto?**

Se a resposta for não, a sequência precisa ser reordenada — por valor, não por
dependência técnica.

### Horizonte decrescente em precisão

```text
próximos 3 meses    itens concretos, com dono e estimativa
3 a 9 meses         direção, com granularidade grossa
além de 9 meses     temas, sem compromisso de data
```

Um roteiro com o mesmo nível de detalhe em todo o horizonte transmite uma precisão que
não existe — e cria a expectativa de que datas distantes são compromissos.

O formato que comunica honestamente é o que mostra a incerteza crescendo com a
distância.

### Datas ou sequência

```text
com datas       necessário quando há dependência externa —
                contrato, regulação, evento de negócio
sem datas       sequência e dependência, sem compromisso de calendário
```

A segunda forma é mais honesta para trabalho de arquitetura, cuja duração é
genuinamente incerta.

E quando datas são necessárias, elas devem vir com o intervalo de confiança: "entre
março e junho" comunica melhor que "abril", e evita a conversa de atraso.

### O roteiro precisa mostrar o que não está nele

Um item que alguém espera e não está no roteiro gera atrito quando descoberto tarde.

Tornar as ausências explícitas — "isto não está previsto para os próximos 18 meses" — é
o que transforma uma expectativa implícita numa conversa. Ver
[estratégia técnica](/15-enterprise-architecture/technical-strategy.md).

### Dependência entre times é o que trava

Roteiros de arquitetura frequentemente atravessam times, e a dependência é onde os
atrasos se acumulam:

```text
time A depende de time B, que depende de time C
cada um com prioridades próprias
o item do roteiro fica bloqueado pela fila do outro
```

O que reduz:

**Reordenar para minimizar dependência.** Preferir itens que um time completa sozinho.

**Explicitar o pedido cedo.** O time dependido precisa saber com antecedência para
priorizar.

**Aceitar duplicação temporária.** Às vezes é mais barato duplicar que esperar.

Ver [paisagens de integração](/15-enterprise-architecture/integration-landscapes.md) — a dependência de roteiro
reflete a dependência estrutural.

### Revisar com evidência

```text
mensal      progresso, obstáculos
trimestral  a sequência ainda faz sentido? o que aprendemos?
semestral   a estratégia ainda vale?
```

A revisão trimestral é a que importa: ela é onde o aprendizado da execução realimenta o
plano.

Um roteiro executado sem revisão é um plano de doze meses executado com a informação de
doze meses atrás.

### Ele comunica antes de planejar

O uso mais valioso de um roteiro não é interno. É **comunicação**: com o negócio, com
outros times, com quem depende.

Isso muda o formato: um roteiro que só a engenharia entende falha no uso principal.
Itens expressos em termos de capacidade e de resultado — não de tecnologia — são o que
permite a conversa acontecer.

## Modelo Mental

**Cada item entrega valor por si.** Um roteiro que só entrega no fim não sobrevive à
primeira mudança de prioridade.

## Quando Usar

- Após definir estratégia e transição.
- Para comunicar direção ao negócio.
- Para coordenar trabalho entre times.
- Em programas de modernização.

## Quando Não Usar

**Com valor apenas no fim.**

**Com precisão uniforme** em todo o horizonte.

**Com datas onde a incerteza é alta.**

**Sem mostrar o que não está previsto.**

**Sem revisão trimestral.**

**Em vocabulário técnico**, quando o público é o negócio.

## Alternativas

- **Sequência sem datas** — dependência e ordem, sem calendário.
- **Temas por trimestre** — direção sem itens específicos.
- **Roteiro de resultados** — expresso em capacidades habilitadas, não em trabalho.
- **Fluxo contínuo priorizado** — sem roteiro, com uma fila revisada continuamente.

A última funciona bem para trabalho de melhoria contínua, e mal para programas com
dependências entre times.

## Trade-offs

A escolha entre datas e sequência depende de haver dependência externa. Quando não há,
sequência comunica melhor: ela transmite ordem sem criar compromisso que a incerteza não
sustenta.

| Com datas | Sem datas |
|---|---|
| Coordenação externa possível | Menos compromisso falso |
| Pressão de prazo e conversa de atraso | Menos previsível para terceiros |
| Exige estimativa que pode não existir | Aceita a incerteza |
| Útil com regulação ou contrato | Útil em trabalho exploratório |

E o horizonte tem o mesmo trade-off entre utilidade e honestidade:

| Horizonte longo | Curto |
|---|---|
| Direção visível para quem depende | Acionável agora |
| Precisão baixa, revisão frequente | Alta |
| Permite planejar dependências | Reage melhor a mudança |
| Risco de virar compromisso | Sem esse risco |

## Modos de Falha

**Valor só no fim.** Interrompido, nada foi entregue.

**Precisão falsa.** Datas distantes tratadas como compromisso.

**Dependência entre times.** Bloqueio pela fila alheia.

**Sem revisão.** Executado com informação antiga.

**Vocabulário técnico.** O negócio não consegue participar.

**Ausências implícitas.** Expectativas não atendidas descobertas tarde.

## Erros Comuns

**Ordenar por dependência técnica.**

**Detalhe uniforme.**

**Não explicitar o que fica de fora.**

**Não revisar trimestralmente.**

**Não expressar em resultados.**

**Não negociar dependências entre times cedo.**

## Exemplo Real

Uma empresa de varejo tinha um roteiro de modernização de 24 meses, com quatro fases e
dependências em cadeia.

Aos 14 meses, uma mudança de prioridade de negócio interrompeu o programa. O balanço:

```text
fase 1 — infraestrutura       concluída
fase 2 — extração de serviços 60%
fase 3 — migração de dados    não iniciada
fase 4 — desligamento         não iniciada
```

O valor entregue ao negócio: nenhum. A infraestrutura e os serviços parciais não
mudavam nada de observável, e o sistema antigo continuava operando integralmente.

Quatorze meses de trabalho sem retorno defensável.

A reformulação, dois anos depois, mudou a estrutura:

**Sequência por valor.** Cada item do roteiro entrega algo utilizável. O primeiro foi a
extração do catálogo — não porque era tecnicamente mais simples, mas porque destravava
uma capacidade de negócio esperada havia dois anos.

**Horizonte decrescente.** Três meses com itens e donos; nove meses com direção; além
disso, temas.

**Sem datas além do primeiro trimestre.** Sequência e dependência, com estimativas em
intervalo.

**Expresso em capacidades.** "Permitir alteração de catálogo sem release" em vez de
"extrair o serviço de catálogo".

Isso mudou a conversa com o negócio: os itens passaram a ser priorizáveis por quem
entende o valor.

**Ausências explícitas.** Uma seção do roteiro listava o que **não** estava previsto,
com o motivo. Ela evitou três discussões que teriam acontecido tarde.

**Revisão trimestral** com reordenação permitida.

Nos 18 meses seguintes, o programa foi interrompido duas vezes por mudança de
prioridade — e retomado nas duas. Cada interrupção deixou um estado defensável, e a
retomada não perdeu trabalho.

O aprendizado que ficou: o roteiro anterior estava tecnicamente correto na sequência de
dependências. Ele foi ordenado da forma que faz sentido para construir, e não da que faz
sentido para sobreviver.

## Conceitos Relacionados

- [Estratégia Técnica](/15-enterprise-architecture/technical-strategy.md) — o que priorizar.
- [Arquitetura de Transição](/15-enterprise-architecture/transition-architecture.md) — os estados.
- [Arquitetura Alvo](/15-enterprise-architecture/target-architecture.md).
- [Capacidades de Negócio](/15-enterprise-architecture/business-capabilities.md) — o vocabulário.

## Exercício Prático

Pegue o roteiro do seu time e teste cada item: se o programa parar logo depois dele, o
que foi entregue é defensável?

Os itens que falham no teste precisam ser reordenados ou redivididos.

## Perguntas de Entrevista

- Por que ordenar por valor em vez de por dependência técnica?
- Por que a precisão deve decrescer com o horizonte?
- Por que explicitar o que não está no roteiro?

## Para Aprofundar

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Highsmith, Jim. *Agile Project Management*. 2ª ed. Addison-Wesley, 2009.
- Open Group. *TOGAF Standard* — planejamento de migração.
