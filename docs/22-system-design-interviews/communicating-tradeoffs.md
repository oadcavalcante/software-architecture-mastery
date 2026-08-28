---
id: communicating-tradeoffs
title: Comunicação de Trade-offs
sidebar_position: 11
description: A competência mais valorizada e a menos treinada — dizer o que você abriu mão e sob qual condição escolheria outra coisa.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor enuncia trade-offs em voz alta enquanto desenha, com a condição que
  inverteria cada escolha.
prerequisites: [high-level-architecture]
related: [interview-structure, failure-handling, interview-common-mistakes]
canonical_for: [comunicação de trade-off, pensar em voz alta, condição que inverte a escolha]
content_version: 1
last_reviewed: 2026-08-29
---

# Comunicação de Trade-offs

## Visão Geral

A pergunta que o avaliador está respondendo o tempo todo não é "esta arquitetura está certa?". É:

```text
"eu confiaria a esta pessoa uma decisão arquitetural
 que eu não vou revisar?"
```

E o que responde a isso não é a solução — é a capacidade de dizer o que ela custa. Uma escolha
apresentada como obviamente correta sinaliza que o candidato não viu o custo; a mesma escolha
apresentada com o custo nomeado sinaliza que ele viu e decidiu.

A forma canônica cabe em uma frase:

```text
"escolho X, porque [razão ligada a um requisito].
 Abro mão de Y.
 Se [condição] fosse diferente, eu escolheria Z."
```

Três partes. A terceira é a que quase ninguém diz, e é a que mais vale.

## Problema

Três padrões.

**Apresentar sem custo.** "Vou usar cache." A afirmação está certa e não demonstra nada — ela não
diz o que se perde, nem quando não valeria.

**Desenhar em silêncio.** O candidato pensa bem e fala pouco. O avaliador não avalia pensamento,
avalia o que é comunicado — e um desenho silencioso é indistinguível de um desenho memorizado.

**Hedge permanente.** O oposto: "poderia ser assim, ou assim, depende". Nunca decidir é pior que
decidir errado. Uma entrevista de arquitetura avalia a capacidade de escolher sob incerteza, e
não escolher é a única resposta que não demonstra isso.

## Conceitos Centrais

### A estrutura de três partes

```text
"vou materializar o feed na escrita, porque a razão leitura/escrita
 é 100 para 1 e leitura é o que domina o custo.

 Abro mão de frescor: uma postagem leva até 30 segundos para
 aparecer, o que o requisito permite. E abro mão de simplicidade —
 passo a ter dois caminhos de leitura e uma consistência a
 gerenciar.

 Se a razão fosse 5 para 1, ou se o requisito de frescor fosse de
 2 segundos, eu montaria na leitura."
```

A terceira parte é a que separa. Ela demonstra que o candidato entende **por que** a escolha é
correta neste contexto, e não em geral — que é a diferença entre arquitetura e receita.

Ela também tem uma função defensiva. Quando o entrevistador introduz uma variação — "e se o
requisito de frescor fosse de 2 segundos?" —, o candidato que já enunciou a condição responde em
segundos, porque a análise já foi feita. O que não a enunciou precisa refazer o raciocínio ao
vivo, sob pressão, e frequentemente chega a uma resposta inconsistente com o que disse antes.

Enunciar a condição de inversão é, na prática, antecipar a pergunta seguinte da entrevista.

### Enuncie enquanto desenha, não depois

```text
ruim   desenhar tudo em silêncio, e ao fim: "algum trade-off?"
bom    enunciar no momento em que a caixa entra no desenho
```

Trade-offs ditos no momento têm outro efeito: eles convidam o entrevistador a discordar cedo, o
que é bom. Uma objeção no minuto 15 é uma correção de rumo; a mesma objeção no minuto 40 é uma
refutação do desenho inteiro.

### Nomeie o custo, não o risco genérico

```text
ruim   "cache adiciona complexidade"
bom    "cache adiciona um componente a operar, uma estratégia de
       invalidação a manter, e uma janela em que o dado exibido
       pode estar desatualizado — que aqui é de até 60 segundos"
```

Custo nomeado é verificável. "Complexidade" é uma palavra que serve a qualquer decisão e não
informa qual.

