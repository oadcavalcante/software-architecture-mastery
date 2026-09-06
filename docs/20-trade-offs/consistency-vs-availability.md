---
id: consistency-vs-availability
title: Consistência vs. Disponibilidade
sidebar_position: 2
description: A escolha só existe durante a partição — e ela é por operação, não pelo sistema.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide consistência ou disponibilidade por operação, com o custo de
  cada modo de falha nomeado pelo negócio.
prerequisites: [cap]
related: [strong-vs-eventual-consistency, sync-vs-async, cost-vs-reliability]
canonical_for: [consistência contra disponibilidade, escolha por operação, degradação escolhida, custo do erro de negócio]
content_version: 2
last_reviewed: 2026-08-29
---

# Consistência vs. Disponibilidade

## Visão Geral

O par vem do [teorema CAP](/06-distributed-systems/cap.md), e é o mais citado e o mais mal
aplicado da arquitetura distribuída.

Duas correções antes de qualquer discussão:

```text
a escolha só existe durante uma partição de rede
fora dela, não há nada a escolher — pode-se ter as duas
```

```text
a escolha não é do sistema
é de cada operação, e operações diferentes do mesmo sistema
escolhem lados diferentes
```

Sistemas descritos como "AP" ou "CP" quase sempre são os dois, em partes diferentes. Um
comércio eletrônico aceita venda com estoque possivelmente desatualizado — e recusa débito
com saldo possivelmente desatualizado.

```text
eixo real   qual erro custa mais nesta operação: recusar o que era válido,
            ou aceitar o que era inválido?
```

## Problema

A formulação usual — "escolha entre consistência e disponibilidade" — leva a três erros.

**Escolher pelo sistema.** Um único modo aplicado a todas as operações produz ou um sistema
que fica indisponível para leituras que toleravam dado velho, ou um sistema que aceita
operações financeiras sobre estado incerto.

**Escolher sem o custo do erro.** A decisão exige um número que raramente é levantado:
quanto custa cada tipo de erro, para o negócio.

```text
recusar um pedido válido        perda de receita, atrito com o cliente
aceitar um pedido inválido      estorno, fraude, ajuste manual, multa
```

**Achar que a escolha é permanente.** Durante a partição, um lado é escolhido. Depois dela,
há reconciliação a fazer — e o desenho dessa reconciliação é parte da decisão, não um
detalhe posterior.

## Conceitos Centrais

### A escolha é por operação

```text
operação                        escolha típica    razão
consultar catálogo              disponibilidade   dado velho não causa dano
adicionar ao carrinho           disponibilidade   reversível, barato
conferir estoque na vitrine     disponibilidade   aproximação aceitável
reservar estoque na compra      depende           ver abaixo
debitar saldo                   consistência      aceitar inválido é caro
alterar limite de crédito       consistência      efeito regulatório
registrar evento de auditoria   disponibilidade   perder é pior que atrasar
```

A linha "reservar estoque" é o caso interessante: a resposta depende do produto. Para itens
com estoque alto, aceitar sobrevenda e resolver depois custa menos que recusar vendas. Para
um item único — um ingresso numerado, um imóvel — não.

### O custo de cada erro precisa de número

```text
sobrevenda de item de estoque alto     cancelar 3 pedidos por mês, ~R$ 400 de custo
recusar vendas durante partição        ~R$ 90 mil por hora de pico
```

Com esses dois números, a decisão é aritmética. Sem eles, é opinião.

E o levantamento costuma ser possível: o custo de recusar vem do faturamento por hora; o de
aceitar indevidamente vem do histórico de estornos, ajustes e chamados.

### Degradação escolhida, não sofrida

Um sistema bem desenhado não fica simplesmente indisponível durante uma partição. Ele
**degrada de forma decidida**:

```text
leitura       serve dado do cache, com indicação de idade
escrita       aceita e enfileira, com confirmação posterior
operação
  crítica     recusa explicitamente, com mensagem clara
navegação     continua funcionando
```

A diferença entre degradação escolhida e falha é que a primeira foi desenhada, testada e
comunicada. Ver [degradação graciosa](/12-reliability/graceful-degradation.md).

### A reconciliação é parte da decisão

Escolher disponibilidade durante a partição significa aceitar divergência — e a divergência
precisa ser resolvida depois:

```text
quem vence em conflito?           regra explícita, não implícita
quem é notificado?                cliente, operação, ambos
o que é reversível?               e a que custo
quanto tempo de divergência
  é tolerável?                    define o alarme
```

