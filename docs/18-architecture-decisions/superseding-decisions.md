---
id: superseding-decisions
title: Superação de Decisões
sidebar_position: 9
description: Mudar de ideia sem apagar o registro — a mecânica que mantém o histórico útil.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor supera uma decisão preservando o raciocínio anterior e registrando
  o que mudou no contexto.
prerequisites: [adr-status]
related: [adr-status, adr-context, adr-alternatives]
canonical_for: [superação de decisão, cadeia de decisões, mudança de contexto registrada]
content_version: 1
last_reviewed: 2026-08-29
---

# Superação de Decisões

## Visão Geral

Superar é o mecanismo pelo qual uma decisão registrada é substituída por outra, **sem que
a primeira desapareça**.

O ADR novo declara que supera o antigo; o antigo declara que foi superado. Os dois
permanecem legíveis, e a sequência entre eles é o que se torna informativo:

```text
ADR-014 (2022)  processar pedidos de forma síncrona
ADR-047 (2024)  processar de forma assíncrona — supera o 014
ADR-061 (2026)  processar de forma síncrona com limite de vazão — supera o 047
```

Essa cadeia conta uma história que nenhum dos três documentos conta sozinho. E ela só
existe porque nenhum foi apagado.

## Problema

Quando uma decisão precisa mudar, o impulso é resolver o documento antigo: editar, apagar
ou ignorar.

```text
editar    o contexto original vira falso
apagar    a organização esquece que já decidiu
ignorar   dois ADRs contraditórios, sem indicação de qual vale
```

O terceiro é o mais comum na prática e o mais confuso: alguém encontra o ADR-014 dizendo
"síncrono", não encontra o ADR-047, e conclui que a decisão vigente é síncrona.

E há um problema anterior a todos: a decisão que **precisa** ser superada e não é. Ela
continua registrada como vigente enquanto o sistema já faz outra coisa — o que é o pior
estado possível, porque o registro passa a mentir com aparência de autoridade.

## Conceitos Centrais

### A mecânica

```text
1. escreve-se um ADR novo, completo, com contexto próprio
2. o novo declara: "supera o ADR-014"
3. o antigo recebe: "superado pelo ADR-047 em <data>"
4. o antigo não muda em mais nada
5. o índice reflete a mudança
```

O passo 1 é o que se costuma pular. O ADR novo não é uma emenda — ele precisa de contexto,
alternativas e consequências próprios, porque o contexto agora é outro.

### O contexto do sucessor inclui o que mudou

A seção mais importante do ADR que supera:

```text
"O ADR-014 decidiu processamento síncrono em 2022, quando o volume era
de 30 pedidos/s e o parceiro de pagamento tinha 99,9% de disponibilidade
medida.

Desde então: o volume chegou a 400/s em picos, e a disponibilidade do
parceiro caiu para 95,9% nos últimos 12 meses, após a migração de
infraestrutura deles. As duas premissas do ADR-014 deixaram de valer."
```

Isso responde à pergunta que interessa: **o que mudou?** Ela distingue uma decisão revista
por informação nova de uma revista por preferência de quem chegou depois.

Ver [contexto](adr-context.md).

### Nem toda mudança é superação

```text
o contexto mudou e a decisão não serve mais    → superação
a decisão nunca foi implementada               → descontinuar
o objeto da decisão desapareceu                → descontinuar
a decisão está sendo detalhada, não alterada   → ADR novo, sem superar
parte da decisão muda                          → depende do escopo
```

O último caso é o mais delicado. Se a decisão original tinha escopo amplo e apenas parte
dela muda, há duas saídas: superar por inteiro com um sucessor de escopo equivalente, ou
escrever um ADR novo que restringe explicitamente o escopo do anterior sem superá-lo.

A segunda produz cadeias mais fáceis de ler, e exige que o escopo original tenha sido
declarado com clareza. Ver
[decisão](adr-decision.md).

