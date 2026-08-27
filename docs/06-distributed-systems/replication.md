---
id: replication
title: Replicação
sidebar_position: 13
description: Manter cópias do mesmo dado — para disponibilidade, para escala de leitura, e ao custo de divergência.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe topologia e modo de confirmação de replicação a
  partir do que o negócio aceita perder e esperar.
prerequisites: [consistency]
related: [partitioning, leader-election, conflict-resolution]
canonical_for: [replicação, réplica, atraso de replicação]
content_version: 1
last_reviewed: 2026-08-27
---

# Replicação

## Visão Geral

Replicação é manter cópias do mesmo dado em nós diferentes.

Ela existe por três razões distintas — **disponibilidade**, **escala de leitura** e
**proximidade geográfica** — e cada uma admite configurações diferentes.

O custo é único e inevitável: as cópias divergem, e alguém precisa decidir o que
fazer com isso.

## Problema

Com uma cópia, uma falha de nó é perda de dado e de serviço.

Com cópias, a falha é tolerável — e surge a pergunta que organiza todo o assunto:
**quando uma escrita é considerada feita?**

Se for quando chega ao nó primário, a resposta é rápida e uma falha imediata perde
a escrita.

Se for quando chega a todas as réplicas, nada se perde e a escrita paga a latência
da mais lenta — e falha se qualquer uma estiver fora.

Entre os dois extremos há um espectro, e a posição nele é uma decisão de negócio
disfarçada de configuração.

## Conceitos Centrais

### As topologias

**Líder único.** Um nó aceita escritas e as propaga. Simples, sem conflito de
escrita, e o líder é gargalo de escrita e ponto de falha — mitigado por
[eleição de líder](leader-election.md).

**Múltiplos líderes.** Vários nós aceitam escritas, tipicamente um por região.
Escrita local e rápida, e **conflitos são inevitáveis** — a mesma linha alterada
em dois lugares. Ver [resolução de conflitos](conflict-resolution.md).

**Sem líder.** Qualquer nó aceita escrita e leitura; a consistência vem de exigir
quóruns. Alta disponibilidade, e a aplicação lida com versões concorrentes.

A grande maioria dos sistemas usa líder único, e faz bem: as outras duas
topologias existem para requisitos específicos e custam conflito.

### Síncrono, assíncrono e semi-síncrono

O modo de confirmação decide o que se perde numa falha:

| Modo | Confirma quando | Perde em falha | Latência |
|---|---|---|---|
| Assíncrono | O líder gravou | Escritas ainda não propagadas | Mínima |
| Semi-síncrono | Ao menos uma réplica confirmou | Só se líder e essa réplica caírem juntos | Uma ida e volta |
| Síncrono total | Todas confirmaram | Nada | A da réplica mais lenta |

Síncrono total é raro na prática: uma réplica lenta ou fora torna toda escrita
lenta ou impossível.

**Semi-síncrono é o meio-termo usado pela maioria dos sistemas sérios** — e a
configuração por quórum é a forma moderna dele.

### Quórum

A generalização: com N réplicas, exigir W confirmações na escrita e R na leitura.

Se `W + R > N`, leitura e escrita se sobrepõem em ao menos uma réplica, e a
leitura observa a escrita mais recente.

```text
N = 3, W = 2, R = 2  →  2 + 2 > 3  ✓ consistente
N = 3, W = 1, R = 1  →  1 + 1 < 3  ✗ pode ler dado velho
```

O ajuste de W e R move o sistema no espectro entre latência e consistência — que é
exatamente o "else" de [PACELC](pacelc.md).

### Atraso de replicação é a métrica que falta

O atraso entre a escrita no líder e sua aparição na réplica é a métrica mais
importante da replicação, e a menos monitorada.

Ele não é constante: cresce sob carga de escrita, durante manutenção, e quando a
réplica está fazendo outra coisa. Um atraso de milissegundos no caso normal pode
virar minutos no pico.

Sem monitoramento, ninguém sabe quão velho o dado de uma réplica pode estar — e a
decisão de ler dela foi tomada assumindo um atraso que ninguém verificou.

### Failover não é gratuito

Promover uma réplica a líder envolve decidir **quem promover**, garantir que o
líder antigo pare de aceitar escritas, e lidar com escritas que ele aceitou e não
propagou.

O terceiro ponto é onde os dados se perdem, e o segundo é onde o
[cérebro dividido](network-failure.md) nasce.

## Modelo Mental

**Quanto o negócio aceita perder, e quanto aceita esperar?** As duas respostas
determinam o modo de confirmação.

## Quando Usar

