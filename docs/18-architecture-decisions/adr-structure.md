---
id: adr-structure
title: Estrutura do ADR
sidebar_position: 3
description: As cinco seções, o que cada uma carrega, e por que o formato curto é deliberado.
doc_type: concept
level: 5
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor escreve um ADR completo no formato padrão e sabe quando adaptá-lo.
prerequisites: [what-is-an-adr]
related: [adr-context, adr-decision, adr-consequences, adr-status]
canonical_for: [estrutura do ADR, formato MADR, título de decisão]
content_version: 1
last_reviewed: 2026-08-29
---

# Estrutura do ADR

## Visão Geral

O formato original de Nygard tem cinco partes:

```text
Título        curto, declarativo, com número
Status        proposto, aceito, superado, descontinuado
Contexto      as forças em jogo no momento
Decisão       o que foi decidido, na voz ativa
Consequências o que passa a ser verdade, bom e ruim
```

Cabe em uma página. Essa brevidade não é economia — é o que torna a prática sustentável e
o que impede que o documento vire especificação.

E há uma assimetria de valor entre as seções que quase todo autor iniciante inverte:
**contexto e alternativas carregam quase tudo; a decisão em si é a parte mais curta e
menos interessante.**

## Problema

Sem estrutura, registros de decisão viram uma de duas coisas:

```text
nota curta demais    "decidimos usar Postgres" — não informa nada
documento longo demais  vinte páginas que ninguém escreve nem lê
```

E há um terceiro modo, mais sutil: o registro que descreve **o que foi feito** em vez de
**por que**. Ele parece completo e não carrega a informação que justifica o esforço.

A estrutura resolve os três, porque cada seção obriga uma pergunta específica que é fácil
pular.

## Conceitos Centrais

### Título

Curto, declarativo, no infinitivo ou na forma de decisão:

```text
bom    "Usar PostgreSQL como banco primário"
bom    "Separar o serviço de faturamento"
ruim   "Banco de dados"                    — não é decisão
ruim   "Discussão sobre persistência"      — é ata
ruim   "Decisão 14"                        — não informa
```

O título é o que aparece no índice, e é por ele que alguém encontra a decisão dois anos
depois. Ele precisa ser legível fora de contexto.

A numeração é sequencial e permanente — números não são reaproveitados, mesmo quando um
ADR é descontinuado.

### Status

Uma palavra, com data:

```text
proposto        escrito, ainda em discussão
aceito          vigente
superado por N  substituído, com referência
descontinuado   não vale mais, sem substituto
```

É o único campo que muda depois da aceitação, e a mudança é sempre acréscimo. Ver
[status](/18-architecture-decisions/adr-status.md).

### Contexto

A seção mais importante e a mais mal escrita. Ela registra **as forças em jogo no
momento**:

```text
a situação atual e o que a torna insatisfatória
as restrições vigentes — técnicas, de prazo, de time, contratuais
o que se sabia e o que não se sabia
os requisitos que a decisão precisa atender, com números
```

O teste: alguém que não estava lá consegue entender por que a decisão era necessária, e
sob que condições a resposta poderia ser outra? Ver
[contexto](/18-architecture-decisions/adr-context.md).

O erro característico é escrever contexto como introdução genérica — "estamos construindo
um sistema de pedidos" — em vez de registrar as forças específicas.

### Decisão

Voz ativa, afirmativa, curta:

```text
"Vamos usar PostgreSQL como banco primário de todos os serviços do domínio de pedidos."
```

Não "propõe-se", não "recomenda-se", não "avaliou-se". Uma decisão registrada em voz
passiva ou condicional não é uma decisão.

Ver [decisão](/18-architecture-decisions/adr-decision.md).

É comum que esta seção tenha três linhas. Isso é correto — o volume está no contexto e nas
consequências.

### Consequências

O que passa a ser verdade depois da decisão, **incluindo o que piora**:

```text
positivas    o que a decisão viabiliza
negativas    o custo aceito
neutras      o que muda sem ser melhor nem pior
riscos       o que pode dar errado, e o sinal de alerta
```

Uma seção de consequências só com pontos positivos é sinal de ADR escrito para convencer,
não para registrar. Ver
[consequências](/18-architecture-decisions/adr-consequences.md).

### Alternativas — o acréscimo que vale

O formato original de Nygard não tem seção de alternativas. Praticamente todos os formatos
derivados acrescentaram uma, porque é onde o raciocínio fica visível.

```text
opção considerada
por que foi descartada
sob que condição voltaria a ganhar
```

A terceira linha é a que transforma o ADR em instrumento de revisão futura. Ver
[alternativas](/18-architecture-decisions/adr-alternatives.md).

### Variantes de formato

```text
Nygard          5 seções, mínimo, o mais usado
MADR            markdown, com alternativas e critérios explícitos
Y-Statement     uma frase estruturada: "no contexto de X, diante de Y,
                decidimos Z, para obter W, aceitando V"
Tyree & Akerman mais completo, com interessados e implicações
```

O Y-Statement merece nota: ele cabe numa frase e força os cinco elementos. É um bom formato
para decisões menores que não justificam um documento.

A escolha entre formatos importa menos que a consistência: um formato usado em toda a
organização permite ler ADRs de sistemas alheios sem reaprender.

### Metadados úteis

```text
data            obrigatória — o contexto é sempre datado
autores         quem decidiu, para quem quiser perguntar
decisores       quando difere de quem escreveu
tags            para busca
relacionados    ADRs que este afeta ou que o afetam
```

