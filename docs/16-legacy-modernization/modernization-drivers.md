---
id: modernization-drivers
title: Motivadores de Modernização
sidebar_position: 2
description: O que justifica investir — e por que "é legado" não é motivo.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor exige um motivo concreto e mensurável antes de propor
  modernização, e sabe defender não modernizar.
prerequisites: [legacy-modernization]
related: [legacy-systems, migration-strategies, modernization-risk]
canonical_for: [motivador de modernização, custo de não fazer, modernização por desconforto]
content_version: 1
last_reviewed: 2026-08-28
---

# Motivadores de Modernização

## Visão Geral

Modernizar custa caro, demora, e traz risco. A pergunta que precede qualquer proposta:
**o que exatamente não conseguimos fazer por causa deste sistema?**

Se a resposta for "ele é antigo", "a tecnologia é obsoleta" ou "o código é ruim", não há
projeto — há desconforto.

Um motivo que sustenta investimento tem duas propriedades: ele descreve uma **limitação
concreta**, e o custo de conviver com ela é **mensurável**.

## Problema

Propostas de modernização costumam ser formuladas a partir do sintoma técnico:

```text
"a tecnologia está fora de suporte"
"o código é difícil de manter"
"é um monólito"
"ninguém quer trabalhar nele"
```

Nenhuma dessas responde à pergunta que quem decide o orçamento vai fazer: **o que
ganhamos?**

E o resultado é previsível: a proposta compete com iniciativas de produto que têm
retorno articulado, e perde — ano após ano, até que o sistema falhe ou o mantenedor saia.

Ver [arquitetura de negócio](/15-enterprise-architecture/business-architecture.md).

## Conceitos Centrais

### Os motivos que sustentam investimento

```text
capacidade bloqueada   o negócio quer fazer algo e o sistema impede
velocidade             mudanças levam meses; a concorrência responde em semanas
risco de pessoas       um ou dois mantenedores, sem substituição
risco de fornecedor    fim de suporte, descontinuação, prazo imposto
custo operacional      desproporcional ao valor que entrega
conformidade           requisito regulatório que o sistema não atende
segurança              vulnerabilidades sem correção disponível
```

Os três primeiros são os que mais frequentemente sustentam a decisão, e os que menos
aparecem articulados.

Note que nenhum deles é "a tecnologia é antiga". Antiguidade é um **indicador** de risco,
não um motivo — um sistema antigo, estável, com equipe que o domina e que ninguém precisa
mudar não tem problema.

### Traduzir o sintoma técnico em limitação de negócio

O trabalho que transforma uma proposta rejeitada numa aprovada:

```text
sintoma técnico              →  limitação de negócio
release trimestral            →  não conseguimos responder a movimento da concorrência
                                 em menos de um trimestre
regra de negócio em código    →  cada produto novo custa 3 meses de engenharia
um mantenedor                 →  se ele sair, ficamos sem capacidade de mudar
                                 a precificação
banco proprietário caro       →  R$ 2,1 milhões por ano em licença, para um sistema
                                 que atende 400 usuários
```

A coluna da direita compete por orçamento. A da esquerda, não.

Ver [capacidades de negócio](/15-enterprise-architecture/business-capabilities.md) — o
vocabulário que faz essa tradução.

### O custo de não fazer precisa ser calculado

Uma proposta de modernização é uma comparação entre dois custos, e o segundo geralmente
não é apresentado:

```text
custo de modernizar     estimativa do projeto
custo de não modernizar tempo perdido em cada mudança, incidentes,
                        oportunidades não atendidas, risco materializado
```

O segundo é difuso e contínuo, e por isso invisível. Torná-lo explícito é o que equilibra
a comparação.

```text
exemplo: 8 mudanças por ano, cada uma 6 semanas mais lenta que deveria
         → 48 semanas de engenharia por ano
         → o custo de não fazer, só nessa dimensão, é quase um ano de time
```

### Não modernizar é uma decisão legítima

E ela precisa ser defensável, não omissa.

