---
id: functional-requirements
title: Requisitos Funcionais
sidebar_position: 7
description: O que o sistema faz — e por que sozinhos eles quase nunca determinam a arquitetura.
doc_type: foundation
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor distingue requisito funcional de não-funcional e
  reconhece por que os funcionais raramente decidem a arquitetura sozinhos.
prerequisites: [problem-space]
related: [non-functional-requirements, quality-attributes]
canonical_for: [requisitos funcionais, functional requirements]
content_version: 1
last_reviewed: 2026-08-26
---

# Requisitos Funcionais

## Visão Geral

Requisitos funcionais descrevem o que o sistema faz: que entradas aceita, que
transformações aplica, que saídas produz, que regras respeita.

São necessários e quase nunca suficientes para decidir uma arquitetura.

## O Problema

A observação que organiza este documento é contraintuitiva: **dois sistemas com
requisitos funcionais idênticos podem exigir arquiteturas completamente
diferentes.**

"Registrar um pedido, cobrar e notificar o cliente" descreve tanto uma loja com
cem pedidos por dia quanto um marketplace com cem mil por minuto. As funções são
as mesmas. As arquiteturas não têm nada em comum.

Isso significa que requisitos funcionais delimitam o que o sistema precisa
conseguir fazer, mas o **como** é decidido por outra coisa: os
[atributos de qualidade](quality-attributes.md) e as
[restrições](constraints.md).

O erro que decorre daí é comum e caro: levantar requisitos funcionais com rigor,
tratá-los como a especificação completa, e descobrir na primeira semana de
produção que a arquitetura não sustenta o volume, a latência ou a garantia que
ninguém escreveu.

## Conceitos Centrais

### O que é e o que não é

| É requisito funcional | Não é |
|---|---|
| "O sistema calcula frete a partir do CEP e do peso" | "O cálculo de frete responde em menos de 200 ms" |
| "Um pedido cancelado não pode ser faturado" | "O sistema fica disponível 99,9% do mês" |
| "O relatório mensal inclui devoluções" | "O relatório é gerado sem impactar a operação" |

A coluna da esquerda descreve comportamento; a da direita, qualidade do
comportamento. Ambas são requisitos. Só a primeira é funcional.

### Regras de negócio são o núcleo

Dentro dos requisitos funcionais, as regras de negócio merecem atenção separada:
são as que expressam decisões da empresa, mudam com frequência, e são a fonte
principal de complexidade essencial.

"Clientes com mais de doze meses e sem inadimplência têm limite ampliado em 40%"
é uma regra que vai mudar. Onde ela mora, e quão fácil é alterá-la, é uma
decisão arquitetural — mesmo que a regra em si seja funcional.

### Requisitos funcionais influenciam fronteiras

Embora não decidam a arquitetura sozinhos, eles informam onde as fronteiras
podem cair. Funcionalidades que mudam juntas e compartilham vocabulário tendem a
pertencer ao mesmo módulo; as que mudam por razões independentes, a módulos
separados.

Esse é o insumo que o [DDD estratégico](../04-domain-driven-design/index.md)
transforma em bounded contexts.

### Casos de exceção são requisito, não detalhe

O fluxo principal costuma ser bem descrito. O que decide arquitetura são os
outros: o pagamento que falha após o estoque ser reservado, o cliente que cancela
durante o envio, a integração externa que não responde.

Esses casos determinam se o sistema precisa de compensação, de idempotência, de
máquina de estados — decisões de alto custo de reversão. Levantá-los junto com o
fluxo principal é o que evita descobri-los depois.

## Modelo Mental

**Requisitos funcionais dizem o que o sistema precisa conseguir fazer. Atributos
de qualidade dizem quão bem. Restrições dizem o que está fora da mesa.**

Os três juntos formam a entrada da arquitetura. Nenhum sozinho basta, e o
primeiro é o que mais frequentemente é confundido com o conjunto.

