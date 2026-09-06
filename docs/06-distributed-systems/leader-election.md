---
id: leader-election
title: Eleição de Líder
sidebar_position: 16
description: Escolher quem coordena — e por que a eleição é fácil e evitar dois líderes é difícil.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor entende por que eleição de líder exige consenso e
  reconhece os mecanismos que impedem cérebro dividido.
prerequisites: [replication]
related: [consensus, distributed-locks, failure-detection]
canonical_for: [eleição de líder, cérebro dividido, fencing]
content_version: 1
last_reviewed: 2026-08-27
---

# Eleição de Líder

## Visão Geral

Eleição de líder é o processo pelo qual um grupo de nós escolhe um para
coordenar — aceitar escritas, distribuir trabalho, tomar decisões que precisam ser
únicas.

Escolher é fácil. O difícil é **garantir que não haja dois**, e essa dificuldade
é a razão pela qual eleição de líder exige [consenso](/06-distributed-systems/consensus.md).

## Problema

Ter um líder simplifica enormemente: com um único nó decidindo, não há conflito de
escrita nem ordenação a resolver. É por isso que [replicação](/06-distributed-systems/replication.md) com
líder único é o arranjo mais comum.

O problema aparece quando o líder falha.

Os outros nós precisam detectar a falha e eleger um substituto. Mas
[detectar falha é heurística](/06-distributed-systems/failure-detection.md): "não responde" pode
significar caído, lento, ou do outro lado de uma partição.

Se os nós elegem um novo líder e o antigo **não caiu** — só estava incomunicável —
existem dois líderes, ambos aceitando escritas, ambos convencidos de serem o
único.

Isso é **cérebro dividido**, e é o modo de falha que a eleição precisa impedir.

## Conceitos Centrais

### Maioria é o que impede dois líderes

O mecanismo fundamental: **um nó só se torna líder com o voto da maioria.**

Como não pode haver duas maiorias disjuntas num mesmo grupo, não pode haver dois
líderes eleitos simultaneamente.

```text
5 nós, partição em 3 e 2
  → o grupo de 3 tem maioria: elege líder
  → o grupo de 2 não tem: fica sem líder, indisponível para escrita
```

O lado minoritário **precisa parar de aceitar escritas**. Se ele continua, o
mecanismo não vale nada.

Isso é o que torna a eleição uma escolha CP: sob partição, o lado minoritário fica
indisponível. Ver [CAP](/06-distributed-systems/cap.md).

### O líder antigo precisa saber que perdeu

Aqui está a parte sutil. O nó isolado pode não perceber que perdeu a liderança —
ele não recebe notícia, porque está partido.

Duas defesas:

**Concessão com prazo.** A liderança vale por um tempo limitado e precisa ser
renovada com a maioria. Sem renovar, o líder **se demite sozinho**. Isso limita a
janela de dois líderes ao tempo da concessão.

**Fencing.** Cada liderança recebe um número crescente. Os recursos protegidos —
banco, armazenamento — rejeitam operações com número menor que o último visto.

```text
líder 1 (época 5) é isolado
líder 2 (época 6) é eleito e escreve
líder 1 volta e tenta escrever com época 5
  → recurso rejeita: já viu época 6
```

Fencing é a defesa que funciona mesmo quando a detecção falha, porque ela não
depende de o líder antigo perceber nada. É o mecanismo mais confiável, e o mais
frequentemente omitido.

### Detecção e estabilidade

O tempo de detecção define um compromisso:

**Curto.** Failover rápido, e risco de eleição desnecessária por lentidão
momentânea — o que causa instabilidade, com liderança trocando repetidamente.

**Longo.** Estável, e mais tempo de indisponibilidade quando o líder de fato cai.

Sistemas maduros costumam usar detecção da ordem de segundos, com concessão de
prazo semelhante.

### Nem tudo precisa de líder

Antes de eleger, vale perguntar se a coordenação é necessária.

Operações comutativas — que podem acontecer em qualquer ordem sem alterar o
resultado — não precisam de líder. Ver
[resolução de conflitos](/06-distributed-systems/conflict-resolution.md) e estruturas que convergem sem
coordenação.

Líder é a solução mais simples de raciocinar e a mais cara em disponibilidade.

### Não implemente do zero

Eleição correta é notoriamente difícil de implementar. As implementações
disponíveis — baseadas em Raft, Paxos ou serviços de coordenação — foram testadas
contra cenários de partição que uma implementação própria não terá.

Ver [consenso](/06-distributed-systems/consensus.md).

## Modelo Mental

**Eleição não é escolher um líder; é garantir que não existam dois.** Todo o
mecanismo serve a essa segunda parte.

## Quando Usar

- Uma operação precisa acontecer em exatamente um lugar — agendamento, migração,
  compactação.
- Replicação com líder único precisa de failover automático.
- Há um recurso que não admite acesso concorrente entre nós.

## Quando Não Usar

