---
id: poison-messages
title: Poison Messages
sidebar_position: 28
description: A mensagem que nunca processa — e trava a fila enquanto tenta.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue falha transitória de permanente no consumo e
  impede que uma mensagem ruim bloqueie o processamento.
prerequisites: [messaging]
related: [dead-letter-queues, retries, duplicate-messages]
canonical_for: [poison message, mensagem envenenada]
content_version: 1
last_reviewed: 2026-08-27
---

# Poison Messages

## Visão Geral

Uma *poison message* é uma mensagem que falha em toda tentativa de processamento.

Sem tratamento, ela volta para a fila indefinidamente, consome o consumidor, e —
em filas com ordem — **bloqueia todas as mensagens seguintes**.

É o modo de falha mais comum de sistemas de mensageria recém-adotados, e o mais
fácil de prevenir.

## Problema

O consumidor lê a mensagem, tenta processar, lança exceção. Não confirma. A
mensagem volta a ficar visível. Outro consumidor a lê. Mesma exceção.

Enquanto isso, nada mais é processado — ou porque a mensagem ocupa o consumidor em
laço, ou porque a fila preserva ordem e ela é a próxima.

O sistema não emite erro visível. Do lado de fora, ele parece funcionar: o
consumidor está de pé, o broker está de pé, a fila apenas **para de avançar**.

Isso é descoberto horas depois, tipicamente por alguém perguntando por que um
pedido não foi processado.

## Conceitos Centrais

### As causas

**Dado malformado.** Um campo com formato inesperado, caractere inválido,
codificação errada.

**Mudança de esquema.** O produtor passou a enviar um formato que o consumidor não
entende. Ver
[evolução de schema](/08-integration-architecture/index.md).

**Defeito no consumidor.** Um caso não previsto que sempre lança.

**Precondição permanentemente ausente.** A mensagem referencia uma entidade que
não existe e nunca existirá.

Note que a última é ambígua: pode ser desordem — a entidade ainda vai chegar — ou
permanente. Distinguir exige contexto que o consumidor nem sempre tem.

### Transitória versus permanente

A decisão central do consumidor a cada falha: **isto vai funcionar se eu tentar de
novo?**

| Falha | Natureza |
|---|---|
| Banco indisponível, timeout de rede | Transitória — repita |
| Serviço externo com erro 503 | Transitória |
| Erro de desserialização | Permanente — não repita |
| Validação de negócio rejeitou | Permanente |
| Entidade referenciada não existe | Ambígua |

Repetir uma falha permanente é desperdício garantido. Tratar uma transitória como
permanente descarta trabalho que teria sucesso.

O consumidor precisa classificar — e o padrão de "tente três vezes e mande para
dead-letter" trata todas igual, o que é aceitável como rede de segurança e ruim
como estratégia única.

### Limite de tentativas é obrigatório

Toda mensagem precisa de um contador. Após N tentativas, ela sai da fila principal
para uma [dead-letter queue](/06-distributed-systems/dead-letter-queues.md).

Sem limite, o laço é infinito. Com limite mas sem dead-letter, a mensagem é
descartada silenciosamente — o que troca um problema visível por um invisível.

### Falha no envenenamento pode não estar na mensagem

Caso traiçoeiro: a mensagem está correta e o consumidor tem um defeito que só
aparece com aquele conteúdo.

Nesse caso, mandar para dead-letter é o comportamento certo, e a análise precisa
olhar o consumidor, não a mensagem. Um lote de mensagens envenenadas com o mesmo
padrão é sinal disso.

### Isolamento do bloqueio

Em filas sem ordem garantida, uma mensagem envenenada ocupa um consumidor mas não
impede os outros de avançarem. O impacto é de capacidade.

Em filas com ordem por partição, ela **bloqueia a partição inteira**. Todas as
mensagens da mesma chave param.

Isso muda a urgência: num sistema com ordem, uma mensagem envenenada é incidente,
não degradação.

## Modelo Mental

**Toda mensagem precisa de um caminho de saída da fila** — por sucesso ou por
desistência. Sem o segundo, ela fica para sempre.

## Quando Usar

O tratamento é obrigatório em qualquer consumidor. As decisões que restam:

- Quantas tentativas antes de desistir.
- Se classificar falhas por natureza ou tratar todas igual.
- Para onde a mensagem vai ao desistir.

## Quando Não Usar

**Repetir indefinidamente.** Nunca é a resposta.

**Descartar sem registrar.** Perde a informação e esconde o problema.

**Tratar toda falha como permanente.** Descarta trabalho que teria sucesso na
segunda tentativa.

