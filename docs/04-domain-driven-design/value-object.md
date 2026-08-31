---
id: value-object
title: Value Object
sidebar_position: 12
description: Objeto definido pelos seus valores, imutável — o bloco tático de melhor retorno.
doc_type: pattern
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor identifica conceitos que deveriam ser objetos de valor e
  reconhece o ganho de eliminar obsessão por primitivos.
prerequisites: [entity]
related: [entity, aggregate, code-smells]
canonical_for: [value object, objeto de valor]
content_version: 1
last_reviewed: 2026-08-26
---

# Value Object

## Visão Geral

Um objeto de valor é definido pelos seus atributos, não por identidade. Dois
objetos com os mesmos valores são intercambiáveis.

É o bloco tático de melhor relação entre esforço e retorno — e o mais
subutilizado.

## Problema

Conceitos do domínio representados por tipos primitivos espalham responsabilidade
e permitem erros que o compilador poderia impedir.

```text
void transferir(String origem, String destino, BigDecimal valor)
```

Três problemas nessa assinatura.

**Troca silenciosa.** Nada impede passar destino no lugar de origem — são do mesmo
tipo.

**Validação espalhada.** Onde se verifica que a conta é válida? Em cada chamador,
com variações.

**Semântica ausente.** `BigDecimal` não sabe que dinheiro tem moeda, que não se
soma valores de moedas diferentes, e que o arredondamento segue regra específica.

É o *primitive obsession* do catálogo de
[code smells](/02-software-design/code-smells.md), e objetos de valor são a
correção.

## Conceitos Centrais

### Imutabilidade é requisito

Um objeto de valor não muda. Operações devolvem novos objetos:

```text
salario.acrescido(reajuste)   → novo Dinheiro
periodo.estendidoAte(data)    → novo Periodo
```

Isso elimina uma classe inteira de defeitos: não há como alterar um valor
compartilhado por acidente, e não há necessidade de cópia defensiva.

### Válido por construção

O construtor valida. Se `Cpf` existe, ele é válido — não há como criar um
inválido.

Isso concentra a validação em um lugar e a torna impossível de esquecer. Quem
recebe um `Cpf` não precisa verificar nada.

O ganho é maior do que parece: elimina a verificação defensiva espalhada e o
tratamento do caso "e se estiver inválido?" em cada consumidor.

### Comportamento pertence ao valor

Um objeto de valor não é só um invólucro de dado. Ele carrega as operações do
conceito.

`Dinheiro` sabe somar apenas com a mesma moeda, sabe ratear com regra de
arredondamento definida, sabe comparar. `Periodo` sabe se contém uma data, se
sobrepõe outro período, quantos dias úteis tem.

Um objeto de valor sem comportamento é um invólucro com pouco retorno.

### Onde eles aparecem no domínio

Os candidatos são reconhecíveis: dinheiro, quantidade com unidade, período,
intervalo, endereço, documento, código, coordenada, percentual, faixa.

Regra prática: **qualquer conceito que o negócio nomeia e que hoje é um primitivo
ou um grupo de primitivos que andam juntos.**

O segundo caso — *data clumps* — é o mais frequente: `dataInicio` e `dataFim`
sempre passados juntos são um `Periodo`.

## Quando Usar

- Um conceito do domínio está representado por primitivo.
- Vários primitivos sempre andam juntos.
- Há validação que se repete em vários lugares.
- Há regra sobre o conceito — arredondamento, comparação, formatação — espalhada.
- Trocar dois parâmetros do mesmo tipo é um erro possível.

## Quando Não Usar

**Quando o conceito tem identidade.** É [entidade](/04-domain-driven-design/entity.md).

**Quando não há comportamento nem validação.** Um invólucro puro sobre uma cadeia
de caracteres, sem nenhuma regra, adiciona cerimônia sem retorno. Vale quando há
pelo menos validação.

**Em subdomínios genéricos ou de apoio.** A cerimônia não se paga fora do core.

