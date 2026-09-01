---
id: domain-event
title: Domain Event
sidebar_position: 16
description: Um fato relevante do domínio, nomeado e publicado — o mecanismo de coordenação entre agregados.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor usa eventos de domínio para coordenar agregados e
  distingue evento interno de evento de integração.
prerequisites: [aggregate]
related: [aggregate, event-driven, event-sourcing]
canonical_for: [domain event, evento de domínio, evento de integração]
content_version: 1
last_reviewed: 2026-08-26
---

# Domain Event

## Visão Geral

Um evento de domínio é um fato ocorrido, relevante para o negócio, nomeado no
vocabulário do domínio e no passado: `PedidoConfirmado`, `PagamentoRecusado`,
`CarenciaCumprida`.

Ele é o mecanismo que permite coordenar agregados sem violar a regra de um
agregado por transação.

## Problema

A regra de [aggregate](/04-domain-driven-design/aggregate.md) diz: modifique um agregado por transação.

Mas casos de uso reais atravessam agregados. Confirmar um pedido precisa reservar
estoque, iniciar cobrança e notificar o cliente — três agregados, possivelmente
três contextos.

Duas saídas ruins.

Alterar tudo na mesma transação, o que produz agregados grandes e conflitos de
concorrência.

Ou colocar a coordenação no serviço de aplicação, que passa a conhecer todos os
agregados envolvidos e vira o lugar onde a regra de sequência mora implicitamente.

Eventos de domínio dão a terceira: o agregado registra o que aconteceu, e quem
interessa reage — cada um na sua transação.

## Conceitos Centrais

### O evento é do domínio, não da técnica

Um evento de domínio tem nome que um especialista reconhece. `PedidoConfirmado`
é evento de domínio; `PedidoAtualizado` não é — "atualizado" é vocabulário de
banco de dados.

Se o especialista não entende o nome, o evento não captura um fato do negócio.

### O agregado registra; a aplicação publica

O padrão que funciona:

```text
class Pedido:
    confirmar():
        ... valida invariantes ...
        this.status = CONFIRMADO
        this.registrarEvento(new PedidoConfirmado(id, itens, total))
```

O agregado **registra** o evento numa lista interna. O serviço de aplicação
**publica** depois de persistir com sucesso.

A ordem importa: publicar antes de persistir produz eventos de coisas que não
aconteceram, se a transação falhar.

### Evento de domínio versus evento de integração

Distinção que evita o erro mais caro deste padrão.

**Evento de domínio** é interno ao bounded context. Carrega conceitos do modelo
interno, pode mudar livremente, e os consumidores estão no mesmo contexto.

**Evento de integração** atravessa a fronteira do contexto. É contrato público:
versionado, estável, e expresso em termos que fazem sentido fora.

Publicar eventos de domínio diretamente para fora amarra o modelo interno a
consumidores externos — e qualquer refatoração passa a quebrá-los.

A prática correta é traduzir: o evento interno dispara a publicação de um evento
de integração, com formato próprio.

### O problema da publicação transacional

Se a transação grava no banco e a publicação vai para um message broker, os dois
não são atômicos. Pode gravar e não publicar, ou publicar e falhar ao gravar.

A solução usual é o padrão *outbox*: o evento é gravado numa tabela na mesma
transação, e um processo separado o publica. Ver
[sistemas distribuídos](/06-distributed-systems/index.md).

Ignorar isso produz perda silenciosa de eventos, que é o defeito mais difícil de
diagnosticar deste padrão.

## Quando Usar

- Vários agregados precisam reagir a um fato.
- A coordenação não precisa ser transacional.
- O fato tem significado para o negócio, não só para o sistema.
- É preciso desacoplar quem faz de quem reage.
- Auditoria de fatos do negócio é necessária.

## Quando Não Usar

**Quando a reação precisa ser transacional com a origem.** Se a reserva de estoque
tem que acontecer ou o pedido não vale, isso não é evento — é parte da mesma
operação, e a fronteira do agregado provavelmente está errada.

**Quando há um consumidor e ele é fixo.** Chamada direta é mais simples e mais
rastreável.

**Para fatos sem significado de negócio.** `EntidadeSalva` não é evento de
domínio.

**Sem tratamento de idempotência no consumidor.** A entrega será ao menos uma
vez.

**Sem observabilidade.** Ver
[arquitetura orientada a eventos](/03-design-patterns/event-driven.md): o custo
do estilo é rastreabilidade.

## Alternativas

- **Chamada direta ao serviço de domínio** — quando há um consumidor.
- **[Saga](/06-distributed-systems/sagas.md)** — quando a coordenação precisa de
  compensação e prazo.
