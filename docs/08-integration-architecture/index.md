---
id: integration-architecture
title: Arquitetura de Integração
sidebar_position: 0
description: Como sistemas conversam entre si, e por que o contrato importa mais que o protocolo.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe estilo de integração a partir do acoplamento
  aceitável e evolui contratos sem quebrar consumidores.
prerequisites: [distributed-systems]
related: [data-architecture, cloud-architecture, enterprise-architecture]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Arquitetura de Integração

Todo sistema de porte real conversa com outros. O que se decide aqui determina
quão independentemente as partes podem evoluir.

## O problema desta seção

A discussão de integração quase sempre começa pelo protocolo — REST ou gRPC,
fila ou chamada direta — como se fosse uma escolha de tecnologia. Não é. É uma
escolha de acoplamento.

Uma chamada síncrona acopla no tempo: se o outro lado está fora, você está fora.
Uma fila desacopla no tempo e acopla no formato da mensagem. Um evento
publicado desacopla dos consumidores e acopla você à estabilidade do próprio
evento, que agora é contrato público.

Nenhuma dessas opções remove acoplamento. Elas escolhem **onde** ele fica. A
pergunta útil não é qual protocolo é melhor, e sim qual acoplamento você
consegue sustentar.

## O que você vai encontrar aqui

**Estilos síncronos.** REST, GraphQL e gRPC. As diferenças que importam de fato
— formato de contrato, evolução, streaming, custo de depuração — em vez da
comparação superficial de desempenho.

**Estilos assíncronos.** Mensageria, arquitetura orientada a eventos e webhooks.
Quando inverter o controle e o que isso cobra em observabilidade.

**Integração em lote.** Batch e integração por arquivo. Frequentemente
descartadas como legado; frequentemente a resposta correta, especialmente entre
organizações.

**Infraestrutura de integração.** API gateways e service mesh. O que cada um
resolve e o que acontece quando viram o lugar onde a lógica de negócio se
esconde.

**Padrões corporativos.** Enterprise integration patterns e anti-corruption
layer — a defesa contra deixar o modelo de outro sistema vazar para dentro do seu.

**Contratos.** Contratos de integração e evolução de schema. Esta é a parte que
determina se a integração sobrevive ao segundo ano.

## Ordem de leitura

Leia **contratos** e **evolução de schema** primeiro, antes de qualquer
protocolo. Todo o resto é consequência de como você pretende versionar e quebrar
compatibilidade.

Depois, síncrono e assíncrono em bloco, para comparar. E **anti-corruption
layer** logo em seguida, porque é o padrão que mais frequentemente falta em
integrações com sistemas que você não controla.

## Ao terminar

Você escolhe estilo de integração declarando qual acoplamento está aceitando e
por quê. Consegue evoluir um contrato sem quebrar consumidores, e sabe dizer
quando quebrar é inevitável e como conduzir isso.

E reconhece, num desenho de integração, o ponto onde uma falha em um sistema vai
derrubar três outros.

## Relacionado

[Sistemas Distribuídos](../06-distributed-systems/index.md) para as garantias de
entrega, e [Confiabilidade](../12-reliability/index.md) para conter a propagação
de falha.