**Tratar toda falha como transitória.** Repete erro de desserialização três vezes,
sem chance de sucesso.

**Sem alerta.** Uma dead-letter queue que ninguém monitora é um cemitério.

## Alternativas

- **[Dead-letter queue](/06-distributed-systems/dead-letter-queues.md)** — a resposta padrão.
- **Fila de reprocessamento com atraso** — para falhas ambíguas, tentar de novo
  daqui a horas em vez de descartar.
- **Validação no produtor** — impedir que a mensagem malformada entre. É a
  prevenção, e não elimina a necessidade do tratamento.
- **Registro de esquema** — garantir compatibilidade entre produtor e consumidor.

## Trade-offs

| Poucas tentativas | Muitas |
|---|---|
| Sai rápido da fila | Ocupa por mais tempo |
| Falha transitória longa vira dead-letter | Mais chance de sucesso |
| Menos consumo de recurso | Mais |

| Classificar a falha | Tratar todas igual |
|---|---|
| Sem retentativa inútil | Simples |
| Exige mapear os erros | Nada a manter |
| Sai mais rápido no caso permanente | Sempre N tentativas |

## Modos de Falha

**Laço infinito.** Sem limite de tentativas.

**Partição bloqueada.** Em fila com ordem, tudo da mesma chave para.

**Descarte silencioso.** Sem dead-letter nem registro.

**Dead-letter não monitorada.** As mensagens vão para lá e ninguém olha.

**Retentativa de erro de desserialização.** Três tentativas garantidamente
inúteis.

**Envenenamento em massa.** Uma mudança de esquema envenena todas as mensagens de
uma vez, e a dead-letter recebe milhares.

## Erros Comuns

**Não configurar limite de tentativas.**

**Não distinguir transitório de permanente.**

**Não alertar sobre a dead-letter.**

**Não registrar o conteúdo e o erro.** Sem isso, diagnosticar exige reproduzir.

**Não testar o caminho de falha.** É o caminho que só acontece quando algo está
errado.

## Exemplo Real

Um consumidor de eventos de pedido processava a integração fiscal.

Um pedido com um caractere de controle no campo de observação fazia a
serialização do payload fiscal lançar exceção.

A fila tinha ordem por partição, particionada por filial. A mensagem envenenada
bloqueou a partição daquela filial.

Nove horas de emissões paradas. Foram descobertas quando a filial ligou
perguntando por que nenhuma nota estava saindo.

O consumidor estava de pé. O broker estava de pé. Não havia erro em nenhum painel —
apenas uma partição que não avançava, e não havia métrica de idade da mensagem
mais antiga por partição.

Quatro correções.

**Dead-letter após três tentativas**, com o conteúdo original e o erro registrados.

**Classificação de falha:** erro de serialização e de validação vão direto para
dead-letter, sem retentativa. Falha de rede e de banco tentam três vezes.

**Alerta duplo:** qualquer mensagem na dead-letter dispara aviso, e a idade da
mensagem mais antiga por partição acima de 15 minutos dispara alerta.

**Sanitização no produtor.** Caracteres de controle passaram a ser removidos na
origem — a prevenção, que não substitui o tratamento.

Nos dois anos seguintes, a dead-letter recebeu 34 mensagens. Todas foram
analisadas em minutos, e nenhuma bloqueou nada.

A avaliação posterior aponta: as quatro correções custaram um dia de trabalho, e todas
estavam na documentação do serviço de fila. O incidente de nove horas foi
inteiramente evitável com configuração padrão de boa prática.

## Conceitos Relacionados

- [Dead-Letter Queues](/06-distributed-systems/dead-letter-queues.md) — para onde a mensagem vai.
- [Retries](/06-distributed-systems/retries.md) — a classificação de falha.
- [Mensageria](/06-distributed-systems/messaging.md) — o canal.
- [Ordenação](/06-distributed-systems/ordering.md) — por que o bloqueio é pior com ordem.

## Exercício Prático

Para cada consumidor do seu sistema, verifique: existe limite de tentativas?
Existe dead-letter? Existe alerta sobre ela?

Depois publique deliberadamente uma mensagem malformada em ambiente de teste e
observe. Se a fila travar, você reproduziu o incidente antes dele acontecer.

## Perguntas de Entrevista

- O que acontece com uma mensagem que sempre falha, sem tratamento?
- Como distinguir falha transitória de permanente no consumo?
- Por que o bloqueio é mais grave em fila com ordem?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003 — o padrão
  *Dead Letter Channel*.
- Nygard, Michael. *Release It!* 2ª ed., 2018.
