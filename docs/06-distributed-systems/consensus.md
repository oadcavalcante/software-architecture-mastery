---
id: consensus
title: Consenso
sidebar_position: 17
description: Fazer vários nós concordarem — o problema mais difícil da área, e o que você deve consumir em vez de implementar.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor entende o que consenso garante, o que ele custa, e por que
  implementá-lo é quase sempre a decisão errada.
prerequisites: [leader-election]
related: [leader-election, distributed-locks, cap]
canonical_for: [consenso, quórum, Raft, Paxos]
content_version: 1
last_reviewed: 2026-08-27
---

# Consenso

## Visão Geral

Consenso é fazer um grupo de nós concordar sobre um valor, de forma que a decisão
seja única, definitiva e sobreviva a falhas.

É o problema mais estudado de sistemas distribuídos, e o mais fácil de implementar
errado. A recomendação prática deste documento é direta: **consuma consenso,
não o implemente.**

## Problema

Várias decisões precisam ser únicas: quem é o líder, qual o próximo número de
sequência, se uma transação foi confirmada, qual a configuração vigente do
cluster.

Se dois nós chegarem a respostas diferentes, o sistema fica incoerente de forma
irrecuperável.

O que torna difícil não é concordar quando tudo funciona — é concordar **apesar
de** nós que caem, mensagens que se perdem e nós lentos que parecem mortos.

E há um resultado teórico incômodo: o teorema FLP mostra que, num sistema
assíncrono em que um nó pode falhar, **nenhum algoritmo garante consenso em tempo
finito**. Não porque os algoritmos sejam ruins — é impossível.

## Conceitos Centrais

### O que o resultado FLP significa na prática

Ele não diz que consenso é inviável. Diz que nenhum algoritmo pode garantir
simultaneamente correção e terminação num sistema perfeitamente assíncrono.

Os algoritmos práticos contornam usando **tempo**: timeouts para suspeitar de
falha. Isso sacrifica a garantia teórica de terminação — sob condições
patológicas, a eleição pode não concluir — em troca de funcionar na prática.

O que eles nunca sacrificam é a **segurança**: mesmo que não decidam, nunca
decidem errado. Duas decisões conflitantes são impossíveis.

Essa é a hierarquia correta: segurança sempre, progresso quando a rede colabora.

### Maioria é o mecanismo

Todos os algoritmos práticos se apoiam na mesma ideia: **uma decisão precisa do
acordo da maioria.**

Como não existem duas maiorias disjuntas, não podem existir duas decisões
conflitantes.

A consequência operacional: com N nós, o sistema tolera `(N-1)/2` falhas.

```text
3 nós → tolera 1 falha
5 nós → tolera 2
7 nós → tolera 3
```

Números pares não ajudam: 4 nós toleram 1 falha, igual a 3, com mais custo de
coordenação. É por isso que clusters de consenso têm número ímpar.

### O custo

Cada decisão exige ao menos uma ida e volta com a maioria. Isso significa:

**Latência.** Uma escrita coordenada custa a latência até a maioria — o que em
configuração multi-região é a distância geográfica.

**Vazão limitada.** Toda decisão passa pelo líder e pela maioria. Consenso não
escala horizontalmente: adicionar nós **piora** a latência, porque a maioria fica
maior.

**Indisponibilidade sob partição.** O lado minoritário não decide nada. Ver
[CAP](cap.md).

Por isso consenso é usado para o **plano de controle** — quem é o líder, qual a
configuração — e raramente para o plano de dados, onde o volume é alto.

### Os algoritmos

**Paxos.** O original, correto e notoriamente difícil de entender e implementar.

**Raft.** Projetado para ser compreensível, com a mesma garantia. É o que a maior
parte dos sistemas modernos usa.

**Zab.** O do ZooKeeper, similar em espírito.

A diferença entre eles é de compreensibilidade e de detalhe operacional, não de
garantia.

### Onde você já usa consenso

A maior parte dos sistemas usa consenso sem que ninguém o implemente:

Bancos distribuídos, para eleger líder de partição. Sistemas de coordenação, para
manter configuração. Orquestradores de contêiner, para o estado do cluster.
Plataformas de streaming, para metadados de partição.

A decisão prática quase nunca é "implementar consenso". É "usar um sistema que já
o implementa" — e escolher qual.

## Modelo Mental

**Consenso troca disponibilidade e latência por certeza.** Você paga coordenação
para nunca ter duas respostas.

## Quando Usar

- A decisão precisa ser única e definitiva.
- Duas respostas divergentes seriam irrecuperáveis.
- O volume de decisões é baixo — plano de controle, não de dados.
- A indisponibilidade do lado minoritário é aceitável.

## Quando Não Usar

