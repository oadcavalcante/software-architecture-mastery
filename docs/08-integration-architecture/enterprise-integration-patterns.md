---
id: enterprise-integration-patterns
title: Enterprise Integration Patterns
sidebar_position: 11
description: O vocabulário que descreve o que roteadores, tradutores e agregadores fazem — independente de tecnologia.
doc_type: reference
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor nomeia com precisão as peças de um fluxo de integração e
  reconhece qual padrão resolve qual problema.
prerequisites: [messaging-integration]
related: [messaging-integration, event-driven-integration, integration-anti-corruption]
canonical_for: [enterprise integration patterns, roteador de mensagens, tradutor de mensagens, agregador, separador]
content_version: 1
last_reviewed: 2026-08-27
---

# Enterprise Integration Patterns

## Visão Geral

O catálogo de *Enterprise Integration Patterns*, de Hohpe e Woolf, nomeia as peças
recorrentes de fluxos de integração assíncrona.

Ele tem mais de vinte anos e continua válido porque descreve **problemas**, não
tecnologias. Os nomes que ele fixou — roteador, tradutor, agregador, separador —
são o vocabulário com que se discute integração sem falar de produto.

Este documento é uma referência: o que cada padrão relevante resolve, e onde ele
custa. Não é para ser lido de uma vez.

## Por que o vocabulário importa

Sem nomes, discussões de integração viram descrição de implementação: "aí a gente
lê da fila, olha o campo tipo, e manda pra uma de três filas".

Com nomes: "é um roteador por conteúdo".

A economia não é de palavras. É que o nome carrega os modos de falha conhecidos —
quem diz "agregador" já sabe que precisa decidir o critério de conclusão e o
tempo limite.

## Canais

Como as mensagens trafegam.

**Canal ponto a ponto.** Uma mensagem, um consumidor. É a fila. Distribui
trabalho.

**Canal publicar-assinar.** Uma mensagem, todos os assinantes. É o tópico.
Notifica.

**Canal de mensagens inválidas.** Destino para mensagens que não podem ser
interpretadas — formato quebrado, esquema desconhecido. Distinto do próximo.

**Canal de mensagens mortas.** Destino para mensagens válidas que falharam no
processamento. Ver
[filas de mensagens mortas](../06-distributed-systems/dead-letter-queues.md).

A distinção entre os dois últimos é útil e raramente feita: mensagem que **não se
entende** e mensagem que **não se conseguiu processar** exigem tratamento
diferente — a primeira é problema de contrato, a segunda de execução.

**Canal garantido.** Persiste a mensagem antes de confirmar o recebimento.

## Roteamento

Como a mensagem chega a quem deve tratá-la.

**Roteador por conteúdo.** Examina a mensagem e escolhe o destino. É o padrão mais
usado, e o que mais acumula regra de negócio — vale a mesma vigilância descrita em
[API gateways](api-gateways.md).

**Filtro.** Descarta o que não interessa àquele consumidor.

**Separador.** Quebra uma mensagem composta em várias. Um pedido com cinco itens
vira cinco mensagens.

**Agregador.** O inverso: junta várias mensagens em uma. É o padrão com mais
decisões a tomar:

```text
correlação   como saber que estas mensagens formam um conjunto
conclusão    quando o conjunto está completo — contagem, tempo, sinal
tempo limite o que fazer se nunca completar
ordem        importa a ordem de chegada
```

A terceira linha é a que se esquece, e o resultado é um agregador que segura
conjuntos incompletos para sempre, consumindo memória.

**Sequenciador.** Restaura a ordem de mensagens que chegaram fora de sequência. Ver
[ordenação](../06-distributed-systems/ordering.md) — inclusive o custo de buffer e
o prazo de lacuna.

**Lista de destinatários.** Envia a mesma mensagem para uma lista calculada.

**Distribuir-reunir.** Envia para vários processadores e reúne as respostas.
Combina lista de destinatários com agregador, e herda os problemas dos dois.

## Transformação

Como a mensagem muda de forma.

**Tradutor de mensagens.** Converte de um formato para outro. É a peça de
[anti-corruption layer](integration-anti-corruption.md).

**Enriquecedor.** Acrescenta dados buscados em outro lugar. O custo escondido: ele
introduz uma dependência síncrona no meio de um fluxo assíncrono — se a fonte de
enriquecimento cai, o fluxo para.

**Filtro de conteúdo.** Remove campos. Útil para não propagar dado sensível
adiante.

**Normalizador.** Converte mensagens de formatos diferentes para um formato
comum. É o que permite tratar quatro fornecedores com um só processamento.

**Loja-armário.** Guarda o corpo grande num armazenamento e passa apenas a
referência na mensagem. Resolve o limite de tamanho de mensagem, e introduz a
necessidade de gerenciar o ciclo de vida do que ficou guardado.

## Pontos de extremidade

Como aplicação e canal se conectam.

**Consumidor concorrente.** Vários consumidores na mesma fila, para escalar. Exige
que a ordem não importe.

