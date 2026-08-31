---
id: sync-vs-async
title: Síncrono vs. Assíncrono
sidebar_position: 9
description: Assíncrono compra disponibilidade com estado intermediário — e o estado intermediário é trabalho de produto.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe o modo de comunicação pela necessidade de resposta imediata
  e pelo custo da indisponibilidade composta.
prerequisites: [messaging]
related: [consistency-vs-availability, monolith-vs-microservices, strong-vs-eventual-consistency]
canonical_for: [síncrono contra assíncrono, indisponibilidade composta, custo do estado pendente, resposta imediata]
content_version: 1
last_reviewed: 2026-08-29
---

# Síncrono vs. Assíncrono

## Visão Geral

Comunicação síncrona é simples de escrever, simples de depurar e frágil por composição.
Assíncrona é resiliente e transfere complexidade para o produto e para a operação.

```text
eixo real   o chamador precisa da resposta para prosseguir, e o que custa
            ficar indisponível quando a dependência estiver fora?
```

A primeira metade elimina a maior parte dos casos: se a resposta é necessária **agora** para
o usuário decidir, assíncrono não é opção. A segunda decide o resto — e envolve um número
que raramente é calculado: a disponibilidade composta de uma cadeia de chamadas.

## Problema

Cada chamada síncrona multiplica indisponibilidade:

```text
serviço A 99,9% × B 99,9% × C 99,9% × D 99,9%
= 99,6% → cerca de 35 horas por ano fora do ar
```

Quatro dependências, cada uma boa, produzem um resultado ruim. E o efeito é invisível
enquanto cada equipe olha apenas o seu número.

Ver [disponibilidade](/06-distributed-systems/availability.md).

A latência compõe da mesma forma, e pior: ela **soma**, e o p99 de uma cadeia é dominado
pelo pior elo.

```text
A 20 ms + B 40 ms + C 80 ms + D 30 ms = 170 ms no caminho feliz
no p99, com um elo degradado                    > 2 s
```

O erro oposto: tornar assíncrono o que precisa de resposta. Um usuário que precisa saber se
o pagamento foi aceito não é atendido por "processando, avisaremos" — a menos que o produto
seja redesenhado para isso, o que é trabalho real.

## Conceitos Centrais

### O teste primário: a resposta é necessária agora?

```text
consultar saldo antes de mostrar a tela          sim → síncrono
autorizar pagamento na finalização               sim, geralmente
enviar e-mail de confirmação                     não → assíncrono
atualizar índice de busca                        não
recalcular recomendações                         não
reservar item único num leilão                   sim
gerar relatório mensal                           não
```

A pergunta é sobre o **usuário ou o processo chamador**, não sobre o desenho técnico. Se
existe uma decisão que depende da resposta, ela precisa vir.

### Assíncrono cria estado intermediário, e ele é trabalho

```text
pedido "em processamento"      tela, comunicação, expectativa
notificação de conclusão       canal, entrega, idempotência
falha depois da aceitação      como o cliente descobre? o que ele faz?
consulta de status             endpoint, tela, suporte
tempo excedido                 o que acontece com um pedido pendente há 3 dias?
```

Nenhum desses é código de infraestrutura — todos são produto. Ignorá-los é o erro mais comum
da adoção de assíncrono: a arquitetura muda, o produto não, e o usuário fica sem resposta.

Ver [consistência eventual](/06-distributed-systems/eventual-consistency.md).

### Assíncrono quebra o acoplamento de disponibilidade

O ganho principal, em números:

```text
síncrono    A depende de B online agora
            A fica indisponível quando B cai
assíncrono  A aceita, registra, e B processa quando voltar
            A permanece disponível
```

Isso é decisivo quando a dependência é externa e menos confiável que o sistema — um parceiro
com 98,7% de disponibilidade não pode estar no caminho síncrono de um sistema com requisito
de 99,9%.

### Também quebra o acoplamento de escala

```text
síncrono    o pico do chamador vira pico no chamado
assíncrono  a fila absorve; o consumidor processa no seu ritmo
```

Isso permite dimensionar o processamento pela média em vez de pelo pico, com efeito direto
em custo — e é frequentemente o argumento econômico mais forte a favor.

Ver [processamento assíncrono](/11-scalability/async-processing.md).

### O custo operacional é real

```text
fila                  mais um componente a operar, monitorar, dimensionar
acúmulo               alarme, causa, ação
mensagens não processáveis   destino, política, reprocessamento
ordem                 garantida só por partição, se garantida
duplicação            o consumidor precisa ser idempotente
depuração             exige correlação e rastreamento distribuído
```