```text
o sistema atende, é estável, e ninguém precisa mudá-lo
o custo de modernizar supera o de conviver
o sistema será descontinuado por outra razão em breve
há prioridades com retorno maior
```

Nesses casos, a decisão correta é registrar: **decidimos não modernizar, por estas
razões, e revisaremos em X meses**.

Isso é diferente de não decidir. A ausência de decisão produz o sistema que degrada
silenciosamente até virar crise.

### Modernização parcial frequentemente basta

A proposta costuma ser "substituir o sistema". Frequentemente o motivo real afeta uma
parte dele.

```text
motivo: produtos novos levam 3 meses
causa:  as regras de produto estão em código
solução: extrair as regras, tornar configurável
         → não exige substituir o sistema
```

Ver [modernização incremental](/16-legacy-modernization/incremental-modernization.md).

Identificar a parte que causa o problema, e atacar só ela, é frequentemente uma fração do
custo com a maior parte do benefício.

### Cuidado com o motivo confortável

Um viés a nomear: engenheiros preferem trabalhar em tecnologia moderna, e isso influencia
a avaliação de necessidade.

Isso não é desonestidade — é humano, e o motivo apresentado é geralmente verdadeiro. Mas
a **prioridade** atribuída a ele pode não ser.

O teste: se a mesma quantidade de esforço fosse aplicada a outra coisa, o retorno seria
maior? Se a resposta honesta for talvez, a proposta merece mais análise.

E há um motivo legítimo que costuma ser omitido por parecer frívolo: **retenção de
pessoas**. Um sistema que ninguém quer manter tem custo real de contratação e de
rotatividade — e ele deveria ser apresentado explicitamente, com o número, em vez de
disfarçado de argumento técnico.

### O momento certo é antes de a crise chegar

Um padrão que se repete: a modernização é aprovada depois de o risco se materializar —
quando o mantenedor sai, quando o fornecedor anuncia o fim do suporte, quando o sistema
cai.

Nesse ponto, ela acontece sob pressão, com prazo imposto e sem as condições que a fariam
dar certo.

```text
antecipada    prazo definido pela organização, transferência de conhecimento
              possível, escopo controlado
sob crise     prazo imposto de fora, conhecimento já perdido, escopo definido
              pela urgência
```

A dificuldade é que os indicadores antecedentes são fracos: um sistema que funciona não
gera sinal, e a degradação é gradual.

Os que valem acompanhar:

```text
número de pessoas capazes de manter          cai antes de a crise chegar
tempo médio para implementar uma mudança     cresce gradualmente
proporção de mudanças que geram incidente
proximidade do fim de suporte de dependências
```

Ver [portfólio de aplicações](/15-enterprise-architecture/application-portfolios.md).

O primeiro é o mais preditivo e o mais fácil de obter — e ele costuma ser conhecido
informalmente por várias pessoas sem nunca virar número numa discussão de prioridade.

## Modelo Mental

**"É legado" não é motivo.** O motivo é a limitação concreta que ele impõe, com o custo
de conviver com ela.

## Quando Usar

- Antes de qualquer proposta de modernização.
- Ao priorizar entre sistemas candidatos.
- Para defender a decisão de não modernizar.
- Em discussões de orçamento com o negócio.

## Quando Não Usar

**Propondo a partir do sintoma técnico.**

**Sem calcular o custo de não fazer.**

**Assumindo que o sistema inteiro precisa mudar.**

**Sem verificar se o motivo justifica a prioridade.**

**Omitindo motivos legítimos** por parecerem frívolos.

## Alternativas

- **Não modernizar**, com decisão registrada e prazo de revisão.
- **Modernização parcial** — atacar a parte que causa o problema.
- **Contenção** — isolar o sistema para que ele não limite o resto. Ver
  [anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).
- **Reduzir a dependência** — em vez de modernizar, diminuir o que depende dele.

A terceira é subestimada: um sistema legado bem isolado pode continuar operando por anos
sem limitar a evolução em volta.

## Trade-offs

