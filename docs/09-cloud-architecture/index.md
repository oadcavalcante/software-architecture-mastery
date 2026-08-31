---
id: cloud-architecture
title: Arquitetura em Nuvem
sidebar_position: 0
description: Projetar sobre infraestrutura que você aluga — onde o custo vira decisão de arquitetura e a falha vira rotina.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta para as garantias que o provedor de fato oferece,
  e trata custo e dependência como decisões arquiteturais explícitas.
prerequisites: [distributed-systems]
related: [integration-architecture, scalability, reliability]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-27
---

# Nível 05 — Arquitetura em Nuvem

Esta seção trata do que muda quando a infraestrutura é alugada e programável.

## O problema desta seção

Nuvem é frequentemente ensinada como catálogo de serviços: este produto faz isto,
aquele faz aquilo. Isso é treinamento de fornecedor, não arquitetura.

O que muda de fato, do ponto de vista de quem projeta, são três coisas.

**A falha deixa de ser exceção.** Uma máquina pode desaparecer a qualquer momento,
por decisão do provedor. Isso não é um risco a mitigar — é o modelo de operação, e
o sistema precisa ser projetado para ele. Ver
[falha parcial](/06-distributed-systems/partial-failure.md).

**O custo vira decisão de arquitetura.** Numa infraestrutura própria, a máquina já
foi comprada e a escolha de desenho não muda a fatura no mês seguinte. Na nuvem,
cada chamada, cada gigabyte transferido e cada segundo de execução aparecem na
conta. Uma decisão ruim de arquitetura tem preço mensal e mensurável.

**A dependência é real e precisa ser escolhida.** Todo serviço gerenciado que você
adota é trabalho que não vai fazer e liberdade que não vai ter. Fingir que essa
troca não existe — dos dois lados — é o que produz tanto o sofrimento de reinventar
o que já existe quanto o de não conseguir sair.

## O que você vai encontrar aqui

**Os modelos de serviço.** IaaS, PaaS e SaaS pelo que cada um transfere de
responsabilidade, não pela sigla. Serviços gerenciados tratados como a decisão
central que são.

**Empacotamento e orquestração.** Contêineres e Kubernetes — este último com a
pergunta que precede a adoção: qual problema concreto ele resolve que você tem
hoje?

**Serverless.** O que ele entrega, e os quatro custos que a apresentação inicial
omite.

**Geografia.** Regiões, zonas de disponibilidade e multi-região. A distinção entre
as duas primeiras é a base de quase toda decisão de disponibilidade, e é
rotineiramente confundida.

**Os blocos.** Rede, identidade, armazenamento e computação em nuvem — cada um pelo
que muda em relação ao equivalente local.

**As decisões que ninguém toma até doer.** Arquitetura de custo, recuperação de
desastre e dependência de fornecedor. São os três documentos que mais mudam o que
se faz na segunda-feira.

**Cloud native.** O termo, o que ele designa de útil, e o que ele virou.

## Ordem de leitura

Comece por **regiões e zonas de disponibilidade**. Sem essa distinção, nenhuma
decisão de disponibilidade faz sentido.

Depois **serviços gerenciados**, que é a decisão econômica e arquitetural central
da seção.

**Arquitetura de custo** pode ser lida a qualquer momento e é a de retorno mais
imediato para quem tem sistema em produção agora.

Deixe **multi-região** e **recuperação de desastre** para o fim, e leia-os juntos —
eles respondem à mesma pergunta com preços muito diferentes.

## Ao terminar

Você projeta assumindo que qualquer componente pode sumir, porque na nuvem ele
pode.

Consegue estimar o custo de uma decisão de arquitetura antes de implementá-la, e
reconhece quando o desenho está caro por motivo estrutural — transferência entre
zonas, chamadas excessivas, dados parados sem política.

E consegue discutir dependência de fornecedor sem os dois extremos: nem adotar
tudo sem pensar, nem abstrair tudo para uma portabilidade que nunca vai ser usada.

## Continua em

[Arquitetura de Segurança](/10-security/index.md), onde as fronteiras que a
nuvem tornou programáveis precisam ser defendidas.
