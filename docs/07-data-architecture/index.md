---
id: data-architecture
title: Arquitetura de Dados
sidebar_position: 0
description: Onde os dados moram, quem é dono deles e por que essa é a decisão mais cara de reverter.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe modelo e tecnologia de armazenamento a partir do
  padrão de acesso e das garantias exigidas, e sabe o que a escolha custa depois.
prerequisites: [distributed-systems]
related: [scalability, integration-architecture, system-design]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Arquitetura de Dados

De todas as decisões arquiteturais, as de dados são as mais caras de reverter.
Código se reescreve num trimestre. Um modelo de dados errado, com anos de
histórico em produção e dez consumidores acoplados a ele, se arrasta por anos.

## O problema desta seção

A escolha de banco de dados costuma ser feita pelo motivo errado: familiaridade
do time, moda do setor, ou uma característica isolada que impressionou. Depois,
o sistema é moldado à ferramenta em vez do contrário.

A escolha correta parte de outro lugar: qual é o padrão de acesso, quais
garantias transacionais o negócio exige, quanto dado existe, quão rápido cresce
e quem mais precisa lê-lo. Respondidas essas perguntas, a lista de candidatos
costuma ter uma ou duas opções — e a familiaridade do time vira, aí sim, um
critério de desempate legítimo.

A segunda armadilha é confundir armazenamento com propriedade. Dois serviços
compartilhando uma tabela estão acoplados por ela, com todo o custo de
acoplamento e nenhum contrato explícito.

## O que você vai encontrar aqui

**Modelos de armazenamento.** Relacional, documento, chave-valor, colunar e
grafo. Cada um a partir do padrão de acesso que o justifica, com os casos em que
a escolha popular é a errada.

**Cargas de trabalho.** OLTP e OLAP, e por que misturar as duas na mesma
instância é o problema de desempenho mais comum em sistemas de porte médio.

**Plataformas analíticas.** Data warehouses, data lakes e lakehouses — o que
cada arranjo resolve e a complexidade operacional que traz junto.

**Modelagem.** Normalização, desnormalização e indexação. Desnormalizar é uma
decisão arquitetural com custo de escrita e de consistência, não um truque de
desempenho.

**Distribuição.** Replicação e particionamento aplicados a dados, retomando o
[Nível 04](../06-distributed-systems/index.md) sob a ótica de quem modela.

**Garantias.** Transações e os níveis de isolamento reais — que quase nunca são
o que a documentação sugere à primeira leitura.

**Governança.** Propriedade de dados e ciclo de vida: quem escreve, quem lê,
quanto tempo fica, quando é apagado.

## Ordem de leitura

Comece por **padrões de acesso** e **OLTP versus OLAP**. São o filtro que
elimina a maior parte das opções antes de discutir tecnologia.

Leia **propriedade de dados** cedo, não no fim. É o conceito que impede a
arquitetura de virar um banco compartilhado com microsserviços em volta.

**Transações** e **níveis de isolamento** merecem leitura atenta mesmo para quem
já usa banco relacional há anos. É a área em que a intuição mais frequentemente
está errada.

## Ao terminar

Você consegue justificar uma escolha de armazenamento por escrito, com o padrão
de acesso e a garantia exigida como premissas. Consegue apontar quando uma
desnormalização se paga e quando ela só antecipou um problema de consistência.

E consegue reconhecer o momento em que a resposta certa é não introduzir um
segundo banco de dados.

## Relacionado

[Escalabilidade](../11-scalability/index.md) para quando o volume é o problema,
e [Integração](../08-integration-architecture/index.md) para quando o dado
precisa atravessar uma fronteira.
