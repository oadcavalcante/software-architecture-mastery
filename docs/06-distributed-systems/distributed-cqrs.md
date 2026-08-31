---
id: distributed-cqrs
title: CQRS Distribuído
sidebar_position: 39
description: Separar o modelo de escrita do de leitura — e por que a separação sem armazenamentos distintos raramente compensa.
doc_type: pattern
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor distingue os graus de CQRS e aplica apenas o necessário para
  o problema real.
prerequisites: [event-driven-systems]
related: [distributed-event-sourcing, eventual-consistency, replication]
canonical_for: [CQRS distribuído, modelo de leitura, modelo de escrita, projeção]
content_version: 1
last_reviewed: 2026-08-27
---

# CQRS Distribuído

## Visão Geral

CQRS separa o modelo usado para **alterar** dados do modelo usado para **consultar**
dados.

A ideia é simples e o grau de aplicação varia muito — desde separar classes no mesmo
banco até manter armazenamentos completamente diferentes, alimentados
assincronamente.

A confusão entre esses graus é a fonte da maioria das adoções mal calibradas: times
pagam o custo do grau máximo para resolver problemas que o grau mínimo resolveria.

## Problema

Um único modelo serve a dois propósitos com necessidades opostas.

**Escrita** precisa de invariantes, normalização, transação e validação.

**Leitura** precisa de dados prontos, desnormalizados, no formato da tela.

Servir os dois com o mesmo modelo produz consultas com muitas junções, ou
desnormalização que complica a escrita — e as duas cargas competem pelo mesmo
recurso.

## Conceitos Centrais

### Os graus, e a escolha do menor suficiente

**Grau 1 — separação no código.** Comandos e consultas em tipos diferentes, mesmo
banco, mesmas tabelas. Custo quase zero. Resolve legibilidade e permite otimizar
consultas sem carregar o modelo de domínio.

**Grau 2 — modelos separados sobre o mesmo banco.** A leitura usa visões ou
consultas diretas otimizadas; a escrita usa o modelo de domínio. Ainda
transacionalmente consistente.

**Grau 3 — réplica de leitura.** Mesmo esquema, servidor separado. Introduz atraso.
Ver [replicação](/06-distributed-systems/replication.md).

**Grau 4 — armazenamento de leitura distinto.** Um banco diferente, com esquema
próprio, alimentado por eventos. Consistência eventual, projeções a manter,
reconstrução a operar.

A recomendação: **a maioria dos sistemas que "precisa de CQRS" precisa do grau 1 ou
2.** O grau 4 se justifica quando a leitura tem requisito de tecnologia diferente —
busca textual, grafo, análise — ou quando a assimetria de carga é grande o
suficiente para exigir escala independente.

Adotar grau 4 por elegância paga consistência eventual, projeções e operação de
reconstrução para resolver um problema que uma visão resolveria.

### A projeção precisa ser reconstruível

No grau 4, o modelo de leitura é derivado. Isso significa que ele pode ser
descartado e reconstruído — e essa capacidade precisa ser exercitada, não apenas
existir em teoria.

Um defeito na projeção corrompe a leitura. A correção é consertar o código e
reconstruir. Se a reconstrução leva 18 horas e nunca foi testada, ela não é uma
opção durante um incidente.

A prática que funciona: reconstruir periodicamente em ambiente de teste, e conhecer
o tempo.

### A consistência eventual vaza para a interface

No grau 3 ou 4, o usuário que executa uma ação e imediatamente consulta pode não ver
o efeito.

Ver [consistência eventual](/06-distributed-systems/eventual-consistency.md). As mitigações — atualização
otimista, estado explícito, leitura direta do modelo de escrita para o próprio autor
— precisam ser projetadas.

Ignorar isso produz a queixa mais comum de sistemas com CQRS: "salvei e não
aparece".

### Múltiplas projeções são o benefício principal

O ganho que justifica o grau 4 quando ele se justifica: a mesma escrita alimenta
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

**CQRS é uma escala, não um interruptor.** A pergunta certa é qual o menor grau que
resolve o problema real.

## Quando Usar

- A leitura exige tecnologia diferente da escrita — busca, grafo, análise.
- Assimetria de carga grande, com necessidade de escalar separadamente.
- Muitas visões distintas dos mesmos dados.
- O modelo de domínio é complexo e as consultas ficam pesadas por causa dele.
- Já há [event sourcing](/06-distributed-systems/distributed-event-sourcing.md).

## Quando Não Usar

**Em CRUD.** O custo é integral e o benefício, nulo.

**Grau 4 quando grau 1 ou 2 resolve.** O erro de calibração mais comum.

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

| Grau 1–2 | Grau 4 |
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

**Complexidade sem benefício.** Grau 4 sobre CRUD.

## Erros Comuns

**Pular direto para o grau 4.**

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

A proposta inicial foi CQRS grau 4 com projeção em armazenamento de documentos,
alimentada por eventos.

Antes de implementar, a equipe fez uma verificação que mudou a decisão.

**Análise da consulta.** Duas das sete junções eram desnecessárias — resquício de
uma versão anterior da tela. Removidas, o tempo caiu para 1,8 segundo.

**Índice composto.** Sobre os campos de filtro mais usados. Tempo: 320 ms.

**Visão materializada** para o agregado que continuava caro. Tempo final: 90 ms.

Nenhuma dessas é CQRS grau 4. O problema estava resolvido com três dias de
trabalho.

Um ano depois, um requisito novo justificou de fato o grau 4: busca textual sobre o
conteúdo dos contratos, com relevância e destaque de trechos. Nenhum índice
relacional resolve isso.

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
- [Replicação](/06-distributed-systems/replication.md) — o grau intermediário.
- [Sistemas Orientados a Eventos](/06-distributed-systems/event-driven-systems.md) — como a projeção é
  alimentada.

## Exercício Prático

Pegue a consulta mais lenta do seu sistema. Antes de considerar CQRS, verifique:
existe índice adequado? Há junções desnecessárias? Uma visão materializada
resolveria?

Se todas as respostas forem negativas e a consulta continuar lenta, aí a separação
de modelos passa a ser candidata.

## Perguntas de Entrevista

- Quais os graus de CQRS e como escolher entre eles?
- Por que CQRS não exige event sourcing?
- Como detectar que uma projeção divergiu?

## Para Aprofundar

- Young, Greg. *CQRS Documents*, 2010.
- Fowler, Martin. *CQRS*, 2011.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013 —
  capítulo 4.
