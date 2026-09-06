---
id: container-diagrams
title: Diagramas de Contêiner
sidebar_position: 4
description: As unidades executáveis e como se comunicam — o diagrama que responde "onde eu mexo".
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor produz um diagrama de contêiner que orienta quem vai mudar o
  sistema, sem descer ao detalhe interno.
prerequisites: [c4-model]
related: [c4-model, context-diagrams, deployment-diagrams]
canonical_for: [diagrama de contêiner, unidade executável, protocolo de comunicação]
content_version: 1
last_reviewed: 2026-08-29
---

# Diagramas de Contêiner

## Visão Geral

Um diagrama de contêiner mostra as **unidades separadamente executáveis ou de
armazenamento** que compõem um sistema, e como elas se comunicam.

Ele responde à pergunta mais frequente de quem vai trabalhar no sistema: **onde eu
mexo, e o que isso afeta?**

E é o segundo diagrama de maior retorno, depois do
[contexto](/17-architecture-documentation/context-diagrams.md) — juntos, os dois cobrem a maior parte da necessidade
real de documentação estrutural.

## Problema

O contexto mostra o sistema como uma caixa. Isso basta para quem está fora, e não para
quem precisa mudá-lo.

A pergunta seguinte é imediata:

```text
de quais peças isto é feito?
onde a lógica de X mora?
onde os dados ficam?
como as peças conversam?
o que preciso subir para rodar isto localmente?
```

Sem o diagrama, essas respostas vêm de leitura de código e de conversa com quem já
conhece — o que é caro e produz respostas parciais.

## Conceitos Centrais

### O que conta como contêiner

```text
sim   aplicação web, API, aplicativo móvel, processo em segundo plano,
      banco de dados, cache, fila, sistema de arquivos, função sem servidor
não   biblioteca, módulo, classe, camada, conceito
```

O teste: **é separadamente implantável, ou é um armazenamento?**

Uma biblioteca compartilhada entre dois serviços não é contêiner — ela é detalhe interno
de ambos. Uma fila é, porque tem existência própria e precisa ser provisionada.

Ver [modelo C4](/17-architecture-documentation/c4-model.md).

### Tecnologia e protocolo pertencem aqui

Diferente do contexto, o de contêiner é técnico. Incluir a tecnologia é útil:

```text
API de Pedidos          [Java, Spring]
Banco de Pedidos        [PostgreSQL]
Fila de Processamento   [RabbitMQ]
Portal                  [React]
```

E os protocolos nas relações:

```text
Portal → API de Pedidos: "consulta e cria pedidos, HTTPS/JSON"
API → Banco: "lê e grava, TCP"
API → Fila: "publica pedido criado, AMQP"
```

Isso responde a "o que preciso saber para trabalhar aqui" — e é o que o diagrama de
contexto deliberadamente omite.

### O diagrama revela a arquitetura de verdade

Desenhar os contêineres e as comunicações expõe padrões que o discurso esconde:

```text
todo mundo lendo o mesmo banco     → o banco é a integração real
uma peça conversando com todas     → ponto de acoplamento
duas peças que sempre mudam juntas → provavelmente deveriam ser uma
comunicação em cadeia longa        → disponibilidade composta ruim
```

Ver [paisagens de integração](/15-enterprise-architecture/integration-landscapes.md) e
[disponibilidade](/06-distributed-systems/availability.md).

É comum que a primeira versão do diagrama gere desconforto — porque ela mostra a
estrutura real, e não a pretendida.

### Ele orienta a execução local

Um uso prático e subestimado: o diagrama de contêiner é a lista do que precisa estar
rodando para trabalhar no sistema.

Isso o torna a documentação de referência para ambiente de desenvolvimento, e dá um
critério de complexidade: um sistema cujo diagrama tem 14 contêineres é um sistema que
exige 14 coisas rodando.

Ver [gestão de ambientes](/14-devops-and-platform/environment-management.md).

### Armazenamentos merecem atenção

Bancos, caches e filas são contêineres, e mostrá-los revela o que costuma ficar
implícito:

```text
quantos armazenamentos existem
quem escreve em cada um
quem lê
se há acesso direto ao armazenamento de outro
```

A última é a mais reveladora. Ver
[propriedade do dado](/07-data-architecture/data-ownership.md) — um diagrama que mostra
duas aplicações escrevendo no mesmo banco documenta um problema de fronteira.

### O escopo é um sistema

O diagrama de contêiner descreve **um** sistema. Sistemas externos aparecem na borda,
como caixas únicas, sem detalhe interno.

Expandir para mostrar o interior de vários sistemas produz um diagrama grande demais e
mistura escopos — o mesmo erro de misturar níveis.

Quando a pergunta atravessa sistemas, o diagrama certo é o de contexto do conjunto, ou um
de fluxo de dados. Ver
[fluxo de dados](/17-architecture-documentation/data-flow-diagrams.md).

### Quantidade de caixas é um diagnóstico

Um diagrama de contêiner grande raramente é um problema de desenho. Ele é um retrato de
quantas coisas separadas precisam existir, ser implantadas, monitoradas e mantidas.

```text
até 6 contêineres    sistema que uma equipe segura
7 a 12               exige coordenação, ainda tratável
acima de 15          o custo operacional já é a característica dominante
```

A pergunta que o diagrama provoca — "por que tantas peças?" — costuma ser mais valiosa que
qualquer resposta que ele dê. Ver
[fronteiras de serviço](/05-system-design/service-boundaries.md): decompor em
unidades implantáveis tem um custo que só fica visível quando ele é desenhado junto.

