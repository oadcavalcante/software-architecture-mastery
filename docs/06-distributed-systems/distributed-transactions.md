---
id: distributed-transactions
title: Transações Distribuídas
sidebar_position: 35
description: Commit atômico entre serviços — o que 2PC promete, o que ele bloqueia, e por que raramente é a resposta.
doc_type: pattern
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece o custo real do commit em duas fases e sabe quais
  alternativas resolvem o mesmo problema sem ele.
prerequisites: [distributed-fundamentals, partial-failure]
related: [sagas, consensus, idempotency]
canonical_for: [transação distribuída, commit em duas fases, 2PC]
content_version: 1
last_reviewed: 2026-08-27
---

# Transações Distribuídas

## Visão Geral

Uma transação distribuída tenta estender a atomicidade de um banco de dados a
múltiplos participantes: ou todos confirmam, ou nenhum.

O mecanismo clássico é o **commit em duas fases** (2PC). Ele funciona, e o preço é
alto o suficiente para que a maioria dos sistemas modernos escolha outra coisa.

Este documento existe para que essa escolha seja informada, não por reflexo.

## Problema

Uma operação de negócio frequentemente toca mais de um armazenamento: debitar numa
conta e creditar em outra, reservar estoque e registrar pedido, criar usuário e
provisionar recurso.

Numa transação local, o banco garante atomicidade. Entre serviços ou bancos, não há
essa garantia — cada participante confirma ou falha independentemente.

O resultado sem coordenação é estado parcial: dinheiro debitado e não creditado,
pedido registrado sem estoque reservado.

## Conceitos Centrais

### Como 2PC funciona

Um **coordenador** conduz o protocolo:

```text
Fase 1 — preparar
  coordenador → cada participante: "consegue confirmar?"
  participante: persiste a intenção, trava os recursos, responde sim/não

Fase 2 — decidir
  se todos disseram sim → "confirme"
  se algum disse não    → "cancele"
```

A garantia vem da fase 1: ao responder "sim", o participante se compromete a poder
confirmar depois, mesmo que reinicie. Ele mantém as travas até a fase 2.

### O problema de bloqueio

Entre responder "sim" e receber a decisão, o participante está **preparado** — com
recursos travados e sem autoridade para decidir sozinho.

Se o coordenador falhar nesse intervalo, o participante fica travado
indefinidamente. Não pode confirmar (não sabe se todos concordaram) nem cancelar
(pode ter sido decidido confirmar).

Isso é o **bloqueio do 2PC**, e é a razão principal para evitá-lo: a
indisponibilidade do coordenador se propaga para todos os participantes, travando
recursos que outras operações precisam.

Na prática, isso aparece como banco travado com transações pendentes que exigem
intervenção manual.

### O coordenador é ponto único

Tornar o coordenador tolerante a falhas exige [consenso](consensus.md) — o que
adiciona latência e complexidade ao protocolo que já é caro.

Sistemas que fazem isso corretamente existem. A maioria das implementações usa
coordenador simples, com o risco de bloqueio.

### O custo de latência e acoplamento

2PC exige duas idas e voltas para todos os participantes, com persistência em
cada fase.

Além disso, ele **acopla a disponibilidade**: a transação só sucede se todos os
participantes estiverem disponíveis simultaneamente. Com cinco participantes de
99,9% cada, a disponibilidade combinada cai para 99,5%.

Ver [falha parcial](partial-failure.md). Cada participante adicionado reduz a
probabilidade de sucesso.

### Onde 2PC ainda é razoável

Ele não é sempre errado:

- Poucos participantes, na mesma rede local.
- Transações curtas, com travas de curta duração.
- Coordenador com alta disponibilidade.
- Baixo volume.
- Um gerenciador de transações maduro cuidando dos casos de borda.

Fora dessas condições, o custo domina.

## Modelo Mental

**2PC troca disponibilidade por atomicidade, e a troca piora com cada participante
adicionado.**

## Quando Usar

- Poucos participantes, próximos, com transações curtas.
- Atomicidade estrita exigida e compensação inaceitável.
- Infraestrutura de transação madura já disponível.
- Volume baixo o suficiente para que o bloqueio seja gerenciável.

## Quando Não Usar

**Entre serviços de times diferentes.** Acopla ciclo de vida e disponibilidade —
contradiz a razão de separar os serviços.

**Com muitos participantes.** A disponibilidade combinada despenca.

**Com transações longas.** Travas de longa duração matam a vazão.

**Entre regiões.** A latência multiplica.

**Sem coordenador tolerante a falhas.** O bloqueio vai acontecer.

**Quando compensação é aceitável.** Ver [sagas](sagas.md) — resolve o mesmo
problema sem travar.

**Quando o problema é modelagem.** Se a operação precisa ser atômica, talvez os
dados devessem estar no mesmo lugar. Frequentemente a fronteira entre serviços foi
traçada no lugar errado.

A última é a observação mais valiosa: a necessidade de transação distribuída é
frequentemente sintoma de decomposição equivocada.

