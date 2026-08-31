---
id: adr-context
title: Contexto da Decisão
sidebar_position: 4
description: As forças em jogo no momento — a seção que decide se o ADR terá valor daqui a dois anos.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escreve contexto que permite reavaliar a decisão quando as
  condições mudarem.
prerequisites: [adr-structure]
related: [adr-structure, adr-alternatives, superseding-decisions]
canonical_for: [contexto da decisão, força em jogo, restrição vigente, decisão irreversível]
content_version: 1
last_reviewed: 2026-08-29
---

# Contexto da Decisão

## Visão Geral

O contexto responde a uma pergunta: **por que essa decisão precisou ser tomada, e sob quais
condições?**

É a seção que determina se o ADR será útil no futuro. Uma decisão registrada sem contexto
só pode ser obedecida. Uma decisão com contexto pode ser **reavaliada** — porque é possível
verificar se as condições que a produziram ainda valem.

E é a seção que os autores escrevem pior, com uma falha característica: descrevem o sistema
em vez de descrever as forças.

## Problema

O contexto típico de um ADR real:

```text
"Estamos construindo um sistema de pedidos. Precisamos armazenar dados
de forma confiável e escalável."
```

Isso serviria a qualquer decisão, de qualquer sistema, em qualquer época. Não informa nada
e, pior, dá a impressão de que a seção foi preenchida.

O que faltou:

```text
quantos pedidos por segundo, hoje e no horizonte previsto
que consistência o negócio exige
quantas pessoas mantêm o sistema, com qual experiência
que prazo existia
que restrições contratuais, regulatórias ou de custo pesavam
o que já existia e não podia ser jogado fora
o que não se sabia no momento
```

Dois anos depois, sem esses números, ninguém consegue dizer se a decisão continua correta.

## Conceitos Centrais

### Forças, não descrição

A distinção que resolve a maior parte dos ADRs ruins:

```text
descrição   "o sistema processa pedidos"
força       "picos de 400 pedidos/s na Black Friday, contra 30/s na média"

descrição   "o time é pequeno"
força       "4 pessoas, nenhuma com experiência operacional em Kafka"

descrição   "precisamos de alta disponibilidade"
força       "contrato com multa a partir de 43 minutos de indisponibilidade mensal"
```

Uma força é algo que **empurra a decisão numa direção**. Se a frase não empurra, é
descrição, e pode sair.

### Restrições vigentes, com origem

Restrições são o conteúdo mais valioso, porque são o que muda com o tempo:

```text
técnicas      o que a infraestrutura atual suporta
de equipe     tamanho, experiência, rotatividade
de prazo      a data e o que a torna real
financeiras  orçamento, custo por unidade
contratuais   acordos com clientes e fornecedores
regulatórias  o que a lei exige
organizacionais quem decide o quê, o que já foi padronizado
```

E cada uma merece a origem: "o prazo é março" é menos útil que "o prazo é março porque o
contrato com o cliente X prevê entrada em produção no primeiro trimestre".

A origem é o que permite verificar depois se a restrição ainda existe.

### Números, sempre que houver

```text
ruim   "volume alto"
bom    "1,2 milhão de eventos por dia, com pico de 400/s"

ruim   "precisa ser rápido"
bom    "p99 abaixo de 200 ms, medido no cliente"

ruim   "o time é pequeno"
bom    "4 engenheiros, 1 com plantão"
```

Números datam a decisão de forma verificável. Daqui a dois anos, "400/s" pode ser comparado
com a realidade; "volume alto" não.

Ver [atributos de qualidade](/01-fundamentals/quality-attributes.md).

### O que não se sabia

Registro raro e valioso: as incertezas do momento.

```text
"não sabíamos qual seria o padrão de consulta do time de dados"
"a estimativa de crescimento vinha de uma projeção comercial, não de dados"
"não tínhamos experiência com este provedor"
```

