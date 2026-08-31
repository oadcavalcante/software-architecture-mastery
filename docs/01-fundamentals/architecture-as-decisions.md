---
id: architecture-as-decisions
title: Arquitetura como Conjunto de Decisões
sidebar_position: 21
description: O que a arquitetura de fato é — e por que o registro do porquê é a parte que se perde primeiro.
doc_type: foundation
level: 1
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor enxerga uma arquitetura como um conjunto de decisões
  reavaliáveis e sabe o que precisa ser registrado para que continuem sendo.
prerequisites: [architecture-principles]
related: [architecture-evolution, solution-space]
canonical_for: [arquitetura como decisões, decisão arquitetural]
content_version: 1
last_reviewed: 2026-08-26
---

# Arquitetura como Conjunto de Decisões

## Visão Geral

Uma arquitetura não é uma estrutura. É o conjunto de decisões que produziu aquela
estrutura, mais as razões pelas quais cada uma foi tomada.

A estrutura é o resultado observável. As decisões são o que permite mudá-la
deliberadamente, e são o que se perde primeiro.

## O Problema

O que se documenta de uma arquitetura é quase sempre o **o quê**: os componentes,
as conexões, as tecnologias. O **porquê** fica na cabeça de quem decidiu, e sai
junto quando a pessoa sai.

O custo aparece quando o contexto muda. Alguém encontra uma decisão que parece
errada — um serviço separado que poderia ser um módulo, uma desnormalização que
complica, uma tecnologia que ninguém escolheria hoje.

Sem a razão registrada, restam duas opções ruins. Manter por medo, sem saber se a
razão ainda vale. Ou reverter sem saber, e redescobrir a razão original através
de um incidente.

O ponto que este documento defende: **uma decisão cujo contexto se perdeu deixa de
ser decisão e vira restrição.** Ela só pode ser obedecida ou quebrada, nunca
reavaliada.

## Conceitos Centrais

### Uma decisão tem quatro partes

O que precisa sobreviver ao tempo:

**Contexto** — o que era verdade quando a decisão foi tomada. Restrições, escala,
tamanho do time, prazos, o que se sabia e o que não se sabia. É a parte mais
importante e a mais omitida.

**Decisão** — o que foi escolhido.

**Alternativas** — o que mais foi considerado, e **sob qual mudança de contexto
cada uma passaria a vencer**. Essa condição é o que torna a reavaliação futura
barata.

**Consequências** — o que a decisão fecha, o que passa a custar, o que se aceita.

A terceira e a primeira são as que carregam quase todo o valor. Um documento que
registra só a segunda e a quarta descreve a estrutura, não a decisão.

### O contexto é a parte perecível

Estrutura é observável — basta ler o código. Consequências aparecem na operação.
Alternativas podem ser reconstruídas com esforço.

Contexto não. Ninguém consegue reconstruir, dois anos depois, que a empresa tinha
seis engenheiros, que o prazo era regulatório, e que o provedor de nuvem não
oferecia o serviço gerenciado que hoje existe.

É exatamente essa informação que decide se a decisão ainda vale.

### Decisões não se apagam; superam-se

Quando uma decisão muda, o registro antigo não é editado nem removido. É marcado
como superado, com link para o que o substituiu.

O motivo: a decisão antiga explica por que o sistema tem a forma que tem hoje. O
código que existe foi escrito sob ela. Apagá-la torna o presente inexplicável.

### Nem toda decisão merece registro

O critério é o de
[o que é arquitetura](/01-fundamentals/what-is-software-architecture.md): custo de reversão.

Decisões baratas de reverter não precisam de registro — o código é a
documentação suficiente. Decisões caras precisam, porque alguém vai querer
reavaliá-las e não terá como.

## Por Que Isso Importa

**Porque torna a arquitetura reavaliável em vez de apenas herdada.** Sistemas
antigos acumulam decisões que ninguém entende. O time convive com elas ou as
quebra às cegas. Com registro, cada uma pode ser examinada contra o contexto de
hoje.