- **Serviço de aplicação orquestrando** — quando o fluxo é crítico e precisa ser
  auditável num lugar.
- **Processo agendado** — quando a latência tolerada é alta.

## Trade-offs

| Eventos de domínio | Coordenação direta |
|---|---|
| Agregados pequenos e independentes | Agregado grande ou serviço acoplado |
| Novo consumidor não toca a origem | Toca |
| Uma transação por agregado | Transação ampla |
| Consistência eventual | Forte |
| Fluxo não visível num lugar | Explícito |
| Duplicação e ordem a tratar | Semântica simples |

## Modos de Falha

**Evento publicado sem persistir.** A transação falha depois da publicação.

**Evento persistido e não publicado.** Sem outbox, o processo morre entre os dois.

**Consumidor não idempotente.** Duplicação vira efeito duplicado.

**Evento de domínio vazando para fora.** O modelo interno vira contrato público.

**Evento com dado insuficiente.** O consumidor precisa consultar a origem, o que
recria o acoplamento.

**Evento com dado demais.** Carrega o agregado inteiro; qualquer mudança de modelo
quebra consumidores.

## Erros Comuns

**Nomear com vocabulário técnico.** `PedidoAtualizado` não diz o que aconteceu no negócio e obriga cada consumidor a inspecionar o conteúdo para descobrir. `PedidoCancelado` e `EnderecoDeEntregaAlterado` são eventos diferentes porque provocam reações diferentes.

**Publicar antes de persistir.** Se a transação falha depois da publicação, consumidores reagem a um fato que não aconteceu — e não há como retirar o evento de circulação.

**Não distinguir evento de domínio de evento de integração.** O primeiro é interno e pode mudar junto com o modelo; o segundo é contrato público e não pode. Publicar o interno para fora congela o modelo do domínio nos consumidores dos outros times.

**Ignorar o problema da publicação transacional.** Gravar no banco e publicar no broker são duas operações que podem divergir: uma pode ter sucesso e a outra falhar. É o problema que o padrão outbox existe para resolver, e ignorá-lo produz inconsistência silenciosa e rara — a pior combinação para depurar.

**Usar eventos para coordenação que precisa ser transacional.** Se o passo seguinte precisa acontecer junto com o primeiro ou nenhum dos dois, evento é a ferramenta errada: ele entrega consistência eventual, e o requisito era atomicidade.

## Exemplo Real

Um sistema de seguros publicava `ApoliceEmitida` diretamente do agregado para o
message broker, consumido por quatro contextos: cobrança, comissionamento,
relatórios e comunicação.

O evento carregava o objeto `Apolice` inteiro, serializado.

Dois problemas apareceram.

Uma refatoração do agregado — renomear um campo interno e reestruturar as
coberturas — quebrou os quatro consumidores simultaneamente. O modelo interno era
contrato público sem que ninguém tivesse decidido isso.

E, num incidente de indisponibilidade do broker, 340 apólices foram emitidas sem
que o evento fosse publicado. Nenhuma foi cobrada. Descobriu-se três semanas
depois, na conciliação contábil.

As duas correções.

O agregado passou a registrar `ApoliceEmitida` como evento **interno**, com o
modelo que quiser. O serviço de aplicação traduz para
`ApoliceEmitidaV1` — evento de integração com formato versionado, contendo apenas
os campos que os consumidores precisam: número, segurado, vigência, prêmio,
coberturas em formato próprio.

Refatorações internas deixaram de alcançar os consumidores.

E a publicação passou a usar outbox: o evento de integração é gravado na mesma
transação da apólice, e um processo o publica com garantia de ao menos uma vez.

A perda silenciosa deixou de ser possível.

## Conceitos Relacionados

- [Aggregate](/04-domain-driven-design/aggregate.md) — quem registra o evento.
- [Application Service](/04-domain-driven-design/application-service.md) — quem publica.
- [Arquitetura Orientada a Eventos](/03-design-patterns/event-driven.md) — o
  estilo em escala de sistema.
- [Event Sourcing](/03-design-patterns/event-sourcing.md) — quando os eventos
  são a fonte de verdade.

## Exercício Prático

Liste os eventos que seu sistema publica. Para cada um, verifique: o nome está no
passado e no vocabulário do domínio? Ele atravessa a fronteira do contexto? Se
sim, é versionado?

Depois verifique como a publicação é feita: existe garantia de que o evento é
publicado se e somente se a transação for confirmada?

## Perguntas de Entrevista

- Qual a diferença entre evento de domínio e evento de integração?
- Por que registrar no agregado e publicar no serviço de aplicação?
- Como garantir que o evento seja publicado apenas se a transação for confirmada?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — o padrão outbox.
