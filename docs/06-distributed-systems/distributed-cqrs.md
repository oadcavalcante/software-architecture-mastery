---
id: distributed-cqrs
title: CQRS Distribuído
sidebar_position: 39
description: O nível 3 de CQRS de perto — o que muda quando o modelo de leitura vive em outro sistema, alimentado de forma assíncrona.
doc_type: pattern
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece quando o nível 3 de CQRS se justifica, e o que ele
  custa em operação depois de pronto.
prerequisites: [event-driven-systems, cqrs]
related: [cqrs, distributed-event-sourcing, eventual-consistency, replication]
canonical_for: [CQRS distribuído, modelo de leitura, modelo de escrita, projeção]
content_version: 3
last_reviewed: 2026-08-27
---

# CQRS Distribuído

> Pré-requisito: [CQRS](/03-design-patterns/cqrs.md) estabelece o que é a separação
> e os três níveis em que ela aparece. Aqui o foco é o nível 3 — o que muda quando o
> modelo de leitura vive em **outro sistema**, alimentado de forma assíncrona.

## Visão Geral

Nos níveis 1 e 2 a separação é de código e de modelo, dentro da mesma transação. O
nível 3 rompe isso: a leitura passa a ser um armazenamento próprio, atualizado depois
da escrita, por um processo que pode atrasar, falhar ou ficar para trás.

O que era decisão de desenho vira sistema distribuído. Três coisas passam a existir e
não existiam: uma projeção a reconstruir, uma janela em que os dois lados discordam, e
um atraso a monitorar.

## Problema

O custo do nível 3 não está em construí-lo — está em operá-lo depois.

```text
construir    uma projeção alimentada por eventos: dias
operar       reconstrução testada, atraso monitorado, divergência
             verificada, consistência eventual tratada na interface: para sempre
```

Adoções mal calibradas pagam a segunda linha para resolver um problema que o nível 2,
ou um índice, resolveria.

## Conceitos Centrais

### O que distingue o nível 3 da réplica de leitura

As duas separam a carga de leitura da de escrita, e param de se parecer aí.

```text
                     réplica de leitura      nível 3
esquema              o mesmo                 próprio, no formato da consulta
tecnologia           a mesma                 escolhida pela leitura
alimentação          o próprio banco         processo que você escreve e opera
reconstrução         reprovisionar           reprocessar do zero
o que você opera     nada de novo            projeção, atraso, divergência
```

Réplica de leitura resolve **volume**; o nível 3 resolve **formato e tecnologia**.
Confundir os dois faz um time adotar projeções para um problema que a réplica
resolveria. Ver [replicação](/06-distributed-systems/replication.md).

O nível 3 se justifica quando a leitura tem requisito de tecnologia que o banco de
escrita não atende — busca textual em escala, grafo, análise — ou quando a assimetria
de carga exige escalar os dois lados separadamente.

Adotar o nível 3 por elegância paga consistência eventual, projeções e operação de
reconstrução para resolver um problema que uma visão resolveria.

### A projeção precisa ser reconstruível

No nível 3, o modelo de leitura é derivado. Isso significa que ele pode ser
descartado e reconstruído — e essa capacidade precisa ser exercitada, não apenas
existir em teoria.

Um defeito na projeção corrompe a leitura. A correção é consertar o código e
reconstruir. Se a reconstrução leva 18 horas e nunca foi testada, ela não é uma
opção durante um incidente.

A prática que funciona: reconstruir periodicamente em ambiente de teste, e conhecer
o tempo.

### A consistência eventual vaza para a interface

No nível 3 — e também com réplica de leitura —, o usuário que executa uma ação e imediatamente consulta pode não ver
o efeito.

Ver [consistência eventual](/06-distributed-systems/eventual-consistency.md). As mitigações — atualização
otimista, estado explícito, leitura direta do modelo de escrita para o próprio autor
— precisam ser projetadas.

Ignorar isso produz a queixa mais comum de sistemas com CQRS: "salvei e não
aparece".

### Múltiplas projeções são o benefício principal

O ganho que justifica o nível 3 quando ele se justifica: a mesma escrita alimenta
projeções diferentes, cada uma no armazenamento adequado.

```text
escrita  →  banco relacional (busca por identificador)
         →  índice de busca textual
         →  agregados para relatório
         →  cache de leitura por tela
```

Nenhum modelo único serve bem a todos esses. Essa é a razão real de adoção.

### CQRS não exige event sourcing

Eles aparecem juntos com frequência e são independentes.

CQRS pode ser alimentado por captura de mudanças do banco, por eventos de
integração, ou por processo em lote — sem
[event sourcing](/06-distributed-systems/distributed-event-sourcing.md).

Event sourcing praticamente exige CQRS. A recíproca não vale, e tratá-los como um
pacote leva times a adotar dois padrões caros quando precisavam de um barato.

## Modelo Mental

**CQRS é uma escala, não um interruptor.** A pergunta certa é qual o menor nível
que resolve o problema real.

## Quando Usar

- A leitura exige tecnologia diferente da escrita — busca, grafo, análise.
- Assimetria de carga grande, com necessidade de escalar separadamente.
- Muitas visões distintas dos mesmos dados.
- O modelo de domínio é complexo e as consultas ficam pesadas por causa dele.
- Já há [event sourcing](/06-distributed-systems/distributed-event-sourcing.md).

## Quando Não Usar

