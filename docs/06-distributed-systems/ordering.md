---
id: ordering
title: Ordenação
sidebar_position: 26
description: A ordem em que as mensagens chegam — e por que ordem global custa mais do que quase todo sistema precisa.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor identifica qual ordem o negócio de fato exige e escolhe a
  chave de partição que a preserva.
prerequisites: [messaging]
related: [partitioning, clock-and-time, duplicate-messages]
canonical_for: [ordenação, ordem de mensagens, ordem por partição]
content_version: 1
last_reviewed: 2026-08-27
---

# Ordenação

## Visão Geral

Ordenação é a garantia sobre a sequência em que mensagens são processadas.

A afirmação que organiza o assunto: **ordem global é cara e quase nunca é o que o
negócio precisa.** O que ele precisa é ordem **por entidade** — e essa é barata.

## Problema

O comportamento observado é conhecido: `PedidoCancelado` chega antes de
`PedidoCriado`. O consumidor tenta cancelar um pedido que ainda não existe.

A causa é estrutural. Sistemas de mensageria distribuem mensagens entre partições
para escalar. Cada partição preserva ordem internamente; **entre partições não há
garantia nenhuma**.

Se as duas mensagens do mesmo pedido caem em partições diferentes, elas são
processadas por consumidores diferentes, em ritmos diferentes.

A reação instintiva é pedir ordem global — uma partição só. Isso funciona e
elimina o paralelismo: a vazão do tópico inteiro fica limitada a um consumidor.

## Conceitos Centrais

### Os níveis de ordenação

| Nível | Garantia | Custo |
|---|---|---|
| Nenhuma | Qualquer ordem | Nenhum |
| Por partição | Ordem dentro de uma partição | Nenhum — é o padrão |
| Por chave | Mensagens da mesma chave em ordem | Escolher a chave |
| Global | Todas em ordem | Uma partição, sem paralelismo |

**Por chave** é o nível que resolve a maior parte dos casos reais, e é obtido de
graça: basta que a chave de partição seja a entidade cuja ordem importa.

```text
partição = hash(id_do_pedido)
  → todos os eventos de um pedido na mesma partição
  → ordem preservada entre eles
  → pedidos diferentes em paralelo
```

### Ordem global raramente é necessária

Vale testar a suposição. As perguntas:

**Os eventos são da mesma entidade?** Se não, a ordem entre eles provavelmente não
importa. Que o pedido 100 seja processado antes do 200 é irrelevante.

**Existe dependência causal?** Cancelar depende de criar. Mas cancelar o pedido A
não depende de criar o pedido B.

**O consumidor consegue tolerar?** Se ele pode reordenar ou aguardar, a ordem não
precisa vir do canal.

Na maior parte dos sistemas de negócio, a resposta é: ordem por entidade basta.

### Ordem por chave tem um custo escondido

Escolher a chave para preservar ordem também determina a distribuição. Se uma
chave for muito mais ativa, ela concentra carga numa partição — o
[hotspot](../11-scalability/index.md).

Um sistema que particiona por `id_do_cliente` e tem um cliente corporativo com 40%
do volume tem uma partição saturada e as outras ociosas.

O compromisso: ordem exige agrupar; distribuição exige espalhar.

### Tolerar desordem no consumidor

Quando a ordem não pode ser garantida pelo canal, o consumidor pode lidar:

**Ignorar o obsoleto.** Cada mensagem carrega um número de versão da entidade; o
consumidor descarta mensagens com versão menor que a já aplicada.

**Aguardar a dependência.** Se `PedidoCancelado` chega antes de `PedidoCriado`,
guardar e reprocessar depois. Exige um lugar para guardar e um limite de espera.

**Operações comutativas.** Se a ordem não altera o resultado, o problema
desaparece. É a solução mais elegante e nem sempre possível.

A primeira é a mais usada e a mais simples: **versão na mensagem** resolve a maior
parte dos casos de desordem sem nenhum mecanismo de espera.

### Marca de tempo não estabelece ordem

Tentar ordenar por marca de tempo de máquinas diferentes não funciona — relógios
divergem. Ver [relógio e tempo](clock-and-time.md).

A ordem precisa vir de um contador da entidade, de um número de sequência
atribuído por quem produz, ou da partição.

### Reordenar no consumidor tem custo e limite

Quando o consumidor precisa de ordem que o transporte não garante, a saída é
guardar as mensagens fora de sequência até que a faltante chegue.

Isso funciona e traz duas restrições que precisam ser decididas antes:

**O buffer é finito.** Guardar indefinidamente esgota memória. Com limite, uma
lacuna longa força descarte ou bloqueio.

**A lacuna pode nunca se fechar.** Se a mensagem faltante foi perdida ou foi para
outra partição, esperar por ela trava o consumo para sempre.

Isso obriga um prazo: depois de N segundos esperando a sequência 7, o consumidor
precisa decidir entre processar fora de ordem, pular, ou parar e alertar.

