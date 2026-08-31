---
id: microservices
title: Microsserviços
sidebar_position: 25
description: Serviços implantáveis independentemente — o que se compra, o que se paga, e os pré-requisitos.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia microsserviços a partir do isolamento operacional
  necessário e dos pré-requisitos organizacionais.
prerequisites: [modular-monolith]
related: [modular-monolith, event-driven, soa]
canonical_for: [microsserviços, microservices]
content_version: 1
last_reviewed: 2026-08-26
---

# Microsserviços

## Visão Geral

Microsserviços organizam a aplicação como um conjunto de serviços pequenos, cada
um implantável de forma independente, com dados próprios, comunicando-se por rede.

A propriedade que define o estilo é **implantabilidade independente**. Tudo o mais
— tamanho pequeno, tecnologia heterogênea, um time por serviço — é consequência ou
acessório.

## Problema

Um sistema grande com muitos times enfrenta problemas específicos.

Times bloqueiam uns aos outros no release: uma mudança arriscada de um trava o
lançamento de todos.

Um componente precisa de recursos desproporcionais, e escalar a aplicação inteira
para atendê-lo desperdiça.

Uma falha em qualquer parte derruba tudo.

E uma parte precisa de tecnologia diferente por razão legítima.

Microsserviços resolvem os quatro. O custo é substituir chamadas de função por
rede — e com isso herdar todo o
[Nível 04](/06-distributed-systems/index.md).

## Conceitos Centrais

### O que se compra e o que se paga

| Compra | Paga |
|---|---|
| Implantação independente | Um pipeline e um artefato por serviço |
| Escala por serviço | Latência e falha parcial em cada chamada |
| Isolamento de falha | Coordenação distribuída de dados |
| Autonomia de time | Contratos públicos versionados |
| Tecnologia heterogênea | Operação heterogênea |
| Fronteira imposta pela rede | Refatorar fronteira vira migração |

A última linha das duas colunas é a mais subestimada. A rede impõe a fronteira de
graça — o que é uma vantagem real. E torna mover a fronteira uma migração de
dados, o que é a desvantagem que decide.

### Os pré-requisitos

Microsserviços exigem capacidades que precisam existir **antes**, não depois:

**Implantação automatizada e independente.** Se implantar exige coordenação
manual, mais serviços multiplicam o problema.

**Observabilidade distribuída.** Rastreamento correlacionado entre serviços.
Sem isso, diagnosticar um incidente é correlacionar registros à mão.

**Provisionamento sob demanda.** Criar um serviço não pode depender de um chamado
que leva semanas.

**Times com autonomia real.** Se as decisões continuam centralizadas, a autonomia
técnica não se materializa.

Adotar sem esses pré-requisitos produz os custos sem os benefícios. É o cenário
mais comum de fracasso.

### O tamanho é consequência

"Micro" é o adjetivo mais enganoso do nome. Não há tamanho correto.

O critério é a fronteira de negócio — um [bounded
context](/04-domain-driven-design/index.md) — e o tamanho é o que ela produzir.
Serviços pequenos demais geram acoplamento por chamadas encadeadas, que é o
monolito distribuído.

### Dados por serviço

A regra que não admite exceção: **cada serviço é dono dos seus dados, e ninguém
mais acessa diretamente.**

Compartilhar banco entre serviços produz todo o acoplamento de um monolito, com
todo o custo de distribuição, e sem contrato. É a pior combinação possível.

A consequência é que consistência entre serviços passa a ser eventual, e
transações viram [sagas](/06-distributed-systems/index.md).

## Quando Usar

- Vários times precisam entregar sem coordenação de release.
- Existe requisito comprovado de escala independente.
- O isolamento de falha entre partes é requisito.
- As fronteiras de domínio já se provaram estáveis.
- Os quatro pré-requisitos operacionais existem.

## Quando Não Usar

**Quando o domínio ainda não está entendido.** Fronteira errada entre serviços é a
correção mais cara que existe. Comece como
[monolito modular](/03-design-patterns/modular-monolith.md).

**Com time pequeno.** Abaixo de algumas dezenas de pessoas, o custo operacional
por pessoa é desproporcional.

**Sem os pré-requisitos operacionais.**

**Para obter isolamento lógico.** Módulos entregam isso.

**Quando a consistência forte entre partes é requisito.** Transações distribuídas
são caras e sagas mudam a semântica do negócio — o que precisa ser aceito pelo
negócio, não decidido pela engenharia.

