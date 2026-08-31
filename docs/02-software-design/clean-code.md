---
id: clean-code
title: Clean Code
sidebar_position: 15
description: Código escrito para ser lido — e onde as regras mais repetidas do movimento erram.
doc_type: concept
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor avalia legibilidade pelo esforço de quem lê, e reconhece
  as regras de Clean Code que produzem código pior quando seguidas ao pé da letra.
prerequisites: [fundamentals]
related: [code-smells, refactoring, design-heuristics]
canonical_for: [clean code, código limpo, legibilidade]
content_version: 1
last_reviewed: 2026-08-26
---

# Clean Code

## Visão Geral

Clean Code é o conjunto de práticas para escrever código legível — nomes claros,
funções focadas, ausência de surpresa.

O princípio central é sólido: **código é lido muitas mais vezes do que é
escrito**, e otimizar para leitura rende mais que otimizar para escrita.

Várias das regras específicas do movimento, porém, produzem código pior quando
seguidas literalmente. Este documento trata das duas coisas.

## Problema

Legibilidade é tratada como preferência estética, o que impede discussão
produtiva. "Acho mais legível assim" contra "acho mais legível assado" não tem
saída.

A saída é reformular a pergunta: legibilidade não é uma propriedade do código, é
uma relação entre o código e quem lê. A pergunta operacional passa a ser
**quanto esforço alguém precisa para entender isto bem o suficiente para
alterá-lo com segurança?**

Isso é observável. Uma pessoa nova lendo o código e narrando o que entende revela
mais do que qualquer debate sobre estilo.

## Conceitos Centrais

### Nomes

O item de maior retorno, com folga.

Um nome bom torna o comentário desnecessário. Um nome ruim exige que o leitor
mantenha uma tradução na cabeça durante toda a leitura.

Três regras que se sustentam:

- **O nome revela intenção, não implementação.** `clientesInadimplentes` em vez de
  `listaFiltrada`.
- **O comprimento acompanha o escopo.** Um índice de laço pode ser `i`; um campo
  de classe usado em vinte lugares não.
- **O vocabulário é o do domínio.** Se o negócio diz "apólice", o código diz
  `apolice`. Ver
  [ubiquitous language](/04-domain-driven-design/index.md).

### Funções

Uma função deve operar num único nível de abstração. Misturar "calcular o valor
devido" com "formatar a data para o padrão do arquivo" obriga o leitor a trocar de
nível no meio.

A regra popular — "funções devem ter no máximo cinco linhas" — não se sustenta.
Extrair agressivamente produz o problema oposto: para entender um fluxo, o leitor
salta por dez funções de três linhas, e a lógica fica distribuída em lugar nenhum.

O critério útil não é tamanho. É **se a função conta uma história coerente num
nível só**.

### Comentários

A formulação forte de Clean Code — "comentário é sinal de fracasso" — está
parcialmente errada.

Comentários que explicam **o quê** o código faz são, de fato, redundância que
envelhece. Mas comentários que explicam **por quê** carregam informação que o
código não pode carregar:

```text
❌ // incrementa o contador
   contador++;

✅ // O provedor retorna 429 sem Retry-After neste endpoint.
   // 800 ms foi determinado empiricamente; abaixo disso a taxa de
   // rejeição volta a subir.
   aguardar(800);
```

O segundo não é fracasso. É a única forma de registrar aquilo.

### Surpresa é o custo real

Código que faz algo além do que o nome promete é o mais caro de todos, porque o
leitor não sabe que precisa investigar. Uma função `validarPedido` que também
grava no banco quebra a confiança em todos os outros nomes do sistema.

## Modelo Mental

**Escreva para quem vai ler daqui a um ano sem contexto.** Essa pessoa
frequentemente é você.

## Quando Usar

- Sempre, em código de vida longa.
- Especialmente em código que outras pessoas vão manter.
- Com mais rigor onde a lógica de negócio mora — é onde a leitura é mais
  frequente e o erro mais caro.

## Quando Não Usar

**Como regra literal sobre tamanho.** Extrair até tudo ter três linhas piora a
legibilidade.

**Quando conflita com desempenho comprovadamente crítico.** Em caminhos quentes,
código menos elegante e mais rápido pode ser a escolha certa — com comentário
explicando por quê e com a medição que justificou.

**Em código gerado ou descartável.** Migração pontual, script de análise,
protótipo.

**Como argumento de autoridade em revisão.** "Isso não é clean code" não é
crítica até que se aponte o que fica mais difícil de entender ou alterar.

