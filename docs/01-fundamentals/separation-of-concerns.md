---
id: separation-of-concerns
title: Separação de Responsabilidades
sidebar_position: 12
description: Cada parte trata de um assunto — e por que "assunto" é a palavra que faz o trabalho.
doc_type: concept
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor identifica responsabilidades misturadas usando o eixo de
  mudança como critério, e reconhece quando separar produz mais dano que ganho.
prerequisites: [modularity]
related: [coupling, cohesion, abstraction]
canonical_for: [separação de responsabilidades, separation of concerns]
content_version: 1
last_reviewed: 2026-08-26
---

# Separação de Responsabilidades

## Visão Geral

Separação de responsabilidades é o princípio de que cada parte do sistema deve
tratar de um assunto, e de que assuntos distintos devem ficar em partes
distintas.

A dificuldade inteira está em "assunto". O princípio é trivialmente aceito e
raramente aplicado bem, porque a definição do que conta como um assunto separado
é onde o julgamento acontece.

## Problema

Código que mistura responsabilidades é difícil de mudar por uma razão precisa:
para alterar um assunto, é preciso entender e não quebrar os outros que moram no
mesmo lugar.

Uma função que valida entrada, aplica regra de negócio, formata saída e grava no
banco tem quatro razões para mudar. Qualquer uma delas obriga a reler as outras
três e arriscar quebrá-las.

O efeito composto é o que importa: cada assunto adicional no mesmo lugar não soma
dificuldade, multiplica. Quatro assuntos misturados não são quatro vezes mais
difíceis de mudar que um — são muito mais, porque as interações entre eles também
precisam ser mantidas na cabeça.

## Conceitos Centrais

### O eixo é a razão de mudança

O critério operacional, e o mesmo que orienta
[modularidade](modularity.md): duas coisas são assuntos distintos se mudam por
razões diferentes.

Validação de formato muda quando o contrato de entrada muda. Regra de negócio
muda quando a empresa decide diferente. Persistência muda quando o esquema ou a
tecnologia muda. Três razões independentes, três assuntos.

Isso é a formulação prática do Princípio da Responsabilidade Única, que fala em
"uma razão para mudar" e é frequentemente lido como "fazer uma coisa só" — leitura
que leva a fragmentar código sem critério.

### Responsabilidades transversais

Alguns assuntos atravessam todo o sistema: log, autenticação, transação,
telemetria, tratamento de erro.

Eles não podem ser isolados num módulo porque precisam estar em toda parte. A
separação, aqui, é feita por outro mecanismo — middleware, decoradores,
interceptadores, aspectos — que mantém o assunto em um lugar e o aplica em
muitos.

Misturar transversais no código de negócio é a forma mais comum de violação do
princípio, e a mais tolerada.

### Separar não é fragmentar

O princípio diz que assuntos distintos ficam separados. Não diz que tudo deve ser
pequeno.

Aplicá-lo mecanicamente produz o problema oposto: dezenas de unidades minúsculas
que sempre mudam juntas, entre as quais o leitor precisa saltar para entender um
fluxo. A separação aumentou o custo de leitura sem reduzir o de mudança — porque
não havia razões de mudança independentes para começar.

Se duas coisas sempre mudam juntas, elas são um assunto só, e separá-las é erro.

## Modelo Mental

**Conte as razões pelas quais este código mudaria.**

Se a lista tem mais de um item e os itens são independentes, há responsabilidades
misturadas. Se tem mais de um item mas eles sempre ocorrem juntos, é um assunto
só — e separar seria dano.

## Quando Usar

- Quando um trecho tem razões de mudança genuinamente independentes.
- Quando um assunto precisa ser testado sem os outros.
- Quando pessoas diferentes precisam alterar assuntos diferentes do mesmo fluxo.
- Quando um assunto transversal está espalhado e duplicado.
- Quando um assunto precisa ser substituído — trocar o provedor de pagamento sem
  tocar na regra de cobrança.

## Quando Não Usar

**Quando os assuntos sempre mudam juntos.** É o caso mais importante e o mais
ignorado. Separar aqui produz indireção pura: o leitor salta entre arquivos e não
ganha nada, porque nunca vai alterar um sem o outro.

**Quando a separação exige uma abstração que não se sustenta.** Separar regra de
negócio de persistência é fácil de enunciar e às vezes caro de fazer — se a regra
depende de agregação que só o banco faz eficientemente, forçar a separação
produz uma abstração que vaza ou um desempenho inaceitável.

**Em código descartável.** Protótipo, script de migração, análise pontual.
Separar responsabilidades é investimento em mudança futura; onde não haverá
mudança futura, o investimento não se paga.