O item de idempotência é obrigatório e frequentemente esquecido: praticamente todo sistema de
mensageria entrega ao menos uma vez, o que significa duplicatas. Ver
[idempotência](/06-distributed-systems/idempotency.md).

### O híbrido é o arranjo comum

Poucos sistemas são inteiramente de um modo:

```text
aceite síncrono, processamento assíncrono
  o usuário recebe confirmação de recebimento na hora
  a conclusão vem depois

leitura síncrona, escrita assíncrona
  consultas rápidas, gravações enfileiradas

síncrono com prazo curto e alternativa assíncrona
  tenta responder em 300 ms; além disso, aceita e notifica
```

O terceiro padrão captura a maior parte do benefício dos dois lados e é subutilizado.

### Sinais de escolha errada

```text
síncrono demais
  indisponibilidade composta acima do requisito
  p99 dominado por uma dependência
  pico do chamador derrubando o chamado
  falha de serviço secundário impedindo operação principal

assíncrono demais
  usuário sem saber o estado do que pediu
  volume de chamados de suporte perguntando "e o meu pedido?"
  fluxos com estado pendente sem prazo nem expiração
  consultas de status implementadas com sondagem em laço
  depuração dominada por correlacionar mensagens
```

O sinal "chamados de suporte perguntando pelo estado" é o mais confiável do segundo grupo:
ele mede diretamente o custo do estado intermediário mal desenhado.

### Custo de mudar de ideia

```text
síncrono → assíncrono   caro: exige mudar o produto, não só o código
assíncrono → síncrono   caro de outro jeito: reintroduz acoplamento
                        de disponibilidade e de escala
```

A assimetria aqui é pequena, e o que decide é a superfície exposta: se o contrato com o
consumidor já promete resposta imediata, mudá-lo exige coordenar quem consome.

Isso favorece decidir cedo e explicitamente, e registrar o modo escolhido como parte do
contrato — não como detalhe de implementação.

## Modelo Mental

**A resposta é necessária agora?** Se não, o assíncrono compra disponibilidade e escala — ao
preço de um estado intermediário que é trabalho de produto.

## Quando Usar

Prefira **síncrono** quando:

- A resposta é necessária para o chamador prosseguir.
- O fluxo é curto — uma ou duas dependências.
- As dependências são confiáveis e rápidas.
- A operação é uma consulta.
- O produto não comporta estado intermediário.

Prefira **assíncrono** quando:

- A resposta pode vir depois.
- A dependência é externa ou menos confiável.
- Há disparidade grande entre pico e média.
- Há vários consumidores do mesmo evento.
- A operação é demorada por natureza.

## Quando Não Usar

**Assíncrono sem desenhar o estado intermediário.**

**Assíncrono sem idempotência no consumidor.**

**Síncrono em cadeias longas**, sem calcular a disponibilidade composta.

**Síncrono com dependência externa** menos confiável que o requisito.

**Assíncrono para consulta simples** — a complexidade não se paga.

## Alternativas

- **Aceite síncrono com processamento assíncrono** — o híbrido mais comum e frequentemente
  o certo.
- **Prazo curto com alternativa assíncrona** — responde rápido quando dá, aceita quando não.
- **Cache com atualização assíncrona** — leitura síncrona sobre dado mantido em segundo
  plano.
- **Disjuntor com resposta degradada** — mantém o síncrono e trata a falha. Ver
  [disjuntores](/12-reliability/circuit-breakers.md).

A última é a alternativa mais barata quando o problema é apenas resiliência e não escala.

## Trade-offs

| Síncrono | Assíncrono |
|---|---|
| Resposta imediata | Disponibilidade preservada |
| Simples de depurar | Absorve picos |
| Indisponibilidade composta | Estado intermediário a desenhar |
| Latência soma | Latência percebida menor |
| Sem infraestrutura extra | Fila a operar |

| Aceite síncrono + processamento assíncrono | Totalmente assíncrono |
|---|---|
| Usuário recebe confirmação | Menos acoplamento ainda |
| Ainda precisa de notificação | Nenhuma resposta imediata |
| Melhor experiência | Mais simples tecnicamente |

## Modos de Falha

**Cadeia síncrona longa.** Disponibilidade composta abaixo do requisito.

**Estado intermediário não desenhado.** Usuário sem saber o que aconteceu.

**Consumidor não idempotente.** Duplicatas viram efeitos duplicados.

**Pendências sem expiração.** Estado que nunca resolve.

**Sondagem em laço.** Consulta de status implementada como carga.

