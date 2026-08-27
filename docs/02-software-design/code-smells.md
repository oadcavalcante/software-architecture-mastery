---
id: code-smells
title: Code Smells
sidebar_position: 16
description: Sinais de que algo merece atenção — não defeitos, e não uma lista de proibições.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor usa smells como diagnóstico priorizado por custo real, e
  não como checklist de conformidade.
prerequisites: [clean-code]
related: [refactoring, technical-debt, dry]
canonical_for: [code smell, cheiro de código]
content_version: 1
last_reviewed: 2026-08-26
---

# Code Smells

## Visão Geral

Um code smell é uma característica do código que **sugere** um problema mais
profundo. A palavra escolhida por Kent Beck e Martin Fowler é deliberada: cheiro,
não defeito. Ele indica onde olhar, não o que corrigir.

## Problema

Smells são tratados de duas formas erradas, opostas entre si.

**Como proibições.** Ferramentas de análise estática listam violações e times
tratam a lista como pendência a zerar. Isso produz refatoração sem critério:
código estável e feio é corrigido enquanto código no caminho crítico permanece.

**Como opinião ignorável.** "É só um smell" descarta o sinal antes de investigar.

O uso correto está no meio: **smell é hipótese**. Ele aponta um lugar e sugere
uma causa; a investigação decide se há problema e se ele vale ser corrigido.

## Conceitos Centrais

### Os smells que mais importam em arquitetura

A lista de Fowler é longa. Estes são os que sinalizam problemas estruturais, não
locais:

**Feature envy.** Um método usa mais dados de outra classe que da própria. Sugere
que o comportamento está do lado errado da fronteira.

**Shotgun surgery.** Uma mudança exige alterações pequenas em muitos lugares.
Sinaliza [coesão](../01-fundamentals/cohesion.md) baixa: o conceito está
espalhado.

**Divergent change.** Uma classe muda por razões independentes. O oposto do
anterior, e sinaliza responsabilidades misturadas.

**Inappropriate intimacy.** Duas classes conhecem detalhes internas uma da outra.
[Acoplamento](../01-fundamentals/coupling.md) no lugar errado.

**Primitive obsession.** Conceitos de domínio representados por tipos primitivos.
`String cpf` em vez de `Cpf`. Espalha validação e permite trocas silenciosas.

**Speculative generality.** Abstração para necessidade que não chegou. Ver
[YAGNI](yagni.md).

**Long parameter list.** Frequentemente sinaliza que existe um conceito sem nome —
os parâmetros que sempre andam juntos são um objeto.

### O critério de prioridade

Um smell em código que ninguém toca há dois anos custa zero. O mesmo smell no
caminho de toda mudança custa em cada mudança.

A priorização correta cruza duas dimensões: **gravidade do smell** e **frequência
de alteração daquele arquivo**. A segunda é extraível do histórico de versão e
quase nunca é consultada.

Isso é a aplicação de juros de [dívida técnica](../01-fundamentals/technical-debt.md)
ao nível de código.

### Smells estruturais não aparecem em ferramenta

Analisadores estáticos detectam bem o local: método longo, complexidade
ciclomática, duplicação textual.

Detectam mal o estrutural: shotgun surgery e divergent change são propriedades do
**histórico**, não do código num instante. Encontrá-los exige olhar como o
repositório mudou ao longo do tempo — que é o que ferramentas de análise de
histórico fazem.

## Modelo Mental

**Smell é uma pergunta, não uma resposta.** "Por que este método usa tanto de
outra classe?" A resposta pode ser "porque está no lugar errado" ou "porque é
assim mesmo".

## Quando Usar

- Ao investigar por que uma área do sistema é cara de mudar.
- Em revisão de código, como vocabulário compartilhado para apontar algo.
- Ao priorizar refatoração, cruzado com frequência de mudança.
- Ao avaliar código herdado, para mapear onde estão os riscos.

## Quando Não Usar

**Como lista de pendências a zerar.** Produz refatoração sem retorno.

**Como veredito automático.** Um método de 80 linhas pode ser a forma mais clara
de expressar uma sequência sem ramificação.

**Em código estável.** Smell sem juros é dívida sem custo corrente.

**Como argumento sem investigação.** "Isso é feature envy" não é crítica até que
se mostre o que fica mais caro por causa disso.

**Contra código de terceiros ou gerado.** Não é seu para corrigir.

## Alternativas

- **Métricas de histórico** — arquivos que mudam com frequência e junto com
  outros dizem mais que qualquer smell isolado.
- **Medir esforço real** — quanto tempo leva uma mudança típica naquela área.
- **Perguntar a quem mantém** — as pessoas que trabalham no código sabem onde
  dói, e raramente são consultadas com essa pergunta.

## Trade-offs

| Agir sobre smells | Ignorar |
|---|---|
| Código mais fácil de mudar | Nenhum esforço de refatoração |
| Vocabulário comum em revisão | Sem discussão sobre estilo |
| Risco de refatorar o que não rende | Sem risco de mudança |
| Custo de mudança agora | Custo acumula se houver juros |

## Modos de Falha

