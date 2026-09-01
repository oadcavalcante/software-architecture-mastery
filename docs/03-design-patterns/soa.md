---
id: soa
title: SOA
sidebar_position: 31
description: Serviços de negócio com integração centralizada — a linhagem que antecede microsserviços.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue SOA de microsserviços e reconhece o que a
  centralização da integração compra e cobra.
prerequisites: [microservices]
related: [microservices, event-driven, integration-architecture]
canonical_for: [SOA, arquitetura orientada a serviços, ESB]
content_version: 1
last_reviewed: 2026-08-26
---

# SOA

## Visão Geral

SOA — *Service-Oriented Architecture* — organiza a empresa em serviços de negócio
reutilizáveis, com contratos formais e integração mediada por um barramento
central.

É a linhagem direta de [microsserviços](/03-design-patterns/microservices.md), e entendê-la ajuda a
entender por que microsserviços fazem certas escolhas — várias delas em reação ao
que deu errado aqui.

## Problema

Uma empresa grande tem dezenas de sistemas que precisam se integrar. Sem
disciplina, isso produz integrações ponto a ponto: N sistemas geram até N² pontos
de conexão, cada um com formato próprio, sem contrato e sem visibilidade.

Mudar um sistema quebra outros de formas imprevisíveis, e ninguém consegue
desenhar o cenário de integração inteiro.

SOA propõe: exponha capacidades de negócio como serviços com contrato formal, e
faça toda a integração passar por um barramento que traduz, roteia e orquestra.

## Conceitos Centrais

### Serviço de negócio, não técnico

A unidade em SOA é uma capacidade de negócio completa — "gestão de clientes",
"processamento de pedidos" — e não um componente técnico.

Serviços tendem a ser grandes e a corresponder a áreas da organização.

### O barramento de serviços

O ESB é o elemento característico: um componente central por onde a integração
passa, responsável por roteamento, transformação de formato, orquestração,
protocolo e política.

A intenção é boa — concentrar a complexidade de integração num lugar
especializado, em vez de espalhá-la.

### O que deu errado

O ESB virou o problema que deveria resolver, por um mecanismo previsível.

**Concentração de lógica.** Roteamento vira condicional de negócio; transformação
vira regra; orquestração vira processo. Regra de negócio migra para o barramento
porque é onde os sistemas se encontram.

**Gargalo organizacional.** Toda integração exige o time do ESB. Mudanças passam a
depender de uma fila.

**Ponto único de falha.** Tudo passa por ali.

**Acoplamento invertido.** Os serviços ficam desacoplados entre si e todos
acoplados ao barramento.

Microsserviços reagem diretamente a isso com o princípio de **tubos burros,
pontas inteligentes**: a inteligência fica nos serviços; o canal só transporta.

### SOA e microsserviços

| | SOA | Microsserviços |
|---|---|---|
| Granularidade | Capacidade de negócio ampla | Bounded context |
| Integração | ESB central | Ponto a ponto ou fila simples |
| Inteligência | No barramento | Nos serviços |
| Dados | Frequentemente compartilhados | Por serviço |
| Governança | Centralizada | Federada |
| Reúso | Objetivo explícito | Consequência, não meta |
| Implantação | Frequentemente coordenada | Independente |

A linha de reúso é a mais subestimada: SOA perseguia reúso como objetivo, e isso
produzia serviços genéricos que serviam mal a todos. Microsserviços priorizam
autonomia sobre reúso — uma inversão deliberada.

## Quando Usar

- Integração entre muitos sistemas heterogêneos, incluindo legado que não muda.
- Transformação de protocolo e formato é necessária de fato — sistemas que falam
  linguagens incompatíveis.
- Existe requisito de governança centralizada, frequentemente regulatório.
- A organização já tem barramento e equipe que o opera.

## Quando Não Usar

**Para sistemas novos com times autônomos.** A centralização vira gargalo.

**Quando o barramento acumularia regra de negócio.** É a degeneração previsível.

**Quando a autonomia de release importa.** Coordenação centralizada a impede.

**Como caminho para microsserviços.** São modelos com filosofias opostas de
integração; migrar de um para o outro é mais reescrita que evolução.

**Quando "ESB" é adotado como solução para acoplamento.** Acoplamento não some —
muda de lugar.

## Alternativas

- **[Microsserviços](/03-design-patterns/microservices.md)** — para sistemas novos com times
  autônomos.
- **API gateway** — roteamento e política sem orquestração nem transformação de
  negócio. Captura parte do valor do ESB sem a degeneração.