## Alternativas

- **[Sagas](sagas.md)** — sequência de transações locais com compensação.
- **Caixa de saída transacional** — grava a mudança e o evento na mesma transação
  local, e publica depois. Resolve o caso mais comum sem 2PC.
- **[Idempotência](idempotency.md) com repetição** — em vez de atomicidade, garantir
  que a repetição converge.
- **Reunir os dados** — se a atomicidade é essencial, colocar no mesmo
  armazenamento.
- **Consistência eventual com reconciliação** — aceitar divergência temporária e
  corrigir.

A caixa de saída transacional merece destaque: o cenário mais comum de "preciso de
2PC" é "atualizar o banco e publicar um evento", e ela resolve isso com uma
transação local mais um processo de publicação.

## Trade-offs

| 2PC | Saga | Caixa de saída |
|---|---|---|
| Atomicidade estrita | Consistência eventual | Eventual |
| Nunca há estado intermediário visível | Estados intermediários visíveis | Visíveis |
| Trava recursos | Sem travas | Sem travas |
| Bloqueia se o coordenador cair | Sem coordenador crítico | Sem coordenador |
| Disponibilidade combinada | Cada passo independente | Local |
| Sem lógica de compensação | Compensação a escrever | Sem compensação |
| Escala mal | Escala | Escala |

## Modos de Falha

**Transação pendente.** O coordenador cai entre as fases; os participantes travam.

**Timeout do coordenador.** Ele decide cancelar; um participante já confirmou por
conta.

**Recuperação heurística.** Um operador resolve manualmente uma pendência,
possivelmente de forma inconsistente com os outros participantes.

**Contenção.** Travas de longa duração serializam operações não relacionadas.

**Cascata de indisponibilidade.** Um participante lento trava todos os outros.

## Erros Comuns

**Usar 2PC por reflexo de atomicidade.**

**Não considerar que a fronteira do serviço está errada.**

**Coordenador sem alta disponibilidade.**

**Não medir a duração das travas.**

**Ignorar a caixa de saída transacional** para o caso "banco + evento".

## Exemplo Real

Uma plataforma de logística tinha uma operação que criava a remessa, reservava a
capacidade do veículo e debitava o crédito do cliente — três serviços, três
bancos.

A implementação usava 2PC com um gerenciador de transações.

Funcionou por dois anos, com incidentes recorrentes:

**Travas longas.** O serviço de crédito consultava um sistema externo dentro da
fase preparada. Quando esse sistema ficava lento, a trava sobre o registro do
cliente durava dezenas de segundos, e outras operações do mesmo cliente
enfileiravam.

**Pendências manuais.** Cerca de duas vezes por mês, o coordenador reiniciava
durante uma transação e deixava participantes travados. Havia um procedimento
manual documentado.

**Indisponibilidade combinada.** Qualquer um dos três serviços indisponível
derrubava a operação inteira, mesmo quando o passo daquele serviço não era
urgente.

A migração para saga mudou o modelo.

**Sequência com compensação.** Criar remessa → reservar capacidade → debitar
crédito. Cada passo é uma transação local. Falha em qualquer ponto dispara as
compensações dos passos anteriores.

**Estados intermediários explícitos.** A remessa passou a ter estado "aguardando
confirmação" visível na interface — o que era estritamente invisível no 2PC.

**Idempotência em todos os passos.** Ver [idempotência](idempotency.md).

O que mudou operacionalmente: as pendências manuais desapareceram, e a contenção
também. A operação passou a suceder mesmo com o serviço de crédito temporariamente
lento — o débito acontece com atraso.

O que piorou: o estado "aguardando confirmação" precisou ser tratado em cinco
telas e dois relatórios, e a compensação do débito exigiu regra de negócio nova —
o que fazer se o crédito já foi consumido.

A equipe considera a troca claramente positiva, e registra que o trabalho de
modelar as compensações foi maior do que a estimativa inicial, por uma margem
larga.

## Conceitos Relacionados

- [Sagas](sagas.md) — a alternativa principal.
- [Falha Parcial](partial-failure.md) — o problema de fundo.
- [Consenso](consensus.md) — o que um coordenador confiável exige.
- [Idempotência](idempotency.md) — o que a alternativa exige.

## Exercício Prático

Encontre no seu sistema uma operação que toca mais de um armazenamento. Pergunte:
o que acontece hoje se ela falhar no meio?

Se a resposta for "não sabemos", esse é o estado real — nem 2PC, nem saga, apenas
estado parcial sem tratamento.

## Perguntas de Entrevista

- O que acontece se o coordenador de 2PC falhar entre as fases?
- Por que a disponibilidade piora com cada participante?
- Que problema a caixa de saída transacional resolve?

## Para Aprofundar

- Gray, Jim; Reuter, Andreas. *Transaction Processing: Concepts and Techniques*.
  Morgan Kaufmann, 1992.
- Bernstein, Philip; Newcomer, Eric. *Principles of Transaction Processing*.
  Morgan Kaufmann, 2009.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — capítulo 4.
