---
id: security
title: Arquitetura de Segurança
sidebar_position: 0
description: Projetar sistemas que resistem a quem quer quebrá-los — decisões estruturais, não uma camada adicionada no fim.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor trata segurança como propriedade do desenho, com fronteiras
  de confiança explícitas e falhas que fecham em vez de abrir.
prerequisites: [system-design]
related: [cloud-architecture, integration-architecture, reliability]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-28
---

# Nível 05 — Arquitetura de Segurança

Esta seção trata de projetar sistemas que resistem a quem quer quebrá-los.

## O problema desta seção

Segurança é frequentemente tratada como uma etapa: constrói-se o sistema, e depois
alguém faz uma revisão, roda uma varredura e aponta correções.

Isso funciona para uma classe de problema — configuração errada, biblioteca
desatualizada — e não funciona para a que importa. As falhas graves são quase sempre
**estruturais**: uma fronteira de confiança no lugar errado, uma permissão ampla
demais concedida no início, um dado que não deveria estar ali.

Nenhuma varredura encontra isso, porque não é defeito de código. É decisão de
arquitetura.

O segundo problema é de enquadramento. "Segurança" é discutida como se fosse uma
propriedade binária — o sistema é seguro ou não é. Ela é, na prática, um conjunto de
decisões sobre **contra quem**, **protegendo o quê**, e **a que custo** — que é
exatamente a forma de qualquer outro trade-off arquitetural.

## O que você vai encontrar aqui

**Identidade e acesso.** Identidade, OAuth 2.0, OpenID Connect e JWT — os quatro
tratados pelo que resolvem e pelo que costumam ser usados errado. JWT ganha atenção
específica ao problema de revogação, que é onde a maioria das implementações falha.

**Autorização.** Modelos de autorização — por papel, por atributo, por relação — com
o critério para escolher, que raramente é discutido.

**Os princípios que decidem estrutura.** Menor privilégio, fronteiras de confiança
seguras, confiança zero e defesa em profundidade. São eles que determinam o tamanho
do dano quando algo dá errado.

**Segredos e criptografia.** Gestão de segredos, criptografia em trânsito e em
repouso, e gestão de chaves — o tópico onde a intuição mais engana.

**Modelagem de ameaças.** A prática que transforma "vamos pensar em segurança" em
uma lista concreta de decisões. É o documento de maior retorno da seção.

**Proteção de dados e auditabilidade.** O que guardar, como proteger, e como provar
o que aconteceu.

**Modos de falha de segurança.** Como um sistema falha quando falha — e por que
falhar fechado precisa ser decisão consciente.

**Confiança na cadeia de suprimentos.** Dependências, artefatos e esteiras — o vetor
que mais cresceu.

## Ordem de leitura

Comece por **modelagem de ameaças**. Sem ela, os demais documentos viram lista de
boas práticas sem critério de prioridade.

Depois **fronteiras seguras** e **menor privilégio**, nessa ordem. Eles determinam
o alcance de qualquer comprometimento, e são as duas decisões que mais mudam o
resultado de um incidente.

**Identidade**, **OAuth 2.0**, **OpenID Connect** e **JWT** formam um bloco e devem
ser lidos em sequência — os três últimos só fazem sentido sobre o primeiro.

Deixe **criptografia** e **gestão de chaves** juntos para o fim. Eles são densos, e
a lição principal — não implemente você mesmo — é rápida de aceitar e difícil de
respeitar sob pressão.

## Ao terminar

Você desenha fronteiras de confiança explícitas, e sabe dizer o que acontece quando
cada uma é atravessada.

Consegue conduzir uma modelagem de ameaças sobre um desenho e sair com decisões, não
com preocupações.

Reconhece que a pergunta não é "é seguro?", e sim "resiste a quem, protegendo o quê,
e o que acontece quando falhar?".

E entende que a maior parte do trabalho de segurança em arquitetura é **reduzir o
alcance do dano**, não impedir o comprometimento — porque o comprometimento
eventualmente acontece.

## Continua em

[Escalabilidade](/11-scalability/index.md), onde as fronteiras que você desenhou
aqui passam a ser testadas por volume.
