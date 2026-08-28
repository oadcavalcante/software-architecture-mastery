---
id: architecture-descriptions
title: Descrições de Arquitetura
sidebar_position: 10
description: O documento que reúne tudo — quando ele serve e quando é teatro de conformidade.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor sabe produzir uma descrição de arquitetura completa e sabe
  reconhecer quando ela não deveria existir.
prerequisites: [architecture-views]
related: [architecture-views, documentation-standards, documentation-principles]
canonical_for: [descrição de arquitetura, arc42, documento de arquitetura, ISO 42010]
content_version: 1
last_reviewed: 2026-08-29
---

# Descrições de Arquitetura

## Visão Geral

Uma descrição de arquitetura é o **artefato consolidado** que reúne as
[visões](architecture-views.md), as decisões, as restrições e a justificativa de um
sistema num único lugar.

É o formato mais completo de documentação arquitetural, e o de pior reputação — porque a
maior parte das descrições produzidas na indústria é escrita para satisfazer um processo,
não para ser lida.

A distinção entre uma descrição útil e teatro de conformidade é observável: **a útil é
consultada**.

## Problema

Diagramas isolados respondem a perguntas pontuais e deixam lacunas grandes:

```text
por que o sistema é assim, e não de outro jeito?
que restrições moldaram estas escolhas?
que alternativas foram descartadas, e por quê?
que qualidades ele precisa ter, com quais números?
o que já se sabe que está errado?
```

Nenhum diagrama responde a isso. A justificativa é textual por natureza, e é o que mais
se perde quando as pessoas que decidiram saem.

Ao mesmo tempo, o remédio tradicional — um documento grande e formal — falha por outro
motivo: ele é escrito uma vez, no início, quando menos se sabe, e nunca revisado.

## Conceitos Centrais

### O que uma descrição precisa conter

Independentemente do formato:

```text
escopo e contexto      o que o sistema faz e o que está fora
interessados           quem se importa, com o quê
restrições             o que não é negociável, e de onde vem
qualidades exigidas    com números, não adjetivos
visões                 as representações escolhidas
decisões               o que foi decidido e por quê
riscos e dívidas       o que se sabe que está errado
```

Os dois últimos são os que mais faltam e os que mais valem. Uma descrição que só afirma
acertos não é confiável.

Ver [atributos de qualidade](../01-fundamentals/quality-attributes.md) para o item de
qualidades — "o sistema deve ser escalável" não é um requisito.

### arc42

O arc42 é um gabarito de doze seções, gratuito e amplamente usado:

```text
1  introdução e objetivos      7  visão de implantação
2  restrições                  8  conceitos transversais
3  contexto e escopo           9  decisões
4  estratégia da solução      10  requisitos de qualidade
5  visão de blocos            11  riscos e dívida técnica
6  visão de execução          12  glossário
```

O valor está menos na lista e mais em duas propriedades: ele **força** as seções que as
pessoas pulam — restrições, decisões, riscos, glossário — e permite que seções vazias
sejam declaradas vazias, o que é informação.

A seção 11 é a que mais distingue uma descrição honesta de uma peça de conformidade.

### ISO/IEC/IEEE 42010

A norma não prescreve formato. Ela define o vocabulário e as regras de consistência:

```text
uma descrição atende a interessados identificados
cada visão governada por um ponto de vista declarado
cada ponto de vista cobre preocupações declaradas
a justificativa é parte da descrição
inconsistências entre visões precisam ser registradas
```

O item mais útil na prática é o último: a norma admite que visões vão divergir, e exige
que a divergência seja **registrada em vez de escondida**.

### Justificativa é o conteúdo mais durável

Estrutura muda; a razão de ter escolhido uma estrutura permanece relevante mesmo depois de
a estrutura mudar — porque ela informa se a mudança contradiz uma restrição real.

```text
"escolhemos X"                     envelhece
"escolhemos X porque Y e Z"        continua informando
"descartamos W porque V"           evita revisitar
```

Este é o argumento para [ADRs](../18-architecture-decisions/index.md), e a razão de a
descrição consolidada apontar para elas em vez de duplicá-las.

### Escrever depois, não antes

O padrão que funciona: a descrição é **escrita ou revisada depois** de o sistema existir,
descrevendo o que é, com as decisões registradas ao longo do caminho.

Uma descrição escrita antes da construção é uma proposta, e vale como tal — desde que seja
rotulada assim e revisada depois.

O anti-padrão clássico é o documento aprovado no início do projeto, arquivado, e nunca
comparado com o que foi construído.

### Uma por sistema, não por projeto

Descrições organizadas por projeto se multiplicam e envelhecem: três projetos no mesmo
sistema produzem três documentos, cada um descrevendo um momento.

A descrição pertence ao **sistema**, tem dono, e é atualizada por qualquer projeto que a
afete. Ver [padrões de documentação](documentation-standards.md).

## Modelo Mental

**O documento que responde "por quê", não só "o quê".** Se ele não tem riscos e decisões
descartadas, é publicidade.

## Quando Usar

- Em sistemas de vida longa, com rotatividade de equipe.
- Em ambientes regulados, onde a descrição é exigida.
- Ao transferir um sistema entre times ou fornecedores.
- Em sistemas complexos o suficiente para que a justificativa se perca.
- Como consolidação de documentos que já existem, não como esforço inicial.