**Quando a busca por pureza vira o trabalho.** Refatorar nomes indefinidamente em
código estável é custo sem retorno.

## Alternativas

- **Testes como documentação** — um teste bem nomeado comunica intenção melhor que
  muitos comentários.
- **Tipos expressivos** — um tipo `Cpf` comunica mais que um `String` bem nomeado.
- **[Heurísticas de design](/02-software-design/design-heuristics.md)** — critérios mais estruturais
  e menos sujeitos a interpretação.

## Trade-offs

| Mais extração e cerimônia | Menos |
|---|---|
| Cada peça é simples | Peças maiores |
| Nomes documentam o fluxo | Fluxo explícito e linear |
| Muitos saltos para seguir a lógica | Lógica em um lugar |
| Fácil testar em partes | Teste mais grosso |

## Modos de Falha

**Fragmentação excessiva.** Funções minúsculas que sempre são chamadas em
sequência, e cujo entendimento exige abrir todas.

**Nome que mente.** Descreve algo diferente do que o código faz. É o pior caso.

**Comentário desatualizado.** Descreve o código de dois anos atrás e é acreditado.

**Abstração pela legibilidade.** Extrair uma classe para "melhorar o nome" quando
uma variável bem nomeada resolveria.

## Erros Comuns

**Tratar as regras como literais.** Especialmente a de tamanho de função.

**Eliminar todos os comentários.** Os de "por quê" são insubstituíveis.

**Discutir estilo em vez de esforço de leitura.** A pergunta é o que fica mais
difícil de entender, não o que agrada mais.

**Aplicar com o mesmo rigor em todo lugar.** Código de domínio merece mais que
código de configuração.

## Exemplo Real

Uma revisão de código pediu a extração de uma função de 40 linhas em oito funções
menores. O autor discordou; a discussão empacou em preferência.

O critério que a resolveu: pediram a uma pessoa que não conhecia o código que
lesse cada versão e explicasse o que ela fazia.

Na versão de 40 linhas, ela levou três minutos e acertou. Na versão extraída,
levou sete e errou a ordem de duas etapas, porque os nomes das funções não
indicavam sequência.

A versão final ficou com três funções, não oito nem uma — separando os três
níveis de abstração que de fato existiam: obter os dados, aplicar a regra,
persistir o resultado.

O que resolveu não foi a regra. Foi medir o esforço de leitura de alguém sem
contexto.

## O rigor varia com o código

Aplicar o mesmo padrão de legibilidade a todo o sistema é desperdício num lado e
negligência no outro.

| Tipo de código | Rigor | Por quê |
|---|---|---|
| Regra de negócio | Máximo | Lido com frequência, alterado por muitas pessoas, erro caro |
| Adaptador de infraestrutura | Médio | Muda pouco depois de estabilizado |
| Configuração e cabeamento | Baixo | Lido raramente, alterado mecanicamente |
| Teste | Alto | É documentação executável; teste ilegível não é usado como referência |
| Migração, script pontual | Nenhum | Vida curta, um consumidor |
| Caminho crítico de desempenho | Especial | Clareza cede a medição, com comentário justificando |

A linha de teste costuma surpreender. Times investem em legibilidade de produção
e aceitam testes com preparação duplicada e nomes genéricos — quando o teste é
justamente o que a próxima pessoa lê para entender a intenção do código.

## Conceitos Relacionados

- [Code Smells](/02-software-design/code-smells.md) — os sinais de que algo precisa de atenção.
- [Refatoração](/02-software-design/refactoring.md) — como mudar sem quebrar.
- [Heurísticas de Design](/02-software-design/design-heuristics.md) — critérios mais estruturais.
- [Abstração](/01-fundamentals/abstraction.md) — quando extrair compensa.

## Exercício Prático

Escolha um arquivo do seu sistema e peça a alguém que não o conhece que leia e
narre o que entende.

Anote onde a pessoa hesita, volta, ou pergunta. Esses pontos são os problemas
reais de legibilidade — e raramente coincidem com o que uma revisão de estilo
apontaria.

## Perguntas de Entrevista

- Como você avalia legibilidade de forma que duas pessoas concordem?
- Que tipo de comentário vale a pena manter?
- Quando extrair uma função piora o código?

## Para Aprofundar

- Martin, Robert C. *Clean Code*. Prentice Hall, 2008.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018 —
  discorda de Clean Code em vários pontos, e vale ler junto.
- Beck, Kent. *Implementation Patterns*. Addison-Wesley, 2007.