Um teste útil: o custo enunciado poderia ser usado para argumentar contra outra decisão qualquer?
Se sim, ele é genérico. "Mais um componente no plantão" serve a quase tudo; "uma janela de até 60
segundos em que o dado exibido pode estar desatualizado" só serve àquela decisão, e é por isso
que ela informa.

### Use os requisitos como âncora

```text
"o requisito de 99,99% no redirecionamento e 99,9% na criação é
 o que me permite aceitar que a criação falhe durante a promoção
 da réplica. Se os dois fossem 99,99%, eu precisaria de escrita
 multirregional — e aí a latência de criação subiria."
```

Amarrar cada trade-off a um requisito levantado na clarificação fecha o ciclo da entrevista e
demonstra que o método foi seguido, não decorado. Ver
[funcionais vs. não funcionais](functional-vs-nonfunctional.md).

### Ofereça a alternativa que você não escolheu

```text
"a alternativa seria manter tudo síncrono e aceitar a
 disponibilidade composta de 98,1%. É mais simples, tem menos
 componentes, e não precisa de estado intermediário nem de
 comunicação de 'processando' ao usuário.

 Eu não escolho isso porque o requisito contratual é 99,5%.
 Se não houvesse esse contrato, provavelmente eu ficaria com
 o síncrono."
```

Apresentar a alternativa com seus méritos reais — e não como espantalho — é o sinal mais forte de
maturidade técnica. Ver
[alternativas em ADR](../18-architecture-decisions/adr-alternatives.md).

### Discorde com base, e mude de ideia com base

Entrevistadores frequentemente propõem alternativas para testar a reação:

```text
"por que não usar um banco de grafos aqui?"
```

Duas respostas ruins: aceitar imediatamente ("boa ideia, vou mudar") e defender por defender.

```text
"consideraria. As consultas aqui são de um salto — quem eu sigo,
 quem me segue — e um relacional com dois índices resolve, com
 um armazenamento a menos para operar.
 Se houvesse consultas de múltiplos saltos, como sugestão de
 conexões por caminho, aí o grafo compensaria. Você tem algum
 caso assim em mente?"
```

Isso demonstra que a posição tem base, e que ela é revisável diante de informação nova — que é
exatamente o comportamento desejado.

### Reconheça incerteza sem se paralisar

```text
"não tenho experiência operando esse mecanismo em escala, então
 minha estimativa de custo operacional é fraca. Vou assumir que
 é comparável ao equivalente que já operei, e sinalizar isso
 como um risco da proposta."
```

Admitir o limite do próprio conhecimento e seguir decidindo é melhor avaliado que fingir domínio.
O que é mal avaliado é a paralisia.

E fingir domínio é detectável com uma pergunta de acompanhamento, o que torna o custo do fingimento
alto e o benefício momentâneo. Sinalizar o risco de uma premissa fraca, ao contrário, transfere a
informação para quem pode corrigi-la — que é o comportamento esperado de alguém que vai tomar
decisões em equipe.

## Modelo Mental

**Escolho X, abro mão de Y, e sob a condição Z escolheria outra coisa.** A terceira parte é a que
demonstra arquitetura.

## Quando Usar

- Continuamente, no momento em que cada decisão é tomada.
- Ancorando em requisitos levantados na clarificação.
- Ao responder a qualquer alternativa proposta pelo entrevistador.

## Quando Não Usar

**Sem decidir** — hedge permanente é pior que escolha errada.

**Com custo genérico** — "adiciona complexidade" não informa.

**Só ao final**, quando o desenho já está fechado.

**Defendendo por defender** uma escolha diante de informação nova.

**Sem a condição de inversão** — sem ela, a escolha parece dogma.

## Alternativas

- **Tabela de comparação** — quando há três opções e o quadro comporta; mais lento e mais claro.
- **Declarar prioridade uma vez** — "disponibilidade acima de consistência neste sistema" — e
  derivar as escolhas seguintes dela.
- **Perguntar a preferência** — "você prefere que eu otimize para custo ou para latência?" é
  legítimo e produtivo.

A segunda é eficiente: uma prioridade declarada no início economiza a repetição do trade-off a
cada decisão.

## Trade-offs

| Enunciar cada trade-off | Declarar prioridade uma vez |
|---|---|
| Demonstra a cada decisão | Mais rápido |
| Consome tempo | Menos explícito |
| Convida correção cedo | Exige coerência |

