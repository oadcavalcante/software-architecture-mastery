---
id: sagas
title: Sagas
sidebar_position: 36
description: Transações locais encadeadas com compensação — e o custo real de modelar o desfazer.
doc_type: pattern
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta sagas com compensações corretas e reconhece quando
  a compensação não é possível.
prerequisites: [distributed-transactions]
related: [idempotency, event-driven-systems, distributed-transactions]
canonical_for: [saga, compensação, passo pivô]
content_version: 3
last_reviewed: 2026-08-27
---

# Sagas

## Visão Geral

Uma saga substitui a transação distribuída por uma **sequência de transações
locais**, cada uma com uma **compensação** que desfaz seu efeito.

Se um passo falha, as compensações dos passos anteriores são executadas em ordem
inversa.

O que se ganha: nenhuma trava distribuída, nenhum coordenador bloqueante, cada
passo independente. O que se paga: estados intermediários visíveis, e a
obrigação de modelar o desfazer — que é a parte difícil e a mais subestimada.

## Problema

Sem transação distribuída, uma operação de múltiplos passos que falha no meio deixa
estado parcial.

A saga aceita que o estado parcial existe e o torna **temporário, nomeado e tratado** — em
vez de curto e sem nome (2PC) ou permanente (nada).

A dificuldade não está no fluxo de sucesso. Está em responder, para cada passo,
"como desfazer isto?" — e descobrir que a resposta nem sempre existe.

## Conceitos Centrais

### Compensação não é rollback

Um rollback de banco apaga o efeito como se nunca tivesse ocorrido. Uma compensação
é uma **nova operação** que produz efeito contrário.

```text
rollback:    o débito nunca existiu
compensação: houve um débito e houve um estorno
```

A diferença é visível para o negócio e para a auditoria. E significa que existe uma
janela em que o efeito não compensado estava visível — outros podem tê-lo
observado e agido sobre ele.

### Nem tudo é compensável

A verificação que decide a viabilidade de uma saga: para cada passo, existe
compensação?

**Compensável.** Reserva → liberar. Débito → estorno. Registro → cancelar.

**Não compensável.** E-mail enviado. Mensagem publicada em canal externo. Chamada
a API de terceiro sem operação de cancelamento. Impressão. Envio físico.

Para passos não compensáveis, a técnica é **ordenar a saga para colocá-los por
último** — depois que todos os passos compensáveis já sucederam.

A reordenação é o que decide se a saga tem ponto de retorno: com os não compensáveis no
fim, todo passo anterior ao primeiro deles é reversível; com um no meio, a saga passa a ter
um trecho em que nem avançar nem voltar são garantidos.

### Passos pivô

Alguns passos, uma vez executados, tornam o cancelamento inaceitável para o
negócio. O passo pivô divide a saga:

```text
antes do pivô  → compensável, pode cancelar
o pivô         → o ponto de não retorno
depois do pivô → só pode avançar; falhas exigem repetição, não compensação
```

Depois do pivô, a saga precisa **avançar até completar**, com repetição
persistente. Isso muda o requisito: os passos posteriores precisam ser
[idempotentes](/06-distributed-systems/idempotency.md) e eventualmente bem-sucedidos.

### Coreografia e orquestração

**Coreografia.** Cada serviço reage a eventos e emite os seus. Não há coordenador.

Baixo acoplamento e nenhum ponto central. Em contrapartida, o fluxo não existe em
lugar nenhum — está distribuído pelas reações. Depurar exige reconstruir a sequência
a partir de registros de vários serviços.

**Orquestração.** Um componente conduz: chama o passo 1, ao receber a resposta chama
o passo 2, e assim por diante.

O fluxo é explícito, legível e testável. Em contrapartida, há um componente que
conhece todos os passos — acoplamento concentrado.

