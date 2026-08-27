---
id: dry
title: DRY
sidebar_position: 2
description: Não repita conhecimento — e por que a leitura comum, sobre repetir texto, causa mais dano que a duplicação.
doc_type: concept
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor distingue duplicação de conhecimento de coincidência
  textual e sabe quando duplicar é a decisão correta.
prerequisites: [fundamentals]
related: [kiss, yagni, code-smells]
canonical_for: [DRY, duplicação de conhecimento]
content_version: 1
last_reviewed: 2026-08-26
---

# DRY

## Visão Geral

DRY — *Don't Repeat Yourself* — é formulado por Hunt e Thomas como:

> Cada porção de conhecimento deve ter uma representação única, não ambígua e
> autoritativa dentro de um sistema.

A palavra que faz o trabalho é **conhecimento**. Não é sobre texto. Dois trechos
de código idênticos que representam decisões independentes não violam DRY; um
trecho que representa a mesma regra escrita duas vezes viola, ainda que a redação
seja diferente.

## Problema

A leitura popular — "não repita código" — causa mais dano que a duplicação que
pretende evitar.

O padrão é reconhecível. Alguém nota dois trechos parecidos e extrai uma função
comum. Meses depois, um dos dois casos precisa mudar. A função ganha um parâmetro
booleano. Depois outro. Ao final, ela tem cinco parâmetros de configuração,
nenhum chamador usa a mesma combinação, e ninguém consegue alterá-la sem
verificar todos os usos.

O que aconteceu: os dois trechos eram **coincidentemente iguais**, não a mesma
decisão. Unificá-los acoplou duas coisas que precisavam evoluir separadamente.

A regra de Sandi Metz resume: **duplicação é muito mais barata que a abstração
errada.**

## Conceitos Centrais

### Conhecimento, não texto

Duas perguntas separam os casos:

1. Se esta regra mudar, os dois lugares mudam juntos, sempre?
2. Existe uma decisão de negócio única por trás dos dois?

Duas respostas "sim" indicam duplicação de conhecimento — unifique. Qualquer
"não" indica coincidência — deixe separado.

| Situação | Veredito |
|---|---|
| Alíquota de imposto em dois cálculos | Duplicação de conhecimento — unifique |
| Duas validações de formato de e-mail | Duplicação — unifique |
| Duas estruturas com os mesmos cinco campos, em contextos diferentes | Coincidência — deixe |
| Duas rotinas de retry com a mesma forma, para serviços diferentes | Provavelmente coincidência |

O terceiro caso é o que mais engana. `PedidoDTO` e `PedidoEntidade` com campos
idênticos parecem duplicação. Não são: uma representa o contrato externo, a outra
o modelo interno, e elas vão divergir na primeira mudança de API.

### A regra dos três

Espere a terceira ocorrência antes de abstrair.

Duas ocorrências não distinguem coincidência de conhecimento — a semelhança pode
ser acidental. A terceira revela a forma real, e o que varia entre as três é
exatamente o que a abstração precisa parametrizar.

### DRY atravessa fronteiras com custo

Unificar conhecimento dentro de um módulo é barato. Unificar entre módulos cria
acoplamento; entre serviços, cria uma biblioteca compartilhada, que acopla os
ciclos de release de times diferentes.

É por isso que um dos trade-offs recorrentes é
[acoplamento versus duplicação](../20-trade-offs/index.md), e por que times
maduros frequentemente **escolhem duplicar** entre bounded contexts.

## Onde a duplicação de conhecimento se esconde

Duplicação de código é visível: ferramentas a detectam. Duplicação de
conhecimento frequentemente não tem nenhuma linha em comum, e é a que causa os
bugs silenciosos.

**Entre código e banco.** Uma restrição de unicidade no esquema e uma validação
na aplicação expressam a mesma regra. Quando a regra muda, os dois precisam
mudar — e é comum um ficar para trás.

**Entre código e configuração.** Um valor padrão no código e outro no arquivo de
configuração. Ninguém sabe qual vence até o incidente.

**Entre código e documentação.** Uma regra descrita no manual do operador e
implementada de forma sutilmente diferente.

**Entre serviços.** Dois serviços que replicam a mesma validação de negócio, cada
um por sua conta, porque compartilhar acoplaria os times. Aqui a duplicação pode
ser a decisão correta — mas precisa ser deliberada e anotada, não acidental.

**Entre código e teste.** Um teste que reimplementa a lógica que verifica passa
sempre, inclusive quando ambos estão errados pela mesma razão.

O padrão comum: quanto mais distantes os dois lugares, menos visível a duplicação
e maior a chance de divergirem sem que ninguém perceba.

## Modelo Mental

**Pergunte se os dois lugares mudam pela mesma razão.** É a mesma pergunta de
[coesão](../01-fundamentals/cohesion.md) e
[separação de responsabilidades](../01-fundamentals/separation-of-concerns.md),
aplicada a duplicação.

