---
id: async-processing
title: Processamento Assíncrono
sidebar_position: 8
description: Tirar trabalho do caminho crítico — a técnica que resolve picos sem capacidade proporcional.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica o que pode sair do caminho da requisição e modela
  os estados intermediários que isso cria.
prerequisites: [scalability]
related: [queue-based-scaling, performance-vs-scalability, statelessness]
canonical_for: [caminho crítico, processamento assíncrono, estado intermediário]
content_version: 1
last_reviewed: 2026-08-28
---

# Processamento Assíncrono

## Visão Geral

Processamento assíncrono é tirar trabalho do caminho da requisição: aceitar, responder,
e processar depois.

O ganho em escala é grande e indireto. Uma requisição que responde em 40 ms em vez de
900 ms ocupa recursos por 22 vezes menos tempo — o que, pela lei de Little, significa
22 vezes mais vazão com a mesma concorrência. Ver
[desempenho versus escalabilidade](/11-scalability/performance-vs-scalability.md).

O custo é que a operação deixa de ter um resultado imediato, e os **estados
intermediários** passam a existir no domínio.

## Problema

Uma requisição que faz cinco coisas — gravar o pedido, reservar estoque, cobrar,
enviar e-mail, atualizar o painel — leva o tempo das cinco somadas, e falha se
qualquer uma falhar.

Sob carga, ela ocupa uma conexão e um fio de execução durante todo esse tempo. Com
concorrência limitada, a vazão desaba.

E, das cinco, tipicamente apenas uma ou duas precisam acontecer antes de responder ao
usuário.

## Conceitos Centrais

### A pergunta que decide

Para cada passo: **o usuário precisa que isto tenha acontecido para receber a
resposta?**

```text
gravar o pedido      sim — sem isso não há o que confirmar
reservar estoque     talvez — depende de o negócio aceitar reserva posterior
cobrar               geralmente não — pode ser confirmado depois
enviar e-mail        não
atualizar painel     não
indexar para busca   não
gerar relatório      não
```

A regra prática: se o usuário não vê o resultado na tela seguinte, provavelmente pode
ser assíncrono.

E há um critério de negócio embutido: tornar a cobrança assíncrona significa aceitar
pedidos que podem falhar na cobrança depois. Isso é decisão de produto, não técnica.

### Os estados intermediários são a parte cara

Uma operação síncrona tem dois estados: aconteceu ou não. Uma assíncrona tem mais:

```text
recebido → em processamento → concluído
                            → falhou → em nova tentativa
                                     → falhou definitivamente
```

Cada um precisa ser representado no modelo, exibido na interface, e tratado pelo
suporte.

Esse é o custo real, e ele é subestimado. Times que tornam uma operação assíncrona sem
modelar os estados produzem a experiência pior possível: o usuário recebe "sucesso" e
descobre depois que não funcionou, sem saber onde olhar.

### O usuário precisa de retorno

Três padrões, do mais simples ao mais elaborado:

**Consulta pelo cliente.** A resposta traz um identificador; o cliente consulta o
estado. Simples, funciona em qualquer lugar, gera tráfego de consulta.

**Notificação.** O sistema avisa quando termina — mensagem, e-mail, notificação.
Adequado para operações longas.

**Conexão persistente.** O cliente recebe atualizações em tempo real. Melhor
experiência, e adiciona estado de conexão. Ver
[ausência de estado](/11-scalability/statelessness.md).

A escolha depende da duração: segundos favorecem conexão ou consulta; minutos ou horas
favorecem notificação.

### O que o assíncrono exige

Ver [integração por mensageria](/08-integration-architecture/messaging-integration.md)
para a lista completa. Em resumo:

**Idempotência**, porque haverá repetição.

**Durabilidade**, porque o trabalho aceito não pode sumir se o processo cair. Aceitar e
guardar em memória é a forma mais comum de perder trabalho silenciosamente.

**Tratamento de falha definitiva**, com destino para o que não processa.

**Monitoramento de atraso**, porque a falha deixa de gerar erro visível.

### Assíncrono não reduz trabalho

Ponto que costuma ser esquecido: o trabalho continua existindo. Ele apenas sai do
caminho crítico.

Se a taxa de chegada excede a capacidade de processamento de forma sustentada, a fila
cresce indefinidamente — e o assíncrono transformou um erro imediato num atraso
crescente, que é pior de diagnosticar.

Assíncrono resolve **pico**, não **sobrecarga sustentada**. A distinção é o que separa
um uso correto de um adiamento do problema. Ver
[escala dirigida por fila](/11-scalability/queue-based-scaling.md).

### A transação e a publicação precisam ser atômicas

Gravar no banco e publicar a mensagem em duas operações separadas cria uma janela: se
o processo cai entre elas, o efeito nunca acontece.

A **caixa de saída transacional** resolve — gravar a mudança e a mensagem na mesma
transação local, com um processo separado publicando. Ver
[transações distribuídas](/06-distributed-systems/distributed-transactions.md).

É o padrão que evita a perda silenciosa mais comum em sistemas assíncronos.

## Modelo Mental

**Assíncrono troca resposta imediata por vazão.** O preço são os estados intermediários,
e eles precisam ser modelados, não descobertos.

## Quando Usar