## Quando Não Usar

**Antes de construir**, como documento aprovado e arquivado.

**Por projeto**, em vez de por sistema.

**Para satisfazer um processo**, sem leitor identificado.

**Em sistemas pequenos** — um README bem feito é a descrição.

**Duplicando o que já existe** em ADRs e diagramas, em vez de apontar.

**Sem dono nem cadência de revisão** — nasce com prazo de validade.

## Alternativas

- **Conjunto de ADRs** — a justificativa, incremental, sem documento consolidado.
- **README estruturado** — para sistemas pequenos, cinco seções bastam.
- **[Visões](architecture-views.md) avulsas** — quando só a estrutura importa.
- **Página de entrada com índice** — a descrição como um índice para artefatos que já
  existem, sem conteúdo próprio.

A última é frequentemente a melhor: a descrição consolidada como **navegação**, não como
repositório de texto duplicado.

## Trade-offs

| Descrição consolidada | ADRs avulsas |
|---|---|
| Visão completa | Incremental |
| Custo alto de manutenção | Baixo |
| Um lugar para entrar | Espalhado |
| Envelhece como bloco | Cada uma é datada |

| Gabarito formal | Formato livre |
|---|---|
| Força seções esquecidas | Ajustado |
| Comparável entre sistemas | Mais curto |
| Convida a preencher por dever | Convida a omitir |

## Modos de Falha

**Escrita para aprovação.** Nunca comparada com o construído.

**Sem riscos nem dívidas.** Sinal de que não é honesta.

**Duplicando ADRs.** Duas fontes que divergem.

**Por projeto.** Multiplicação de retratos.

**Qualidades sem números.** "Escalável", "seguro", "confiável".

**Sem dono.** Ninguém atualiza.

## Erros Comuns

**Preencher todas as seções do gabarito** por completude, incluindo as que não se aplicam
— em vez de declará-las vazias.

**Omitir alternativas descartadas.**

**Escrever no início e nunca revisar.**

**Não datar seções individualmente.**

**Consolidar por cópia** em vez de por referência.

## Exemplo Real

Uma instituição financeira exigia descrição de arquitetura completa para todo sistema
antes da entrada em produção, em formato próprio de 40 páginas.

Uma revisão do processo, provocada por um incidente em que a descrição existente
contradizia o sistema real, mediu:

```text
descrições existentes                          61
atualizadas nos últimos 24 meses                9
com seção de riscos preenchida                 14
com alternativas descartadas registradas        7
com qualidades expressas em números            11
consultadas ao menos uma vez em 12 meses       17
```

O padrão era consistente: as descrições eram produzidas para o comitê de aprovação, e o
comitê verificava a existência das seções, não o conteúdo. Seções eram preenchidas com
texto genérico que passava na verificação.

Uma frase encontrada em 23 das 61 descrições, palavra por palavra: "o sistema foi
projetado para atender aos requisitos de desempenho e disponibilidade da instituição".

A reformulação:

**Formato substituído por arc42**, com autorização explícita para declarar seções não
aplicáveis — o que reduziu a extensão média de 40 para 14 páginas.

**Decisões movidas para ADRs**, referenciadas pela descrição em vez de copiadas. Ver
[decisões de arquitetura](../18-architecture-decisions/index.md).

**Seção de riscos obrigatória e não vazia.** Uma descrição sem riscos registrados é
devolvida — a premissa sendo que todo sistema tem algum.

**Qualidades com números.** Cada requisito de qualidade precisa de metrificação e fonte.
Ver [atributos de qualidade](../01-fundamentals/quality-attributes.md).

**Revisão anual com dono nomeado**, não aprovação única na entrada.

**Verificação por amostragem**: a cada trimestre, três descrições são comparadas com o
sistema real por alguém de fora do time.

Dezoito meses depois: 54 descrições atualizadas nos últimos 12 meses, 49 com riscos reais
registrados, e a taxa de consulta subiu para 41 sistemas.

A conclusão registrada: a mudança de maior efeito não foi o formato. Foi permitir declarar
seções vazias. Enquanto preencher tudo era obrigatório, texto genérico era a resposta
racional.

## Conceitos Relacionados

- [Visões de Arquitetura](architecture-views.md) — o conteúdo estrutural.
- [Decisões de Arquitetura](../18-architecture-decisions/index.md) — a justificativa.
- [Padrões de Documentação](documentation-standards.md) — a política.
- [Princípios de Documentação](documentation-principles.md).

## Exercício Prático

Pegue a descrição de arquitetura de um sistema do seu time e verifique três coisas: há
riscos registrados, há alternativas descartadas, e as qualidades têm números.

Se as três faltarem, a descrição é uma peça de conformidade.

## Perguntas de Entrevista

- Por que a seção de riscos distingue uma descrição honesta de uma formal?
- Por que a descrição pertence ao sistema e não ao projeto?
- Qual a vantagem de referenciar ADRs em vez de copiá-las?

## Para Aprofundar

- ISO/IEC/IEEE 42010:2022 — *Architecture description*.
- Starke, Gernot; Hruschka, Peter. *arc42* — arc42.org.
- Clements, Paul et al. *Documenting Software Architectures*. 2ª ed. Addison-Wesley, 2010.