**Caça a smells sem priorização.** Trimestres gastos no código mais visível, não
no mais caro.

**Ferramenta como autoridade.** O limiar de complexidade da ferramenta vira lei.

**Smell corrigido, causa mantida.** Extrair um método de 80 linhas em oito não
resolve responsabilidades misturadas; apenas as distribui.

**Falso positivo tratado como verdadeiro.** Uma lista de parâmetros longa em um
construtor de objeto de valor imutável costuma ser adequada.

## Erros Comuns

**Não cruzar com frequência de mudança.** O erro de priorização dominante.

**Confundir smell com bug.** Smell não quebra nada; encarece a mudança.

**Usar como conformidade.** Vira teatro.

**Ignorar smells estruturais.** São os que custam mais e os que ferramenta não vê.

## Exemplo Real

Um time tinha 340 violações apontadas pelo analisador estático. A meta do
trimestre foi zerá-las.

Ao final, 310 corrigidas. O tempo de entrega de funcionalidades não mudou.

A análise posterior cruzou as violações com o histórico: 280 delas estavam em
arquivos alterados menos de duas vezes no ano. Os juros eram próximos de zero.

As 30 restantes estavam em quatro arquivos que apareciam em 60% dos commits.
Nenhum deles era o de pior pontuação na ferramenta — os problemas ali eram
shotgun surgery e inappropriate intimacy, que o analisador não detecta.

O trimestre seguinte tratou apenas esses quatro arquivos. O tempo médio de
entrega caiu de forma mensurável.

A diferença entre os dois trimestres não foi o esforço. Foi olhar para o
histórico antes de escolher.

## Do sintoma à causa estrutural

Smells locais frequentemente apontam para problemas de fronteira. A tradução:

| Smell | Causa estrutural provável |
|---|---|
| Feature envy | Comportamento do lado errado da fronteira |
| Shotgun surgery | Conceito espalhado; coesão baixa |
| Divergent change | Responsabilidades misturadas; um módulo com dois atores |
| Inappropriate intimacy | Fronteira nominal, não imposta |
| Primitive obsession | Conceito de domínio sem tipo próprio |
| Long parameter list | Objeto de valor faltando |
| Data clumps | Os mesmos parâmetros sempre juntos são um conceito |
| Middle man | Camada anêmica que só repassa |
| Speculative generality | Abstração criada antes do terceiro caso |

A coluna da direita é o que vale corrigir. Corrigir a da esquerda sem a da
direita produz o mesmo problema com forma diferente — o método de 80 linhas vira
oito de dez, e as responsabilidades continuam misturadas.

## Conceitos Relacionados

- [Refatoração](refactoring.md) — como corrigir com segurança.
- [Dívida Técnica](../01-fundamentals/technical-debt.md) — juros e priorização.
- [Coesão](../01-fundamentals/cohesion.md) e
  [Acoplamento](../01-fundamentals/coupling.md) — o que os smells estruturais
  sinalizam.
- [Clean Code](clean-code.md) — o lado local.

## Os smells que valem discutir em revisão

Nem todo smell merece um comentário em pull request. A maior parte do valor de
uma revisão vem de apontar três deles, e o restante é ruído que treina o autor a
ignorar comentários.

**Primitive obsession em conceito de domínio.** Quando um identificador, um
documento fiscal ou um valor monetário aparece como texto ou número simples, o
custo se espalha: a validação passa a existir em todo lugar que recebe o valor, e
nada impede que dois identificadores diferentes sejam trocados um pelo outro numa
chamada. É o smell de melhor relação entre esforço de correção e retorno, porque
a correção é criar um tipo e o benefício vale para todo o código futuro.

**Feature envy que atravessa fronteira de módulo.** Dentro de um módulo, é
questão de organização. Atravessando módulos, é sinal de que a fronteira está no
lugar errado — e fronteira errada custa em toda mudança, não só naquele método.

**Nome que mente.** Um método chamado `validar` que também persiste é o defeito
mais caro desta lista, porque destrói a confiança em todos os outros nomes do
sistema. Quem lê passa a precisar verificar cada chamada, e a leitura deixa de
render.

Os demais smells são melhor tratados como material de refatoração planejada,
priorizada por frequência de mudança, e não como comentário pontual em revisão.
Apontá-los um a um no pull request consome a atenção do autor sem mudar a
estrutura que os causa.

## Exercício Prático

Extraia do seu repositório a lista de arquivos mais alterados nos últimos seis
meses. Pegue os dez primeiros.

Para cada um, procure smells estruturais: ele muda por razões independentes? Ele
sempre muda junto com outro arquivo específico?

Compare essa lista com a do seu analisador estático. A sobreposição costuma ser
pequena, e a primeira lista é a que importa.

## Perguntas de Entrevista

- Por que "smell" e não "defeito"?
- Como você prioriza qual smell corrigir?
- Que smells uma ferramenta de análise estática não consegue detectar?

## Para Aprofundar

- Fowler, Martin. *Refactoring*. 2ª ed., Addison-Wesley, 2018 — o catálogo de
  smells.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — smells
  detectados por histórico.
