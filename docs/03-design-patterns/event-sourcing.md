---
id: event-sourcing
title: Event Sourcing
sidebar_position: 28
description: Persistir a sequência de fatos em vez do estado — e o custo de versionar eventos para sempre.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece quando o histórico é requisito de negócio e o
  compromisso permanente de versionamento que o padrão impõe.
prerequisites: [cqrs]
related: [cqrs, memento, event-driven]
canonical_for: [event sourcing]
content_version: 1
last_reviewed: 2026-08-26
---

# Event Sourcing

## Visão Geral

Event sourcing persiste a **sequência de eventos** que levou ao estado atual, em
vez do estado. O estado passa a ser derivado: uma função dos eventos.

É [Memento](/03-design-patterns/memento.md) em escala de sistema, e um dos padrões de maior
consequência do catálogo — porque a decisão é irreversível na prática.

## Problema

Persistir apenas o estado atual descarta informação.

Um saldo de R$ 1.200 não diz como chegou lá. Um pedido "cancelado" não diz quando,
por quem, nem qual era seu estado antes. Uma alteração sobrescreve o valor
anterior, e ele deixa de existir.

Para muitos domínios isso é aceitável. Para outros — contabilidade, saúde,
regulação, qualquer sistema em que "por que este valor é este?" precisa ter
resposta — é perda de dado que o negócio exige.

Event sourcing inverte: os eventos são a fonte de verdade, e o estado é uma
projeção.

## Conceitos Centrais

### O evento é imutável e definitivo

Uma vez gravado, um evento nunca é alterado nem removido. Corrigir um erro exige
um **evento compensatório** — o mesmo princípio de um lançamento de estorno em
contabilidade.

Isso é o que dá auditabilidade completa e o que torna o padrão rígido.

### Reconstrução e instantâneos

O estado é obtido reprocessando os eventos desde o início. Com milhares de
eventos por agregado, isso fica caro.

A mitigação é o **instantâneo**: gravar o estado a cada N eventos e reprocessar
apenas a partir dali. É a mesma estratégia híbrida de
[Memento](/03-design-patterns/memento.md), e é praticamente obrigatória em produção.

### Versionamento de evento é permanente

Este é o custo que decide, e o menos discutido antes da adoção.

Eventos gravados há três anos precisam continuar sendo lidos. Quando a estrutura
de um evento muda, o código precisa saber interpretar **todas as versões
anteriores**, para sempre.

Não há migração possível no sentido usual: reescrever eventos antigos destrói a
propriedade de imutabilidade que justificava o padrão.

As estratégias — versionar o tipo, atualizar na leitura, manter um conversor por
versão — todas significam carregar código de compatibilidade indefinidamente.

**A pergunta antes de adotar não é "isso resolve meu problema?". É "estou disposto
a manter compatibilidade de leitura para sempre?"**

### Projeções e consistência eventual

O estado consultável vem de projeções construídas a partir dos eventos —
tipicamente de forma assíncrona, o que traz
[CQRS de nível 3](/03-design-patterns/cqrs.md) e sua consistência eventual.

Projeções podem ser reconstruídas do zero, o que é uma vantagem real: um defeito
numa projeção se corrige reprocessando, sem perda de dado.

## Quando Usar

- O histórico é **requisito de negócio**, não conveniência — auditoria
  regulatória, contabilidade, rastreabilidade legal.
- É preciso responder "qual era o estado em tal data?".
- O negócio precisa de análise temporal sobre como as coisas chegaram ao estado
  atual.
- Novas projeções sobre dados históricos têm valor — reprocessar responde
  perguntas que não existiam quando o dado foi gravado.

## Quando Não Usar

**Quando o histórico não é requisito.** É o caso mais comum. Um registro de
auditoria ao lado do estado resolve a maior parte das necessidades de
rastreabilidade por uma fração do custo.

**Em domínios CRUD.** O padrão adiciona complexidade proporcional ao domínio
inteiro, não à parte que precisa de histórico.

**Quando o time não domina consistência eventual.**

**Quando não há disposição para versionamento permanente.** É o critério que mais
deveria eliminar candidatos e menos é considerado.

**Como padrão do sistema inteiro.** Aplicar a todos os agregados quando dois
precisam é o erro mais caro. Ver o exemplo abaixo.

**Quando exclusão de dados é requisito.** Legislação de proteção de dados que
exige apagar informação pessoal conflita diretamente com eventos imutáveis, e as
soluções — criptografia com descarte de chave, por exemplo — são complexas e
precisam ser projetadas desde o início.

## Alternativas

- **Tabela de auditoria** — grava quem mudou o quê e quando, ao lado do estado.
  Resolve a maioria das necessidades de rastreabilidade.
