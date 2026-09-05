---
id: event-driven
title: Arquitetura Orientada a Eventos
sidebar_position: 26
description: Componentes reagem a fatos em vez de serem chamados — desacoplamento no tempo, ao custo de rastreabilidade.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe entre orquestração e coreografia e reconhece o
  custo de rastreabilidade que o estilo introduz.
prerequisites: [microservices]
related: [observer, cqrs, event-sourcing]
canonical_for: [arquitetura orientada a eventos, coreografia, orquestração]
content_version: 2
last_reviewed: 2026-08-26
---

# Arquitetura Orientada a Eventos

## Visão Geral

Numa arquitetura orientada a eventos, componentes publicam fatos ocorridos e
outros reagem a eles, sem que o publicador conheça os consumidores.

É [Observer](/03-design-patterns/observer.md) em escala de sistema, com uma diferença que muda tudo:
o canal é durável, e a entrega atravessa processos.

## Problema

Comunicação síncrona entre serviços acopla no tempo: se o destino está fora, a
origem está fora. E acopla em conhecimento: quem chama precisa saber quem
chamar.

Quando confirmar um pedido exige acionar estoque, cobrança, entrega, fidelidade e
notificação, o serviço de pedidos conhece cinco outros, depende da
disponibilidade dos cinco, e cada novo interessado exige alterá-lo.

Publicar `PedidoConfirmado` inverte: pedidos anuncia um fato e segue. Quem
interessa reage no seu tempo.

## Conceitos Centrais

### Evento é um fato ocorrido

A distinção que organiza tudo: **evento é passado, comando é imperativo.**

`PedidoConfirmado` descreve o que aconteceu; quem reage decide o que fazer.
`ReservarEstoque` diz o que fazer, e é um comando disfarçado de evento.

Nomear comandos como eventos produz acoplamento com aparência de desacoplamento:
o publicador continua sabendo o que deve acontecer.

### Orquestração e coreografia

A decisão estrutural do estilo, e a mesma que aparece em
[Mediator](/03-design-patterns/mediator.md) versus [Observer](/03-design-patterns/observer.md).

**Orquestração** — um coordenador conhece o fluxo e aciona os passos. O fluxo
está num lugar, é auditável e visualizável. O coordenador acopla.

**Coreografia** — cada serviço reage aos eventos que lhe interessam. Máximo
desacoplamento, e o fluxo não existe em lugar nenhum: entendê-lo exige juntar o
que cada serviço faz.

| | Orquestração | Coreografia |
|---|---|---|
| Fluxo visível | Sim, num lugar | Não, emergente |
| Acoplamento | Coordenador conhece todos | Cada um conhece eventos |
| Adicionar passo | Alterar o coordenador | Novo assinante |
| Depurar | Seguir o coordenador | Reconstruir por rastros |
| Adequado a | Fluxos de negócio críticos | Reações independentes |

A escolha não é ideológica. Fluxos com ordem, compensação e responsabilidade legal
pedem orquestração; reações independentes pedem coreografia. Sistemas reais usam
as duas.

### O custo central: rastreabilidade

O que se ganha em desacoplamento se paga em capacidade de responder "o que
aconteceu com este pedido?".

Num sistema síncrono, o fluxo é legível no código — dá para segui-lo lendo, e o erro volta
a quem chamou. Num orientado a eventos não há esse fio: a sequência só existe em tempo de
execução. Atravessar processos exige correlacionar registros de vários serviços nos dois
casos, ao longo do tempo, com o
mesmo identificador.

Isso torna [observabilidade](/13-observability/index.md) um pré-requisito, não
um complemento. Correlation ID atravessando todo evento não é opcional.

### As garantias herdadas

O canal é uma rede, e isso obriga a **escolher** a garantia de entrega — não impõe uma
delas. Ver [garantias de entrega](/06-distributed-systems/delivery-guarantees.md): no máximo
uma vez é escolha legítima onde a perda é aceitável, e o canônico registra que ela raramente
é considerada.

Quem escolhe **ao menos uma vez**, que é o caso comum, herda:

Duplicação — consumidores precisam ser idempotentes.
Ordem não garantida entre partições.
Mensagens que sempre falham — *poison messages* — precisam de dead-letter queue.
E consistência eventual entre os serviços.

Ver [Nível 04](/06-distributed-systems/index.md). Nada disso é opcional; é o que
o estilo custa.

## Quando Usar

- Múltiplos interessados independentes no mesmo fato.
- Os consumidores mudam com frequência.
- As reações podem ser assíncronas sem prejuízo ao negócio.
- É preciso desacoplar no tempo — o produtor não deve depender da disponibilidade
  do consumidor.
- Há necessidade de reprocessar histórico.

## Quando Não Usar

**Quando a resposta é necessária para continuar.** Se quem publica precisa do
resultado, é uma chamada, não um evento.

**Quando a consistência forte é requisito.** Consistência eventual é a semântica
do estilo, e o negócio precisa aceitá-la explicitamente.

**Quando há um consumidor e ele é fixo.** Chamada direta é mais simples e mais
rastreável.

