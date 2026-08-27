---
id: background-processing
title: Processamento em Background
sidebar_position: 12
description: Trabalho que acontece fora da requisição — e como o usuário sabe que terminou.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor move trabalho para fora da requisição sem perder
  rastreabilidade nem visibilidade do resultado para o usuário.
prerequisites: [queues]
related: [queues, request-response, observability]
canonical_for: [processamento em background, trabalho assíncrono, agendamento]
content_version: 1
last_reviewed: 2026-08-26
---

# Processamento em Background

## Visão Geral

Processamento em background é trabalho executado fora do ciclo de requisição:
gerar um relatório, processar um arquivo, enviar mil e-mails, reconciliar dados.

Mover trabalho para fora da requisição é a parte fácil. A parte que decide se a
solução funciona é **como o usuário e o operador sabem o que aconteceu**.

## Problema

Uma requisição HTTP tem limite prático de alguns segundos: proxies expiram,
conexões caem, usuários desistem, e a conexão consome recurso o tempo todo.

Trabalho longo dentro da requisição produz três falhas conhecidas: timeout no
meio, sem saber se completou; conexões esgotadas por espera; e nenhuma forma de
retomar o que parou.

Mover para background resolve os três — e cria um problema novo: o trabalho agora
acontece num lugar que ninguém está olhando.

## Conceitos Centrais

### O contrato com o usuário muda

Síncrono, a resposta é o resultado. Assíncrono, a resposta é **um aceite**.

O padrão que funciona:

```text
POST /relatorios          → 202 Accepted
                            { id: "abc", status: "processando" }

GET  /relatorios/abc      → { status: "processando", progresso: 40 }
                          → { status: "concluido", url: "..." }
                          → { status: "falhou", erro: "..." }
```

Três elementos são obrigatórios: um identificador, um estado consultável, e uma
representação de falha. Sem o terceiro, um trabalho que falha simplesmente nunca
termina do ponto de vista do usuário.

### Notificar em vez de consultar

Consulta repetida funciona e desperdiça. Alternativas, conforme o caso:

**Webhook** — o sistema avisa quando termina. Exige que o consumidor tenha um
endpoint.

**Conexão persistente** — WebSocket ou eventos do servidor. Bom para interface,
e cria estado de conexão. Ver
[sem estado vs. com estado](stateless-vs-stateful.md).

**Notificação assíncrona** — e-mail ou mensagem. Adequado para trabalho longo,
de minutos ou horas.

**Consulta com intervalo crescente** — o mais simples e frequentemente suficiente.

### Os três disparadores

**Por evento.** Algo aconteceu e dispara o trabalho. É o caso mais comum e o mais
alinhado com [filas](queues.md).

**Agendado.** Executa em horários definidos. O erro clássico aqui é implementar o
agendamento em memória do serviço — com várias instâncias, cada uma dispara.

**Contínuo.** Um consumidor que fica lendo uma fila.

Para agendamento, a regra: **o agendador precisa ser externo ao serviço**, ou
precisa haver coordenação por bloqueio distribuído. Um laço `setInterval` dentro
de um serviço com quatro instâncias executa quatro vezes.

### Idempotência e retomada

Todo trabalho em background pode ser executado duas vezes — por retentativa, por
duplicação na fila, por reinício no meio.

Para trabalho longo, retomada importa: processar 100 mil registros e falhar no
80 mil não deveria recomeçar do zero. Marcar progresso permite retomar — e exige
que o trabalho seja divisível.

### Observabilidade é obrigatória

O trabalho acontece longe do usuário. Sem instrumentação, ninguém sabe que ele
falhou.

O mínimo: registro de início e fim com identificador correlacionado, métrica de
duração, métrica de sucesso e falha, e alerta para trabalho que não roda no prazo
esperado.

O último é o mais esquecido: um trabalho agendado que **para de rodar** não gera
erro nenhum. O silêncio é o sintoma, e só um alerta de ausência o detecta.

## Modelo Mental

**Trabalho em background é uma promessa.** Quem faz a promessa precisa dar ao
usuário uma forma de saber se ela foi cumprida — e ao operador, uma forma de saber
se não foi.

## Quando Usar

- O trabalho leva mais que alguns segundos.
- O usuário não precisa do resultado imediatamente.
- O trabalho pode falhar e ser repetido.
- É preciso limitar o ritmo — processar mil itens sem sobrecarregar um serviço
  externo.
- O trabalho é agendado.

## Quando Não Usar

**Quando o usuário precisa do resultado agora.** Assíncrono não torna nada mais
rápido; ele muda quando você responde.