Os dois estilos são desenvolvidos em
[arquitetura orientada a eventos](/03-design-patterns/event-driven.md), canônico do tema. O
que muda numa saga é a compensação: ela é ordem, tem responsável e precisa acontecer mesmo
quando ninguém está escutando — e é por isso que o canônico manda orquestrar fluxos com
ordem e compensação.

**A ressalva deste documento:** numa saga de dois ou três passos sem passo pivô, a
coreografia ainda é defensável, porque não há ordem de compensação a coordenar. A partir do
momento em que existe um pivô, vale a regra do canônico — a dificuldade de depurar
coreografia cresce mais rápido que o benefício do desacoplamento.

### A saga precisa ser durável

O estado da saga — qual passo, o que já sucedeu — precisa sobreviver a reinício.
Se o orquestrador cai no meio, ele precisa retomar.

Isso significa persistir o estado a cada transição, e ter processo que detecta
sagas paradas e as retoma. Sem isso, uma queda deixa a operação em estado
intermediário permanente — exatamente o que a saga deveria evitar.

### Compensação também falha

A compensação é uma chamada de rede, e pode falhar como qualquer outra. Ela precisa
de [repetição](/06-distributed-systems/retries.md) e de [idempotência](/06-distributed-systems/idempotency.md).

E precisa de destino final: se a compensação falha repetidamente, algo precisa
alertar. Ver [fila de mensagens mortas](/06-distributed-systems/dead-letter-queues.md).

## Modelo Mental

**A saga troca invisibilidade por reversibilidade explícita.** O estado
intermediário deixa de ser escondido e passa a ser modelado.

## Quando Usar

- Operação de múltiplos passos entre serviços.
- Consistência eventual aceitável para essa operação.
- Todos os passos compensáveis, ou os não compensáveis podem ir por último.
- Estados intermediários podem ser representados no domínio.

## Quando Não Usar

**Quando o estado intermediário é inaceitável.** Se ver o dinheiro debitado e não
creditado é intolerável, mesmo por segundos.

**Quando passos essenciais não são compensáveis e não podem ir por último.**

**Quando a operação cabe numa transação local.** Se os dados estão no mesmo banco,
a transação resolve.

**Para operações de dois passos triviais.** A caixa de saída transacional pode ser
suficiente. Ver [transações distribuídas](/06-distributed-systems/distributed-transactions.md).

**Sem persistência a cada transição, e sem processo que detecte sagas paradas.** Uma saga
que não sobrevive a reinício deixa o limbo permanente e invisível: ninguém sabe quais
ficaram no meio, e a operação multi-passo que ela autorizou já aconteceu pela metade.

**Sem idempotência.** A repetição vai duplicar efeitos.

## Alternativas

- **[Transação distribuída](/06-distributed-systems/distributed-transactions.md)** — quando a atomicidade é
  inegociável e as condições permitem.
- **Caixa de saída transacional** — para o caso simples de banco + evento.
- **Reunir os dados** — transação local se a fronteira permitir.
- **Reconciliação em lote** — para divergências raras, corrigir depois pode ser
  mais barato que compensar em linha.

## Trade-offs

| Saga | 2PC |
|---|---|
| Sem travas distribuídas | Trava recursos |
| Cada passo independente | Disponibilidade combinada |
| Estados intermediários visíveis | Invisíveis |
| Compensação a modelar | Rollback automático |
| Escala | Escala mal |

| Coreografia | Orquestração |
|---|---|
| Sem componente central | Componente conhece o fluxo |
| Fluxo implícito | Explícito e testável |
| Difícil de depurar | Rastreável |
| Acoplamento distribuído | Concentrado |

## Modos de Falha

**Saga parada.** Um passo falha e a compensação não dispara; a operação fica em
limbo.

**Compensação falhando.** Sem repetição ou sem destino final.

**Compensação não idempotente.** Executada duas vezes, estorna em dobro.

**Efeito observado antes da compensação.** Alguém agiu sobre estado que foi
desfeito.

