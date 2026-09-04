---
id: technical-debt
title: Dívida Técnica
sidebar_position: 18
description: Custo futuro assumido conscientemente — e por que quase tudo que recebe esse nome não é dívida.
doc_type: concept
level: 1
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue dívida deliberada de trabalho mal feito e
  decide quando pagar a partir dos juros observados.
prerequisites: [complexity]
related: [architecture-evolution, dependency-management]
canonical_for: [dívida técnica, technical debt]
content_version: 2
last_reviewed: 2026-08-26
---

# Dívida Técnica

## Visão Geral

Dívida técnica é o custo futuro assumido ao escolher uma solução mais rápida
agora em vez da adequada.

A metáfora é de Ward Cunningham e tem uma parte que quase sempre se perde: dívida
pressupõe **decisão consciente** e **intenção de pagar**. Sem os dois, não é
dívida — é trabalho mal feito, que é outra coisa e se trata de outro jeito.

## Problema

"Dívida técnica" virou o nome de tudo que está ruim no código. Isso destrói a
utilidade do conceito de duas maneiras.

Primeiro, torna o problema não acionável. Se dívida abrange desde um atalho
deliberado de duas semanas até um sistema construído sem entendimento do domínio,
não há decisão possível sobre o conjunto.

Segundo, e pior: o nome empresta legitimidade. Dívida é uma decisão financeira
respeitável. Chamar de dívida o que foi feito por desconhecimento transforma um
problema de capacidade em uma escolha estratégica que ninguém fez.

A pergunta que separa os casos: **alguém decidiu isso sabendo do custo?** Se sim,
é dívida. Se não, é outra coisa — e a outra coisa não se paga refatorando, se
resolve aprendendo.

## Conceitos Centrais

### O quadrante

Martin Fowler classifica em dois eixos: deliberado ou inadvertido, prudente ou
imprudente.

| | Prudente | Imprudente |
|---|---|---|
| **Deliberado** | "Lançamos agora e refatoramos depois — sabemos o custo" | "Não temos tempo para design" |
| **Inadvertido** | "Agora que terminamos, sabemos como deveria ter sido" | "O que é design em camadas?" |

Só o quadrante superior esquerdo é dívida no sentido útil. O inferior direito é
falta de competência. O superior direito é imprudência. O inferior esquerdo é
aprendizado — e é inevitável e saudável.

Tratar os quatro com a mesma palavra impede tratar cada um com a resposta
correta.

### Juros

O custo da dívida não é o esforço de corrigi-la. São os **juros**: o custo extra
de cada mudança enquanto ela existe.

Isso muda a decisão de quando pagar. Dívida em código que ninguém toca tem juros
zero — é dívida sem custo corrente, e pagá-la é gasto puro. Dívida no caminho de
toda mudança tem juros altos e se paga rápido.

A pergunta operacional não é "isto está ruim?", e sim **"quanto isto está nos
custando por mês?"**. Um módulo feio e estável perde para um módulo medíocre no
caminho crítico.

### Dívida arquitetural

Dívida no nível de código é local e paga-se com refatoração. Dívida arquitetural
— uma fronteira no lugar errado, um modelo de dados inadequado, um acoplamento
estrutural — não se paga incrementalmente com a mesma facilidade.

Os juros dela também são maiores: afetam toda mudança que atravessa a fronteira
errada, não apenas quem toca aquele arquivo.

É o tipo que mais importa em arquitetura e o que menos aparece nas listas de
dívida dos times, porque não é visível em métricas de código.

### Dívida deliberada precisa de registro

Uma dívida assumida e não registrada é indistinguível, seis meses depois, de
trabalho mal feito. Ninguém lembra que foi decisão, ninguém sabe qual era a
alternativa, e a condição em que se pretendia pagar se perdeu.

O registro mínimo: o que foi feito, o que teria sido feito com mais tempo, e
**sob qual condição vale pagar**. Isso pertence a um
[ADR](/18-architecture-decisions/what-is-an-adr.md) quando a dívida é arquitetural.

## Modelo Mental

**Dívida técnica é uma decisão de financiamento.** Você toma emprestado tempo
agora e paga com juros depois.

Como toda decisão de financiamento, pode ser sensata. Antecipar um lançamento
para validar mercado pode valer meses de juros. O que não é sensato é tomar
emprestado sem saber a taxa.

## Quando Usar

Assumir dívida deliberadamente faz sentido quando:

- **A informação que falta é mais valiosa que o custo.** Construir o certo exige
  saber o que vai ser usado; um atalho que produz esse aprendizado se paga.
- **Existe uma janela com consequência externa.** Evento, obrigação regulatória,
  concorrente.
- **O código pode ser descartado.** Dívida em algo que provavelmente será jogado
  fora nunca vence.
- **Os juros são baixos e conhecidos.** Atalho num módulo periférico e estável.

## Quando Não Usar

**Quando não há plano nem condição de pagamento.** Dívida sem intenção de pagar é
só decisão ruim com nome melhor.