**Porque transfere conhecimento sem transferir pessoas.** Perguntar a quem estava lá
funciona enquanto essa pessoa estiver por perto e lembrar — o registro é o que
funciona depois disso.

**Porque separa "está errado" de "não vale mais".** São coisas diferentes com
respostas diferentes, e sem contexto registrado não há como distinguir.

**Porque muda o que a revisão de arquitetura discute.** Sem registro, revisar é
opinar sobre estrutura. Com registro, é examinar se as premissas ainda valem —
que é uma conversa com critério.

## Erros Comuns

**Documentar o quê e não o porquê.** O erro central. Diagramas impecáveis, zero
razões.

**Registrar a decisão sem o contexto.** "Escolhemos PostgreSQL" não é registro.
"Escolhemos PostgreSQL porque a equipe tem experiência, o volume previsto cabe em
uma instância, e precisávamos de transações entre agregados" é.

**Omitir alternativas, ou listar espantalhos.** Toda alternativa registrada
precisa da condição sob a qual venceria. Sem isso, não era alternativa real e o
registro simula rigor.

**Editar decisões antigas.** Destrói o histórico e torna o presente inexplicável.

**Registrar tudo.** Registro tem custo de escrita e de manutenção. Aplicado a
decisões triviais, o volume faz ninguém ler nenhuma.

**Escrever o registro depois de decidir, para justificar.** Reconhecível porque o
contexto descrito admite exatamente uma solução. Não serve para reavaliar nada.

## Exemplo Real

Um time herda um sistema em que o serviço de catálogo mantém uma cópia local dos
dados de fornecedores, sincronizada por evento.

A reação inicial é previsível: duplicação de dados, complexidade de
sincronização, risco de divergência. A proposta é consultar o serviço de
fornecedores diretamente.

O registro existia, e continha o contexto:

> *O serviço de fornecedores é operado por outra unidade de negócio, com SLA de
> 99,5% e latência de p99 acima de 2 s. O catálogo tem requisito de p99 de 300 ms
> e disponibilidade de 99,9%. Consultar de forma síncrona subordina o catálogo ao
> SLA do fornecedor, que é uma ordem de grandeza pior.*
>
> *Alternativa descartada: consulta síncrona com cache. Passaria a vencer se o
> SLA do serviço de fornecedores subisse para 99,9% e o p99 caísse abaixo de
> 500 ms.*

O time verificou. O SLA continuava 99,5%; o p99 tinha piorado.

A decisão foi mantida, e a verificação levou vinte minutos.

O contrafactual é o que importa: sem o registro, o time teria feito a mudança —
ela é a mais óbvia e a mais defensável em abstrato — e descoberto o motivo
original através de uma queda do catálogo causada por indisponibilidade de um
serviço de outra área.

## Conceitos Relacionados

- [O que é Arquitetura](/01-fundamentals/what-is-software-architecture.md) — o critério de quais
  decisões merecem registro.
- [Espaço da Solução](/01-fundamentals/solution-space.md) — de onde as alternativas vêm.
- [ADRs](/18-architecture-decisions/index.md) — o formato prático de registro.
- [Evolução da Arquitetura](/01-fundamentals/architecture-evolution.md) — o que acontece quando o
  contexto muda.

## Exercício Prático

Encontre no seu sistema uma decisão estrutural cuja razão ninguém sabe explicar.

Tente reconstruir o contexto: quando foi tomada, quem estava no time, que
restrições existiam, quais alternativas havia. Use git log, tickets antigos,
conversas.

Duas perguntas ao final: quanto tempo levou? E o que você não conseguiu
reconstruir?

O que não se reconstrói é exatamente o que precisaria ter sido escrito.

## Perguntas de Entrevista

- O que precisa ser registrado sobre uma decisão arquitetural?
- Por que o contexto é a parte mais importante e mais omitida?
- O que você faz ao encontrar uma decisão que parece errada e cuja razão ninguém
  conhece?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*, 2011.
- Fowler, Martin. *Who Needs an Architect?* IEEE Software, 2003.
