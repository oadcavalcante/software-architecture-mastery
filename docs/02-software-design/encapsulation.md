---
id: encapsulation
title: Encapsulamento
sidebar_position: 5
description: Esconder o que pode mudar — e por que getters e setters em tudo é o oposto disso.
doc_type: concept
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor avalia encapsulamento pelo que o consumidor precisa saber,
  e reconhece estruturas que expõem estado sob aparência de objeto.
prerequisites: [fundamentals]
related: [interfaces, boundaries, solid]
canonical_for: [encapsulamento, encapsulation, ocultação de informação]
content_version: 1
last_reviewed: 2026-08-26
---

# Encapsulamento

## Visão Geral

Encapsulamento é esconder decisões que podem mudar atrás de uma interface que não
muda.

A formulação de Parnas — *information hiding* — é mais precisa que a versão que
se ensina: não se trata de tornar campos privados. Trata-se de decidir **o que o
resto do sistema não precisa saber**, e garantir que não saiba.

## Problema

O padrão dominante em código orientado a objetos é a classe com campos privados e
um par de acessadores para cada um.

Isso não encapsula nada. Um campo privado com getter e setter públicos é um campo
público com três linhas a mais. Toda decisão sobre a representação interna
continua visível: o tipo, a cardinalidade, a possibilidade de ser nulo, o fato de
existir um campo.

O sintoma que revela: quem usa a classe precisa saber a ordem de chamada, ou
precisa validar antes de chamar, ou precisa combinar vários acessadores para
executar uma operação que faz sentido no domínio. O conhecimento sobre o objeto
está do lado de fora.

## Conceitos Centrais

### Esconder decisão, não dado

A pergunta correta não é "quais campos tornar privados?". É **"que decisões eu
quero poder mudar sem avisar ninguém?"**

Se a resposta inclui "a moeda é armazenada em centavos como inteiro", então o
consumidor não pode ver esse inteiro. Se ele vê, mudar para decimal quebra todo
mundo.

### O objeto expõe operações, não estado

Um objeto encapsulado oferece o que **faz sentido fazer com ele**, não o que ele
contém.

```text
exposto como estado          exposto como operação
─────────────────────        ─────────────────────
pedido.getStatus()           pedido.podeSerCancelado()
pedido.setStatus(X)          pedido.cancelar(motivo)
pedido.getItens().add(i)     pedido.adicionarItem(i)
```

A coluna da direita permite que o objeto garanta suas invariantes. A da esquerda
espalha essa responsabilidade por todos os chamadores — e basta um esquecer.

### Invariante é o que justifica

Um objeto sem invariante a proteger não precisa de encapsulamento. Uma estrutura
de dados que só transporta valores — um DTO, um registro de configuração — pode e
deve ser transparente.

Encapsular o que não tem regra a proteger é cerimônia.

### Vazamento por referência

Devolver uma coleção interna mutável desfaz o encapsulamento silenciosamente: o
chamador pode alterá-la, e a classe perde o controle sobre sua própria invariante
sem que nada no código sinalize.

O mesmo vale para devolver o objeto de persistência, o tipo do framework, ou
qualquer coisa que amarre o consumidor a uma decisão interna.

## Modelo Mental

**O que eu quero poder mudar amanhã sem avisar ninguém?** Isso fica dentro. O
resto é o contrato.

## Quando Usar

- Quando o objeto tem invariante — uma regra que precisa valer sempre.
- Quando a representação interna pode mudar e há consumidores.
- Quando existe uma sequência de operações que precisa ser respeitada.
- Quando o objeto pertence ao domínio e tem comportamento próprio.

## Quando Não Usar

**Em estruturas de transporte.** DTO, payload de API, registro de configuração.
Eles existem para carregar dados; esconder o que carregam é atrito sem ganho.

**Quando não há invariante.** Um objeto com cinco campos independentes e nenhuma
regra entre eles não ganha nada em ser encapsulado.

**Em código de análise ou script.** Onde a vida é curta e o consumidor é um só.

**Quando o encapsulamento força o consumidor a lutar.** Se todo uso legítimo
exige uma sequência de três chamadas para obter o que um acesso direto daria, a
fronteira está no lugar errado. O sintoma é o consumidor recriando o estado
interno do lado de fora.

## Alternativas

- **Tipo imutável** — se o objeto não muda, expor os valores é seguro e a
  invariante é garantida na construção.
- **Registro transparente** — para dados sem regra.
- **Objeto de valor** — encapsula significado sem esconder valor. Ver
  [DDD](/04-domain-driven-design/index.md).

## Trade-offs

| Mais encapsulamento | Menos |
|---|---|
| Invariante garantida em um lugar | Cada chamador precisa respeitar |
| Representação interna substituível | Mudança interna quebra consumidores |
| API expressa o domínio | API expressa a estrutura |
| Mais métodos a projetar e manter | Acesso direto, menos código |
| Risco de forçar caminhos artificiais | Consumidor faz o que precisa |

## Modos de Falha

**Objeto anêmico.** Só dados e acessadores; a lógica que deveria estar dentro
está espalhada em serviços. Cada serviço reimplementa parte da invariante.