**Quando o custo de navegação supera o de mudança.** Um fluxo que atravessa oito
arquivos para fazer o que caberia legivelmente em um está separado demais. O
sintoma é precisar de um diagrama para entender uma operação simples.

## Alternativas

- **Coesão por proximidade** — manter junto o que muda junto, sem impor
  separação formal. É o default correto até que razões independentes apareçam.
- **Separação por convenção** — mais barata e menos confiável que separação
  imposta.
- **Aspectos e middleware** — para transversais, é a alternativa correta à
  separação por módulo.

## Trade-offs

O eixo é **custo de mudar um assunto versus custo de entender o fluxo inteiro**.

| Mais separação | Menos separação |
|---|---|
| Mudança isolada em um assunto | Mudança exige entender vizinhos |
| Cada parte testável sozinha | Teste carrega tudo |
| Substituir um assunto é viável | Substituição toca tudo |
| Fluxo exige saltar entre arquivos | Fluxo legível linearmente |
| Abstrações a manter e justificar | Sem abstração intermediária |

Vale notar que os dois lados falham do mesmo jeito no extremo: código
impossível de entender. As causas são opostas.

## Modos de Falha

**Abstração vazada.** A separação existe formalmente, mas o consumidor precisa
saber como o outro lado funciona. Um repositório que devolve estruturas do ORM
não separou persistência de domínio.

**Separação no eixo errado.** Assuntos que mudam juntos foram separados; os que
mudam independentemente ficaram juntos. Pior que não separar, porque tem o custo
sem o benefício.

**Transversal espalhado.** Tratamento de erro replicado em cada função, com
variações sutis. Quando a política muda, muda em trinta lugares — e em dois deles
alguém esquece.

**Camadas anêmicas.** Camadas que existem por simetria e apenas repassam chamadas,
sem tratar assunto nenhum. Custo de navegação sem separação real.

## Erros Comuns

**Ler o Princípio da Responsabilidade Única como "faça uma coisa só".** Leva a
fragmentar sem critério. A formulação correta é sobre razões de mudança.

**Separar por tipo técnico em vez de por assunto.** Todos os validadores num
lugar, todos os mapeadores em outro. Agrupa o que muda por razões diferentes.

**Aceitar transversal misturado por conveniência.** Log e transação dentro da
regra de negócio parecem inofensivos e são a violação mais comum.

**Confundir com camadas.** Camadas são uma forma de separar responsabilidades,
não a definição dela. Um sistema em camadas pode ter responsabilidades
tremendamente misturadas dentro de cada uma.

## Exemplo Real

Uma função de processamento de pedido, com 180 linhas, fazia: validar o payload,
verificar estoque, calcular impostos, aplicar desconto, gravar, emitir evento e
enviar e-mail.

A pergunta aplicada foi "quantas razões de mudança?". A resposta revelou algo que
a contagem de linhas não revelava.

Cinco razões distintas: o contrato de entrada, a regra fiscal, a política
comercial de desconto, o esquema de persistência, e a integração de notificação.

Mas duas coisas que pareciam separáveis — verificar estoque e gravar o pedido —
sempre mudavam juntas, porque a reserva de estoque fazia parte da mesma
transação. Separá-las teria criado uma abstração que precisaria ser furada na
primeira alteração.

O resultado: cinco unidades, não sete. E a mais valiosa foi a de regra fiscal,
que passou a ser alterável e testável sem tocar em nada do resto — o que
importava porque regra fiscal muda por decisão externa, com prazo, várias vezes
por ano.

## Conceitos Relacionados

- [Modularidade](modularity.md) — a estrutura que materializa a separação.
- [Coesão](cohesion.md) — a medida de se o que ficou junto pertence junto.
- [Abstração](abstraction.md) — o mecanismo que torna a separação possível.

## Exercício Prático

Escolha a função mais longa do seu sistema e liste as razões pelas quais ela
mudaria. Seja específico: não "mudança de regra", mas "quando o time fiscal
alterar a alíquota".

Para cada par de razões, pergunte: já aconteceu de uma mudar sem a outra?

Só os pares que já divergiram justificam separação. Os demais são um assunto só.

## Perguntas de Entrevista

- Como identifica responsabilidades misturadas?
- Quando separar responsabilidades piora o código?
- Qual a diferença entre separação de responsabilidades e camadas?

## Para Aprofundar

- Dijkstra, Edsger. *On the role of scientific thought*, 1974 — origem do termo.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — o Princípio da
  Responsabilidade Única em termos de razão de mudança.