Sem esse desenho, "escolhemos disponibilidade" é escolher o problema sem escolher a
solução. Ver
[resolução de conflitos](/06-distributed-systems/conflict-resolution.md).

### PACELC: a escolha que existe todo dia

O CAP descreve o comportamento durante a partição, que é rara. O restante do tempo, existe
outro trade-off, mais frequente e mais relevante no dia a dia:

```text
partição    → consistência ou disponibilidade
sem partição → latência ou consistência
```

Manter consistência forte entre réplicas distantes custa latência em toda operação, todos os
dias. Essa é, na prática, a decisão que mais afeta os usuários.

Ver [PACELC](/06-distributed-systems/pacelc.md).

### Sinais de escolha errada

```text
escolheu disponibilidade e não deveria
  ajustes manuais recorrentes na operação
  estornos e cancelamentos acima do previsto
  divergências descobertas por clientes, não por monitoração
  reconciliação sem regra clara, resolvida caso a caso

escolheu consistência e não deveria
  indisponibilidade em operações que toleravam dado velho
  latência alta em leituras simples
  falha de uma dependência derrubando funcionalidade não relacionada
  usuários reclamando de lentidão em consulta
```

### Custo de mudar de ideia

```text
disponibilidade → consistência   caro: exige coordenação onde não havia
consistência → disponibilidade   caro de outro jeito: exige desenhar
                                 reconciliação e comunicar divergência
```

A assimetria aqui é menor que em outros pares, e o que a decide é o dado já acumulado: um
sistema que operou meses aceitando divergência tem histórico inconsistente que a migração
para consistência forte precisa tratar.

Isso favorece **começar consistente nas operações de maior custo de erro**, e relaxar
depois com evidência — o inverso é mais difícil.

## Modelo Mental

**Qual erro custa mais: recusar o válido ou aceitar o inválido?** A resposta muda por
operação, e a escolha só existe durante a partição.

## Quando Usar

Prefira **consistência** quando:

- Aceitar uma operação inválida tem custo financeiro, legal ou de confiança.
- O recurso é único ou escasso — ingresso numerado, imóvel, slot.
- A reconciliação seria manual ou impossível.
- Há requisito regulatório sobre o estado.

Prefira **disponibilidade** quando:

- Dado velho não causa dano — catálogo, busca, recomendação.
- A operação é reversível a baixo custo.
- Recusar custa mais que corrigir depois, com números.
- A escrita pode ser aceita e confirmada depois.

## Quando Não Usar

**Como escolha global do sistema.**

**Sem os números de custo de erro** dos dois lados.

**Fora de uma partição** — não há *esse* trade-off, e citar CAP para justificar consistência fraca
em operação normal é erro conceitual.

**Sem desenhar a reconciliação.**

**Como desculpa para não tratar divergência** — "somos eventualmente consistentes" não é
desenho.

## Alternativas

- **Consistência por operação** — o arranjo correto na maior parte dos casos.
- **Reserva com expiração** — permite aceitar rápido e confirmar depois, com janela curta.
- **Limite de risco** — aceitar divergência até um teto e endurecer além dele: sobrevender
  até 2% do estoque, recusar acima.
- **Confirmação assíncrona** — aceitar a operação e confirmar por notificação. Ver
  [síncrono vs. assíncrono](/20-trade-offs/sync-vs-async.md).

A terceira é subutilizada e frequentemente a melhor: ela captura a maior parte da receita da
disponibilidade com uma fração do risco.

## Trade-offs

| Consistência | Disponibilidade |
|---|---|
| Prioriza não aceitar inválido | Prioriza não recusar válido |
| Indisponível na partição | Divergência a reconciliar |
| Latência maior | Menor |
| Sem reconciliação | Exige desenho de reconciliação |

| Escolha por sistema | Por operação |
|---|---|
| Simples de explicar | Ajustada ao custo real |
| Erra em metade dos casos | Mais desenho |
| Um modo de falha | Vários, cada um tratado |

## Modos de Falha

**Escolha global.** Metade das operações no modo errado.

**Sem números.** Decisão por preferência técnica.

**Divergência sem reconciliação.** Descoberta pelo cliente.

**CAP citado fora de partição.** Justifica consistência fraca sem motivo.

**Degradação sofrida.** O sistema falha em vez de degradar de forma desenhada.