| Modernizar | Conviver |
|---|---|
| Remove a limitação | Ela permanece |
| Custo alto e concentrado | Difuso e contínuo |
| Risco de execução | Risco de degradação |
| Capacidade liberada depois | Capacidade consumida agora |

| Substituição completa | Parcial |
|---|---|
| Resolve tudo | Resolve o que importa |
| Custo integral | Fração |
| Risco alto | Menor |

## Modos de Falha

**Proposta sem motivo concreto.** Rejeitada ano após ano.

**Custo de não fazer não calculado.** A comparação fica desequilibrada.

**Escopo maior que o motivo.** Substituir o sistema quando uma parte bastava.

**Prioridade sem análise.** O motivo é real e não é o mais urgente.

**Ausência de decisão.** Nem modernizar nem registrar que não vai.

**Motivo apresentado não é o real.** A discussão acontece sobre a razão errada.

## Erros Comuns

**Argumentar por obsolescência.**

**Não traduzir para limitação de negócio.**

**Não apresentar o custo de conviver.**

**Propor substituição completa por reflexo.**

**Não registrar a decisão de não fazer.**

**Esconder o motivo de retenção** atrás de argumento técnico.

## Exemplo Real

Uma empresa de logística tinha uma proposta de substituir o sistema de roteirização
rejeitada em três ciclos de orçamento consecutivos.

A justificativa apresentada: "tecnologia de 2009, código difícil de manter, um único
mantenedor".

Na quarta tentativa, a proposta foi reformulada a partir do motivo real, investigado com
as áreas de operação:

```text
limitação      não conseguimos oferecer entrega no mesmo dia
causa          o algoritmo de roteirização recalcula rotas de madrugada;
               não suporta reotimização durante o dia
custo de não   o concorrente oferece; perdemos 3 contratos grandes em 18 meses,
fazer          estimados em R$ 14 milhões por ano
risco          o único mantenedor tem aposentadoria prevista em 2 anos
```

A comparação:

```text
custo de modernizar        R$ 4,2 milhões, 16 meses
custo de não modernizar    R$ 14 milhões por ano em receita não capturada,
                           mais o risco de perder a capacidade inteira
```

Aprovada no ciclo seguinte, sem discussão.

E a análise do escopo revelou que não era necessário substituir o sistema inteiro:

```text
o que causava a limitação   o motor de otimização, monolítico e batch
o que não causava           cadastro de veículos, motoristas, integrações, telemetria
```

O projeto executado extraiu o motor de otimização e o substituiu por um serviço que
suporta reotimização contínua. O restante do sistema permaneceu.

Custo real: R$ 1,8 milhão, 9 meses — menos da metade do orçado, porque o escopo foi
reduzido ao que resolvia o motivo.

A entrega no mesmo dia foi lançada 11 meses depois.

E o risco de pessoas foi endereçado em paralelo, com transferência de conhecimento do
mantenedor para três pessoas — tratado como projeto próprio, e não como consequência da
modernização.

O que a equipe aprendeu: as três rejeições anteriores estavam corretas. A proposta pedia
R$ 4,2 milhões para resolver um desconforto técnico, e o negócio não tinha como avaliá-la.

## Conceitos Relacionados

- [Sistemas Legados](/16-legacy-modernization/legacy-systems.md) — a definição.
- [Estratégias de Migração](/16-legacy-modernization/migration-strategies.md) — como executar.
- [Restrições Organizacionais](/16-legacy-modernization/organizational-constraints.md).
- [Capacidades de Negócio](/15-enterprise-architecture/business-capabilities.md).

## Exercício Prático

Pegue um sistema que seu time considera legado e responda: o que exatamente não
conseguimos fazer por causa dele, e quanto isso custa por ano?

Se não houver resposta concreta, a proposta de modernizá-lo não vai ser aprovada — e
provavelmente não deveria ser.

## Perguntas de Entrevista

- Por que "é legado" não é motivo?
- Como se calcula o custo de não modernizar?
- Por que o escopo frequentemente é maior que o motivo?

## Para Aprofundar

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Fowler, Martin. *Technical Debt*, 2003.
