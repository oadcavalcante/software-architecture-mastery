---
id: reliability-basics
title: Fundamentos de Confiabilidade
sidebar_position: 2
description: O que confiabilidade é, o que ela não é, e por que ela é propriedade do sistema, não das partes.
doc_type: foundation
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue confiabilidade de disponibilidade e raciocina sobre
  falha como caso normal.
prerequisites: [reliability]
related: [availability-metrics, fault-tolerance, resilience]
canonical_for: [confiabilidade, falha e defeito, taxa de falha, confiabilidade do sistema]
content_version: 1
last_reviewed: 2026-08-28
---

# Fundamentos de Confiabilidade

## Visão Geral

Confiabilidade é a capacidade de um sistema **continuar entregando o serviço correto**
ao longo do tempo, mesmo quando partes dele falham.

A definição contém duas coisas que a distinguem de disponibilidade:

**Correto.** Um sistema que responde rápido e devolve dados errados não é confiável,
por mais disponível que esteja.

**Ao longo do tempo.** Confiabilidade é uma propriedade sustentada, não um estado
instantâneo.

## Por Que Isso Importa

A confusão entre confiabilidade e disponibilidade leva a investimento no lugar errado.

Um sistema pode estar 99,99% disponível e ser pouco confiável: ele responde, e uma
fração das respostas está errada. Nenhuma métrica de disponibilidade captura isso, e é
o tipo de problema que corrói a confiança do usuário mais rápido que indisponibilidade.

E há uma consequência de desenho: perseguir disponibilidade sem correção leva a
degradações que produzem resultado errado — servir dado velho onde ele não pode ser
velho, aceitar operação sem verificar o que precisava ser verificado. Ver
[degradação graciosa](graceful-degradation.md).

## Conceitos Centrais

### Falta, erro e falha são coisas diferentes

A terminologia clássica, que organiza o raciocínio:

```text
falta   a causa — um defeito no código, um disco com problema
erro    o estado incorreto que a falta produz — um valor errado na memória
falha   o serviço entregue incorretamente — o usuário vê o problema
```

A cadeia nem sempre se completa: uma falta pode nunca ser ativada; um erro pode ser
detectado e corrigido antes de virar falha.

O trabalho de confiabilidade age nos três pontos:

```text
prevenir falta      revisão, testes, tipos, verificação
tolerar erro        redundância, verificação de integridade, validação
conter falha        degradação, isolamento, recuperação rápida
```

A maior parte do esforço de engenharia vai para o primeiro. O maior retorno costuma
estar no terceiro, porque ele funciona para faltas que ninguém previu.

### A confiabilidade do sistema não é a das partes

Um sistema pode ser mais confiável que seus componentes — se ele tolera a falha deles.
E pode ser menos, se a falha de qualquer um o derruba.

```text
sem tolerância   confiabilidade = produto das partes → sempre menor
com tolerância   confiabilidade > qualquer parte individual
```

Essa é a contribuição da arquitetura: transformar componentes falíveis num sistema que
não falha junto. Ver [tolerância a falhas](fault-tolerance.md).

A recíproca é o modo de falha mais comum em sistemas distribuídos: dezenas de serviços
individualmente bons, compondo um sistema pior que qualquer um deles, porque nada
tolera a falha de nada.

### Falha é o caso normal

Numa escala suficiente, algo está sempre falhando: um disco, uma instância, uma
conexão, uma dependência.

Isso muda a postura de projeto: em vez de "o que fazemos se falhar", a pergunta é "o
que fazemos **quando** falhar" — e a resposta precisa estar no desenho, não no
procedimento de emergência.

Ver [falha parcial](../06-distributed-systems/partial-failure.md).

### As categorias de falha

Reconhecê-las orienta o tipo de proteção:

```text
parada          o componente para de responder — a mais fácil de tratar
omissão         responde a algumas requisições, não a outras
temporização    responde fora do prazo — a mais danosa na prática
resposta errada devolve resultado incorreto — a mais difícil de detectar
bizantina       comportamento arbitrário, possivelmente malicioso
```

A dificuldade cresce na lista. Redundância trata bem a primeira; a quarta exige
verificação semântica — comparar resultados, validar invariantes — que raramente
existe.

