---
id: kiss
title: KISS
sidebar_position: 3
description: Prefira a solução mais simples que resolve o problema — e o que "simples" significa de forma verificável.
doc_type: concept
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor avalia simplicidade por número de partes entrelaçadas e
  reconhece quando a solução simples é insuficiente, não apenas desconfortável.
prerequisites: [fundamentals]
related: [yagni, dry, design-heuristics]
canonical_for: [KISS, simplicidade]
content_version: 1
last_reviewed: 2026-08-26
---

# KISS

## Visão Geral

KISS — *Keep It Simple, Stupid* — orienta a preferir a solução mais simples que
resolve o problema.

Como slogan, é inútil: ninguém defende complicar de propósito. O que torna o
princípio operacional é ter uma definição de "simples" que possa ser verificada,
e não sentida.

## Problema

"Simples" é usado para significar duas coisas diferentes, e a confusão entre elas
é a razão pela qual o princípio raramente decide nada.

**Fácil** é o que é familiar. Uma ferramenta que você usa há cinco anos parece
fácil; uma desconhecida parece difícil. É uma propriedade da pessoa.

**Simples**, no sentido que interessa, é ter poucas partes entrelaçadas. Rich
Hickey resgata a etimologia: *simplex* é "uma dobra"; o oposto é *complex*,
"entrelaçado". É uma propriedade da coisa.

As duas divergem com frequência. Um ORM familiar pode ser complexo — traz cache,
carga preguiçosa, gerenciamento de sessão e geração de SQL entrelaçados. SQL
direto pode ser simples e desconfortável.

Quando um time diz "vamos manter simples" e escolhe o que já conhece, escolheu
fácil, não simples. Às vezes é a decisão certa — familiaridade reduz risco de
execução — mas é outra decisão, e vale tomá-la sabendo.

## Conceitos Centrais

### A medida operacional

Três perguntas que substituem a impressão:

1. **Quantas partes** o leitor precisa entender para modificar isso com segurança?
2. **Quantos caminhos** de execução existem? Cada flag booleana dobra o número.
3. **Quantas coisas mudam** se eu mudar uma?

A terceira é a mais reveladora, e é a mesma de
[acoplamento](/01-fundamentals/coupling.md). Complexidade e acoplamento não são
conceitos distintos vistos de perto — são o mesmo fenômeno medido de ângulos
diferentes.

### Simples não é pouco código

Código curto e denso pode entrelaçar mais que código longo e explícito. Uma
expressão de uma linha com quatro operações encadeadas tem mais partes
interdependentes que quatro linhas nomeadas.

Contar linhas é a métrica errada. Contar o que precisa ser mantido na cabeça
simultaneamente é a certa.

### Simples é local ou global

Uma decisão pode simplificar uma parte e complicar o conjunto. Extrair um serviço
simplifica cada lado e adiciona rede, implantação e falha parcial ao todo.

Ver [complexidade](/01-fundamentals/complexity.md): o erro é contabilizar um
lado só.

## Modelo Mental

**Simples é o que tem poucas partes entrelaçadas. Fácil é o que você já
conhece.** Quando escolher fácil sobre simples, diga que é o que está fazendo.

## Quando Usar

- Sempre como default: comece pela opção mais simples e adicione mecanismo quando
  ela demonstrar insuficiência.
- Quando duas soluções atendem aos requisitos e uma tem menos partes.
- Quando o time é pequeno ou tem rotatividade — cada parte extra custa em cada
  pessoa nova.
- Quando o requisito ainda pode mudar: menos partes é menos coisa a desfazer.

## Quando Não Usar

**Quando a solução simples não atende a um requisito declarado.** Simplicidade
não é desculpa para não atender a um SLO. Se o requisito exige replicação, a
instância única não é simples — é inadequada.

**Quando "simples" significa deixar complexidade essencial para o operador.** Um
sistema com pouca lógica e um manual de procedimentos manuais de quarenta passos
não é simples; ele exportou a complexidade.

**Quando o problema é genuinamente complexo.** Complexidade essencial não some
por preferência. Ver
[complexidade](/01-fundamentals/complexity.md).

**Quando fácil é o critério disfarçado.** Escolher o familiar pode ser certo, mas
o argumento é redução de risco de execução, não simplicidade.

## Alternativas

