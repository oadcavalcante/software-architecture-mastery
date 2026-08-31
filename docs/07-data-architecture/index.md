---
id: data-architecture
title: Arquitetura de Dados
sidebar_position: 0
description: Onde o dado mora, quem é dono dele e por que essa é a decisão mais difícil de reverter.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe modelo e armazenamento a partir do padrão de
  acesso, e reconhece a propriedade do dado como decisão organizacional.
prerequisites: [distributed-systems]
related: [integration-architecture, scalability, system-design]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-27
---

# Nível 05 — Arquitetura de Dados

Esta seção trata da decisão mais cara de reverter em qualquer sistema.

## O problema desta seção

Código se reescreve. Um serviço mal desenhado pode ser substituído em algumas
semanas, e o resto do sistema nem percebe se o contrato foi mantido.

Dados não. Um esquema mal modelado carrega anos de registros que precisam
continuar legíveis. Uma escolha de armazenamento errada exige migração com o
sistema no ar. E a decisão sobre **quem é dono de qual dado** determina, na
prática, quais times conseguem trabalhar em paralelo e quais vivem se
bloqueando.

É por isso que arquitetura de dados aparece neste nível e não antes. Ela exige
que você já entenda [falha parcial](/06-distributed-systems/partial-failure.md)
e [consistência](/06-distributed-systems/consistency.md) — porque quase toda
decisão aqui é uma escolha sobre onde pagar esses custos.

## O que você vai encontrar aqui

**Os modelos de armazenamento.** Relacional, documento, chave-valor, colunar e
grafo. Apresentados pelo padrão de acesso que cada um serve bem, não por
categoria de marketing. O termo "NoSQL" recebe um documento próprio justamente
para ser desmontado: ele agrupa tecnologias sem nada em comum além de não serem
relacionais.

**Cargas de trabalho.** OLTP e OLAP, e por que confundi-las é a origem de boa
parte dos problemas de desempenho que se tenta resolver com hardware.

**Plataformas analíticas.** Data warehouse, data lake e lakehouse — o que cada
uma resolve, e o que acontece quando um lake vira depósito sem catálogo.

**Modelagem.** Normalização e desnormalização como decisão consciente e
reversível, com o critério de quando cada uma se paga. Indexação tratada como
decisão de arquitetura, porque índice errado é a causa mais comum de consulta
lenta — e a mais frequentemente confundida com necessidade de escalar.

**Distribuição de dados.** Replicação e particionamento vistos do ângulo do
armazenamento, complementando o tratamento de
[sistemas distribuídos](/06-distributed-systems/index.md). Transações e
consistência no nível do banco: níveis de isolamento e o que cada um permite
acontecer.

**Governança.** Propriedade do dado e ciclo de vida — retenção, arquivamento e
apagamento. Os dois tópicos menos técnicos da seção e os que mais determinam se
o sistema continua sustentável em cinco anos.

## Ordem de leitura

Comece por **OLTP e OLAP**. A distinção organiza tudo o que vem depois, e
escolher armazenamento sem ela é escolher no escuro.

Depois **modelagem**, **normalização** e **desnormalização** — nessa ordem, porque
desnormalizar sem entender o que se está desfazendo produz um esquema que ninguém
consegue evoluir.

**Indexação** pode ser lida a qualquer momento e é a de retorno mais imediato para
quem tem um sistema em produção agora.

Deixe **propriedade do dado** para o fim, e leia com o organograma do seu time em
mente. É o tópico em que a resposta certa depende mais do contexto e menos da
tecnologia.

## Ao terminar

Você escolhe armazenamento a partir do padrão de acesso — como o dado é escrito,
como é lido, com qual frequência e em qual volume — em vez de por familiaridade
ou reputação.

Consegue olhar uma consulta lenta e distinguir problema de índice, de modelo, de
volume e de carga concorrente, que exigem respostas diferentes.

E reconhece quando o problema não é técnico: quando dois times disputam o mesmo
dado porque ninguém decidiu de quem ele é.

## Continua em

[Arquitetura de Integração](/08-integration-architecture/index.md), onde a
questão passa a ser como esses dados atravessam fronteiras de sistema.