## Quando Usar

- Quando a mesma regra de negócio está escrita em mais de um lugar.
- Quando esquecer de atualizar um dos lugares produziria um bug silencioso.
- Quando a terceira ocorrência apareceu e a forma se estabilizou.
- Dentro de um mesmo módulo, onde o custo de unificar é baixo.

## Quando Não Usar

**Quando a semelhança é coincidência.** O caso mais comum e o mais caro de errar.

**Entre bounded contexts.** Duas representações de "cliente" em contextos
diferentes devem divergir. Unificá-las produz um modelo que não serve bem a
nenhum dos dois.

**Quando unificar exige parâmetros de configuração.** Cada booleano adicionado a
uma função extraída é evidência de que os casos não eram o mesmo.

**Entre serviços, via biblioteca compartilhada.** O custo é acoplamento de
release entre times. Às vezes vale; frequentemente não, e quase nunca é
contabilizado.

**Com apenas duas ocorrências.** Espere a terceira.

## Alternativas

- **Duplicação deliberada e anotada** — duplicar, com comentário dizendo por quê e
  qual condição levaria a unificar.
- **Extrair só o que é estável** — unificar o núcleo invariante e deixar as
  bordas duplicadas.
- **Contrato compartilhado sem código compartilhado** — publicar um esquema em
  vez de uma biblioteca.

## Trade-offs

| Unificar | Duplicar |
|---|---|
| Uma fonte de verdade | Cada lado evolui livre |
| Mudança consistente por construção | Risco de divergir sem aviso |
| Menos código | Mais código |
| Acoplamento entre os usos | Independência |
| Custo alto se a abstração estiver errada | Custo baixo de reverter |

A assimetria decisiva: desfazer duplicação é fácil; desfazer a abstração errada é
caro, porque outros já dependem dela.

## Modos de Falha

**Abstração com parâmetros de configuração.** O sinal mais confiável de
unificação indevida.

**Biblioteca compartilhada como gargalo.** Toda mudança nela exige coordenar
releases de vários times.

**Divergência silenciosa.** O caso oposto: duplicação real de conhecimento, um
lado atualizado, o outro não, e nada avisa.

**Unificação por semelhança estrutural.** Duas coisas com a mesma forma e
significados diferentes.

## Erros Comuns

**Ler DRY como "não repita código".** A raiz de tudo.

**Extrair na segunda ocorrência.** Cedo demais para distinguir.

**Tratar `PedidoDTO` e `PedidoEntidade` como duplicação.** São camadas diferentes
com razões de mudança diferentes.

**Aplicar DRY entre bounded contexts.** É onde o custo é maior e o benefício,
menor.

**Não anotar a duplicação deliberada.** Sem registro, o próximo desenvolvedor a
"corrige".

## Exemplo Real

Um sistema tinha cálculo de desconto em dois lugares: no carrinho, para exibir ao
cliente, e no fechamento, para cobrar.

Um refatoramento unificou os dois em `CalculadoraDeDesconto`. Correto: era a mesma
regra de negócio, e divergência entre exibido e cobrado seria um bug grave.

No mesmo sistema, outro refatoramento unificou a validação de endereço de entrega
com a de endereço de cobrança — mesma estrutura, mesmos campos.

Onze meses depois, endereço de cobrança passou a aceitar caixa postal e endereço
de entrega não. A função validadora ganhou `permiteCaixaPostal: boolean`. Depois,
cobrança passou a aceitar endereço estrangeiro: `permiteInternacional: boolean`.
Ao final, quatro parâmetros e nenhum chamador com a mesma combinação.

A separação seria trivial na primeira divergência. Na quarta, exigiu entender
todas as combinações em uso.

Os dois casos eram textualmente parecidos. Só um era conhecimento duplicado.

## Conceitos Relacionados

- [Coesão](../01-fundamentals/cohesion.md) — a mesma pergunta sobre razão de mudança.
- [Abstração](../01-fundamentals/abstraction.md) — o custo de abstrair cedo.
- [Acoplamento vs. Duplicação](../20-trade-offs/index.md) — o trade-off em detalhe.
- [Code Smells](code-smells.md) — como reconhecer os sintomas.

## Exercício Prático

Encontre no seu sistema uma função com três ou mais parâmetros booleanos.

Liste os chamadores e as combinações que cada um usa. Se nenhuma combinação se
repete, a função unificou casos que não eram o mesmo.

Depois responda: separá-la em funções distintas produziria duplicação de
conhecimento ou apenas de texto?

## Perguntas de Entrevista

- Qual a formulação correta de DRY?
- Como distingue duplicação de conhecimento de coincidência?
- Por que "duplicação é mais barata que a abstração errada"?

## Para Aprofundar

- Hunt, Andrew; Thomas, David. *The Pragmatic Programmer*. 2ª ed.,
  Addison-Wesley, 2019 — a formulação original.
- Metz, Sandi. *The Wrong Abstraction*, 2016.
