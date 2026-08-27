---
id: dead-letter-queues
title: Dead-Letter Queues
sidebar_position: 29
description: Onde vão as mensagens que não puderam ser processadas — e por que ela precisa de dono.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor configura dead-letter com contexto suficiente para
  diagnóstico e define o processo de tratamento.
prerequisites: [poison-messages]
related: [poison-messages, retries, observability]
canonical_for: [dead-letter queue, DLQ]
content_version: 1
last_reviewed: 2026-08-27
---

# Dead-Letter Queues

## Visão Geral

Uma dead-letter queue recebe as mensagens que não puderam ser processadas após as
tentativas configuradas.

Ela existe para dar à mensagem envenenada **um caminho de saída** da fila
principal, sem descartá-la.

E ela só cumpre a função se alguém olhar. Uma dead-letter sem alerta e sem dono é
um cemitério que dá a impressão de tratamento.

## Problema

Sem dead-letter, uma mensagem que sempre falha tem dois destinos ruins: repetir
indefinidamente — bloqueando — ou ser descartada — perdendo.

A dead-letter dá o terceiro: sair da fila e ficar guardada para análise.

O problema que ela cria é organizacional: **mensagens acumulam lá e ninguém
percebe**. Isso é comum e é pior do que parece, porque cada mensagem representa
uma operação de negócio que não aconteceu — um pedido não faturado, uma cobrança
não emitida, uma notificação não enviada.

## Conceitos Centrais

### O que precisa ir junto com a mensagem

Uma mensagem sozinha na dead-letter é difícil de diagnosticar. O contexto
necessário:

**O conteúdo original**, sem alteração.

**O erro** — exceção, mensagem, rastro de pilha.

**Quantas tentativas** e quando.

**De qual fila e qual consumidor** veio.

**O identificador de correlação**, para ligar aos registros da operação original.

Sem os três últimos, a análise começa por reconstruir o que aconteceu — que é o
trabalho que o contexto existe para evitar.

Vários brokers adicionam parte disso automaticamente em atributos da mensagem;
vale verificar o que o seu adiciona e complementar o que falta.

### Ela precisa de alerta e de dono

**Alerta.** Qualquer mensagem na dead-letter deveria notificar. Em sistemas de
volume alto, um limiar; em sistemas de negócio, a primeira mensagem já merece
atenção.

**Dono.** Alguém responde por analisá-las. Sem isso, o alerta vira ruído
ignorado.

A pergunta que revela se o processo existe: *quantas mensagens estão na
dead-letter agora, e há quanto tempo?* Se ninguém sabe responder, o mecanismo está
configurado e não está funcionando.

### Reprocessar exige idempotência

Depois de corrigir a causa, as mensagens da dead-letter são reenviadas para a fila
principal.

Isso é reprocessamento — e algumas delas podem ter sido **parcialmente
processadas** antes de falhar. Se o consumidor gravou algo e falhou depois,
reprocessar duplica.

Ver [idempotência](idempotency.md) e
[mensagens duplicadas](duplicate-messages.md). Reprocessar sem elas troca um
problema por outro.

### Uma dead-letter por fila, não uma global

Uma dead-letter compartilhada entre vários consumidores dificulta o
reprocessamento: é preciso saber para qual fila cada mensagem volta.

Uma por fila mantém a associação óbvia e permite políticas diferentes por
consumidor.

### Ela não é armazenamento de longo prazo

Mensagens ficam ali para serem analisadas e resolvidas, não guardadas. Um prazo de
retenção evita acúmulo indefinido — e força o processo a existir, porque a
mensagem some se ninguém agir.

O prazo precisa ser generoso o bastante para cobrir fim de semana e feriado.

### Depois de analisar, há três destinos

Mensagem em dead-letter não é o fim do processo — é o começo de uma decisão que
precisa ser tomada por alguém:

**Descartar.** A mensagem é inválida e não há o que fazer. Registre o descarte;
uma dead-letter esvaziada sem registro apaga a evidência do problema.

**Corrigir a mensagem e reprocessar.** Um campo malformado na origem. Exige
ferramenta de edição e trilha de auditoria de quem alterou o quê.

**Corrigir o código e reprocessar.** O caso mais comum. A mensagem estava certa e
o consumidor tinha defeito.

O terceiro caso é o que justifica guardar a mensagem original intacta: depois da
correção, o reprocessamento precisa dos dados como eles chegaram, não como o
consumidor defeituoso os interpretou.

Sem esses três caminhos definidos e com dono, a dead-letter vira depósito.

## Modelo Mental

**A dead-letter é uma caixa de entrada, não um arquivo.** Se ela nunca é esvaziada,
o processo não existe.