**Sem observabilidade distribuída.** O sistema fica indiagnosticável.

**Para fluxo crítico sem orquestração.** Coreografia em fluxo de pagamento
produz um processo que ninguém consegue auditar.

**Quando o time não domina os problemas de duplicação e ordem.** Eles vão
aparecer, e os defeitos são sutis.

## Alternativas

- **Chamada síncrona** — quando há um consumidor e a resposta importa.
- **Orquestração explícita** — mantendo eventos, mas com um coordenador.
- **Consulta agendada** — mais simples que evento quando a latência tolerada é
  alta.
- **[Monolito modular](/03-design-patterns/modular-monolith.md) com eventos internos** — o
  desacoplamento lógico sem a rede.

## Trade-offs

| Orientado a eventos | Chamadas síncronas |
|---|---|
| Produtor independe do consumidor | Depende da disponibilidade |
| Novo consumidor não toca o produtor | Toca |
| Absorve picos por enfileiramento | Propaga pressão |
| Fluxo não é visível em lugar nenhum | Visível na pilha de chamadas |
| Duplicação e ordem a tratar | Semântica simples |
| Consistência eventual | Transação possível |
| Exige observabilidade distribuída | Diagnóstico local |

## Modos de Falha

**Fluxo invisível.** Ninguém consegue descrever o que acontece após um evento.

**Comando disfarçado de evento.** Acoplamento com aparência de desacoplamento.

**Consumidor não idempotente.** Duplicação vira efeito duplicado — cobrança
repetida é o caso clássico.

**Evento perdido silenciosamente.** Sem dead-letter queue e sem alerta.

**Cascata de eventos.** Um evento dispara outro que dispara outro; um laço.

**Contrato de evento não versionado.** Um campo removido quebra consumidores que o
produtor desconhece.

## Erros Comuns

**Adotar sem observabilidade.**

**Coreografia em fluxo crítico.**

**Não versionar o contrato do evento.** É público por definição.

**Ignorar idempotência.**

**Tratar o evento como notificação e depois como fonte de verdade.** Se o
consumidor guarda o dado, o evento virou contrato de dados e a evolução dele fica
muito mais cara.

## Onde ele aparece na prática

**Processamento de pedidos em comércio eletrônico.** A condição que o torna adequado:
muitos interessados independentes no mesmo fato, todos com reação assíncrona tolerável.

**Sistemas de dados em tempo real.** Ingestão, transformação e distribuição por
fluxos de eventos.

**Integração entre domínios de uma empresa.** Eventos de negócio como contrato
entre áreas.

**Notificação e auditoria.** Reações independentes e não críticas — o caso em que
coreografia é claramente adequada.

Nos sistemas de pagamento, a divisão típica é reveladora: o fluxo de autorização e
captura é orquestrado; notificação, fidelidade e análise consomem eventos. A mesma
plataforma usa os dois estilos, por razões diferentes.

## Exemplo Real

Uma plataforma de delivery adotou coreografia pura: dezenove serviços reagindo a
eventos, sem coordenador.

O sintoma apareceu no atendimento. Um pedido ficava "em preparo" indefinidamente,
e ninguém conseguia dizer por quê — o fluxo esperado não estava documentado em
lugar nenhum, e reconstruí-lo exigia ler dezenove serviços.

Três engenheiros levaram dois dias para descobrir que um consumidor tinha parado
de processar por uma mensagem envenenada, sem dead-letter queue configurada.

A correção teve duas partes.

A operacional: dead-letter queue e alerta em todos os consumidores.

A estrutural: o fluxo principal do pedido — aceito, preparo, coleta, entrega —
virou orquestrado, com uma saga explícita que conhece os passos, os prazos e as
compensações. Os demais serviços — fidelidade, análise, notificação, avaliação —
continuaram em coreografia.

O resultado: o fluxo crítico passou a ser auditável e a ter prazo por etapa; as
reações periféricas mantiveram o desacoplamento.

O erro original não foi usar eventos. Foi usar coreografia para um processo que
tem responsabilidade legal e prazo contratual.

## Conceitos Relacionados

- [Observer](/03-design-patterns/observer.md) — a versão em processo.
- [CQRS](/03-design-patterns/cqrs.md) e [Event Sourcing](/03-design-patterns/event-sourcing.md) — padrões que
  frequentemente acompanham.
- [Sistemas Distribuídos](/06-distributed-systems/index.md) — as garantias.
- [Integração](/08-integration-architecture/index.md) — os mecanismos.

## Exercício Prático

Escolha um fluxo de negócio do seu sistema e tente descrevê-lo por escrito, do
início ao fim, sem consultar o código.

Se não conseguir, o fluxo é emergente. Verifique se ele é crítico — se for,
orquestração provavelmente se justifica.

## Perguntas de Entrevista

- Qual a diferença entre evento e comando?
- Quando coreografia é inadequada?
- Que garantias o estilo obriga a tratar?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*.
  Addison-Wesley, 2003.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — sagas e
  coreografia.
- Fowler, Martin. *What do you mean by "Event-Driven"?*, 2017.