**Despachante de mensagens.** Um consumidor lê e distribui para trabalhadores
internos.

**Consumidor seletivo.** Consome apenas mensagens que casam com um critério.

**Consumidor idempotente.** Detecta e descarta duplicatas. Ver
[mensagens duplicadas](../06-distributed-systems/duplicate-messages.md).

**Ativador de serviço.** Conecta um canal a um serviço que não conhece mensageria.

## Gestão

Como se enxerga o que está acontecendo.

**Histórico de mensagem.** A mensagem carrega por onde passou. Útil para depurar e
para detectar ciclos.

**Repositório de mensagens.** Cópia de todas as mensagens, para auditoria e
reprocessamento.

**Bisbilhoteiro.** Um consumidor extra que observa sem interferir.

**Mensagem de teste.** Injetar mensagens sintéticas periodicamente para verificar
que o fluxo está vivo — o equivalente a monitorar ausência descrito em
[integração em lote](batch-integration.md).

## Quando usar este catálogo

- Ao desenhar um fluxo com mais de dois passos.
- Ao discutir integração com outro time — o vocabulário comum economiza reunião.
- Ao revisar um fluxo existente, para nomear o que está lá.
- Ao avaliar ferramentas: elas implementam esses padrões com nomes próprios.

## Quando não usar

**Como catálogo a implementar.** Não é lista de recursos a ter. Cada padrão é
resposta a um problema; sem o problema, é complexidade.

**Para fluxos simples.** Uma fila entre dois serviços não precisa de vocabulário.

**Como justificativa para ferramenta de integração.** As plataformas que
implementam o catálogo inteiro costumam trazer, junto, uma linguagem de
configuração própria e um ponto central que acumula regra de negócio.

**Sem os fundamentos.** Estes padrões pressupõem
[idempotência](../06-distributed-systems/idempotency.md), tratamento de
duplicatas e monitoramento de consumidor. Sem isso, nenhum deles funciona.

## Erros Comuns

**Agregador sem tempo limite.**

**Enriquecedor criando dependência síncrona** num fluxo que deveria ser
assíncrono.

**Roteador acumulando regra de negócio.**

**Separador sem correlação.** As partes se perdem e não há como reunir.

**Confundir mensagem inválida com mensagem morta.**

**Implementar o catálogo em vez de resolver o problema.**

## Exemplo Real

Uma distribuidora recebia pedidos de quatro canais — portal, aplicativo, EDI de
grandes clientes e planilha por e-mail — com formatos completamente diferentes.

O processamento era um serviço com condicionais por canal, 3.000 linhas, que
ninguém queria tocar.

A reescrita usou o vocabulário do catálogo, e o ganho principal foi de clareza:

**Normalizador por canal.** Quatro tradutores, cada um convertendo para um formato
interno de pedido. As condicionais desapareceram.

**Separador.** O pedido normalizado vira uma mensagem por item, porque a
disponibilidade é verificada por item.

**Enriquecedor.** Cada item recebe dados de produto e preço.

**Agregador.** As respostas dos itens são reunidas de volta num pedido, com
critério de conclusão por contagem e tempo limite de 30 segundos.

**Roteador por conteúdo.** Pedido completo segue para faturamento; pedido com item
indisponível segue para tratamento comercial.

Dois problemas apareceram, e ambos eram os modos de falha conhecidos dos padrões:

**Agregador sem tempo limite.** A primeira versão esperava todos os itens
indefinidamente. Um item cujo enriquecimento falhava fazia o pedido inteiro ficar
preso. Depois de três dias havia 1.200 pedidos travados em memória. O tempo limite
de 30 segundos com tratamento de conjunto incompleto resolveu.

**Enriquecedor derrubando o fluxo.** O serviço de preços ficou lento, e como o
enriquecimento era síncrono, toda a fila parou. Corrigido com timeout, cache e um
caminho alternativo que usa o último preço conhecido, marcando o item para
revisão.

O que a equipe registra: os dois problemas estão descritos no livro, com esses
nomes, há vinte anos. Ter usado o vocabulário na fase de desenho teria feito
alguém perguntar "qual o critério de conclusão do agregador?" antes de a
implementação existir.

## Conceitos Relacionados

- [Integração por Mensageria](messaging-integration.md) — a base.
- [Integração Orientada a Eventos](event-driven-integration.md).
- [Anticorrupção na Integração](integration-anti-corruption.md) — o tradutor.
- [Ordenação](../06-distributed-systems/ordering.md) — o sequenciador.

## Exercício Prático

Pegue o fluxo de integração mais complexo do seu sistema e nomeie cada passo com
os padrões deste documento.

Onde um passo não tiver nome, provavelmente ele faz duas coisas — e separá-lo é a
próxima refatoração.

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley,
  2003 — a referência.
- [enterpriseintegrationpatterns.com](https://www.enterpriseintegrationpatterns.com)
  — o catálogo online, com os diagramas.
- Hohpe, Gregor. *Conversation Patterns*, 2017 — a continuação sobre fluxos de
  longa duração.