**Em CRUD.** O custo é integral e o benefício, nulo.

**Nível 3 quando nível 1 ou 2 resolve.** O erro de calibração mais comum.

**Quando a consistência forte entre escrita e leitura é requisito.**

**Sem procedimento de reconstrução testado.**

**Sem tratamento da consistência eventual na interface.**

**Por acompanhar event sourcing automaticamente.**

**Sem monitoramento de atraso da projeção.** Ver
[backpressure](/06-distributed-systems/backpressure.md).

## Alternativas

- **Visão materializada do banco** — muito do benefício de leitura, mantida pelo
  banco, sem projeção a operar.
- **Réplica de leitura** — separação de carga sem esquema diferente.
- **Cache** — quando o problema é volume de leitura repetida.
- **Índice** — frequentemente a consulta lenta precisa de índice, não de
  arquitetura.

A última é a verificação a fazer antes de qualquer coisa: consultas lentas
motivaram muitas adoções de CQRS que um índice teria resolvido.

## Trade-offs

| Nível 1–2 | Nível 3 |
|---|---|
| Consistência transacional | Eventual |
| Um armazenamento | Dois ou mais |
| Sem projeção | Projeções a manter e reconstruir |
| Custo operacional zero | Significativo |
| Escala acoplada | Independente |
| Um modelo de dados | Cada leitura no formato ideal |
| Tecnologia única | Tecnologia por necessidade |

## Modos de Falha

**Projeção atrasada.** A leitura fica cada vez mais velha.

**Projeção corrompida.** Um defeito grava dados errados e persistem até
reconstrução.

**Reconstrução inviável.** Leva horas e nunca foi testada.

**Divergência silenciosa.** A projeção perde eventos e ninguém compara.

**Interface mostrando dado velho como atual.**

**Complexidade sem benefício.** Nível 3 sobre CRUD.

## Erros Comuns

**Pular direto para o nível 3.**

**Adotar junto com event sourcing sem avaliar separadamente.**

**Não testar reconstrução.**

**Não monitorar o atraso da projeção.**

**Não verificar divergência entre escrita e leitura.** Uma comparação periódica de
contagens detecta perda silenciosa.

**Não tratar a consistência eventual na interface.**

## Exemplo Real

Um sistema de gestão de contratos tinha consultas lentas na tela principal: uma
listagem com filtros que fazia junções sobre sete tabelas, com 4 segundos de tempo
de resposta.

A proposta inicial foi CQRS de nível 3 com projeção em armazenamento de documentos,
alimentada por eventos.

Antes de implementar, a equipe fez uma verificação que mudou a decisão.

**Análise da consulta.** Duas das sete junções eram desnecessárias — resquício de
uma versão anterior da tela. Removidas, o tempo caiu para 1,8 segundo.

**Índice composto.** Sobre os campos de filtro mais usados. Tempo: 320 ms.

**Visão materializada** para o agregado que continuava caro. Tempo final: 90 ms.

Nenhuma dessas é CQRS de nível 3. O problema estava resolvido com três dias de
trabalho.

Um ano depois, um requisito novo justificou de fato o nível 3: busca textual sobre o
conteúdo dos contratos, com tolerância a erro de digitação, agregação por faceta e
relevância ajustada por sinais de negócio — e com volume de busca alto o bastante
para competir com a carga transacional. A busca textual do banco foi medida antes e
não sustentou os dois últimos. Ver [busca](/05-system-design/search.md).

A implementação foi limitada ao necessário: uma projeção para o índice de busca,
alimentada por eventos, com o restante das consultas continuando no banco
relacional.

Os problemas operacionais que apareceram nessa projeção:

**Divergência.** Após uma implantação com defeito, a projeção perdeu 12 horas de
atualizações. Não havia comparação de contagem, e a descoberta veio de um usuário
relatando contrato que não aparecia na busca.

**Reconstrução.** Levava 6 horas para o histórico completo. Foi reduzida para 40
minutos com paralelização, depois que a necessidade apareceu num incidente.

O ponto que a equipe sublinha: o CQRS que valeu a pena foi o de escopo mínimo, adotado
quando havia razão técnica clara. O CQRS que quase adotaram um ano antes teria
custado meses para resolver um problema de índice.

## Conceitos Relacionados

- [Event Sourcing Distribuído](/06-distributed-systems/distributed-event-sourcing.md) — independente.
- [Consistência Eventual](/06-distributed-systems/eventual-consistency.md) — a consequência.
- [CQRS](/03-design-patterns/cqrs.md) — os três níveis e a escolha entre eles.
- [Replicação](/06-distributed-systems/replication.md) — resolve volume, não formato.
- [Sistemas Orientados a Eventos](/06-distributed-systems/event-driven-systems.md) — como a projeção é
  alimentada.

## Exercício Prático

Pegue a consulta mais lenta do seu sistema. Antes de considerar CQRS, verifique:
existe índice adequado? Há junções desnecessárias? Uma visão materializada
resolveria?

Se todas as respostas forem negativas e a consulta continuar lenta, aí a separação
de modelos passa a ser candidata.

## Perguntas de Entrevista

- Por que réplica de leitura não é um nível de CQRS?
- Por que CQRS não exige event sourcing?
- Como detectar que uma projeção divergiu?

## Para Aprofundar

- Young, Greg. *CQRS Documents*, 2010.
- Fowler, Martin. *CQRS*, 2011.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013 —
  capítulo 4.