**Vazamento por coleção mutável.** `getItens()` devolve a lista interna.

**Encapsulamento de fachada.** Campos privados, acessadores públicos para todos.

**Sequência implícita.** O consumidor precisa chamar `preparar()` antes de
`executar()`, e nada impede o contrário.

## Erros Comuns

**Confundir com campos privados.** A raiz.

**Gerar acessadores automaticamente para tudo.** A ferramenta facilita
exatamente a prática errada.

**Encapsular DTOs.** Cerimônia sem invariante.

**Devolver estruturas mutáveis.** O vazamento mais comum e o menos percebido.

**Achar que encapsulamento é sobre segurança.** É sobre custo de mudança. Um
campo privado não protege contra ninguém — protege contra dependência.

## Exemplo Real

Uma classe `Assinatura` com `getStatus()`, `setStatus()`, `getDataFim()` e
`setDataFim()`.

A regra "assinatura cancelada não pode ter a data de fim alterada" existia — em
quatro serviços diferentes, cada um verificando antes de chamar o setter. Um
deles não verificava.

O bug: um processo de correção em lote alterava a data de fim de assinaturas
canceladas, e o faturamento voltava a cobrá-las.

A correção não foi adicionar a verificação no quarto lugar. Foi mover a regra
para dentro: `assinatura.estender(novaData)` lança se o status for cancelado, e o
setter deixou de existir.

Depois disso a regra passou a valer por construção, e o quinto serviço — escrito
um ano depois por outra pessoa — não teve como errar.

O detalhe que importa: a classe tinha campos privados desde sempre. O
encapsulamento estava ausente mesmo com todos os campos privados.

## Encapsulamento em escala de módulo

O mesmo raciocínio se aplica acima da classe, e é onde ele rende mais.

Um módulo encapsulado publica um contrato estreito e esconde tudo o mais: suas
entidades, seu esquema de persistência, suas dependências externas, sua estrutura
interna.

O sintoma de módulo não encapsulado é o mesmo da classe não encapsulada, em outra
escala: quem usa precisa saber como ele funciona por dentro. Um módulo de
cobrança que expõe `Fatura` com todos os campos e relações força os consumidores
a entender o modelo de faturamento, e amarra esse modelo a eles.

A diferença prática entre as duas escalas é o mecanismo. Numa classe,
visibilidade de linguagem basta. Num módulo, é preciso um mecanismo explícito —
módulo declarado, teste de arquitetura, análise de dependências — porque a maioria
das linguagens não impõe fronteira de pacote com força suficiente.

Ver [design modular](/02-software-design/modular-design.md) para o contrato e
[fronteiras](/02-software-design/boundaries.md) para os mecanismos.

## Conceitos Relacionados

- [Interfaces](/02-software-design/interfaces.md) — o contrato que o encapsulamento expõe.
- [Abstração](/01-fundamentals/abstraction.md) — o princípio geral.
- [Fronteiras](/02-software-design/boundaries.md) — encapsulamento em escala maior.

## O objeto anêmico e por que ele persiste

O modo de falha mais comum de encapsulamento tem nome próprio: o modelo de
domínio anêmico. Entidades reduzidas a campos e acessadores, com toda a lógica em
classes de serviço que as manipulam de fora.

Vale entender por que ele persiste, porque isso muda como corrigi-lo.

A primeira razão é ferramental. Geradores de código, mapeadores objeto-relacional
e bibliotecas de serialização historicamente exigiram construtor sem argumentos e
acessadores para todos os campos. O caminho de menor resistência produz a
estrutura anêmica, e resistir a ele exige configuração adicional que nem todo time
conhece.

A segunda é conceitual. A separação entre dados e comportamento é intuitiva para
quem vem de programação procedural, e o resultado funciona — o sistema faz o que
deve. O custo não aparece como defeito; aparece como regra de negócio duplicada
em vários serviços, e como bugs em que um dos lugares esqueceu de verificar algo.

A terceira é organizacional. Quando o serviço é escrito por uma pessoa e a
entidade por outra, colocar a regra no serviço evita uma conversa. A estrutura do
código passa a refletir a estrutura da comunicação do time, que é a lei de Conway
operando em escala pequena.

A correção não começa movendo métodos. Começa listando as regras que deveriam
valer sempre sobre a entidade, e verificando em quantos lugares cada uma é
aplicada hoje. Os números costumam ser convincentes por si.

## Exercício Prático

Escolha uma classe de domínio do seu sistema e liste as regras que deveriam valer
sempre sobre ela.

Para cada regra, encontre onde ela é verificada. Se estiver fora da classe, conte
em quantos lugares — e verifique se todos verificam.

Os lugares que faltam são bugs que ainda não aconteceram.

## Perguntas de Entrevista

- Qual a diferença entre encapsulamento e campos privados?
- O que é um objeto anêmico e por que é um problema?
- Quando não encapsular?

## Para Aprofundar

- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into
  Modules*. CACM, 1972.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018 —
  módulos profundos.
- Fowler, Martin. *AnemicDomainModel*, 2003.