**Por reputação.** É a razão mais comum e a pior.

## Alternativas

- **[Monolito modular](/03-design-patterns/modular-monolith.md)** — o default correto.
- **Extração seletiva** — monolito modular com os poucos serviços que têm razão.
  O arranjo mais comum em sistemas maduros.
- **[SOA](/03-design-patterns/soa.md)** — serviços maiores, com integração centralizada.
- **Serverless por função** — granularidade ainda menor, com custos próprios.

## Trade-offs

Ver a tabela em "o que se compra e o que se paga". O eixo geral é **autonomia
versus complexidade operacional e de dados**.

O ponto de inflexão costuma estar no número de times, não no tamanho do código:
sistemas grandes com poucos times raramente precisam; sistemas médios com muitos
times frequentemente precisam.

## Modos de Falha

**Monolito distribuído.** Serviços que sempre são implantados juntos e cuja
indisponidade mútua derruba tudo. Custo de distribuição, nenhum benefício.

**Banco compartilhado.** Acoplamento sem contrato.

**Cascata síncrona.** Uma requisição atravessa sete serviços; a falha de um
derruba a cadeia. Ver
[circuit breakers](/12-reliability/index.md).

**Granularidade excessiva.** Mais serviços do que o time consegue operar.

**Ausência de rastreamento.** Diagnóstico impossível.

**Contratos não versionados.** Uma mudança quebra consumidores sem aviso.

## Erros Comuns

**Adotar antes de conhecer as fronteiras.**

**Compartilhar banco.**

**Confundir o tamanho com o critério.**

**Ignorar o custo de dados distribuídos.** É maior que o de código distribuído, e
recebe menos atenção.

**Não ter estratégia de consistência.** Sagas e compensação precisam ser
projetadas, não descobertas em produção.

## Onde ele aparece na prática

**Grandes plataformas de comércio e streaming.** Onde a escala e o número de times
tornam o custo justificável.

**Relatos de reversão.** Vários casos públicos de consolidação de serviços
motivados por custo operacional — que são tão instrutivos quanto os de adoção.

**Sistemas com fronteiras regulatórias.** Onde partes precisam de isolamento por
exigência externa, e não por escolha técnica.

O que a literatura de casos mostra de forma consistente: as adoções bem-sucedidas
partiram de sistemas existentes cujas fronteiras já eram conhecidas, e não de
projetos novos. Ver [MonolithFirst](/03-design-patterns/modular-monolith.md).

## Exemplo Real

Uma plataforma de pagamentos extraiu três serviços de um monolito modular, ao
longo de dois anos, cada um por uma razão registrada em ADR.

**Antifraude** — requisito de escala: consome dez vezes mais CPU que o resto, em
picos independentes do volume de transações.

**Conciliação** — requisito de isolamento: processa arquivos grandes e já tinha
esgotado memória do processo principal duas vezes.

**Portal do cliente** — requisito organizacional: time separado, com ciclo de
release próprio e requisito de disponibilidade menor.

O restante — autorização, captura, estorno, cadastro — permaneceu no monolito
modular, porque compartilha transação e muda junto.

Quatro anos depois, essa divisão não mudou. Nenhum outro serviço foi extraído,
porque nenhum outro módulo apresentou uma das três razões.

O que a equipe evitou foi tratar a extração como direção — cada serviço precisou
de uma justificativa própria, e a ausência de justificativa manteve o módulo onde
estava.

## Conceitos Relacionados

- [Monolito Modular](/03-design-patterns/modular-monolith.md) — o ponto de partida.
- [Arquitetura Orientada a Eventos](/03-design-patterns/event-driven.md) — comunicação assíncrona
  entre serviços.
- [Sistemas Distribuídos](/06-distributed-systems/index.md) — o que se herda.
- [SOA](/03-design-patterns/soa.md) — a linhagem anterior.

## Exercício Prático

Para cada serviço do seu sistema — ou cada módulo candidato — responda: qual das
razões justifica a separação? Escala, isolamento de falha, autonomia de time, ou
regulação?

Os que não têm resposta específica são candidatos a consolidação.

## Perguntas de Entrevista

- Qual é a propriedade que define microsserviços?
- Que pré-requisitos precisam existir antes da adoção?
- O que é um monolito distribuído e como reconhecê-lo?

## Para Aprofundar

- Newman, Sam. *Building Microservices*. 2ª ed., O'Reilly, 2021.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Fowler, Martin. *MicroservicePrerequisites*, 2014.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018.