**Para o plano de dados de alto volume.** A latência de coordenação por operação
inviabiliza.

**Quando a operação é comutativa.** Se a ordem não importa, não há o que
coordenar.

**Quando idempotência resolve.** Executar duas vezes sem efeito adicional dispensa
a garantia de execução única.

**Quando disponibilidade sob partição é requisito.** Consenso é CP por
construção.

**Implementando você mesmo.** É a recomendação mais forte deste documento.

## Alternativas

- **Serviço de coordenação pronto** — ZooKeeper, etcd, Consul. Consenso como
  serviço.
- **Banco com transação** — para muitos casos, uma transação num banco único dá a
  garantia necessária sem cluster de consenso.
- **Operações comutativas** — evitar a necessidade. Ver
  [resolução de conflitos](conflict-resolution.md).
- **Idempotência** — permitir execução múltipla em vez de garantir única.
- **Bloqueio com prazo e fencing** — mais fraco e suficiente para coordenação
  pontual. Ver [locks distribuídos](distributed-locks.md).

## Trade-offs

| Com consenso | Sem |
|---|---|
| Decisão única garantida | Divergência possível |
| Segurança sob qualquer falha | Depende de sorte |
| Latência de coordenação por decisão | Latência local |
| Indisponível sem maioria | Disponível |
| Vazão limitada | Escala |
| Complexidade operacional alta | Baixa |

## Modos de Falha

**Perda de quórum.** Falhas suficientes para não haver maioria: o cluster para de
decidir. Um cluster de 3 com 2 nós fora não faz nada.

**Cluster par.** Sem ganho de tolerância e com mais latência.

**Nós de consenso na mesma zona.** A falha de zona derruba a maioria — anula o
propósito.

**Consenso no caminho crítico de dados.** Latência inaceitável descoberta em
produção.

**Implementação própria com defeito sutil.** Funciona nos testes e viola segurança
sob partição específica.

## Erros Comuns

**Implementar do zero.**

**Usar número par de nós.**

**Colocar todos os nós na mesma zona de disponibilidade.**

**Usar consenso onde uma transação de banco bastaria.**

**Adicionar nós esperando mais desempenho.** Mais nós significam maioria maior e
mais latência.

## Exemplo Real

Uma equipe precisava garantir que apenas uma instância executasse uma rotina de
reconciliação financeira. A proposta inicial foi montar um cluster de consenso
próprio, com três nós, implementando Raft.

A estimativa era de dois meses. A revisão mudou o caminho com duas perguntas.

**"A rotina é idempotente?"** Não era, e podia ser. Ela lançava registros de
ajuste; adicionar uma chave por período de reconciliação e verificar antes de
lançar tornava a execução múltipla inofensiva.

**"Se ela executar duas vezes, o que acontece de fato?"** Com idempotência, nada.
Sem ela, lançamentos duplicados.

Com a rotina idempotente, a garantia de execução única deixou de ser necessária.
Restava apenas evitar desperdício de executar duas vezes — o que um bloqueio
simples com prazo no banco resolve, sem cluster nenhum.

A implementação levou três dias.

Dois anos depois, houve uma ocasião em que duas instâncias executaram
simultaneamente por uma falha no bloqueio. O resultado foi trabalho duplicado e
zero inconsistência — exatamente o que a idempotência garante.

O que a equipe aprendeu: consenso teria resolvido o problema, e o problema não
precisava de consenso. A pergunta que economizou dois meses foi "o que acontece se
executar duas vezes?", e ela vem antes de qualquer discussão sobre algoritmo.

## Conceitos Relacionados

- [Eleição de Líder](leader-election.md) — a aplicação mais comum.
- [Locks Distribuídos](distributed-locks.md) — a alternativa mais fraca.
- [CAP](cap.md) — por que consenso é CP.
- [Idempotência](idempotency.md) — o que frequentemente dispensa consenso.

## Exercício Prático

Se seu sistema tem alguma operação que "só pode acontecer uma vez", responda: o
que acontece se ela acontecer duas?

Se a resposta for "nada de grave", você não precisa de consenso — precisa de
idempotência, que é muito mais barata.

## Perguntas de Entrevista

- O que o resultado FLP afirma, e como os algoritmos práticos o contornam?
- Por que clusters de consenso têm número ímpar de nós?
- Por que adicionar nós a um cluster de consenso não aumenta a vazão?

## Para Aprofundar

- Ongaro, Diego; Ousterhout, John. *In Search of an Understandable Consensus
  Algorithm (Raft)*, 2014.
- Fischer, Michael; Lynch, Nancy; Paterson, Michael. *Impossibility of Distributed
  Consensus with One Faulty Process*. JACM, 1985.
- Lamport, Leslie. *Paxos Made Simple*, 2001.