## Por Que Isso Importa

**Porque delimita o escopo do que precisa existir.** Sem requisitos funcionais
claros, não há como saber se o sistema está pronto nem o que ele deveria fazer
em cada caso.

**Porque a separação evita a falha mais comum de projeto.** Times que levantam
apenas o funcional produzem sistemas que fazem tudo certo e não aguentam a
carga — e o retrabalho para corrigir isso é arquitetural, não incremental.

**Porque os casos de exceção decidem estrutura.** Levantá-los tarde significa
descobrir tarde que o modelo de dados não comporta compensação, que é exatamente
o tipo de descoberta cara.

## Erros Comuns

**Tratar requisitos funcionais como a especificação completa.** O erro
estruturante. Produz a pergunta "por que o sistema está lento?" formulada como
se fosse defeito, quando é ausência de requisito.

**Descrever solução em vez de comportamento.** "O sistema envia o pedido para uma
fila" não é requisito funcional; é decisão de design travestida. O requisito é
"o pedido é processado sem bloquear a confirmação ao cliente".

**Documentar só o caminho feliz.** Os casos de exceção são onde a arquitetura é
decidida, e são os que ficam de fora quando o levantamento é apressado.

**Ignorar quem mais precisa da funcionalidade.** Uma funcionalidade consumida por
outro time ou sistema tem requisito de contrato que uma funcionalidade interna
não tem — e isso muda seu custo de mudança.

**Confundir volume com função.** "Processar mil pedidos por segundo" não é
requisito funcional. É atributo de qualidade sobre a função "processar pedido", e
tratá-lo como funcional esconde que ele é o que decide a arquitetura.

## Exemplo Real

Requisito recebido: *"O sistema deve permitir que o cliente cancele o pedido."*

Como está, é insuficiente para arquitetar. As perguntas que faltam são todas
funcionais:

- Cancelar é possível até que momento? Antes do pagamento, do faturamento, do
  envio?
- Cancelamento parcial existe?
- O que acontece com o estoque já reservado? E com o pagamento já capturado?
- Se o pedido já saiu, cancelar vira devolução? É a mesma operação ou outra?
- Quem pode cancelar — só o cliente, ou também o operador?

As respostas mudam a arquitetura de forma direta. Se cancelar só é possível antes
do pagamento, uma operação simples resolve. Se é possível após captura e envio,
o sistema precisa de estorno, de reversão de estoque e de coordenação com a
transportadora — o que provavelmente significa uma
[saga](../06-distributed-systems/index.md), com tudo o que ela custa.

O mesmo enunciado de uma linha cobre os dois casos. A diferença arquitetural
entre eles é de meses.

## Conceitos Relacionados

- [Requisitos Não-Funcionais](non-functional-requirements.md) — a outra metade.
- [Atributos de Qualidade](quality-attributes.md) — o que de fato decide a
  arquitetura.
- [Espaço do Problema](problem-space.md) — de onde os requisitos vêm.

## Exercício Prático

Pegue uma funcionalidade do seu sistema e liste todos os casos de exceção que ela
precisa tratar — falha externa, cancelamento no meio, dado inconsistente,
operação repetida.

Para cada um, pergunte: o sistema atual trata isso? Se sim, onde? Se não, o que
acontece hoje quando ocorre?

Os casos não tratados são requisitos funcionais que existem e nunca foram
declarados.

## Perguntas de Entrevista

- Qual a diferença entre requisito funcional e não-funcional?
- Por que dois sistemas com os mesmos requisitos funcionais podem precisar de
  arquiteturas diferentes?
- Como você levanta os casos de exceção que decidem estrutura?

## Para Aprofundar

- Wiegers, Karl; Beatty, Joy. *Software Requirements*. 3ª ed., Microsoft Press,
  2013.
- Cockburn, Alistair. *Writing Effective Use Cases*. Addison-Wesley, 2000 —
  sobre fluxos alternativos e de exceção.