- **[Arquitetura orientada a eventos](/03-design-patterns/event-driven.md)** — canal simples,
  inteligência nas pontas.
- **Anti-corruption layer por consumidor** — cada sistema traduz o que consome,
  em vez de um tradutor central. Ver
  [DDD](/04-domain-driven-design/index.md).

## Trade-offs

| SOA com ESB | Integração descentralizada |
|---|---|
| Cenário de integração visível num lugar | Emergente |
| Transformação e protocolo concentrados | Replicados |
| Governança e política centralizadas | Federadas |
| Barramento vira gargalo | Sem gargalo central |
| Ponto único de falha | Falha isolada |
| Time especializado necessário | Cada time cuida do seu |

## Modos de Falha

**ESB com lógica de negócio.** O modo dominante.

**Fila de mudanças no time do barramento.** Integrações levam meses.

**Serviços genéricos que servem mal.** Consequência de perseguir reúso.

**Dados compartilhados entre serviços.** Acoplamento sem contrato.

**Contrato canônico impossível.** A tentativa de definir um modelo único para toda
a empresa — "cliente canônico" — consome anos e não converge, porque cliente
significa coisas diferentes em áreas diferentes. Ver
[bounded context](/04-domain-driven-design/bounded-context.md).

## Erros Comuns

**Colocar regra de negócio no barramento.**

**Perseguir modelo canônico único.**

**Tratar SOA como versão antiga de microsserviços.** As filosofias de integração
são opostas.

**Adotar ESB para resolver acoplamento.**

## Onde ele aparece na prática

**Grandes empresas com legado extenso.** Bancos, seguradoras e operadoras de
telecomunicações, onde há sistemas de décadas que não serão reescritos.

**Setores com governança regulatória.** Onde rastreabilidade centralizada de
integração é exigência.

**Cenários com protocolos heterogêneos.** Sistemas que falam formatos
proprietários e precisam de tradução real.

O caso do legado é o que mantém SOA relevante: quando metade dos sistemas não pode
ser alterada, alguém precisa traduzir — e um componente central de tradução é uma
resposta legítima. O erro é quando ele passa a decidir, e não apenas traduzir.

## Exemplo Real

Uma seguradora com 40 anos de sistemas adotou ESB para integrar mainframe,
sistemas em Delphi, plataformas web e parceiros externos.

Nos três primeiros anos, funcionou como pretendido: o barramento traduzia
formatos, roteava, e o cenário de integração ficou visível pela primeira vez.

A degeneração levou cinco anos. Regras de elegibilidade migraram para o
barramento — porque a decisão dependia de dados de três sistemas, e o ESB era onde
os três se encontravam. Depois regras de comissionamento. Depois cálculo de
prêmio.

Ao final, o ESB tinha mais lógica de negócio que qualquer sistema individual, e o
time que o operava tinha oito meses de fila.

A correção não foi migrar para microsserviços — os sistemas legados continuavam
lá. Foi devolver as regras aos donos: elegibilidade voltou para subscrição,
comissionamento para o sistema de corretores, prêmio para atuarial.

O barramento permaneceu, reduzido ao que sempre deveria ter sido: tradução de
protocolo e roteamento. Sem condicional de negócio.

A fila do time caiu para semanas.

O padrão não estava errado para aquele contexto. O que falhou foi não ter uma
regra explícita sobre o que pode e o que não pode morar no barramento — e essa é
uma decisão de governança, não de tecnologia.

## Conceitos Relacionados

- [Microsserviços](/03-design-patterns/microservices.md) — a reação a este modelo.
- [Arquitetura Orientada a Eventos](/03-design-patterns/event-driven.md) — tubos burros, pontas
  inteligentes.
- [Integração](/08-integration-architecture/index.md) — API gateway e service
  mesh.
- [Modernização de Legado](/16-legacy-modernization/index.md).

## Exercício Prático

Se sua empresa tem barramento de integração, examine o que há dentro dele.

Classifique cada elemento: é tradução de formato, roteamento, ou decisão de
negócio? Os da terceira categoria pertencem a algum sistema — identifique qual.

## Perguntas de Entrevista

- Qual a diferença filosófica entre SOA e microsserviços quanto à integração?
- Por que ESBs degeneram, e qual o mecanismo?
- Por que o modelo canônico único costuma falhar?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*.
  Addison-Wesley, 2003.
- Newman, Sam. *Building Microservices*. 2ª ed., O'Reilly, 2021 — a comparação
  com SOA.
- Erl, Thomas. *SOA: Principles of Service Design*. Prentice Hall, 2007.