Escolher entre as três é decisão de domínio, não técnica — e um consumidor que
reordena sem prazo definido vai travar em produção, invariavelmente numa
madrugada.

## Modelo Mental

**A pergunta não é "as mensagens estão em ordem?". É "a ordem de quê importa para
quem?"**

## Quando Usar

**Ordem por chave** quando:
- Eventos da mesma entidade têm dependência causal.
- O consumidor aplica mudanças de estado sequenciais.
- A distribuição da chave é razoavelmente uniforme.

**Ordem global** quando:
- Há um requisito genuíno de sequência total — um livro-razão contábil, por
  exemplo.
- A vazão cabe num consumidor.

## Quando Não Usar

**Ordem global por precaução.** Elimina paralelismo e raramente é necessária.

**Ordem por chave quando a chave é desequilibrada.** Vira hotspot.

**Confiar em ordem sem verificar a configuração.** Vários sistemas só garantem
ordem sob condições específicas — produtor sem envio paralelo, sem retentativa
reordenando.

**Ordenar por marca de tempo entre máquinas.**

## Alternativas

- **Versão na mensagem** — o consumidor descarta o obsoleto. Resolve a maioria dos
  casos.
- **Operações comutativas** — eliminar a dependência de ordem.
- **Buffer de reordenação** — guardar e aplicar em ordem, com limite de espera.
- **Estado no consumidor** — verificar a precondição antes de aplicar, em vez de
  confiar na ordem.

## Trade-offs

| Ordem global | Por chave | Nenhuma |
|---|---|---|
| Sequência total garantida | Por entidade | Nenhuma garantia |
| Sem paralelismo | Paralelo entre chaves | Paralelismo máximo |
| Vazão de um consumidor | Escala com partições | Escala livremente |
| Sem hotspot por ordenação | Possível hotspot | Distribuição uniforme |

## Modos de Falha

**Evento aplicado fora de ordem.** Estado incorreto — cancelamento antes da
criação.

**Hotspot pela chave de ordenação.** Uma partição saturada.

**Ordem quebrada por retentativa.** O produtor reenvia uma mensagem após já ter
enviado a seguinte.

**Ordem quebrada por rebalanceamento.** Consumidores trocam de partição e
processam sobrepondo.

**Ordem assumida e não configurada.** O produtor envia em paralelo, o que reordena
mesmo dentro da partição.

## Erros Comuns

**Pedir ordem global sem verificar a necessidade.**

**Não incluir versão nas mensagens.** É a defesa mais barata contra desordem.

**Escolher a chave sem olhar a distribuição.**

**Assumir que o broker garante ordem sem ler a configuração do produtor.**

**Ordenar por marca de tempo.**

## Exemplo Real

Um sistema de rastreamento de encomendas processava eventos de status. Um cliente
reportou uma encomenda que mostrava "saiu para entrega" depois de "entregue".

A investigação encontrou a causa: os eventos eram particionados por
`id_do_transportador` — escolha feita para agrupar por parceiro — e uma encomenda
podia trocar de transportador no meio do trajeto.

Ao trocar, os eventos subsequentes iam para outra partição, e a ordem entre os dois
grupos não era garantida.

A primeira proposta foi ordem global. O cálculo mostrou o custo: 40 mil eventos por
minuto num consumidor único, contra os oito consumidores em paralelo que existiam.
Inviável.

A correção teve duas partes.

**A chave de partição mudou** para `id_da_encomenda` — a entidade cuja ordem de
fato importa. Transportador continua sendo um atributo do evento, não a chave.

**Versão na mensagem.** Cada evento carrega um contador sequencial da encomenda,
atribuído por quem produz. O consumidor descarta eventos com versão menor que a
última aplicada.

A segunda parte foi a que mais rendeu, e por uma razão que a equipe não previu: ela
protege contra desordem de **qualquer** origem — retentativa, rebalanceamento,
reprocessamento manual — e não apenas contra a causa conhecida.

A distribuição por encomenda também se mostrou mais uniforme que por
transportador, onde dois parceiros grandes concentravam a carga.

## Conceitos Relacionados

- [Mensageria](messaging.md) — o canal.
- [Particionamento](partitioning.md) — a escolha da chave.
- [Relógio e Tempo](clock-and-time.md) — por que marca de tempo não ordena.
- [Mensagens Duplicadas](duplicate-messages.md).

## Exercício Prático

Para cada tópico do seu sistema, responda: qual a chave de partição, e a ordem de
qual entidade ela preserva?

Depois verifique se as mensagens carregam versão. Se não carregarem, o consumidor
não tem como detectar desordem.

## Perguntas de Entrevista

- Por que ordem global é cara?
- Como escolher a chave de partição para preservar a ordem que importa?
- Por que versão na mensagem é a defesa mais robusta contra desordem?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Lamport, Leslie. *Time, Clocks, and the Ordering of Events in a Distributed
  System*. CACM, 1978.