**Passo não compensável no meio.** A saga não consegue voltar.

**Estado perdido no reinício.** Sem persistência.

## Erros Comuns

**Não verificar a compensabilidade de cada passo antes de projetar.**

**Não reordenar para colocar o não compensável por último.**

**Coreografia para fluxos longos.**

**Compensação sem idempotência.**

**Não modelar os estados intermediários no domínio.** Eles vazam para a interface
de qualquer jeito.

**Não ter monitoramento de sagas paradas.**

## Exemplo Real

Uma plataforma de viagens implementou uma saga para reserva de pacote: voo, hotel e
carro, cada um num fornecedor externo diferente.

A primeira versão foi coreografada, com eventos entre três serviços.

Dois problemas apareceram em produção.

**Depuração.** Quando uma reserva ficava incompleta, descobrir onde parou exigia
correlacionar registros de três serviços. Um incidente típico levava 40 minutos só
para entender o estado.

**E-mail no meio.** O passo de confirmação enviava e-mail ao cliente após o hotel.
Quando o carro falhava, o cliente já tinha recebido "reserva confirmada" e depois
recebia o cancelamento. A reclamação era constante.

A reformulação.

**Orquestração.** Um serviço passou a conduzir, com o estado persistido a cada
transição. O tempo de diagnóstico caiu para minutos — o estado da saga é uma
consulta.

**Reordenação.** O e-mail foi movido para depois de todos os passos reserváveis.
Passou a existir um passo pivô explícito: a confirmação do pagamento. Antes dele,
tudo é cancelável; depois, a saga avança até completar, repetindo indefinidamente
os passos restantes.

**Compensação com prazo.** Descobriu-se que o fornecedor de hotel só aceitava
cancelamento sem multa dentro de 30 minutos. Isso virou requisito do trecho **antes do
pivô**: se a saga não chega ao pagamento em 25 minutos, compensa preventivamente, enquanto
compensar ainda é grátis.

Depois do pivô a regra não se aplica — e não pode se aplicar, porque ali a saga só avança.
Para o caso em que a janela do hotel expirava com o pagamento já confirmado, a decisão foi
mover a reserva para depois do pivô: ela deixou de ser um passo a compensar e passou a ser
um passo a repetir até suceder. As sagas que pivotaram antes dessa mudança pagaram a multa,
lançada como custo conhecido em vez de surpresa na conciliação.

Esse último ponto é o que a equipe registra como a lição principal: **a
compensação tinha uma janela de validade**, e ninguém tinha perguntado. Havia
sagas que compensavam horas depois e geravam multa — um custo que aparecia na
conciliação financeira mensal sem que ninguém ligasse à saga.

## Conceitos Relacionados

- [Transações Distribuídas](/06-distributed-systems/distributed-transactions.md) — a alternativa.
- [Idempotência](/06-distributed-systems/idempotency.md) — requisito.
- [Arquitetura Orientada a Eventos](/03-design-patterns/event-driven.md) — canônico de
  coreografia e orquestração.
- [Sistemas Orientados a Eventos](/06-distributed-systems/event-driven-systems.md) — o custo
  de rastrear um fluxo que ninguém coordena.
- [Filas de Mensagens Mortas](/06-distributed-systems/dead-letter-queues.md) — para compensação que falha.

## Exercício Prático

Pegue uma operação multi-passo do seu sistema. Para cada passo, escreva a
compensação.

Quando chegar a um passo sem compensação possível, você encontrou a restrição que
determina a ordem da saga.

## Perguntas de Entrevista

- Qual a diferença entre compensação e rollback?
- O que é um passo pivô e como ele muda a estratégia de falha?
- Quando coreografia deixa de ser adequada?

## Para Aprofundar

- Garcia-Molina, Hector; Salem, Kenneth. *Sagas*. SIGMOD, 1987.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — capítulo 4.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021 — capítulo 6.
