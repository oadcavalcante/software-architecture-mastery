---
id: queue-based-scaling
title: Escala Dirigida por Fila
sidebar_position: 9
description: Desacoplar taxa de chegada de taxa de processamento — e escalar pelo indicador que reage antes.
doc_type: pattern
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor usa a fila como amortecedor e escala pela profundidade dela,
  com teto e descarte definidos.
prerequisites: [async-processing]
related: [async-processing, horizontal-scaling, scaling-capacity-planning]
canonical_for: [escala dirigida por fila, profundidade de fila, amortecedor de carga, descarte por prazo]
content_version: 1
last_reviewed: 2026-08-28
---

# Escala Dirigida por Fila

## Visão Geral

Uma fila entre quem produz e quem consome desacopla a **taxa de chegada** da **taxa de
processamento**.

Isso resolve o problema que capacidade não resolve bem: picos curtos e intensos, que
duram menos que o tempo de provisionar máquinas.

E ela oferece o melhor indicador de escalonamento disponível — a **profundidade da
fila**, que reage antes de qualquer métrica de recurso.

## Problema

Escalonamento automático por CPU é reativo e lento: a métrica sobe, o alarme dispara, a
capacidade sobe, a aplicação inicia. Ver
[computação em nuvem](/09-cloud-architecture/cloud-compute.md).

O intervalo é de minutos. Muitos picos duram menos que isso — e quando a capacidade
chega, o pico passou.

Sem fila, o excesso vira erro: requisições recusadas, timeouts, retentativas que
amplificam a carga.

Com fila, o excesso vira **atraso**. E atraso é quase sempre preferível a erro.

## Conceitos Centrais

### A fila é um amortecedor, não capacidade

O ponto que precisa ficar claro: a fila não processa nada. Ela absorve a diferença
temporária entre chegada e processamento.

```text
chegada 500/s, processamento 300/s, por 2 minutos
  → fila acumula 24.000, drena depois. Funciona.

chegada 500/s, processamento 300/s, sustentado
  → fila cresce indefinidamente. Não funciona.
```

Ver [processamento assíncrono](/11-scalability/async-processing.md). A fila resolve pico, não
sobrecarga sustentada — e usá-la para a segunda transforma um erro imediato num atraso
crescente que ninguém percebe.

A verificação: a **capacidade média de processamento precisa exceder a taxa média de
chegada**. Se não exceder, nenhuma fila resolve.

### A profundidade é o melhor indicador de escalonamento

```text
CPU                  reage depois que o trabalho já está atrasando
latência             idem
profundidade da fila reage no instante em que a chegada supera o processamento
```

Escalonar pela profundidade — ou, melhor, pela **idade da mensagem mais antiga** — dá
minutos de antecedência em relação a métricas de recurso.

A idade é preferível à contagem porque ela se traduz diretamente em experiência: "a
mensagem mais antiga tem 4 minutos" diz algo ao negócio; "há 30 mil mensagens" não diz.

E ela normaliza automaticamente: 30 mil mensagens podem ser 10 segundos ou 3 horas,
dependendo da capacidade de consumo.

### Teto e descarte não são opcionais

Uma fila sem limite acumula até esgotar o armazenamento — e a recuperação de uma fila
com milhões de mensagens é lenta.

Três controles:

**Teto de profundidade.** Acima dele, o produtor recebe recusa. Isso devolve a pressão
para a borda, onde ela pode ser tratada. Ver
[backpressure](/06-distributed-systems/backpressure.md).

**Descarte por prazo.** Mensagens cuja utilidade expirou são descartadas. Uma
notificação de "seu pedido saiu para entrega" com 6 horas de atraso não deveria ser
enviada.

**Prioridade.** Filas separadas por criticidade, com o consumo priorizando a que
importa.

O descarte por prazo é o menos implementado e o que mais evita dano: processar
trabalho obsoleto consome capacidade que o trabalho novo precisa.

### Priorizar exige filas separadas

Uma única fila processa em ordem de chegada. Numa recuperação após incidente, isso
significa que o trabalho novo espera atrás de horas de acumulado.

Filas separadas por prioridade, com consumidores dedicados ou com proporção definida de
consumo, resolvem — e a decisão de quais operações são prioritárias precisa vir do
negócio.

O erro comum é criar prioridade sem reservar capacidade para a fila de baixa
prioridade: ela nunca é consumida enquanto houver algo na alta.

### O consumidor precisa escalar de verdade

Adicionar consumidores só aumenta a vazão se o trabalho for paralelizável.

Os limites que aparecem:

**Ordenação por chave.** Se as mensagens de uma entidade precisam ser processadas em
ordem, elas vão para o mesmo consumidor. O paralelismo é limitado pelo número de
chaves. Ver [ordenação](/06-distributed-systems/ordering.md).

**Recurso compartilhado.** Vinte consumidores contra o mesmo banco apenas movem o
gargalo.

**Número de partições.** Em sistemas particionados, o paralelismo máximo é o número de
partições — adicionar consumidores além disso não faz nada.

O terceiro é o mais frequente e o mais surpreendente: dobrar os consumidores sem
aumentar as partições não muda nada.

### Escalar a zero é possível e tem custo

Quando a fila está vazia, os consumidores podem ser desligados — o que economiza em
cargas esporádicas.

O custo é a latência de retomada: a primeira mensagem depois de um período ocioso
espera o tempo de provisionar. Ver
[serverless](/09-cloud-architecture/serverless.md).

Para trabalho tolerante a atraso, é uma economia significativa. Para o que precisa de
resposta rápida, um mínimo de consumidores sempre ativos é necessário.