Isso muda a leitura futura. Uma decisão tomada sob incerteza declarada é revisável sem
crítica ao autor — a informação simplesmente não existia. Uma decisão apresentada como
certa e depois errada parece erro de julgamento.

E ajuda a identificar o momento certo de revisar: quando a incerteza se resolve.

### Reversibilidade importa e pertence ao contexto

Nem toda decisão tem o mesmo peso:

```text
reversível        pode ser desfeita em dias, com custo baixo
custosa           semanas ou meses de trabalho
irreversível na prática  formato de dado público, contrato com cliente,
                  fronteira de serviço com muitos consumidores
```

Registrar em qual categoria a decisão cai orienta quanto rigor ela merecia — e orienta quem
vier depois sobre quanto custa mudá-la.

Decisões reversíveis merecem ser tomadas rápido e com pouca cerimônia; irreversíveis
merecem o oposto. Ver
[níveis de arquitetura](/15-enterprise-architecture/architecture-levels.md).

### O contexto é datado por natureza

Esta é a razão de o ADR ser imutável. O contexto descreve um momento, e momentos não são
atualizáveis.

```text
"em março de 2024, éramos 12 pessoas"    permanece verdadeiro para sempre
"somos 12 pessoas"                        vira falso e corrompe o registro
```

Escrever no passado, com data explícita, é o hábito que preserva o valor. Ver
[status](/18-architecture-decisions/adr-status.md).

### O contexto define o gatilho de revisão

Um contexto bem escrito produz, quase de graça, a condição de revisão:

```text
contexto   "4 engenheiros, nenhum com experiência operacional em sistemas distribuídos"
gatilho    quando o time crescer ou ganhar essa experiência, reavaliar

contexto   "o parceiro tem 4% de indisponibilidade medida"
gatilho    quando o parceiro melhorar, reavaliar
```

Tornar esse gatilho explícito é o que diferencia um ADR que apenas registra de um que
mantém a decisão viva.

## Modelo Mental

**Registre as forças e os números, no passado.** Se o contexto serviria a qualquer decisão,
ele não é contexto.

## Quando Usar

- Em todo ADR — é a seção que não pode ser omitida.
- Com mais cuidado quanto mais irreversível for a decisão.
- Especialmente quando há restrições temporárias em jogo: elas são as que mais mudam.

## Quando Não Usar

**Como descrição do sistema.** Isso é documentação, não contexto.

**Sem números** quando eles existem.

**No presente.** "Somos 12 pessoas" envelhece para falso.

**Omitindo restrições incômodas** — prazo, política interna, limitação de time. São
exatamente as que explicam decisões que parecem estranhas depois.

**Longo demais.** Três a seis parágrafos bastam; um contexto de duas páginas costuma estar
descrevendo em vez de registrar forças.

## Alternativas

- **Y-Statement** — comprime contexto e decisão numa frase, para casos menores.
- **Referência a um documento de requisitos** — funciona se o documento for imutável e
  datado; não funciona se ele for vivo.
- **Lista de forças** em vez de prosa — mais fácil de escrever e de verificar depois.

A última é subestimada: uma lista com sete forças numeradas é mais útil, e mais honesta,
que três parágrafos de prosa.

## Trade-offs

| Contexto detalhado | Curto |
|---|---|
| Revisável no futuro | Rápido de escrever |
| Números verificáveis | Menos manutenção mental |
| Mais longo | Pode faltar quando importar |

| Restrições explícitas | Implícitas |
|---|---|
| Permite verificar validade | Menos exposição política |
| Explica decisões estranhas | Parece mais técnico |

A segunda tabela esconde uma tensão real: registrar "decidimos assim por causa do prazo" é
honesto e desconfortável. Omitir produz um ADR que parece melhor e vale menos.

## Modos de Falha

**Contexto genérico.** Serviria a qualquer decisão.

**Sem números.** Impossível verificar se ainda vale.

**Escrito no presente.** Envelhece para falso.

**Restrições políticas omitidas.** A decisão fica inexplicável depois.

