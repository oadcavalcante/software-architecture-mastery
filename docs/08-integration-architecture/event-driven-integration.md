---
id: event-driven-integration
title: Integração Orientada a Eventos
sidebar_position: 5
description: Publicar fatos entre sistemas — e a diferença entre evento interno e evento de integração.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta eventos de integração como contrato público,
  separados do modelo interno de quem os publica.
prerequisites: [messaging-integration]
related: [messaging-integration, schema-evolution, integration-anti-corruption]
canonical_for: [catálogo de eventos, evento fino, evento gordo]
content_version: 1
last_reviewed: 2026-08-27
---

# Integração Orientada a Eventos

## Visão Geral

Integração orientada a eventos é publicar **fatos** que outros sistemas podem
consumir, sem que o publicador saiba quem são.

Os fundamentos estão em
[sistemas orientados a eventos](../06-distributed-systems/event-driven-systems.md).
Aqui o foco é o que muda quando o evento atravessa a fronteira de um sistema para
outro: ele deixa de ser detalhe interno e vira **contrato público**.

Essa distinção — evento interno contra evento de integração — é a decisão que
separa arquiteturas que evoluem das que travam.

## Problema

Um sistema começa a publicar eventos para desacoplar. Naturalmente, publica os
eventos que já usa internamente, com o formato que já tem.

Meses depois, o modelo interno precisa mudar. E não pode: quatro sistemas
dependem daquele formato, e dois deles são de outros times.

O evento interno virou contrato público sem ninguém decidir isso. O desacoplamento
que motivou a adoção produziu um acoplamento pior — porque agora o modelo interno
está congelado.

## Conceitos Centrais

### Evento interno e evento de integração são coisas diferentes

```text
evento interno       de domínio, granular, reflete o modelo
                     muda com o modelo, sem coordenação
                     consumido dentro do próprio serviço

evento de integração publicado para fora, estável, versionado
                     linguagem do negócio, não do modelo
                     contrato com processo de mudança
```

O evento de integração é **traduzido** a partir do interno, numa camada
deliberada. Ver [anti-corruption layer](integration-anti-corruption.md).

Isso parece cerimônia até a primeira vez que o modelo interno precisa mudar. Times
que publicam o evento interno direto descobrem, em geral no segundo ano, que não
conseguem mais refatorar.

### Evento fino ou gordo

**Fino — notificação.** Carrega o identificador e o tipo. O consumidor consulta
para saber o resto.

Contrato pequeno, fácil de versionar. E devolve o acoplamento de disponibilidade:
o consumidor precisa que o publicador responda.

**Gordo — com estado.** Carrega os dados. O consumidor não consulta ninguém.

Desacoplamento completo. E o evento vira um contrato amplo: cada campo publicado
é compromisso.

Um ponto que decide muitos casos: o evento gordo carrega o estado **no momento do
fato**, e o fino traz o estado **atual** na hora da consulta. Para auditoria e
para processamento histórico, a primeira é a correta — o preço no momento do
pedido não é o preço de hoje.

Ver [normalização](../07-data-architecture/normalization.md).

### Nomear no passado, e no vocabulário do negócio

`PedidoConfirmado`, não `AtualizarStatusPedido`.

Se o nome do evento descreve o que o consumidor deve fazer, o publicador está
comandando — e conhece os consumidores, o que anula o desacoplamento.

E o vocabulário precisa ser o do negócio, não o da tabela. `LinhaPedidoInserida`
expõe o modelo interno; `ItemAdicionadoAoPedido` descreve o fato.

### Catálogo é o que torna isso operável

Sem um lugar que diga quais eventos existem, o que significam, quem publica e
quem consome, ninguém consegue mudar nada com segurança.

O catálogo responde a pergunta que o desacoplamento tornou difícil: **quem quebra
se eu mudar isto?**

Junto com o registro de esquema — que recusa mudanças incompatíveis na publicação
— é o que permite evoluir eventos sem incidente. Ver
[evolução de esquema](schema-evolution.md).

### O consumidor não deve confiar no que não precisa

Um consumidor que desserializa o evento inteiro em um objeto acopla-se a todos os
campos, inclusive os que não usa.

Consumir apenas os campos necessários, ignorando o resto, é o que permite ao
publicador adicionar coisas livremente.

Isso é responsabilidade do consumidor, e é o pré-requisito da compatibilidade
futura.

### Ordem entre eventos de sistemas diferentes não existe

Dois sistemas publicando eventos relacionados não têm ordem garantida entre si.
`PagamentoAprovado` pode chegar antes de `PedidoCriado`.

O consumidor precisa tolerar isso — tipicamente guardando o evento fora de
sequência ou consultando o estado atual em vez de assumir a ordem.

Ver [ordenação](../06-distributed-systems/ordering.md).

## Modelo Mental

**Evento de integração é API.** Ele merece o mesmo cuidado de contrato,
versionamento e depreciação que qualquer endpoint público.

## Quando Usar

- Um fato interessa a vários sistemas, e o publicador não deve conhecê-los.
- Consumidores novos aparecem com frequência.
- Times diferentes evoluem em ritmos diferentes.
- A consequência é assíncrona.
- É preciso registrar o que aconteceu, não só o estado atual.

## Quando Não Usar

**Publicando o evento interno diretamente.** Congela o modelo.

**Quando o publicador precisa da resposta.**

**Para um único consumidor conhecido e estável.**

**Sem catálogo.** Ninguém sabe quem consome o quê.

**Sem registro de esquema.** A primeira mudança quebra alguém.

