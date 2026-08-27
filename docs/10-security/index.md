---
id: security
title: Arquitetura de Segurança
sidebar_position: 0
description: Segurança como propriedade estrutural — fronteiras, identidade e o que acontece quando cada controle falha.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor modela ameaças de um sistema, desenha fronteiras de
  confiança e escolhe controles a partir do que falha se cada um for burlado.
prerequisites: [system-design]
related: [cloud-architecture, integration-architecture, architecture-governance]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Arquitetura de Segurança

Segurança não é uma camada adicionada no fim. É uma propriedade estrutural, e
estrutura é decidida cedo.

## O problema desta seção

O tratamento mais comum de segurança em arquitetura é uma lista de controles:
criptografe em trânsito, use OAuth2, guarde segredos num cofre. A lista não é
errada — é insuficiente, porque não diz onde estão as fronteiras nem o que
acontece quando um item falha.

O raciocínio arquitetural de segurança parte de outras perguntas. Quais são as
fronteiras de confiança do sistema? O que atravessa cada uma? Quem é o
adversário plausível, e o que ele ganha? Se este controle específico for
burlado, o que ele ainda protege?

A última é a que separa arquitetura de checklist. Um controle cuja falha derruba
tudo não é um controle — é um ponto único de falha com nome de segurança.

## O que você vai encontrar aqui

**Identidade e acesso.** Autenticação, autorização, identidade, OAuth2, OIDC e
JWT. Tratados pelo que garantem e — mais importante — pelo que não garantem.
JWT em particular acumula mais mal-entendidos que qualquer outro item da lista.

**Segredos e criptografia.** Gestão de segredos, criptografia e gestão de
chaves. A chave é o problema difícil; o algoritmo raramente é.

**Fronteiras.** Segurança de rede, Zero Trust e fronteiras seguras. Zero Trust
apresentado como consequência de uma premissa — a rede interna não é confiável —
e não como produto.

**Análise.** Threat modeling e menor privilégio. O método que transforma
segurança de opinião em análise.

**Consequências.** Auditabilidade, proteção de dados e modos de falha de
segurança. O que o sistema consegue provar depois que algo aconteceu.

## Ordem de leitura

Comece por **fronteiras de confiança** e **threat modeling**. São o método;
todo o resto são controles que só fazem sentido dentro dele.

Leia **menor privilégio** logo em seguida. É o princípio com maior retorno por
esforço e o mais frequentemente sacrificado por conveniência de implantação.

**Modos de falha de segurança** é a seção que mais distingue este material de um
checklist. Leia com atenção: descreve o que acontece com o resto do sistema
quando cada controle é burlado.

## Ao terminar

Você produz um modelo de ameaças de um sistema real, com fronteiras, ativos e
adversários nomeados. Consegue justificar cada controle pelo que ele contém em
caso de falha dos outros.

E consegue argumentar contra um controle caro que não reduz risco material —
que é uma conversa tão necessária quanto a inversa.

## Relacionado

[Nuvem](../09-cloud-architecture/index.md) para identidade e rede na prática, e
[Governança](../19-architecture-governance/index.md) para sustentar isso entre
times.