**Em fundação.** Dívida no modelo de dados, nas fronteiras principais ou no
contrato público tem juros que crescem com o sistema e é a mais cara de pagar.
Atalho ali raramente compensa.

**Quando o "depois" é estruturalmente improvável.** Se o time nunca teve espaço
para pagar dívida anterior, assumir mais não é financiamento — é acumulação.

**Quando a alternativa correta custa pouco mais.** Se fazer certo custa dois dias
a mais, não há dívida a discutir.

## Alternativas

- **Reduzir escopo** — entregar menos, bem feito. Frequentemente melhor que
  entregar tudo com atalho, e raramente considerado.
- **Descartar explicitamente** — construir sabendo que será jogado fora, sem
  fingir que vira produção.
- **Negociar prazo** — a alternativa que engenharia menos exercita.

## Trade-offs

O eixo é **velocidade agora versus custo de mudança depois**.

| Assumir a dívida | Fazer o adequado |
|---|---|
| Entrega antes | Entrega depois |
| Aprende com uso real mais cedo | Constrói sobre suposição |
| Juros em toda mudança futura | Sem juros |
| Risco de nunca pagar | Custo integral pago agora |
| Pode ser descartado sem perda | Investimento pode ser desperdiçado |

Note a simetria: fazer o adequado também pode ser desperdício, se o que foi bem
construído acabar descartado. Nenhum dos lados é gratuito.

## Modos de Falha

**Dívida que vira permanente.** O "depois" nunca chega. O sistema é construído
sobre o atalho, e removê-lo passa a exigir tocar tudo o que veio depois.

**Juros compostos.** Cada nova funcionalidade contorna a dívida em vez de
corrigi-la, e o contorno vira dívida também. O custo cresce de forma acelerada.

**Dívida invisível.** Não registrada, não medida, percebida só como "o sistema
está lento para mudar" — sem causa identificável.

**Refatoração sem critério.** Pagar a dívida errada. Times gastam trimestres
melhorando código de juros baixos porque era o mais visível ou o mais
desconfortável.

## Erros Comuns

**Chamar tudo de dívida técnica.** Dissolve o conceito e legitima o que foi feito
por desconhecimento.

**Priorizar pelo que incomoda mais.** O código mais feio raramente é o mais caro.
Priorize pelo que aparece no caminho de mudanças frequentes — o histórico de
commits informa isso melhor que a impressão.

**Pedir "um sprint de dívida técnica".** Trata sintoma. Sem entender por que a
dívida se acumula, ela volta na mesma taxa.

**Não registrar a decisão.** Sem registro, dívida vira mistério em seis meses.

**Assumir dívida na fundação.** É onde os juros são maiores e o pagamento é mais
caro.

## Exemplo Real

Um time precisava lançar cobrança recorrente em seis semanas para uma janela
comercial. O modelo adequado exigia máquina de estados de assinatura, tratamento
de tentativas e reconciliação — estimados em onze semanas.

A dívida assumida: um campo de status simples, sem histórico, com tentativa de
cobrança em processo agendado sem retentativa estruturada.

**O que foi feito diferente do usual:** registraram um ADR com o que foi feito, o
que teria sido feito, e a condição de pagamento — *"quando o volume passar de
5 mil assinaturas ativas ou quando a taxa de falha de cobrança exigir análise por
tentativa"*.

Quatorze meses depois, a segunda condição se materializou. O time tinha o
registro, a alternativa desenhada, e o argumento pronto para priorizar. A
conversa com produto levou uma reunião em vez de um trimestre de negociação.

O contraste vale mais que o caso: no mesmo sistema havia outras oito "dívidas"
conhecidas, nenhuma registrada. Nenhuma delas foi paga, e ninguém sabia dizer
qual era a mais cara.

A diferença não estava na qualidade da decisão original. Estava no registro.

## Conceitos Relacionados

- [Complexidade](/01-fundamentals/complexity.md) — a forma que a dívida acumulada assume.
- [Evolução da Arquitetura](/01-fundamentals/architecture-evolution.md) — como o sistema muda ao
  longo do tempo.
- [ADRs](/18-architecture-decisions/what-is-an-adr) — onde a dívida deliberada é
  registrada.

## Exercício Prático

Liste o que seu time chama de dívida técnica. Classifique cada item nos quatro
quadrantes.

Para os deliberados, existe registro da decisão e da condição de pagamento?

Para todos, estime os juros: quantas vezes nos últimos seis meses alguém pagou
custo extra por causa daquilo? Os de juros zero podem ficar.

## Perguntas de Entrevista

- O que distingue dívida técnica de código mal escrito?
- Como você prioriza o que pagar?
- Quando assumir dívida deliberadamente é a decisão correta?

## Para Aprofundar

- Cunningham, Ward. *The WyCash Portfolio Management System*, OOPSLA 1992 — a
  metáfora original.
- Fowler, Martin. *Technical Debt Quadrant*, 2009.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — medir
  juros pelo histórico de mudança.
