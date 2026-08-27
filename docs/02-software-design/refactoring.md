---
id: refactoring
title: Refatoração
sidebar_position: 17
description: Mudar a estrutura sem mudar o comportamento — e o que separa refatoração de reescrita disfarçada.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor conduz refatoração em passos verificáveis e sabe quando
  parar — que é a parte que quase nunca é definida.
prerequisites: [code-smells]
related: [technical-debt, clean-code, legacy-modernization]
canonical_for: [refatoração, refactoring]
content_version: 1
last_reviewed: 2026-08-26
---

# Refatoração

## Visão Geral

Refatoração é alterar a estrutura interna do código **sem alterar seu
comportamento observável**.

A cláusula depois do "sem" é a definição inteira. Se o comportamento muda, não é
refatoração — é mudança de funcionalidade, e as duas não devem acontecer no mesmo
commit.

## Problema

A palavra é usada para descrever qualquer alteração estrutural, inclusive
reescritas que mudam comportamento. Isso destrói a propriedade que torna
refatoração segura.

Refatoração é segura porque **o comportamento é a rede**. Se ele não muda, os
testes existentes verificam a mudança. Quando comportamento e estrutura mudam
juntos, e um teste falha, ninguém sabe qual das duas causou.

O segundo problema é ausência de critério de parada. "Vamos refatorar isso"
raramente define quando está pronto, e refatoração sem fim declarado consome
tempo até que alguém interrompa por pressão de prazo — frequentemente no meio,
que é o pior estado possível.

## Conceitos Centrais

### Passos pequenos e verificáveis

A prática que distingue refatoração de reescrita: cada passo é pequeno o
suficiente para que os testes rodem entre eles.

```text
❌ refatorar por três dias → rodar os testes → 40 falhas → onde?
✅ extrair método → testes → renomear → testes → mover → testes
```

O valor não é psicológico. Com passos pequenos, o passo que quebrou é sempre o
último, e desfazer custa minutos.

### Testes são pré-requisito, não consequência

Refatorar código sem testes não é refatoração — é mudança estrutural na
esperança de que nada quebre.

Quando os testes não existem, a ordem é: escrever testes de caracterização que
capturam o comportamento **atual**, inclusive o que parece errado, e só então
refatorar. Comportamento incorreto é corrigido depois, em commit separado.

### O critério de parada

A pergunta que precisa ser respondida antes de começar: **o que precisa ser
verdade para pararmos?**

Respostas úteis são verificáveis:

- "A regra de cálculo fiscal pode ser alterada sem tocar em persistência."
- "Este módulo pode ser testado sem banco."
- "O ciclo entre estes dois pacotes deixou de existir."

Respostas inúteis: "o código está melhor", "está mais limpo".

### Refatoração preparatória

A forma de maior retorno, e a menos praticada: refatorar **antes** de implementar,
para tornar a implementação simples.

Kent Beck: *"para cada mudança difícil, primeiro faça a mudança fácil que torna a
mudança difícil fácil"*.

Isso tem uma vantagem prática decisiva: a refatoração ganha justificativa
concreta e escopo natural. Ela termina quando a funcionalidade fica fácil de
adicionar.

### Refatoração não é um projeto

"Sprint de refatoração" e "trimestre de dívida técnica" tratam como projeto o que
funciona melhor como prática contínua, associada a mudanças reais.

Refatoração desconectada de necessidade não tem critério de parada nem de
priorização, e compete com entrega — competição que ela perde no primeiro
imprevisto.

## Modelo Mental

**Duas etiquetas, nunca ao mesmo tempo:** estou mudando estrutura, ou estou
mudando comportamento. Se não souber qual, pare.

## Quando Usar

- Antes de adicionar funcionalidade a um código que resiste — refatoração
  preparatória.
- Quando um smell tem juros altos: código no caminho de muitas mudanças.
- Ao entender um código pela primeira vez — renomear conforme se aprende é
  registro de conhecimento.
- Depois de entregar, para limpar o que foi feito sob pressão, enquanto o
  contexto ainda está fresco.

## Quando Não Usar

**Sem testes.** Escreva os testes de caracterização primeiro.

**Junto com mudança de comportamento.** Commits separados, sempre.

**Em código estável que ninguém toca.** Juros zero.

**Perto de um prazo crítico.** Não porque refatorar seja arriscado, mas porque
interromper no meio deixa o código pior que no início.

**Quando o problema é arquitetural.** Uma fronteira no lugar errado não se corrige
com extração de método. Ver
[modernização de legado](../16-legacy-modernization/index.md).

**Sem critério de parada declarado.** Ver acima.

## Alternativas

- **Reescrever o módulo** — quando a estrutura atual não admite passos
  incrementais. É mais arriscado e às vezes é a resposta.
- **Strangler fig** — substituição incremental por fora, quando o interior não
  permite mudança segura.