## Quando Usar

- Todo consumidor de mensagem.
- Especialmente onde a mensagem representa operação de negócio.
- Onde a fila tem ordem — o bloqueio é mais grave.

## Quando Não Usar

**Sem alerta.** Configurar a dead-letter e não monitorar dá falsa sensação de
tratamento.

**Como destino permanente.** Mensagens precisam ser resolvidas.

**Compartilhada entre consumidores diferentes.** Dificulta o reprocessamento.

**Sem retenção.** Acumula indefinidamente.

**Para falhas transitórias.** Uma indisponibilidade de banco não deveria mandar
mensagens para dead-letter — deveria haver retentativa com
[backoff](backoff.md). Se a dead-letter enche durante uma queda de dependência, a
classificação de falha está errada.

## Alternativas

- **Fila de reprocessamento com atraso** — para falhas ambíguas, tentar de novo em
  horas em vez de desistir.
- **Descarte com registro** — quando a mensagem é genuinamente descartável e o
  volume torna a análise inviável. Precisa ser decisão explícita.
- **Tabela de pendências** — em vez de fila, gravar num banco com interface de
  análise. Melhor quando o tratamento envolve decisão humana.

A última é subestimada: para mensagens que exigem decisão de negócio, uma tela é
melhor que uma fila.

## Trade-offs

| Com dead-letter | Sem |
|---|---|
| Fila não bloqueia | Bloqueia ou perde |
| Mensagem preservada para análise | Perdida |
| Mais uma fila a operar e monitorar | Menos peças |
| Exige processo de tratamento | Nada a fazer |

## Modos de Falha

**Acúmulo silencioso.** Sem alerta, ninguém percebe.

**Sem contexto.** A mensagem está lá e ninguém sabe por que falhou.

**Reprocessamento duplicando.** Sem idempotência.

**Enchendo por falha transitória.** Classificação errada manda mensagens que
teriam sucesso.

**Retenção expirando antes da análise.** A mensagem some antes de alguém olhar.

**Dead-letter da dead-letter.** O reprocessamento falha de novo e volta — sem
limite, é um laço mais lento.

## Erros Comuns

**Configurar e não alertar.**

**Não incluir o erro junto com a mensagem.**

**Não definir dono.**

**Reprocessar sem idempotência.**

**Não medir há quanto tempo as mensagens estão lá.**

## Exemplo Real

Um sistema de assinaturas tinha dead-letter configurada em todas as sete filas —
boa prática seguida corretamente.

Nenhuma tinha alerta.

Durante uma migração de esquema, o produtor passou a enviar um campo com tipo
diferente. O consumidor de renovação de assinatura falhava na desserialização e
mandava para dead-letter.

Isso durou 23 dias.

4 100 renovações não processadas. Assinaturas venceram sem cobrança, acessos foram
suspensos, e clientes ligaram — o que finalmente levou alguém a investigar.

A descoberta veio de olhar a dead-letter e encontrar 4 100 mensagens, a mais antiga
de três semanas.

O reprocessamento teve o próprio problema: algumas renovações **tinham sido
parcialmente processadas** — a cobrança foi feita e a atualização da assinatura
falhou. Reprocessar cobrou de novo 180 clientes.

As correções, em ordem de importância:

**Alerta na primeira mensagem.** Em sistema de negócio, uma mensagem na
dead-letter é anomalia, não estatística.

**Métrica de idade.** Painel com quantidade e idade da mensagem mais antiga por
fila.

**Idempotência no consumidor de renovação**, com chave por assinatura e período —
o que teria evitado a cobrança dupla no reprocessamento.

**Registro de esquema** entre produtor e consumidor, impedindo que uma mudança
incompatível seja publicada.

O que a equipe registrou: a dead-letter fez exatamente o que devia — impediu o
bloqueio da fila e preservou as mensagens. O que faltou foi a metade
organizacional do mecanismo.

## Conceitos Relacionados

- [Poison Messages](poison-messages.md) — o que vai para lá.
- [Idempotência](idempotency.md) — necessária para reprocessar.
- [Retries](retries.md) — a classificação que decide o que vai.
- [Observabilidade](../13-observability/index.md) — alerta e métrica.

## Exercício Prático

Descubra, agora, quantas mensagens estão nas dead-letter queues do seu sistema e há
quanto tempo.

Se você não consegue responder em um minuto, o mecanismo está configurado e não
está sendo usado.

## Perguntas de Entrevista

- O que precisa acompanhar a mensagem na dead-letter?
- Por que reprocessar exige idempotência?
- Por que falhas transitórias não deveriam chegar à dead-letter?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — alertas
  acionáveis.