## Modelo Mental

**A fila converte excesso em atraso.** Ela compra tempo para a capacidade chegar — e
não substitui capacidade.

## Quando Usar

- Picos curtos e intensos.
- O trabalho tolera atraso.
- A chegada é imprevisível.
- O processamento é mais lento que a aceitação.
- Vários consumidores podem trabalhar em paralelo.
- Escalonamento por métrica de recurso é lento demais.

## Quando Não Usar

**Para sobrecarga sustentada.**

**Sem teto de profundidade.**

**Sem descarte de trabalho obsoleto.**

**Quando a resposta precisa ser imediata.**

**Quando o consumidor não paraleliza.** Adicionar consumidores não ajuda.

**Sem monitorar a idade da mensagem mais antiga.**

## Alternativas

- **Capacidade provisionada antes do pico** — quando ele é previsível, escalonamento
  programado é melhor que qualquer reação. Ver
  [computação em nuvem](/09-cloud-architecture/cloud-compute.md).
- **Limite de taxa** — recusa na borda, em vez de acumular. Ver
  [rate limiting](/05-system-design/rate-limiting.md).
- **Descarte de carga** — rejeitar o menos importante para preservar o essencial.
- **Processamento em lote** — agrupar reduz o custo por item.

## Trade-offs

| Com fila | Sem |
|---|---|
| Pico vira atraso | Vira erro |
| Consumidor escala independentemente | Acoplado |
| Estado intermediário | Resposta direta |
| Componente adicional | Menos peças |
| Falha silenciosa possível | Erro visível |

| Escalar por profundidade | Por CPU |
|---|---|
| Reage antes | Depois |
| Traduz-se em experiência | Não |
| Exige fila | Funciona sempre |

## Modos de Falha

**Fila crescendo indefinidamente.**

**Trabalho obsoleto processado.** Notificações antigas enviadas.

**Consumidor parado sem alerta.**

**Paralelismo limitado por partições.**

**Fila de baixa prioridade nunca consumida.**

**Recuperação lenta.** Milhões de mensagens acumuladas levam horas para drenar.

**Amplificação por retentativa.** O consumidor falha, repete, e a fila cresce com
repetições.

## Erros Comuns

**Usar fila para sobrecarga sustentada.**

**Não definir teto.**

**Não descartar trabalho expirado.**

**Escalar por CPU quando a profundidade está disponível.**

**Não reservar capacidade para baixa prioridade.**

**Adicionar consumidores sem aumentar partições.**

## Exemplo Real

Uma plataforma de entrega de alimentos tinha picos previsíveis — almoço e jantar — com
volume oito vezes maior que a média.

O escalonamento automático por CPU não acompanhava: o pico do almoço subia em cerca de
90 segundos, e a capacidade levava 4 minutos. Nos primeiros minutos, pedidos eram
recusados.

A reformulação:

**Fila entre a aceitação e o processamento.** O pedido passou a ser aceito e
enfileirado. A recusa desapareceu; o pico virou atraso de processamento.

**Escalonamento pela idade da mensagem mais antiga**, com alvo de 30 segundos. A
reação passou a ser imediata, porque a idade cresce no instante em que a chegada supera
o consumo.

**Escalonamento programado** para os dois picos, provisionando capacidade 15 minutos
antes. A fila passou a ser a proteção para o imprevisto, não o mecanismo principal.

**Filas por prioridade.** Confirmação de pedido em alta prioridade; atualização de
painel do restaurante em média; relatórios e indexação em baixa. Com 20% do consumo
reservado para a baixa, para que ela não parasse.

**Descarte por prazo.** Notificações de status com mais de 10 minutos passaram a ser
descartadas — a informação já não era útil, e processá-las consumia capacidade
necessária para as atuais.

Dois problemas apareceram:

**Partições insuficientes.** O escalonamento subia até 40 consumidores, e a vazão parava
de crescer em 12 — o número de partições do tópico. Descoberto ao comparar o número de
consumidores com a vazão. As partições foram aumentadas para 48.

**Recuperação lenta.** Numa indisponibilidade de 40 minutos do serviço de pagamento, a
fila acumulou 180 mil pedidos. A drenagem levou 2 horas, durante as quais os pedidos
novos entravam atrás. A priorização por prazo de entrega foi adicionada: pedidos com
entrega mais próxima são processados primeiro, independentemente da ordem de chegada.

O aprendizado que ficou: o escalonamento programado resolveu mais que a fila para os
picos conhecidos. A fila continua sendo essencial — para o imprevisto e para a
recuperação — e a expectativa inicial, de que ela sozinha resolveria os picos diários,
estava errada.

## Conceitos Relacionados

- [Processamento Assíncrono](/11-scalability/async-processing.md).
- [Backpressure](/06-distributed-systems/backpressure.md) — o teto.
- [Escala Horizontal](/11-scalability/horizontal-scaling.md) — o consumidor.
- [Filas](/05-system-design/queues.md) — os fundamentos.

## Exercício Prático

Se você tem filas, verifique se o escalonamento usa a profundidade ou a CPU — e se
existe alerta sobre a idade da mensagem mais antiga.

Depois compare o número de consumidores com o número de partições. Se os consumidores
puderem passar das partições, o escalonamento está gastando sem entregar.

## Perguntas de Entrevista

- Por que a fila resolve pico e não sobrecarga sustentada?
- Por que a idade da mensagem mais antiga é melhor indicador que a contagem?
- Por que adicionar consumidores pode não aumentar a vazão?

## Para Aprofundar

- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