**Para trabalho curto.** Mover uma operação de 50 ms para background adiciona
infraestrutura e latência de coordenação.

**Sem estado consultável.** Um trabalho disparado sem forma de acompanhar deixa o
usuário sem saber.

**Sem observabilidade.** Falha silenciosa é o modo normal de trabalho em
background mal instrumentado.

**Quando a ordem entre trabalhos importa e não há mecanismo.** Dois trabalhos
concorrentes sobre o mesmo dado produzem resultado imprevisível.

## Alternativas

- **Síncrono** — para trabalho curto.
- **Resposta em fluxo** — devolver resultados parciais enquanto processa, quando o
  protocolo permite.
- **Pré-cálculo** — se o resultado é previsível, calcular antes de ser pedido.
- **Reduzir o trabalho** — a alternativa menos considerada: um relatório que
  demora dez minutos frequentemente está processando dados que ninguém olha.

## Trade-offs

| Background | Síncrono |
|---|---|
| Sem limite de duração | Limitado pelo timeout |
| Retentativa e retomada | Recomeça do zero |
| Ritmo controlável | Rajada |
| Contrato de duas etapas | Resposta direta |
| Precisa de estado consultável | Nada a manter |
| Falha silenciosa se mal instrumentado | Erro visível ao usuário |

## Modos de Falha

**Falha silenciosa.** Ninguém sabe que não rodou.

**Agendamento duplicado.** Múltiplas instâncias disparando o mesmo trabalho.

**Trabalho que nunca termina.** Sem timeout, um trabalho travado ocupa um
trabalhador indefinidamente.

**Sem estado de falha.** O usuário consulta e vê "processando" para sempre.

**Acúmulo.** Trabalhos entram mais rápido do que saem.

**Perda no reinício.** Trabalho em memória, sem fila durável.

## Erros Comuns

**Agendamento em memória do serviço.**

**Não expor estado consultável.**

**Não alertar sobre ausência de execução.**

**Não definir timeout do trabalho.**

**Assumir que o trabalho roda uma vez.**

## Exemplo Real

Um sistema de e-commerce gerava o relatório de fechamento mensal dentro de uma
requisição HTTP. Com o crescimento, passou de 40 segundos para 4 minutos, e o
proxy expirava em 60 segundos.

A solução foi mover para background. A primeira versão tinha três problemas.

**O usuário não sabia.** A tela dizia "relatório solicitado" e nada mais. As
pessoas clicavam várias vezes, gerando quatro relatórios iguais.

**O agendamento mensal duplicava.** O disparo automático era um laço em memória, e
o serviço tinha três instâncias. Todo dia primeiro, três relatórios eram gerados
simultaneamente, saturando o banco.

**Falhas eram invisíveis.** Em três meses, o relatório de fevereiro não foi gerado
— um erro de dado o fez falhar — e ninguém percebeu até a contabilidade cobrar em
abril.

As correções.

A resposta virou `202` com identificador. A tela passa a consultar o estado e
mostra progresso, e o botão fica desabilitado enquanto há um em andamento — o que
resolveu a duplicação por clique.

O agendamento saiu do serviço para um agendador externo, que publica uma mensagem
na fila. Um disparo, um consumidor pega.

E a instrumentação: métrica de sucesso e falha, alerta se o relatório mensal não
concluir até as 6h do dia primeiro. Esse alerta detectou duas falhas no ano
seguinte, ambas corrigidas no mesmo dia.

O terceiro problema era o mais caro e o menos visível. Mover trabalho para
background sem alerta de ausência troca uma falha ruidosa por uma silenciosa.

## Conceitos Relacionados

- [Filas](queues.md) — o mecanismo de entrega.
- [Request/Response](request-response.md) — o modelo que se abandona.
- [Observabilidade](../13-observability/index.md) — como saber o que aconteceu.
- [Confiabilidade](../12-reliability/index.md) — retentativa e retomada.

## Exercício Prático

Liste os trabalhos em background do seu sistema. Para cada um: existe alerta se
ele **não** rodar? O usuário consegue consultar o estado, incluindo falha? Ele é
seguro para executar duas vezes?

O alerta de ausência é o que quase ninguém tem, e é o que detecta o pior tipo de
falha.

## Perguntas de Entrevista

- Como o contrato com o usuário muda ao mover trabalho para background?
- Por que agendamento em memória do serviço é um problema?
- Qual falha de trabalho em background é a mais difícil de detectar?

## Para Aprofundar

- Nygard, Michael. *Release It!* 2ª ed., 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — alertas de
  ausência.