- **As quatro regras de design simples** (Beck), que dão critério verificável.
- **YAGNI** — o mesmo espírito aplicado a funcionalidade em vez de estrutura.
- **Contabilidade explícita de complexidade** — listar o que a decisão adiciona e
  remove.

## Trade-offs

| Mais simples | Mais mecanismo |
|---|---|
| Menos a entender | Cobre mais casos |
| Menos modos de falha | Absorve variação prevista |
| Mudança exige alterar código | Mudança é configuração |
| Pode não atender a requisito real | Custo pago mesmo sem necessidade |

## Modos de Falha

**Simplicidade que vira insuficiência.** A opção simples foi mantida além do
ponto em que deixou de atender.

**Simplicidade aparente.** Pouco código, muita dependência implícita.

**Complexidade exportada.** O sistema é simples e a operação é complexa.

## Erros Comuns

**Confundir simples com fácil.** A raiz.

**Usar KISS como argumento para não fazer o necessário.** "Vamos manter simples" é
frequentemente usado para evitar trabalho que o requisito exige.

**Medir simplicidade em linhas.** Densidade não é simplicidade.

**Aplicar só ao código.** A operação, a implantação e o modelo de dados também
têm complexidade, e frequentemente mais.

## Exemplo Real

Um time precisava agendar tarefas recorrentes. Duas propostas.

**A** — Introduzir um orquestrador de fluxos de trabalho. Familiar para dois
engenheiros que o usaram antes.

**B** — Uma tabela de agendamentos e um processo que a consulta a cada minuto.

Contando partes: A trazia um serviço adicional, seu banco próprio, uma linguagem
de definição de fluxo, um modelo de permissões e mais um componente em plantão.
B trazia uma tabela e um laço.

A era mais fácil para dois dos oito engenheiros. B era mais simples para todos.

O time escolheu B, com uma condição registrada: *se aparecer necessidade de
dependência entre tarefas, ramificação condicional ou reprocessamento de
histórico, A passa a vencer*.

Dois anos depois, a condição não se materializou. A tabela tem 40 linhas de
código e ninguém pensa nela.

O que teria tornado a decisão errada: se o requisito real incluísse dependência
entre tarefas desde o início. Ali B não seria simples — seria insuficiente, e
teria virado um orquestrador mal feito por acúmulo.

## A simplicidade que ninguém conta

A discussão de simplicidade quase sempre para no código. As três dimensões que
costumam ficar de fora pesam mais no custo total.

**Simplicidade operacional.** Quantas coisas precisam estar de pé para o sistema
funcionar? Quantos alertas existem? Quantas pessoas conseguem diagnosticar um
incidente às três da manhã? Uma arquitetura elegante que exige conhecimento
especializado para ser operada não é simples — ela transferiu a complexidade para
um lugar onde ela custa mais.

**Simplicidade de implantação.** Quantos passos, quantas coordenações entre
componentes, quanto tempo até reverter. Um sistema cuja reversão exige três
pessoas e um roteiro tem complexidade que não aparece em nenhuma métrica de
código.

**Simplicidade cognitiva de entrada.** Quanto tempo uma pessoa nova leva para
fazer a primeira alteração com segurança. É a medida mais honesta das três,
porque não depende de quem já está adaptado ao sistema — e é a única que piora
silenciosamente conforme o time se acostuma.

As três se degradam sem aparecer em revisão de código, que é onde a maioria dos
times olha para simplicidade.

## Conceitos Relacionados

- [Complexidade](/01-fundamentals/complexity.md) — a contabilidade dos dois lados.
- [YAGNI](/02-software-design/yagni.md) — o mesmo princípio aplicado a funcionalidade.
- [Heurísticas de Design](/02-software-design/design-heuristics.md) — critérios verificáveis.

## Exercício Prático

Pegue um componente do seu sistema e conte: quantas partes o leitor precisa
conhecer para alterá-lo? Quantos caminhos de execução? Quantas coisas mudam se
uma mudar?

Depois faça a mesma contagem para a alternativa mais direta que resolveria o
mesmo problema hoje. A diferença é o preço da flexibilidade que você está pagando.

## Perguntas de Entrevista

- Qual a diferença entre simples e fácil?
- Como você mede simplicidade de forma que duas pessoas concordem?
- Quando a solução simples é a errada?

## Para Aprofundar

- Hickey, Rich. *Simple Made Easy*, Strange Loop 2011.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018.
- Beck, Kent. *Extreme Programming Explained*. 2ª ed., 2004 — as quatro regras
  de design simples.