**Sem monitoramento de consumidor.** Ver
[integração por mensageria](messaging-integration.md).

**Como escolha global.** A mistura com integração síncrona é o desenho correto.

## Alternativas

- **[REST](rest.md)** — quando a resposta é necessária.
- **[Webhooks](webhooks.md)** — eventos para fora da organização, sem exigir que
  o parceiro consuma seu intermediário.
- **Captura de mudanças do banco** — publicar a partir do log do banco, sem tocar
  a aplicação. Rápido de adotar, e publica o modelo interno — com todo o
  acoplamento que isso traz.
- **Consulta periódica** — mais simples, e suficiente quando o atraso é
  aceitável.

A terceira merece o alerta: capturar mudanças do banco é frequentemente vendida
como integração orientada a eventos, e é exatamente o antipadrão descrito acima —
o esquema da tabela vira contrato público.

## Trade-offs

| Evento de integração traduzido | Evento interno publicado |
|---|---|
| Modelo interno livre para mudar | Congelado |
| Camada de tradução a manter | Nenhuma |
| Vocabulário de negócio | De implementação |
| Contrato explícito | Acidental |

| Evento gordo | Evento fino |
|---|---|
| Consumidor autossuficiente | Consulta o publicador |
| Estado no momento do fato | Estado atual |
| Contrato amplo | Pequeno |
| Mensagens maiores | Menores |
| Dados sensíveis circulam | Ficam na origem |

A última linha do segundo quadro decide casos de privacidade: um evento gordo com
dado pessoal replica esse dado por todos os consumidores, e cada cópia é
exposição.

## Modos de Falha

**Modelo interno congelado.** O evento virou contrato sem decisão.

**Consumidor desconhecido quebrado.**

**Evento fora de ordem.** O consumidor assumiu sequência.

**Cascata de eventos.** Um evento gera outro, e ninguém tem o mapa. Ciclos são
possíveis.

**Tempestade.** Uma operação em lote publica milhões de eventos.

**Consumidor parado sem alerta.**

**Dado sensível replicado.** Um evento gordo espalha o que deveria ficar na
origem.

## Erros Comuns

**Publicar o evento interno.**

**Nomear evento como comando.**

**Não manter catálogo.**

**Não versionar.**

**Consumidor desserializando o evento inteiro.**

**Confundir captura de mudanças do banco com integração por eventos.**

## Exemplo Real

Uma empresa de saúde adotou eventos para integrar agendamento, prontuário,
faturamento e um portal do paciente.

A implementação inicial publicou os eventos de domínio existentes, com o formato
interno do serviço de agendamento.

Funcionou por dezoito meses. Depois:

**Refatoração impossível.** O serviço de agendamento precisava separar o conceito
de "consulta" de "procedimento" — uma mudança de modelo que o negócio exigia.
Três consumidores dependiam do formato antigo, e um era de um parceiro externo. A
refatoração ficou parada por sete meses.

**Dado sensível espalhado.** O evento carregava o CPF e a data de nascimento do
paciente, porque o objeto interno tinha esses campos. Quatro sistemas passaram a
armazenar dados que não precisavam. Numa solicitação de exclusão, foi preciso
rastrear as quatro cópias. Ver
[ciclo de vida do dado](../07-data-architecture/data-lifecycle.md).

**Consumidor desconhecido.** Uma mudança de campo quebrou um sistema de business
intelligence que ninguém sabia que consumia o tópico.

**Ciclo.** `ConsultaAgendada` disparava `FaturaGerada`, que em cancelamentos
disparava `ConsultaReagendada` — que publicava `ConsultaAgendada`. Um caso raro
gerou um laço que publicou 200 mil eventos numa madrugada.

A reformulação, ao longo de um ano:

**Eventos de integração separados**, traduzidos a partir dos internos, com
vocabulário do negócio e apenas os campos que os consumidores precisavam. O CPF
saiu; ficou um identificador opaco de paciente, e quem precisa do dado consulta
com autorização.

**Catálogo** com publicador, consumidores e esquema. Tornou visível o consumidor
desconhecido e permitiu ver o ciclo — que ninguém tinha percebido em dezoito
meses porque nenhum diagrama existia.

**Registro de esquema** com compatibilidade obrigatória.

**Convivência de versões** por seis meses em cada mudança incompatível.

Depois disso, a refatoração de "consulta" e "procedimento" foi feita em três
semanas, sem tocar em nenhum consumidor.

O que a equipe registra: a camada de tradução parecia cerimônia desnecessária no
início — "é o mesmo dado, por que copiar?". O custo dela é pequeno e constante; o
custo de não tê-la foi sete meses de uma mudança de negócio bloqueada.

## Conceitos Relacionados

- [Sistemas Orientados a Eventos](../06-distributed-systems/event-driven-systems.md).
- [Integração por Mensageria](messaging-integration.md).
- [Anti-Corruption Layer](integration-anti-corruption.md) — onde a tradução vive.
- [Evolução de Esquema](schema-evolution.md).

## Exercício Prático

Pegue um evento que seu sistema publica para fora. Pergunte: se o modelo interno
mudar amanhã, este evento muda junto?

Se a resposta for sim, você não tem evento de integração — tem seu modelo interno
exposto como contrato público.

## Perguntas de Entrevista

- Qual a diferença entre evento interno e de integração, e por que ela importa?
- Quando um evento gordo é preferível a um fino, e vice-versa?
- Por que capturar mudanças do banco não é integração orientada a eventos?

## Para Aprofundar

- Stopford, Ben. *Designing Event-Driven Systems*. O'Reilly, 2018.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018.
