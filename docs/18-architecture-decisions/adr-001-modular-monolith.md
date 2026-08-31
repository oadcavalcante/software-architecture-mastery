---
id: adr-001-modular-monolith
title: "ADR-001 — Adotar Monólito Modular"
sidebar_position: 10
description: Exemplo completo de ADR — escolher monólito modular em vez de microsserviços, com as condições que inverteriam a decisão.
doc_type: adr
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece como contexto, alternativas e sinal de alerta se
  combinam num ADR real de decisão estrutural.
prerequisites: [adr-structure]
related: [adr-context, adr-alternatives, adr-consequences]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# ADR-001 — Adotar Monólito Modular em Vez de Microsserviços

:::note Exemplo didático

Este e os quatro ADRs seguintes descrevem decisões de um sistema fictício — **Verano**,
uma plataforma de pedidos para entrega de alimentos. Eles formam uma sequência coerente
ao longo de três anos, e existem para mostrar o raciocínio, não para servir de gabarito de
tecnologia.

:::

| | |
|---|---|
| Status | aceito em 2023-02-14 |
| Sistema | Verano — plataforma de pedidos |
| Autores | equipe de plataforma |
| Decisores | líder técnica, gerente de engenharia |
| Consultados | os três times de produto |

## Contexto

Estamos construindo a plataforma do zero. A operação atual roda sobre um sistema de
terceiros que será desligado em 18 meses, por fim de contrato — a data é contratual e não
é negociável.

Forças em jogo, em fevereiro de 2023:

```text
equipe                    12 engenheiros, 1 com experiência operacional
                          em sistemas distribuídos
domínio                   um só — pedidos de alimentos, com catálogo,
                          carrinho, pagamento, entrega
volume atual              ~25 pedidos/s em pico, 3/s na média
projeção comercial        ~120 pedidos/s em pico em 24 meses
                          (projeção de vendas, não medição)
prazo                     18 meses até o desligamento do sistema atual
plantão                   ainda não existe; será criado durante o projeto
```

Restrições:

- **Prazo contratual de agosto de 2024**, com multa por extensão do contrato atual.
- **Nenhuma plataforma interna de implantação.** Cada unidade implantável exigiria
  esteira, monitoração e plantão construídos por nós.
- A equipe não tem experiência operacional com sistemas distribuídos, e o prazo não
  permite aprendizado sob pressão.

O que não sabíamos: se a projeção comercial de 120 pedidos/s se confirmaria, e como o
domínio se dividiria de fato — nenhum de nós tinha operado esse negócio antes.

## Decisão

Vamos construir a Verano como um **monólito modular**: uma unidade implantável única,
organizada em módulos com fronteiras explícitas — catálogo, carrinho, pedido, pagamento e
entrega.

Cada módulo tem seu próprio esquema de banco e só é acessado pelos outros através de
interfaces públicas declaradas. Acesso direto a tabelas de outro módulo é proibido e
verificado na esteira.

**Não vamos** adotar microsserviços neste ciclo. **Não vamos** criar unidades implantáveis
separadas, exceto para processamento em segundo plano, se necessário.

Esta decisão vale para a plataforma Verano. Integrações com sistemas externos não são
afetadas.

## Alternativas Consideradas

**Microsserviços desde o início.** Descartada porque exigiria construir esteira,
monitoração, rastreamento e plantão para N serviços antes de entregar qualquer
funcionalidade — estimado em 4 a 5 meses dos 18 disponíveis, com uma equipe sem experiência
operacional distribuída.

*Voltaria a ganhar se:* o prazo fosse maior que 30 meses, ou a equipe já tivesse plataforma
interna e experiência operacional.

**Monólito sem modularização.** Descartada porque a projeção de crescimento e a divisão
provável do domínio tornariam a extração posterior muito cara. O custo da modularização é
baixo agora e alto depois.

*Voltaria a ganhar se:* o sistema fosse descartável ou tivesse vida prevista menor que dois
anos.