E a terceira é a que mais causa incidentes: dependências raramente param, elas ficam
lentas. Ver [circuit breakers](circuit-breakers.md).

### Complexidade é inimiga da confiabilidade

Mais componentes, mais interações, mais modos de falha.

Isso cria uma tensão real com as técnicas desta seção: redundância, failover, circuit
breakers e bulkheads adicionam complexidade — e complexidade adiciona falha.

Um sistema com quatro camadas de proteção mal configuradas pode ser menos confiável que
um simples e bem operado.

O critério: cada mecanismo precisa ser exercitado e observável. Um mecanismo que não é
verificado é complexidade sem benefício. Ver
[engenharia do caos](chaos-engineering.md).

### A operação faz parte

Confiabilidade não é só propriedade do software. Ela depende de:

```text
implantação      gradual, reversível
observabilidade  detectar antes do usuário
procedimentos    ensaiados, atualizados
pessoas          sobreaviso sustentável, conhecimento distribuído
```

Um sistema tecnicamente bom, operado por um time exausto e sem procedimentos, é menos
confiável que um sistema mediano bem operado.

Esse é o componente que a arquitetura influencia indiretamente — e que aparece na
maioria dos post-mortems.

## Erros Comuns

**Confundir confiabilidade com disponibilidade.** Responder rápido e errado não é
confiável.

**Investir só em prevenção.** As faltas não previstas continuam existindo.

**Presumir falhas de parada.** As de temporização são mais comuns e mais danosas.

**Adicionar mecanismos sem exercitá-los.** Complexidade sem benefício.

**Ignorar o componente operacional.**

**Tratar falha como exceção.** Em escala, ela é rotina.

## Exemplo Real

Uma plataforma de análise de crédito tinha disponibilidade de 99,97% e um problema que
nenhuma métrica capturava.

Um serviço de consulta a bureaus tinha uma condição de corrida rara: sob concorrência
alta, ele ocasionalmente associava a resposta de uma consulta ao pedido errado.

O resultado: cerca de 1 em 4.000 análises recebia o histórico de crédito de outra
pessoa. O sistema respondia rápido, com código de sucesso, e o dado estava errado.

Isso durou catorze meses. Foi descoberto quando um cliente contestou uma negativa e a
auditoria comparou os dados.

Nenhum indicador de disponibilidade mudou durante todo o período — porque não havia
erro, havia resposta incorreta.

As correções:

**Verificação de correlação.** Toda resposta passou a carregar o identificador do
pedido, verificado antes de usar. A condição de corrida deixou de ser silenciosa.

**Validação de invariante.** Verificações semânticas — o documento da resposta
corresponde ao consultado, a data de nascimento é plausível — aplicadas antes de
processar.

**Indicador de correção**, além dos de disponibilidade: proporção de análises com dados
consistentes, verificada por amostragem contra a fonte.

**Trilha de auditoria** com o dado bruto recebido, permitindo reconstruir o que
aconteceu. Ver
[auditabilidade](../10-security/auditability.md).

E, na origem, a condição de corrida foi corrigida — o que era o trabalho mais simples
dos cinco.

O que a equipe registra: eles mediam disponibilidade em quatro pontos e correção em
nenhum. O sistema estava, pelos números, entre os mais confiáveis da empresa.

## Conceitos Relacionados

- [Métricas de Disponibilidade](availability-metrics.md).
- [Tolerância a Falhas](fault-tolerance.md).
- [Resiliência](resilience.md).
- [Falha Parcial](../06-distributed-systems/partial-failure.md).

## Exercício Prático

Pergunte, sobre o seu sistema: existe alguma métrica que detectaria se ele passasse a
devolver respostas erradas, mantendo latência e código de sucesso?

Se não existir, você mede disponibilidade e não confiabilidade.

## Perguntas de Entrevista

- Qual a diferença entre confiabilidade e disponibilidade?
- Qual a diferença entre falta, erro e falha, e como cada uma é tratada?
- Por que falha de temporização é mais danosa que falha de parada?

## Para Aprofundar

- Avizienis, Algirdas et al. *Basic Concepts and Taxonomy of Dependable and Secure
  Computing*. IEEE TDSC, 2004.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