- Disponibilidade exige tolerar falha de nó.
- A carga de leitura excede a capacidade de um nó.
- Usuários geograficamente distribuídos precisam de leitura local.
- Há requisito de recuperação de desastre em outra região.

## Quando Não Usar

**Replicação assíncrona quando perda é inaceitável.** Sistema financeiro com
confirmação assíncrona perde transações confirmadas ao cliente.

**Múltiplos líderes sem estratégia de conflito.** Os conflitos vão acontecer, e a
resolução padrão — último a escrever vence — descarta dados silenciosamente.

**Ler de réplica em operação que não tolera atraso.** Ver
[consistência](consistency.md).

**Replicação como substituto de backup.** Ela propaga o erro: um `DELETE` acidental
é replicado em milissegundos. Backup protege contra erro humano; replicação, não.

**Sem monitorar o atraso.** É operar às cegas.

## Alternativas

- **Backup e restauração** — para durabilidade, não para disponibilidade.
- **[Particionamento](partitioning.md)** — para escala de escrita, que replicação
  não resolve.
- **Cache** — para escala de leitura, mais barato que réplica em alguns casos.
- **Nó único com recuperação rápida** — legítimo quando o RTO permite.

## Trade-offs

| Mais réplicas | Menos |
|---|---|
| Mais tolerância a falha | Menos |
| Mais capacidade de leitura | Limitada |
| Escrita mais lenta com quórum maior | Mais rápida |
| Mais divergência a gerenciar | Menos |
| Custo de infraestrutura | Menor |

| Síncrono | Assíncrono |
|---|---|
| Nada se perde | Janela de perda |
| Latência da réplica mais lenta | Latência local |
| Réplica fora bloqueia escrita | Não bloqueia |

## Modos de Falha

**Perda no failover.** Escritas confirmadas pelo líder e não propagadas.

**Cérebro dividido.** Dois líderes após partição.

**Atraso crescente.** A réplica não acompanha e fica cada vez mais atrás.

**Conflito silencioso.** Com múltiplos líderes, a resolução padrão descarta uma das
escritas sem avisar.

**Réplica usada como backup.** O erro humano é replicado.

**Leitura de réplica em operação crítica.** Decisão tomada sobre dado velho.

## Erros Comuns

**Não monitorar o atraso de replicação.**

**Confundir replicação com backup.**

**Adotar múltiplos líderes sem entender conflito.**

**Não testar o failover.** Um mecanismo de failover nunca exercitado falha quando
é necessário.

**Configurar quórum sem verificar `W + R > N`.**

## Exemplo Real

Um sistema de pedidos usava replicação assíncrona com uma réplica, para failover.

O failover nunca tinha sido testado em produção.

Numa falha de hardware do primário, a promoção da réplica levou 4 minutos —
manual, porque o processo automatizado não existia.

Ao voltar, descobriu-se que 1 800 pedidos confirmados ao cliente não estavam na
réplica. Eles haviam sido gravados no primário e não propagados antes da falha.

O atraso de replicação, que ninguém monitorava, estava em 90 segundos no momento
da falha — porque um processo de relatório rodava naquele horário e consumia a
réplica.

Três correções, em ordem de efeito.

**Confirmação semi-síncrona.** A escrita passou a exigir confirmação de ao menos
uma réplica antes de responder ao cliente. Custo medido: 6 ms adicionais por
escrita. O negócio aceitou imediatamente quando o custo foi apresentado ao lado da
alternativa.

**Uma segunda réplica.** Com duas, a exigência de uma confirmação não deixa a
escrita refém de uma réplica em manutenção.

**Monitoramento e alerta de atraso** acima de 5 segundos. O relatório noturno foi
movido para uma réplica dedicada.

E o failover passou a ser exercitado trimestralmente, em produção, em janela
combinada. Na primeira execução, três problemas de configuração apareceram — todos
que teriam causado incidente numa falha real.

## Conceitos Relacionados

- [Particionamento](partitioning.md) — a outra forma de distribuir dados.
- [Eleição de Líder](leader-election.md) — como o failover escolhe.
- [Resolução de Conflitos](conflict-resolution.md) — com múltiplos líderes.
- [Consistência](consistency.md) — o que a leitura observa.

## Exercício Prático

Descubra três coisas sobre a replicação do seu sistema: o modo de confirmação, o
atraso atual, e quando o failover foi testado pela última vez.

Se a resposta da terceira for "nunca", o mecanismo de recuperação é uma hipótese.

## Perguntas de Entrevista

- Quais são as topologias de replicação e o que cada uma custa?
- O que a condição `W + R > N` garante?
- Por que replicação não substitui backup?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 5.
- Documentação de replicação do PostgreSQL sobre modos síncronos.