**Serviços separados apenas para pagamento e entrega**, mantendo o resto junto. Descartada
por um motivo específico: são justamente os dois módulos com maior incerteza de fronteira,
e separá-los cedo fixaria uma divisão que não sabemos se está certa.

*Voltaria a ganhar se:* a fronteira desses módulos ficar estável e o acoplamento com o
restante se mostrar baixo na prática.

**Manter o sistema atual e renegociar o contrato.** Descartada — o fornecedor comunicou que
não renovará em nenhuma condição.

## Consequências

**Positivas (imediatas).** Uma esteira, um implantável, um plantão. A equipe entrega
funcionalidade a partir da primeira semana em vez de construir infraestrutura. Transações
locais entre módulos, sem consistência eventual a gerenciar.

**Positivas (longo prazo).** As fronteiras de módulo, se mantidas, tornam extração posterior
viável — um módulo com esquema próprio e interface declarada é candidato natural a serviço.

**Negativas (imediatas).** Implantação acoplada: qualquer mudança sobe o sistema inteiro.
Um erro num módulo pode derrubar todos.

**Negativas (longo prazo).** Escala por componente é impossível — se o catálogo precisar de
mais capacidade, escalamos tudo. Acima de certo tamanho de equipe, a implantação única vira
gargalo de coordenação.

**Neutras.** Precisamos de disciplina e verificação automática para manter as fronteiras. A
esteira ganha uma etapa de verificação de dependências entre módulos.

**Risco aceito.** As fronteiras de módulo podem erodir. Um monólito modular sem verificação
vira monólito comum em 12 a 18 meses — este é o modo de falha mais provável desta decisão.

## Sinal de Alerta

Saberemos que esta decisão precisa ser revista se:

- a equipe passar de **30 engenheiros** e a coordenação de implantação virar reclamação
  recorrente;
- a verificação de fronteiras entre módulos acumular **mais de 5 exceções permanentes**;
- algum módulo isolado exigir capacidade **acima de 3× a dos demais**;
- o tempo de implantação passar de **20 minutos**.

## Revisão — 2024-09-10

Bloco acrescentado 19 meses depois, sem alteração do texto original.

O sistema entrou em produção em julho de 2024, um mês antes do prazo. Volume observado no
pico: 41 pedidos/s — bem abaixo da projeção comercial de 120.

Das quatro condições do sinal de alerta, nenhuma foi atingida. A equipe está com 17
engenheiros; a verificação de fronteiras tem 2 exceções, ambas com prazo; o tempo de
implantação é de 11 minutos.

A erosão de fronteiras, apontada como risco principal, não se materializou — atribuímos à
verificação automática, que rejeitou 34 tentativas de acesso cruzado ao longo do período.

Um custo não previsto: o banco único virou ponto de contenção em migrações de esquema.
Migrações de módulos diferentes precisam ser coordenadas, o que não estava no ADR.

Decisão mantida.

## O que observar neste exemplo

O contexto registra **números e origens** — inclusive que a projeção de 120 pedidos/s vinha
do comercial e não de medição, o que a revisão de 2024 mostrou ser relevante.

As alternativas trazem a **condição de reversão**, e uma delas foi descartada por incerteza
de fronteira, não por argumento técnico contra a opção.

As consequências separam **horizonte** e nomeiam o custo aceito, incluindo o modo de falha
mais provável.

O sinal de alerta é **medível**, e por isso a revisão de 2024 pôde ser objetiva.

## Conceitos Relacionados

- [Contexto](/18-architecture-decisions/adr-context.md), [Alternativas](/18-architecture-decisions/adr-alternatives.md),
  [Consequências](/18-architecture-decisions/adr-consequences.md).
- [Monólito Modular](/03-design-patterns/modular-monolith.md).
- [ADR-004](/18-architecture-decisions/adr-004-kafka.md) — a decisão que veio quando o volume cresceu.
