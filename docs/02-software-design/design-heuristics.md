---
id: design-heuristics
title: Heurísticas de Design
sidebar_position: 18
description: Regras práticas que orientam sem prescrever — e por que heurística é o formato certo para design.
doc_type: foundation
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor dispõe de um conjunto de heurísticas aplicáveis e entende
  por que design se orienta por heurística e não por regra.
prerequisites: [clean-code]
related: [solid, kiss, design-patterns]
canonical_for: [heurísticas de design, design heuristics]
content_version: 1
last_reviewed: 2026-08-26
---

# Heurísticas de Design

## Visão Geral

Uma heurística é uma regra prática que funciona na maioria dos casos e reconhece
exceções. É o formato adequado para design de software, e a razão é estrutural:
design depende de contexto que a regra não consegue capturar.

## O Problema

Princípios de design chegam frequentemente como regras: "uma classe deve ter uma
responsabilidade", "funções devem ser curtas", "prefira composição a herança".

Regras têm duas propriedades ruins nesse domínio.

**Não admitem exceção sem virar hipocrisia.** Quando o caso não encaixa — e casos
não encaixam com frequência — o time contorna em silêncio. A regra deixa de ser
discutível, o que é pior do que não tê-la.

**Escondem o raciocínio.** Quem segue uma regra não aprende a decidir. Diante de
uma situação nova, não tem nada.

Heurística resolve os dois. Ela vem com a força do argumento explícita, o que
permite pesá-la contra outras considerações — e o exercício de pesar é o que
desenvolve julgamento.

## Conceitos Centrais

### As quatro regras de design simples

Formuladas por Kent Beck, em ordem de prioridade:

1. **Passa em todos os testes.**
2. **Revela a intenção.**
3. **Não contém duplicação.**
4. **Tem o mínimo de elementos.**

A ordem é a parte que importa. Quando 3 e 4 conflitam com 2, a intenção vence —
o que legitima duplicação que torna o código mais claro. É a versão mais enxuta
de tudo o que [SOLID](/02-software-design/solid.md) e [Clean Code](/02-software-design/clean-code.md) tentam capturar.

### Um conjunto operacional

Heurísticas que aparecem repetidamente neste material, reunidas:

**Coisas que mudam juntas ficam juntas.** A heurística de maior alcance. Orienta
[modularidade](/01-fundamentals/modularity.md),
[coesão](/01-fundamentals/cohesion.md),
[fronteiras](/02-software-design/boundaries.md) e [DRY](/02-software-design/dry.md).

**Dependa na direção da estabilidade.** Ver
[direção de dependência](/02-software-design/dependency-direction.md).

**Prefira a opção mais barata de abandonar.** Quando duas alternativas empatam, a
reversibilidade decide.

**Espere a terceira ocorrência.** Antes de abstrair. Duas não distinguem
coincidência de conceito.

**Duplicação é mais barata que a abstração errada.** O corolário do anterior.

**Contabilize os dois lados.** Toda decisão adiciona e remove complexidade.

**Escolha o nível mais baixo de fronteira que resolve.** Módulo antes de pacote,
pacote antes de processo.

**Se precisa de conjunção para nomear, provavelmente são dois.** O teste rápido
de coesão.

**Nomeie pelo domínio, não pela implementação.**

**Se você não consegue escrever o teste que verifica, não é requisito.**

### Heurísticas conflitam

Não é defeito, é a natureza delas. "Não duplique" conflita com "não abstraia
cedo". "Reduza acoplamento" conflita com "não duplique conhecimento".

O conflito é onde o julgamento acontece, e é por isso que design não pode ser
reduzido a um algoritmo. Um conjunto de heurísticas que nunca conflita é um
conjunto que não cobre o espaço.

## Por Que Isso Importa

**Porque desenvolve julgamento em vez de conformidade.** Quem entende o argumento
por trás de uma heurística decide bem em situação nova. Quem decorou a regra, não.

**Porque torna a discussão possível.** Duas heurísticas em conflito produzem uma
conversa sobre qual força é maior neste caso. Duas regras em conflito produzem
impasse.

**Porque é o formato que os princípios de fato têm.** Todo princípio de design
tem exceções. Apresentá-los como regras é impreciso, e a imprecisão aparece na
primeira aplicação.

## Erros Comuns

**Tratar heurística como regra.** Perde a exceção e o raciocínio.

**Coletar heurísticas sem entender os argumentos.** Vira lista de slogans.

**Achar que o conflito entre elas é um problema a resolver.** É onde o trabalho
está.

**Aplicar sem verificar o contexto.** Toda heurística tem uma faixa. "Espere a
terceira ocorrência" não se aplica quando a terceira é uma obrigação regulatória
com prazo.

**Usar como argumento de autoridade.** "Isso viola o princípio X" não é crítica
até que se aponte o custo concreto.

## Exemplo Real

Uma revisão de código travou entre duas posições, ambas defensáveis.

*Posição A:* a lógica de validação está duplicada em dois módulos — extraia para
um módulo comum. Heurística invocada: não duplique conhecimento.

*Posição B:* os dois módulos pertencem a contextos diferentes e vão divergir —
mantenha separado. Heurística invocada: duplicação é mais barata que a abstração
errada.

Nenhuma das duas está errada. O impasse se resolveu com uma terceira heurística:
*coisas que mudam juntas ficam juntas* — reformulada como pergunta empírica.

O histórico respondeu: nos catorze meses anteriores, as duas validações haviam
sido alteradas cinco vezes, sempre separadamente, e por pedidos de áreas
diferentes.

A posição B venceu, e a duplicação foi anotada com a razão — para que a próxima
pessoa não a "corrigisse".

O que resolveu não foi eleger a heurística mais forte. Foi encontrar a que podia
ser verificada com dado.

## Conceitos Relacionados

- [KISS](/02-software-design/kiss.md) e [YAGNI](/02-software-design/yagni.md) — duas heurísticas em detalhe.
- [SOLID](/02-software-design/solid.md) — cinco heurísticas frequentemente lidas como regras.
- [Clean Code](/02-software-design/clean-code.md) — o conjunto local.
- [Trade-offs](/20-trade-offs/index.md) — o que fazer quando duas conflitam.

## Exercício Prático

Escreva as cinco heurísticas que você de fato usa ao tomar decisões de design.
Não as que acha que deveria usar — as que usa.

Para cada uma, escreva o argumento por trás e um caso em que ela não se aplica.

As que você não conseguir justificar são regras decoradas. As sem exceção
provavelmente estão mal formuladas.

## Perguntas de Entrevista

- Qual a diferença entre heurística e regra em design?
- Cite duas heurísticas que conflitam e diga como você decide entre elas.
- Que heurística você usa com mais frequência, e qual é o argumento por trás?

## Para Aprofundar

- Beck, Kent. *Extreme Programming Explained*. 2ª ed., Addison-Wesley, 2004 — as
  quatro regras de design simples.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018.
- Riel, Arthur. *Object-Oriented Design Heuristics*. Addison-Wesley, 1996 — o
  catálogo clássico.