**Reconciliação caso a caso.** Custo operacional crescente e invisível.

## Erros Comuns

**Classificar o sistema como AP ou CP.**

**Não levantar o custo de recusar** — costuma ser o número que falta.

**Tratar reconciliação como problema futuro.**

**Não medir o tempo de divergência.**

**Confundir partição com indisponibilidade de dependência** — são falhas diferentes, com
respostas diferentes.

## Exemplo Real

Uma rede varejista com operação física e digital tinha o estoque como fonte recorrente de
incidentes. A arquitetura usava consistência forte: toda reserva de estoque exigia
confirmação do serviço central.

Consequência medida ao longo de 12 meses:

```text
indisponibilidade do serviço de estoque      41 h/ano
vendas perdidas durante indisponibilidade    ~R$ 2,8 milhões
sobrevendas                                  0
```

A proposta inicial foi migrar para disponibilidade, com estoque em cache local. A equipe
resistiu, por medo de sobrevenda.

A decisão foi tomada depois de levantar o outro lado da conta, por categoria de produto:

```text
categoria            itens   estoque médio   custo de sobrevenda
commodities          82%     alto            cancelamento + cupom, ~R$ 60/caso
sazonais             14%     médio           idem, com atrito maior
exclusivos/únicos     4%     1 a 3 unidades  impossível cancelar sem dano
```

E o histórico mostrou que 91% do faturamento vinha das duas primeiras categorias.

O desenho adotado foi **por operação e por categoria**:

**Commodities e sazonais: disponibilidade.** Reserva contra cache local, com sincronização
contínua. Sobrevenda aceita até um limite de 2% do estoque da unidade; acima disso, o modo
endurece automaticamente e passa a exigir confirmação central.

**Exclusivos e únicos: consistência.** Reserva com confirmação central obrigatória. Durante
partição, a venda é recusada com mensagem explícita — 4% dos itens, e o custo de recusar é
aceito.

**Reconciliação desenhada**, não improvisada: divergência detectada gera cancelamento
automático com cupom de compensação, notificação ao cliente em até 30 minutos, e registro
para a operação da loja. A regra de quem vence em conflito é a ordem de chegada no serviço
central.

**Alarme de tempo de divergência.** Acima de 5 minutos sem sincronizar, o modo endurece.

**Degradação comunicada.** Durante partição, a vitrine indica que a disponibilidade do
estoque pode estar desatualizada.

Resultados após 14 meses:

```text
vendas perdidas por indisponibilidade        ~R$ 180 mil (contra 2,8 milhões)
sobrevendas                                  312 casos
custo total de sobrevenda                    ~R$ 24 mil
sobrevendas em itens exclusivos              0
tempo médio até cancelamento e aviso         11 minutos
```

O saldo líquido foi de cerca de R$ 2,6 milhões por ano, com o risco concentrado onde ele é
barato.

O que se registrou depois: a decisão travou por dois anos porque a discussão era "consistência
ou disponibilidade", em abstrato, e ninguém tinha o custo de recusar. Assim que os dois
números entraram na mesma tabela, a decisão levou uma reunião — e não foi um dos dois lados,
foi a separação por categoria, que ninguém tinha proposto enquanto o dilema era global.

## Conceitos Relacionados

- [Teorema CAP](/06-distributed-systems/cap.md) e
  [PACELC](/06-distributed-systems/pacelc.md).
- [Consistência Forte vs. Eventual](/20-trade-offs/strong-vs-eventual-consistency.md).
- [Resolução de Conflitos](/06-distributed-systems/conflict-resolution.md).
- [Degradação Graciosa](/12-reliability/graceful-degradation.md).

## Exercício Prático

Liste cinco operações do seu sistema e, para cada uma, estime o custo de recusar uma
operação válida e o de aceitar uma inválida.

As operações em que os dois números diferem por ordem de grandeza são as que estão no modo
errado se todas usam o mesmo.

## Perguntas de Entrevista

- Por que a escolha entre consistência e disponibilidade é por operação e não por sistema?
- Por que citar CAP fora de uma partição é erro conceitual?
- O que o PACELC acrescenta que o CAP não cobre?

## Para Aprofundar

- Brewer, Eric. *CAP Twelve Years Later: How the "Rules" Have Changed*. IEEE
  Computer, 2012.
- Abadi, Daniel. *Consistency Tradeoffs in Modern Distributed Database System Design*. 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