### A condição de reversão é o gatilho

Um ADR que registrou, nas alternativas, a condição sob a qual cada opção descartada
voltaria a ganhar, já contém o gatilho da própria superação:

```text
ADR-014  "síncrono voltaria a perder se o parceiro cair abaixo de 99%
         de disponibilidade sustentada"
2024     medição mostra 95,9%
         → a condição foi atingida; a decisão merece revisão
```

Isso muda a natureza da revisão: de julgamento sobre o que fazer, para verificação de uma
condição registrada. Ver
[alternativas](adr-alternatives.md).

### Superação por acúmulo

Um caso comum e mal tratado: a decisão nunca foi formalmente revista, e a prática divergiu
aos poucos.

```text
ADR diz          "todos os serviços usam PostgreSQL"
realidade        4 serviços usam PostgreSQL, 3 usam DynamoDB, 1 usa Mongo
```

Aqui a superação é retroativa: escreve-se um ADR que reconhece a prática real, explica como
se chegou nela, e decide o que vale daqui para frente.

Isso é desconfortável e é o registro mais honesto disponível. A alternativa — manter um ADR
que descreve uma realidade inexistente — corrói a confiança em todo o conjunto.

### Ler a cadeia ensina

O valor de longo prazo aparece na sequência:

```text
decisões que foram e voltaram        sinal de que uma força foi subestimada
decisões superadas em menos de 1 ano sinal de decisão tomada cedo demais
decisões nunca superadas em 5 anos   ou eram boas, ou ninguém revisa
cadeias longas sobre o mesmo tema    o problema real não foi endereçado
```

O último padrão é o mais informativo. Três superações sobre a mesma questão em quatro anos
raramente indicam contexto mutável — indicam que a decisão está tratando o sintoma.

### O ADR superado continua correto

Vale insistir, porque o impulso contrário é forte: um ADR superado não estava errado. Ele
registra uma decisão adequada ao contexto dela.

Tratá-lo como erro desincentiva o registro — se ser superado é vergonhoso, escreve-se menos
e supera-se menos.

## Modelo Mental

**Substituir, não apagar.** O sucessor explica o que mudou; o antecessor continua verdadeiro
sobre o seu momento.

## Quando Usar

- Quando o contexto mudou e a decisão não serve mais.
- Quando a condição de reversão registrada foi atingida.
- Quando a prática divergiu e o registro precisa reconhecer a realidade.
- Quando a decisão foi revista por informação nova.

## Quando Não Usar

**Editando o ADR antigo.**

**Apagando o superado.**

**Sem explicar o que mudou** no contexto do sucessor.

**Como emenda** — o sucessor precisa ser completo.

**Sem referência bidirecional.**

**Para decisões que nunca foram implementadas** — o status correto é descontinuado.

## Alternativas

- **Descontinuar** — quando não há sucessor.
- **ADR complementar** — quando a decisão é detalhada, não alterada.
- **Restringir escopo** — um ADR novo que limita o alcance do anterior, sem superá-lo.
- **Revisão sem mudança** — registrar que a decisão foi reavaliada e mantida, com data. Ver
  [status](adr-status.md).

A última é subutilizada e barata: um bloco de "revisado em (data), mantido" informa que
alguém verificou, o que é diferente de ninguém ter olhado.

## Trade-offs

| Superar | Editar |
|---|---|
| Histórico preservado | Documento único |
| Exige índice | Leitura direta |
| Ensina pela sequência | Menos arquivos |

| Sucessor completo | Emenda curta |
|---|---|
| Legível isoladamente | Rápido de escrever |
| Duplica contexto | Depende de ler os dois |
| Superável por sua vez | Cadeias confusas |

## Modos de Falha

**Decisão obsoleta não superada.** O registro passa a mentir.

**Sucessor sem explicar a mudança.** Parece preferência, não informação.