- O usuário não precisa do resultado para continuar.
- A operação é longa ou depende de terceiros.
- Há picos que a capacidade não acompanha.
- O trabalho pode ser retentado sem intervenção.
- Vários efeitos derivam de uma ação.
- A operação pode falhar sem invalidar o todo.

## Quando Não Usar

**Quando o usuário precisa do resultado agora.**

**Sem modelar os estados intermediários.**

**Sem durabilidade.** Aceitar e guardar em memória perde trabalho.

**Sem idempotência.**

**Para sobrecarga sustentada.** A fila cresce e o problema volta pior.

**Quando a ordem entre operações é obrigatória** e a fila não a garante.

**Sem monitorar atraso.** A falha vira silêncio.

## Alternativas

- **Otimizar o síncrono** — se a operação ficar rápida, não precisa sair do caminho.
- **Paralelizar dentro da requisição** — cinco chamadas independentes em paralelo
  custam o tempo da mais lenta, não a soma.
- **Timeout agressivo com degradação** — responder sem o resultado opcional.
- **[Fila](/11-scalability/queue-based-scaling.md)** — a forma mais robusta de assíncrono.

A segunda merece consideração: muitas requisições lentas são sequências de chamadas
independentes, e paralelizá-las resolve sem introduzir estado intermediário.

## Trade-offs

| Assíncrono | Síncrono |
|---|---|
| Resposta rápida | Tempo total |
| Absorve pico | Propaga |
| Estados intermediários | Dois estados |
| Falha silenciosa possível | Erro imediato |
| Idempotência obrigatória | Frequentemente dispensável |
| Depuração exige rastreamento | Pilha de chamadas |

## Modos de Falha

**Trabalho perdido.** Aceito e não persistido.

**Fila crescendo indefinidamente.** Sobrecarga sustentada.

**Usuário sem retorno.** Aceito, e ninguém avisa o que houve.

**Efeito duplicado.** Sem idempotência.

**Falha silenciosa.** O consumidor parou e nada gera erro.

**Publicação perdida.** Sem caixa de saída transacional.

**Ordem quebrada.** O consumidor assumia sequência.

## Erros Comuns

**Não modelar os estados no domínio.**

**Aceitar sem persistir.**

**Não dar retorno ao usuário.**

**Usar assíncrono para sobrecarga sustentada.**

**Não monitorar atraso de processamento.**

**Publicar fora da transação.**

## Exemplo Real

Uma plataforma de emissão de notas fiscais tinha a operação de emissão levando entre 3
e 12 segundos, porque chamava o serviço da receita de forma síncrona.

Com concorrência limitada a 200 requisições simultâneas e latência média de 7 segundos,
a vazão máxima era de cerca de 28 emissões por segundo. O pico do fim do mês pedia
120.

O resultado era previsível: fila de espera no balanceador, timeouts, e usuários
reenviando — o que piorava tudo.

A migração para assíncrono:

**Aceitar e responder.** A emissão passou a gravar a solicitação e responder em 45 ms
com um identificador. A vazão da camada de aceitação passou a ser limitada apenas pela
gravação.

**Caixa de saída transacional.** A solicitação e a mensagem de processamento gravadas
na mesma transação. Sem isso, quedas do processo perdiam emissões — o que já
acontecia, e era diagnosticado como "erro da receita".

**Estados no domínio.** `recebida`, `processando`, `autorizada`, `rejeitada`,
`falha_temporária`. Cada um exibido na interface, com significado claro para o usuário
e para o suporte.

**Notificação** ao concluir, mais consulta pelo cliente enquanto a tela está aberta.

**Idempotência** por chave de solicitação, impedindo emissão duplicada quando o
usuário reenviava.

Resultado: o pico do fim do mês passou a ser absorvido, com atraso de processamento de
até 8 minutos nos momentos mais intensos — aceito pelo negócio, porque a emissão tem
prazo legal de horas.

Dois problemas apareceram depois:

**Sobrecarga sustentada.** Numa indisponibilidade de 6 horas do serviço da receita, a
fila acumulou 400 mil emissões. Quando o serviço voltou, o consumo levou 9 horas — e
durante esse período as emissões novas entravam atrás das antigas. Foi adicionada
priorização por prazo.

**Usuários confusos.** A primeira versão exibia apenas "processando", sem estimativa. O
volume de chamados ao suporte triplicou. A adição de uma previsão e de um histórico de
tentativas resolveu.

O ponto que a equipe sublinha: a modelagem dos estados consumiu mais tempo que a mudança
técnica — cinco telas, dois relatórios e o treinamento do suporte. Ela tinha sido
estimada como detalhe.

## Conceitos Relacionados

- [Escala Dirigida por Fila](/11-scalability/queue-based-scaling.md).
- [Integração por Mensageria](/08-integration-architecture/messaging-integration.md).
- [Idempotência](/06-distributed-systems/idempotency.md).
- [Processamento em Background](/05-system-design/background-processing.md).

## Exercício Prático

Pegue a requisição mais lenta do seu sistema e liste o que ela faz, passo a passo.

Para cada passo, pergunte: o usuário precisa disto para ver a resposta? Some o tempo
dos que não precisam — é o que você pode tirar do caminho crítico.

## Perguntas de Entrevista

- Como assíncrono aumenta a vazão sem adicionar capacidade?
- Por que os estados intermediários são o custo real?
- Por que assíncrono não resolve sobrecarga sustentada?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley,
  2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