- **Aceitar e isolar** — encapsular o código problemático atrás de uma interface
  boa, sem mexer no interior.
- **Não fazer nada** — quando os juros são baixos.

## Trade-offs

| Refatorar | Deixar como está |
|---|---|
| Mudanças futuras mais baratas | Sem custo agora |
| Código compreensível | Conhecimento permanece tácito |
| Tempo que não vira funcionalidade | Tempo em entrega |
| Risco de introduzir defeito | Sem risco de mudança |
| Conflitos de merge com trabalho paralelo | Sem conflito |

O último é subestimado: uma refatoração ampla em paralelo com outras frentes
produz conflitos que custam mais que a refatoração.

## Modos de Falha

**Refatoração interrompida.** Metade do sistema na estrutura nova, metade na
velha, e ninguém sabe qual é a convenção.

**Refatoração que muda comportamento sem perceber.** Sem testes, o defeito
aparece semanas depois e ninguém liga à mudança estrutural.

**Refatoração sem fim.** Ausência de critério de parada.

**Refatoração como evasão.** Reestruturar em vez de resolver o problema difícil.

## Erros Comuns

**Misturar com mudança de funcionalidade.** O erro mais frequente e o mais caro.

**Refatorar sem rede.** Testes primeiro.

**Não declarar quando termina.** Convite a não terminar.

**Escolher pelo que incomoda, não pelo que custa.** Ver
[code smells](code-smells.md).

**Tratar como evento em vez de prática.** Refatoração contínua, associada a
mudanças reais, rende mais que trimestres dedicados.

## Exemplo Real

Um time precisava adicionar um novo tipo de desconto. A implementação estimada
era de dois dias, mas o cálculo estava numa classe de 600 linhas com sete tipos
de desconto entrelaçados por condicionais aninhadas.

Duas propostas: implementar mais um ramo — meio dia, e a classe vai a 700 linhas —
ou refatorar antes.

A refatoração preparatória foi definida com critério explícito de parada:
*adicionar um tipo de desconto deve exigir uma classe nova e nenhuma alteração
nas existentes.*

Levou quatro dias. Cada passo com testes rodando: caracterizar o comportamento
atual, extrair cada tipo para uma classe, substituir o condicional por seleção, e
por fim adicionar o novo tipo.

O novo desconto levou duas horas.

O que torna o caso instrutivo não é a economia — quatro dias para economizar
meio não fecha. É o que veio depois: nos quatorze meses seguintes foram
adicionados mais cinco tipos, cada um em cerca de duas horas. A refatoração se
pagou no terceiro.

O critério de parada é o que permitiu declarar que estava pronto no quarto dia,
em vez de continuar melhorando.

## Refatoração num time

Refatoração ampla em paralelo com outras frentes produz conflitos de merge que
frequentemente custam mais que a refatoração economiza.

Quatro práticas que reduzem isso:

**Anuncie antes, com escopo e prazo.** Quem está trabalhando na área precisa saber
para decidir se espera ou se acelera.

**Prefira muitos commits pequenos a um grande.** Cada um integrado rapidamente.
Um ramo de refatoração aberto por duas semanas acumula divergência que ninguém
consegue resolver com confiança.

**Separe movimentação de alteração.** Um commit que só move arquivos é trivial de
revisar e de rebasear; um que move e altera é impossível de avaliar.

**Refatore o que você está tocando.** A regra do escoteiro — deixe melhor do que
encontrou — distribui a refatoração por quem já tem o contexto, e evita conflito
por construção.

O ponto que essas quatro compartilham: refatoração é mais barata quando é contínua
e local, e mais cara quando é um evento coordenado. A tentação de organizar um
esforço grande vem da vontade de fazer de uma vez, e é normalmente a opção pior.

## Conceitos Relacionados

- [Code Smells](code-smells.md) — o que indica onde refatorar.
- [Dívida Técnica](../01-fundamentals/technical-debt.md) — como priorizar.
- [Clean Code](clean-code.md) — o alvo local.
- [Modernização de Legado](../16-legacy-modernization/index.md) — quando o
  problema é maior que refatoração.

## Exercício Prático

Escolha a próxima funcionalidade que você vai implementar num código que resiste.

Antes de começar, escreva o critério de parada da refatoração preparatória: o que
precisa ser verdade para que a funcionalidade fique fácil?

Refatore até esse critério, e pare. Depois implemente.

Compare o tempo total com sua estimativa de implementar direto.

## Perguntas de Entrevista

- Qual a definição precisa de refatoração?
- Como refatorar código sem testes?
- Como você define quando uma refatoração terminou?

## Para Aprofundar

- Fowler, Martin. *Refactoring*. 2ª ed., Addison-Wesley, 2018.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall,
  2004 — testes de caracterização.
- Beck, Kent. *Tidy First?* O'Reilly, 2023 — refatoração em passos pequenos.