E há uma assimetria que o desenho torna evidente: acrescentar um contêiner é uma decisão
tomada por uma pessoa em uma tarde; removê-lo exige coordenação entre todos os que passaram
a depender dele. O diagrama é o lugar onde o acúmulo dessas decisões individuais aparece
como uma propriedade do sistema, e onde ela pode ser discutida antes de virar estrutura
permanente.

## Modelo Mental

**As peças que executam ou armazenam, e como conversam.** Ele responde onde mexer.

## Quando Usar

- Para todo sistema com mais de uma unidade executável.
- Ao integrar pessoas ao time.
- Para discutir fronteiras internas.
- Ao planejar mudanças que atravessam peças.
- Como referência de ambiente de desenvolvimento.

## Quando Não Usar

**Com bibliotecas ou módulos** como caixas.

**Expandindo sistemas externos.**

**Sem tecnologia nem protocolo** — o nível é técnico, e omiti-los reduz a utilidade.

**Para sistema de uma peça só** — o contexto basta.

**Descendo a componentes internos.**

## Alternativas

- **[Contexto](/17-architecture-documentation/context-diagrams.md)** — quando a pergunta é externa.
- **[Componente](/17-architecture-documentation/component-diagrams.md)** — quando é sobre o interior de uma peça.
- **[Implantação](/17-architecture-documentation/deployment-diagrams.md)** — quando é sobre onde roda.
- **Descrição textual** — para sistemas de duas ou três peças.

## Trade-offs

| Contêiner | Contexto |
|---|---|
| Diz onde mexer | Diz o que o sistema faz |
| Técnico | Para qualquer pessoa |
| Envelhece mais rápido | Devagar |
| Mais caixas | Poucas |

| Com tecnologia | Sem |
|---|---|
| Útil para trabalhar | Mais estável |
| Envelhece com migrações | Menos |

## Modos de Falha

**Bibliotecas como caixas.** Confunde o nível.

**Sistemas externos expandidos.** Escopo misturado.

**Sem protocolos.** Não responde a "como conversam".

**Desatualizado após uma peça nova.**

**Grande demais.** Sinal de que o sistema tem responsabilidades demais.

## Erros Comuns

**Incluir módulos internos.** Mistura dois níveis de abstração e faz o diagrama perder a função, que é mostrar unidades implantáveis e como elas conversam.

**Omitir armazenamentos.** Banco, fila e cache são contêineres com decisão arquitetural embutida. Escondê-los apaga metade do que o diagrama existia para mostrar.

**Não rotular as comunicações.** Sem protocolo e sincronismo na seta, não dá para avaliar acoplamento nem propagação de falha.

**Expandir o que está fora do sistema.** Sistema externo é uma caixa só. Detalhá-lo gasta espaço e sugere um controle sobre ele que não existe.

**Não versionar junto ao código.** Diagrama fora do repositório não é atualizado junto com a mudança que o invalida, e desatualiza na primeira semana.

## Exemplo Real

Uma plataforma de comércio eletrônico produziu diagramas de contêiner para os oito
sistemas principais.

O do sistema de pedidos revelou algo que a equipe não esperava:

```text
API de Pedidos          → Banco de Pedidos
Serviço de Faturamento  → Banco de Pedidos     ← acesso direto
Painel Administrativo   → Banco de Pedidos     ← acesso direto
Processo de Conciliação → Banco de Pedidos     ← acesso direto
```

Três consumidores acessavam o banco diretamente, contornando a API.

Isso era conhecido individualmente, e nunca tinha aparecido junto. A consequência estava
documentada em incidentes anteriores sem que a causa fosse nomeada: mudanças no esquema
do banco quebravam sistemas que ninguém tinha considerado.

E o diagrama tornou visível outra coisa: a API de pedidos tinha 11 endpoints, e o painel
administrativo não usava nenhum — ele lia direto.

As decisões que saíram:

**Acesso direto eliminado** ao longo de nove meses. Os três consumidores passaram a usar
a API, com endpoints novos onde faltava. Ver
[propriedade do dado](/07-data-architecture/data-ownership.md).

**Fronteira revista.** O processo de conciliação, que só lia, foi movido para uma réplica
de leitura dedicada — com contrato explícito sobre o esquema.

E um efeito colateral do exercício: os diagramas viraram a documentação de ambiente de
desenvolvimento. A pergunta "o que preciso subir para trabalhar no sistema de pedidos?"
passou a ter resposta visual.

Um problema durante a produção:

**Bibliotecas como caixas.** Os primeiros diagramas incluíam bibliotecas compartilhadas —
autenticação, logging, cliente HTTP interno. Isso inflava os diagramas e misturava
níveis. A regra "é separadamente implantável?" resolveu.

O que se registrou depois: o acesso direto ao banco existia havia cinco anos, era conhecido
por várias pessoas, e nunca tinha sido tratado como problema arquitetural — até aparecer
num diagrama com três setas convergindo para a mesma caixa.

## Conceitos Relacionados

- [Modelo C4](/17-architecture-documentation/c4-model.md).
- [Diagramas de Contexto](/17-architecture-documentation/context-diagrams.md) — o nível acima.
- [Diagramas de Componente](/17-architecture-documentation/component-diagrams.md) — o abaixo.
- [Diagramas de Implantação](/17-architecture-documentation/deployment-diagrams.md) — onde roda.

## Exercício Prático

Desenhe o diagrama de contêiner de um sistema do seu time, incluindo todos os
armazenamentos.

Depois verifique: alguma aplicação acessa diretamente o armazenamento de outra? Essa seta
costuma ser a descoberta mais valiosa do exercício.

## Perguntas de Entrevista

- Qual o teste que decide se algo é um contêiner?
- Por que tecnologia e protocolo pertencem a este nível e não ao de contexto?
- O que o diagrama revela que o discurso esconde?

## Para Aprofundar

- Brown, Simon. *The C4 model* — c4model.com.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