**Quando a linguagem torna caro.** Em plataformas onde cada objeto tem custo
significativo e o volume é enorme, o impacto precisa ser medido — embora isso
seja menos comum do que se supõe.

**Para dados de transporte.** Um DTO de API não precisa de objetos de valor
internos.

## Alternativas

- **Tipo primitivo com validação centralizada** — menos seguro, mais barato.
- **Alias de tipo** — em linguagens que oferecem tipos nominais leves, dá
  segurança de tipo sem classe.
- **Registro imutável** — quando há valores agrupados e pouco comportamento.

## Trade-offs

| Objeto de valor | Primitivo |
|---|---|
| Válido por construção | Validação em cada uso |
| Troca de parâmetro impossível | Silenciosa |
| Comportamento junto do conceito | Espalhado |
| Semântica explícita na assinatura | Ausente |
| Mais tipos no sistema | Menos |
| Conversão na fronteira | Direto |

A última linha é o custo real: objetos de valor precisam ser convertidos ao
atravessar a fronteira do domínio — para persistência, para API. É trabalho de
mapeamento que os primitivos não exigem.

## Modos de Falha

**Objeto de valor mutável.** Perde as garantias e reintroduz o risco de
compartilhamento.

**Igualdade não implementada.** Comparação por referência faz dois valores iguais
parecerem diferentes — e quebra coleções e caches silenciosamente.

**Invólucro anêmico.** Sem validação nem comportamento.

**Explosão de tipos.** Um objeto de valor para cada campo, incluindo os que não
têm regra.

**Vazamento para a API.** O tipo do domínio na fronteira externa amarra o contrato
público ao modelo interno.

## Erros Comuns

**Não implementar igualdade e código de dispersão.** O defeito mais comum e o mais
sutil.

**Criar invólucro sem regra.**

**Torná-lo mutável.**

**Usar em todo lugar, inclusive fora do core.**

## Exemplo Real

Um sistema de folha de pagamento tinha `BigDecimal` para valores monetários e
`double` para percentuais.

Dois defeitos em produção, ambos rastreados à ausência de objetos de valor.

O primeiro: um cálculo de rateio de férias arredondava a cada parcela, e a soma
das parcelas diferia do total em centavos. Multiplicado por 4 mil funcionários,
gerou divergência contábil que levou uma semana para diagnosticar.

O segundo: um percentual foi passado como `0.05` num lugar e `5` em outro — os
dois `double`, nenhum erro de compilação. O desconto saiu 100 vezes maior para 12
funcionários.

A introdução de `Dinheiro` e `Percentual` resolveu os dois.

`Dinheiro` tem `ratear(int partes)` que distribui o resto de forma determinística —
a última parcela absorve a diferença — e garante que a soma das partes é sempre o
total. A regra ficou em um lugar, testada.

`Percentual` só se constrói a partir de um valor com unidade explícita:
`Percentual.deCemAvos(5)` ou `Percentual.deFracao(0.05)`. A ambiguidade
desapareceu na assinatura.

Custo da mudança: duas semanas, incluindo o mapeamento na fronteira de
persistência. Nos três anos seguintes, nenhum defeito da mesma categoria.

## Conceitos Relacionados

- [Entity](/04-domain-driven-design/entity.md) — a outra metade da decisão.
- [Aggregate](/04-domain-driven-design/aggregate.md) — onde eles se compõem.
- [Code Smells](/02-software-design/code-smells.md) — primitive obsession.
- [Encapsulamento](/02-software-design/encapsulation.md).

## Exercício Prático

Procure no seu domínio parâmetros do mesmo tipo primitivo que aparecem juntos numa
assinatura — dois `String`, duas datas, dois números.

Cada par é uma troca silenciosa possível, e um candidato a objeto de valor.

Depois procure validações que se repetem: cada uma que aparece em mais de dois
lugares pertence a um objeto de valor.

## Perguntas de Entrevista

- O que caracteriza um objeto de valor?
- Por que a imutabilidade é requisito?
- Qual o risco de não implementar igualdade corretamente?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *ValueObject*, 2016.