**Falha silenciosa após aceite.** O pior caso: o sistema aceitou e não entregou.

## Erros Comuns

**Não calcular a disponibilidade composta** de uma cadeia. Cinco dependências síncronas a 99,9% entregam 99,5% ao usuário — e o número de cada uma parecia aceitável isoladamente.

**Adotar assíncrono sem mudar o produto.** O estado intermediário precisa existir na interface e no vocabulário do negócio. Escondê-lo transfere a ambiguidade para o suporte.

**Esquecer idempotência.** Entrega ao menos uma vez é o padrão, e sem proteção cada reentrega repete o efeito.

**Não definir prazo para estado pendente.** Sem expiração, registros ficam pendentes para sempre e ninguém sabe se ainda estão sendo processados ou se morreram.

**Tornar assíncrona uma consulta.** Quem pergunta precisa da resposta agora; assincronia serve para trabalho, não para leitura.

## Exemplo Real

Uma empresa de seguros tinha o fluxo de emissão de apólice totalmente síncrono, atravessando
seis serviços — cadastro, análise de risco, bureau externo, precificação, emissão e
notificação.

Números de 12 meses:

```text
disponibilidade individual dos 5 serviços internos   99,9% a 99,95%
disponibilidade do bureau externo                    98,4%
disponibilidade composta observada                   98,1%
requisito contratual                                 99,5%
p99 da emissão                                       7,2 s
p99,9                                                24 s
emissões perdidas por tempo excedido                 ~3 200/mês
```

O bureau externo, sozinho, respondia por 71% da indisponibilidade.

A mudança foi híbrida, não um giro completo para assíncrono:

**Aceite síncrono.** A proposta é validada e aceita em menos de 400 ms, com número de
protocolo. O cliente recebe confirmação de recebimento imediatamente.

**Análise assíncrona.** Risco, bureau e precificação passaram a rodar em segundo plano, com
repetição e recuo exponencial quando o bureau está fora.

**Consulta síncrona mantida** onde a resposta é necessária: verificação de elegibilidade
básica, que usa apenas dados internos.

**Estado intermediário desenhado como produto**, não como detalhe:

```text
tela de acompanhamento com estados nomeados em linguagem de cliente
prazo declarado: "resposta em até 2 horas; 90% em menos de 5 minutos"
notificação por e-mail e no aplicativo
prazo máximo de 24 h, com escalonamento para atendimento humano
motivo de recusa explicado, não apenas "não aprovado"
```

**Consumidores idempotentes** com chave por protocolo.

**Alarme de acúmulo** com endurecimento automático: acima de 30 minutos de fila, novas
propostas recebem aviso de prazo estendido.

Resultados após 10 meses:

```text
disponibilidade do fluxo de aceite                   99,93%
emissões perdidas por tempo excedido                 ~40/mês
tempo até resposta final, p50                        90 s
p90                                                  4 min
p99                                                  38 min
chamados de suporte perguntando pelo estado          picos nos 2 primeiros meses,
                                                     estabilizando em -60% após
                                                     ajustes na tela de acompanhamento
```

Os chamados de suporte são o dado que a equipe destaca. Nos primeiros dois meses, eles
**subiram** — o estado intermediário existia e a comunicação não era clara o suficiente. A
correção foi de produto: nomes de estado em linguagem do cliente, prazo explícito e
notificação proativa.

A avaliação posterior aponta: a parte técnica da migração levou seis semanas. A parte de produto —
telas, textos, prazos, escalonamento, comunicação de recusa — levou quatro meses e não tinha
sido estimada. Ela é o custo real de tornar um fluxo assíncrono, e é o que a decisão precisa
prever.

## Conceitos Relacionados

- [Mensageria](/06-distributed-systems/messaging.md) e
  [Idempotência](/06-distributed-systems/idempotency.md).
- [Disponibilidade](/06-distributed-systems/availability.md) — a composição.
- [Consistência Forte vs. Eventual](/20-trade-offs/strong-vs-eventual-consistency.md).
- [Processamento Assíncrono](/11-scalability/async-processing.md).

## Exercício Prático

Escolha um fluxo do seu sistema e multiplique a disponibilidade de todas as dependências
síncronas no caminho.

Compare com o requisito. A diferença é o que a cadeia custa, e ela quase nunca é calculada.

## Perguntas de Entrevista

- Por que quatro dependências de 99,9% não produzem 99,9%?
- Por que tornar um fluxo assíncrono é majoritariamente trabalho de produto?
- Quando o híbrido "aceite síncrono, processamento assíncrono" é preferível aos dois
  extremos?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