**Quando a operação é comutativa.** Não precisa de coordenação.

**Quando pode ser idempotente e executada por todos.** Ver
[idempotência](/06-distributed-systems/idempotency.md): se executar N vezes é inofensivo, a eleição é
desnecessária.

**Sem fencing, para proteger recurso externo.** A eleição garante um líder no
grupo; ela não impede que um ex-líder escreva num recurso que não participa do
consenso.

**Implementando do zero.**

**Quando a indisponibilidade do lado minoritário for inaceitável.** Aí a resposta é
uma arquitetura sem líder, com as complicações correspondentes.

## Alternativas

- **Sem líder, com quórum** — replicação sem coordenação central.
- **Operações comutativas** — evita a necessidade.
- **Bloqueio distribuído com prazo** — para coordenação pontual, não contínua. Ver
  [locks distribuídos](/06-distributed-systems/distributed-locks.md).
- **Particionamento** — em vez de um líder para tudo, um por partição, o que
  distribui a carga e o risco.

## Trade-offs

| Com líder | Sem líder |
|---|---|
| Sem conflito de escrita | Conflitos a resolver |
| Ordenação natural | Ordenação a estabelecer |
| Raciocínio simples | Complexo |
| Gargalo de escrita | Distribuído |
| Indisponível durante eleição | Sempre disponível |
| Ponto de falha, mitigado por failover | Sem ponto único |

## Modos de Falha

**Cérebro dividido.** Dois líderes escrevendo.

**Instabilidade de liderança.** Trocas repetidas por detecção agressiva.

**Ex-líder escrevendo em recurso externo.** Sem fencing.

**Eleição que não conclui.** Sem maioria disponível, o grupo fica sem líder.

**Falso positivo de detecção.** Líder saudável e lento é substituído
desnecessariamente.

## Erros Comuns

**Não usar fencing ao proteger recurso externo.**

**Implementar eleição própria.**

**Detecção agressiva demais.**

**Permitir que o lado minoritário aceite escritas.** Anula toda a proteção.

**Assumir que o líder antigo percebe que perdeu.**

## Exemplo Real

Um sistema de processamento em lote usava eleição de líder para garantir que
apenas uma instância executasse a rotina noturna de fechamento.

A implementação era caseira: um registro numa tabela com marca de tempo. Quem
conseguisse atualizar primeiro era o líder por 5 minutos.

Funcionou por dois anos. Depois, uma pausa longa de coleta de lixo numa instância
produziu o cenário clássico.

A instância A obteve a liderança e começou o fechamento. No meio, sofreu uma pausa
de 7 minutos. A concessão expirou. A instância B assumiu e começou o fechamento do
zero.

A instância A voltou da pausa **sem saber** que havia perdido a liderança — do
ponto de vista dela, nada aconteceu — e continuou escrevendo de onde parou.

Duas instâncias escreveram lançamentos contábeis do mesmo fechamento. A
conciliação levou três dias.

A correção teve duas partes.

**Fencing.** Cada liderança passou a receber um número crescente, gravado junto
com cada lançamento. A tabela de lançamentos rejeita escrita com número menor que
o último aceito. A instância A, ao voltar, foi rejeitada na primeira escrita.

**Serviço de coordenação testado** em vez da implementação caseira, com concessão
renovada por batimento e verificação explícita de liderança antes de cada bloco de
escrita.

O que torna esse caso instrutivo é que o problema não foi a eleição — ela
funcionou, e B foi corretamente eleito. O problema foi **A não saber que perdeu**,
e nenhum mecanismo impedir que ele escrevesse.

Fencing é a única defesa que funciona nesse cenário, porque ela não depende do
ex-líder perceber nada.

## Conceitos Relacionados

- [Consenso](/06-distributed-systems/consensus.md) — o mecanismo que sustenta a eleição.
- [Locks Distribuídos](/06-distributed-systems/distributed-locks.md) — o mesmo problema em escala menor.
- [Detecção de Falha](/06-distributed-systems/failure-detection.md) — por que é heurística.
- [Falha de Rede](/06-distributed-systems/network-failure.md) — a partição que o provoca.

## Exercício Prático

Se seu sistema tem alguma operação que "só uma instância pode executar", descubra
como isso é garantido.

Depois faça a pergunta do caso acima: se a instância eleita sofrer uma pausa longa
e voltar, o que impede que ela continue escrevendo?

## Perguntas de Entrevista

- Por que eleição de líder exige maioria?
- O que é fencing e por que ele é necessário mesmo com concessão de prazo?
- Por que o lado minoritário de uma partição precisa parar de aceitar escritas?

## Para Aprofundar

- Kleppmann, Martin. *How to do distributed locking*, 2016 — o argumento sobre
  fencing.
- Ongaro, Diego; Ousterhout, John. *In Search of an Understandable Consensus
  Algorithm (Raft)*, 2014.
- Burrows, Mike. *The Chubby Lock Service*. OSDI, 2006.