| Defender a escolha | Ceder à sugestão |
|---|---|
| Demonstra convicção | Demonstra abertura |
| Risco de teimosia | Risco de não ter posição |

A resposta correta quase sempre está no meio: reconhecer o mérito da sugestão, explicar a base da
escolha, e pedir a informação que decidiria.

## Modos de Falha

**Desenho silencioso.** Indistinguível de memorização.

**Sem custo nomeado.** Sugere que o custo não foi visto.

**Sem condição de inversão.** A escolha parece dogma.

**Hedge permanente.** Não demonstra capacidade de decidir.

**Ceder a toda sugestão.** Sugere ausência de posição.

**Espantalho.** Apresentar a alternativa fraca de propósito é notado.

## Erros Comuns

**Dizer "adiciona complexidade"** em vez de nomear o custo.

**Não ancorar em requisitos.**

**Enunciar trade-offs só no fim.**

**Reagir defensivamente** a uma alternativa proposta.

**Não perguntar** a informação que decidiria a dúvida.

## Exemplo de Entrevista

**Contexto.** Encurtador de URL, decisão sobre como gerar o código curto.

**Comunicação da decisão:**

```text
"Vou gerar o código a partir de um contador global codificado
 em base 62, em vez de hash da URL.

 A razão: contador garante unicidade sem verificação. Hash exige
 checar colisão, e checar colisão a 120 escritas por segundo
 introduz uma leitura antes de cada escrita e um caminho de
 erro para o caso raro.

 Abro mão de duas coisas. Primeiro, os códigos ficam
 sequencialmente adivinháveis — alguém pode enumerar links. Se
 privacidade importar, eu embaralharia o contador com uma
 permutação, o que custa quase nada.

 Segundo, o contador é um ponto de coordenação. A 120 por
 segundo isso é irrelevante, mas se fôssemos a 100 mil por
 segundo, um contador único seria gargalo — e aí eu usaria
 faixas pré-alocadas por instância, aceitando lacunas na
 sequência.

 Se a mesma URL precisasse sempre gerar o mesmo código curto,
 aí hash seria obrigatório, e eu aceitaria o custo da
 verificação de colisão."
```

Quatro elementos numa resposta de um minuto: a escolha, a razão ligada a um número, dois custos
nomeados com mitigação, e duas condições que inverteriam a decisão.

**Entrevistador propõe alternativa:**

```text
"por que não UUID?"

"Funcionaria e resolve unicidade sem coordenação nenhuma, que
 é a vantagem real. O problema é o comprimento: um UUID em
 base 62 dá 22 caracteres, e o produto é um encurtador — um
 link de 22 caracteres é pouco mais curto que muitas URLs
 originais.

 Se o requisito de brevidade não existisse — num sistema
 interno de rastreamento, por exemplo —, UUID seria a escolha
 melhor, porque elimina o ponto de coordenação.

 Aqui o requisito de produto decide."
```

A resposta reconhece o mérito da alternativa, identifica a razão específica da recusa, e nomeia o
contexto em que ela venceria. Nenhuma dessas três partes é sobre conhecimento técnico — todas são
sobre comunicação de decisão.

## Conceitos Relacionados

- [Estrutura da Entrevista](interview-structure.md).
- [Alternativas em ADR](../18-architecture-decisions/adr-alternatives.md) — a mesma disciplina,
  por escrito.
- [Trade-offs](../20-trade-offs/index.md) — o material de argumentação.
- [Erros Comuns](interview-common-mistakes.md).

## Exercício Prático

Pegue uma decisão de arquitetura que você tomou recentemente e escreva a frase de três partes:
escolhi X porque Y, abri mão de Z, e sob a condição W escolheria outra coisa.

Se você não conseguir preencher a terceira parte, a decisão foi tomada sem alternativa real — o
que é a mesma lacuna que uma entrevista expõe.

## Perguntas de Entrevista

- Por que a condição que inverteria a escolha é a parte mais valiosa?
- Por que enunciar trade-offs enquanto desenha é melhor que enunciá-los no fim?
- Como responder a uma alternativa proposta pelo entrevistador sem ceder nem teimar?

## Para Aprofundar

- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.