**Descrição do sistema.** Ocupa espaço, não informa.

**Incertezas não registradas.** A decisão parece mais firme do que foi.

## Erros Comuns

**Escrever o contexto depois da decisão**, como justificativa.

**Omitir o prazo** como força — é uma das mais comuns e das menos registradas.

**Não dizer o tamanho e a experiência do time.**

**Não declarar reversibilidade.**

**Confundir contexto com requisitos**: requisitos são o que o sistema precisa fazer;
contexto inclui também o que limitava as opções.

## Exemplo Real

Uma empresa de mídia decidiu, em 2021, construir seu próprio sistema de gestão de conteúdo
em vez de usar uma solução de mercado. O ADR foi escrito, e o contexto dizia:

```text
"Precisamos de flexibilidade para atender aos requisitos editoriais
específicos da nossa operação, que as soluções de mercado não cobrem."
```

Em 2024, com o sistema consumindo 60% da capacidade de uma equipe de nove pessoas, a
decisão foi questionada. E foi impossível avaliá-la: o contexto não dizia **quais**
requisitos editoriais, nem **quais** soluções tinham sido avaliadas, nem sob que restrição.

A investigação levou três semanas e reconstruiu, por entrevistas, o contexto real de 2021:

```text
duas soluções avaliadas, ambas descartadas por um requisito de fluxo
  de aprovação em quatro etapas com bloqueio editorial
custo das licenças estimado em 180 mil por ano
equipe de 4 pessoas na época, com folga
prazo de 8 meses, sem data contratual
uma das soluções tinha o recurso no roteiro para o ano seguinte
```

O último item era decisivo e nunca tinha sido registrado. A solução em questão passou a
oferecer o fluxo de aprovação em 2022. A restrição que motivou construir deixou de existir
dois anos antes de alguém perceber.

E o requisito de quatro etapas tinha sido simplificado pela própria redação em 2023 — ou
seja, nem existia mais do lado do negócio.

O que foi decidido:

**Migração para a solução de mercado**, concluída em 14 meses.

**Regra de contexto** para ADRs novos: toda restrição precisa de origem e de uma condição
que a invalidaria. A frase-modelo adotada foi "esta decisão muda se ___".

**Revisão de ADRs de decisões custosas** a cada 12 meses — apenas verificar se as
restrições registradas ainda valem, sem reabrir a decisão. Um exercício de 15 minutos por
ADR.

**Roteiros de fornecedores registrados** no contexto quando pesarem na decisão.

Na primeira rodada de revisão, 7 dos 34 ADRs de decisões custosas tinham restrições que já
não existiam. Dois foram superados. Ver
[superação](/18-architecture-decisions/superseding-decisions.md).

A lição registrada: o contexto original não era desonesto nem preguiçoso — ele parecia
completo. A frase "requisitos editoriais específicos" descrevia com precisão o que todos
sabiam em 2021. O problema é que "todos sabiam" é exatamente a informação que evapora.

## Conceitos Relacionados

- [Estrutura do ADR](/18-architecture-decisions/adr-structure.md).
- [Alternativas](/18-architecture-decisions/adr-alternatives.md) — a condição de reversão.
- [Superação](/18-architecture-decisions/superseding-decisions.md) — o que se faz quando o contexto muda.
- [Atributos de Qualidade](/01-fundamentals/quality-attributes.md) — os números.

## Exercício Prático

Pegue o ADR mais antigo do seu time e liste as restrições que o contexto menciona.

Para cada uma, responda: ela ainda existe? As que não existirem mais são o argumento para
reabrir a decisão.

## Perguntas de Entrevista

- Qual a diferença entre descrever o sistema e registrar as forças em jogo?
- Por que o contexto deve ser escrito no passado?
- Por que registrar o que não se sabia melhora o valor do ADR?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Bezos, Jeff. *Carta aos acionistas de 2015* — decisões de mão única e de mão dupla.