Autoria importa mais do que parece: um ADR de dois anos com um autor identificável ainda
tem uma pessoa a quem perguntar, se ela continuar na organização.

## Modelo Mental

**Contexto e alternativas carregam o valor; a decisão é a linha mais curta.** Se o ADR não
cabe em duas páginas, provavelmente são várias decisões.

## Quando Usar

- Sempre que escrever um ADR — o formato é o mínimo comum.
- Como lista de verificação: se uma seção está vazia, falta pensar.
- Ao padronizar a prática numa organização.

## Quando Não Usar

**Acrescentando seções por completude** — cada seção a mais reduz a chance de o ADR ser
escrito.

**Como gabarito rígido** — uma decisão pequena cabe num Y-Statement.

**Com contexto genérico** que serviria a qualquer decisão.

**Com decisão em voz passiva.**

**Sem consequências negativas.**

**Formatos diferentes por time**, o que impede leitura cruzada.

## Alternativas

- **Y-Statement** — uma frase, para decisões menores.
- **MADR** — quando os critérios de comparação precisam ser explícitos.
- **Formato próprio** — legítimo, desde que uniforme e curto.
- **Comentário no código** — para decisões locais, um comentário explicando o porquê é o
  registro certo.

A última é subutilizada: nem toda decisão merece arquivo, e muitas merecem três linhas de
comentário ao lado do código que elas explicam.

## Trade-offs

| Formato mínimo | Formato completo |
|---|---|
| Escrito com frequência | Mais informativo |
| Rápido de ler | Mais lento |
| Omite critérios | Explicita |
| Sustentável | Tende ao abandono |

| Gabarito único | Formato livre |
|---|---|
| Comparável entre sistemas | Ajustado à decisão |
| Convida a preencher por dever | Varia demais |
| Fácil de indexar | Difícil |

## Modos de Falha

**Contexto genérico.** A seção mais importante vira introdução.

**Decisão condicional.** "Recomenda-se avaliar" não é decisão.

**Consequências só positivas.** ADR de convencimento.

**Sem alternativas.** Afirmação sem argumento.

**Longo demais.** Não é escrito, ou não é lido.

**Sem data.** O contexto perde a âncora.

**Título vago.** Não é encontrado depois.

## Erros Comuns

**Escrever a decisão primeiro** e o contexto como justificativa retroativa.

**Misturar várias decisões** num ADR só.

**Descrever implementação** em vez de decisão.

**Omitir a condição de reversão** nas alternativas.

**Numerar por data** em vez de sequencialmente — dificulta a referência.

## Exemplo Real

Uma empresa de tecnologia com nove times adotou ADRs sem padronizar o formato. Cada time
escolheu o seu.

Dois anos e 210 ADRs depois, uma revisão encontrou:

```text
formatos distintos em uso                      6
ADRs sem seção de alternativas                134
sem consequências negativas                   157
com contexto genérico                          89
sem data                                       41
com título não descritivo                      52
```

O problema prático não era a variedade de formatos — era a ausência sistemática das mesmas
duas coisas: alternativas e consequências negativas. Os times que usavam o formato Nygard
puro simplesmente não tinham campo para alternativas, e os demais deixavam em branco.

E os ADRs sem consequências negativas eram todos legíveis como justificativa de uma escolha
já feita.

A padronização adotada:

**MADR como formato único**, escolhido por ter alternativas e critérios como seções de
primeira classe.

**Alternativas obrigatórias**, com a condição de reversão explícita. ADR sem alternativa é
devolvido na revisão.

**Ao menos uma consequência negativa.** A premissa: toda decisão arquitetural tem custo, e
um ADR que não o nomeia não pensou nele.

**Y-Statement autorizado** para decisões menores — o que fez o volume subir, porque muitas
decisões que não valiam um documento passaram a ser registradas em uma frase.

**Título verificado** por uma regra simples: precisa começar com um verbo.

**Índice único** entre times, gerado a partir dos repositórios.

Um ano depois, 168 ADRs novos:

```text
com alternativas                              168
com ao menos uma consequência negativa        161
Y-Statements                                   57
consultados ao menos uma vez                   38
```

Exigir uma consequência negativa foi a regra de maior efeito. Ela
custava uma linha e mudava a natureza do documento — de peça de convencimento para
registro de trade-off aceito.

E o Y-Statement resolveu um problema que ninguém tinha nomeado: decisões médias, que não
justificavam um documento, antes não eram registradas de forma alguma.

## Conceitos Relacionados

- [Contexto](/18-architecture-decisions/adr-context.md) — a seção que carrega o valor.
- [Decisão](/18-architecture-decisions/adr-decision.md) — a mais curta.
- [Alternativas](/18-architecture-decisions/adr-alternatives.md) — o acréscimo essencial.
- [Consequências](/18-architecture-decisions/adr-consequences.md) — onde o custo é nomeado.

## Exercício Prático

Pegue um ADR existente do seu time e verifique três coisas: o contexto cita restrições
específicas, há alternativas com condição de reversão, e há ao menos uma consequência
negativa.

A ausência das três é o perfil típico do ADR escrito para justificar em vez de registrar.

## Perguntas de Entrevista

- Por que a seção de decisão costuma ser a mais curta?
- Por que o formato original não tinha alternativas, e por que quase todos os derivados
  acrescentaram?
- Quando um Y-Statement é preferível a um documento?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- *MADR — Markdown Any Decision Records* — adr.github.io/madr.
- Zdun, Uwe et al. *Sustainable Architectural Design Decisions*. IEEE Software, 2013.