- **Versionamento temporal de linha** — tabelas com validade, suportadas
  nativamente por alguns bancos.
- **Registro de alterações** — capturar mudanças sem torná-las a fonte de verdade.
- **Event sourcing seletivo** — apenas nos agregados que precisam.

## Trade-offs

| Event sourcing | Estado persistido |
|---|---|
| Histórico completo e auditável | Só o estado atual |
| Estado em qualquer momento passado | Não recuperável |
| Novas projeções sobre o passado | Só o que foi previsto |
| Versionamento de evento permanente | Migração de schema comum |
| Consistência eventual nas consultas | Transacional |
| Exclusão de dados difícil | Trivial |
| Complexidade alta e permanente | Baixa |

## Modos de Falha

**Evento sem versionamento.** Uma mudança de estrutura torna eventos antigos
ilegíveis. É irrecuperável sem reescrever o histórico.

**Reconstrução lenta.** Sem instantâneos, carregar um agregado com dezenas de
milhares de eventos leva segundos.

**Evento com dado demais.** Guardar o estado inteiro em cada evento anula a
economia e agrava o versionamento.

**Evento com dado de menos.** Falta informação para reconstruir, e ela não pode
ser adicionada retroativamente.

**Projeção sem reconstrução automatizada.** Um defeito trava o sistema.

**Conflito com exclusão obrigatória.** Descoberto tarde, é caro.

## Erros Comuns

**Adotar sem requisito de histórico.**

**Aplicar ao sistema inteiro.**

**Não planejar versionamento.**

**Confundir com [arquitetura orientada a eventos](/03-design-patterns/event-driven.md).** Uma é sobre
persistência; a outra sobre comunicação. Podem existir separadamente.

**Não pensar em exclusão de dados pessoais desde o início.**

## Onde ele aparece na prática

**Sistemas contábeis.** O livro-razão é event sourcing por definição, e há
séculos — lançamentos imutáveis, saldo derivado, correção por estorno.

**Controle de versão.** Git armazena a sequência de mudanças; o estado da árvore é
derivado.

**Sistemas de negociação financeira.** Ordens e execuções como eventos, com
exigência regulatória de reconstrução.

**Bancos de dados.** O registro de transações de qualquer banco relacional é event
sourcing usado internamente — replicação e recuperação derivam dele.

A contabilidade é o exemplo mais útil, porque mostra o padrão funcionando por
séculos num domínio onde o histórico é a razão de ser. Onde o histórico é
acessório, a mesma estrutura vira peso.

## Exemplo Real

Uma seguradora adotou event sourcing em toda a plataforma, motivada por uma
exigência regulatória real: sinistros precisam de trilha completa de decisão.

Três anos depois, o balanço.

Onde funcionou: sinistros. A trilha é requisito, auditorias são frequentes, e a
capacidade de responder "qual era o estado desta análise em tal data" já evitou
duas disputas judiciais.

Onde não funcionou: cadastro de corretores, tabelas de produto, configuração de
comissão. Nenhum tem requisito de histórico além de uma tabela de auditoria. Os
três acumularam eventos, versões e conversores de compatibilidade — a estrutura de
`CorretorAtualizado` mudou quatro vezes, e o código carrega quatro leitores.

A migração de volta para estado persistido nesses três módulos levou dois
trimestres, porque os eventos antigos precisavam ser reprocessados para produzir o
estado final e depois descartados — o que exigiu autorização jurídica.

O custo de reverter foi maior que o de nunca ter adotado. É a característica que
torna essa decisão diferente das outras: **event sourcing é caro de abandonar**, e
por isso a decisão de escopo precisa ser tomada com muito mais cuidado que a de
adoção.

## Conceitos Relacionados

- [CQRS](/03-design-patterns/cqrs.md) — quase sempre acompanha.
- [Memento](/03-design-patterns/memento.md) — a mesma ideia em memória.
- [Arquitetura Orientada a Eventos](/03-design-patterns/event-driven.md) — comunicação, não
  persistência.
- [Sagas](/06-distributed-systems/index.md).

## Exercício Prático

Liste os agregados do seu sistema e, para cada um, responda: alguém já perguntou
"como isto chegou a este estado?" ou "qual era o valor em tal data?"

Se a resposta for não, event sourcing não se aplica ali. Se for sim para um ou
dois, considere aplicá-lo apenas neles.

## Perguntas de Entrevista

- Qual o custo permanente que event sourcing impõe?
- Como corrigir um evento gravado com erro?
- Qual a diferença entre event sourcing e arquitetura orientada a eventos?

## Para Aprofundar

- Young, Greg. *Versioning in an Event Sourced System*, 2017 — o problema
  central.
- Fowler, Martin. *Event Sourcing*, 2005.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