**Sem referência bidirecional.** O antigo é encontrado, o novo não.

**Superado apagado.** A história some.

**Superação tratada como erro.** Desincentiva a prática.

**Cadeia longa ignorada.** O padrão que ela revela não é lido.

## Erros Comuns

**Escrever o sucessor como emenda** ao anterior.

**Não datar a superação.**

**Não reconhecer divergência da prática**, mantendo o ADR ficcional.

**Não registrar revisões que mantiveram a decisão.**

**Numerar o sucessor com o mesmo número** do antecessor, com sufixo — quebra a
referenciabilidade.

## Exemplo Real

Uma empresa de saúde digital tinha uma cadeia de ADRs sobre autenticação que se estendia
por seis anos:

```text
ADR-008 (2019)  autenticação própria, com sessão em banco
ADR-021 (2021)  tokens JWT sem estado — supera o 008
ADR-034 (2022)  JWT com lista de revogação em cache — supera o 021
ADR-052 (2024)  volta a sessão com estado, em cache distribuído — supera o 034
ADR-071 (2025)  provedor de identidade externo — supera o 052
```

Cinco decisões, quatro superações, mesma questão. Cada ADR era bem escrito, com contexto,
alternativas e consequências.

Uma revisão anual de arquitetura leu a cadeia inteira de uma vez — algo que ninguém tinha
feito — e o padrão apareceu:

```text
ADR-021  motivo do descarte do 008: escalabilidade da sessão em banco
ADR-034  motivo do descarte do 021: não havia como revogar tokens
ADR-052  motivo do descarte do 034: a lista de revogação virou estado,
         anulando a vantagem do JWT
ADR-071  motivo do descarte do 052: complexidade operacional
```

Os ADRs 021, 034 e 052 giravam em torno de uma tensão conhecida — revogação exige estado, e
tokens sem estado não permitem revogação — que nenhum deles nomeava. Cada decisão resolvia
o sintoma da anterior e reintroduzia o problema da que veio antes dela.

O que a organização mudou:

**Revisão de cadeia** incorporada à revisão anual: toda cadeia com três ou mais superações
é lida por inteiro, com uma pergunta única — "qual é a tensão que não foi nomeada?".

**Seção de "história desta decisão"** nos sucessores de cadeias longas, resumindo as
anteriores e o que cada uma tentou resolver.

**Restrição declarada** no ADR-071: o registro passou a nomear explicitamente a tensão
entre revogação e ausência de estado, e a justificar por que delegar a um provedor externo
resolvia a raiz e não o sintoma.

A revisão também encontrou outro dado: das 118 cadeias de decisão da organização, 9 tinham
três ou mais superações. Todas as nove, examinadas, mostravam o mesmo padrão de sintoma.

Duas delas foram reabertas com base nisso.

O que a equipe registra: cada ADR isolado da cadeia de autenticação era defensável. O
problema só era visível na sequência — e a sequência só existia porque nenhum ADR tinha
sido apagado ou editado.

## Conceitos Relacionados

- [Status](adr-status.md) — os estados e a imutabilidade.
- [Contexto](adr-context.md) — o que mudou.
- [Alternativas](adr-alternatives.md) — a condição de reversão como gatilho.
- [Modernização](../16-legacy-modernization/index.md) — decisões revistas em sistemas
  antigos.

## Exercício Prático

Encontre a cadeia de decisões mais longa do seu time e leia-a inteira, do primeiro ao
último.

Pergunte: qual é a tensão que nenhum dos ADRs nomeia? Cadeias longas quase sempre têm uma.

## Perguntas de Entrevista

- Por que o sucessor precisa de contexto próprio em vez de ser uma emenda?
- O que uma cadeia com quatro superações sobre o mesmo tema costuma indicar?
- Por que tratar superação como erro reduz a qualidade do acervo?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Woods, Eoin. *Harnessing Architecture Decision Records*. IEEE Software, 2022.
