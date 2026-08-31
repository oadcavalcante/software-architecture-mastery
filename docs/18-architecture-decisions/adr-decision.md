---
id: adr-decision
title: A Decisão
sidebar_position: 5
description: A seção mais curta do ADR — voz ativa, escopo delimitado, sem hedge.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escreve a decisão de forma inequívoca e sabe delimitar seu escopo.
prerequisites: [adr-structure]
related: [adr-context, adr-consequences, adr-status]
canonical_for: [voz da decisão, escopo da decisão, decisão inequívoca]
content_version: 1
last_reviewed: 2026-08-29
---

# A Decisão

## Visão Geral

A seção de decisão é a mais curta do ADR e a mais fácil de escrever mal. Ela precisa
responder a uma pergunta com uma frase: **o que foi decidido?**

Três propriedades a definem:

```text
voz ativa      "vamos usar X", não "recomenda-se avaliar X"
escopo claro   onde vale e onde não vale
sem hedge      nenhum "provavelmente", "por enquanto", "salvo se"
```

O tamanho típico é de duas a cinco linhas. Se ela cresce, geralmente é porque virou
implementação, ou porque são várias decisões.

## Problema

O que se encontra em ADRs reais:

```text
"Após avaliação, entende-se que PostgreSQL seria a opção mais adequada
para o contexto atual, podendo ser reavaliada conforme a evolução."
```

Isso não é uma decisão. Não se sabe se foi decidido, quem decidiu, se vale, nem para onde.

A linguagem defensiva tem causa: quem escreve teme comprometer-se e teme errar. Mas o ADR
existe justamente para registrar um compromisso — e um compromisso registrado com hedge
não pode ser nem seguido nem contestado.

E há um segundo problema, mais sutil: a decisão que descreve **como** em vez de **o quê**.
Ela transforma o ADR em especificação, que envelhece na velocidade do código.

## Conceitos Centrais

### Voz ativa e comprometida

```text
ruim   "Recomenda-se o uso de PostgreSQL."
ruim   "Foi decidido utilizar PostgreSQL."
ruim   "PostgreSQL parece adequado."
bom    "Vamos usar PostgreSQL como banco primário dos serviços de pedidos."
```

A segunda parece aceitável e não é: a voz passiva apaga quem decidiu, e é justamente essa
informação que alguém vai querer daqui a dois anos.

A escolha de "vamos" ou "usaremos" não é estilística. Ela sinaliza que houve compromisso —
o que distingue um ADR de uma avaliação técnica.

### Escopo delimitado

Uma decisão sem escopo é impossível de aplicar e impossível de superar:

```text
vago    "Vamos usar Kafka."
claro   "Vamos usar Kafka para os eventos de domínio entre os serviços de
        pedidos, faturamento e estoque. Comunicação síncrona entre esses
        serviços continua sendo HTTP. Outros domínios não são afetados."
```

O escopo responde a três perguntas: **onde vale, onde não vale, e o que permanece como
está.**

A terceira é frequentemente omitida e evita a interpretação expansiva — a leitura de que a
decisão substitui tudo que existia antes.

### O quê, não como

```text
decisão         "Vamos separar o serviço de faturamento."
implementação   "Vamos criar um repositório novo, com Spring Boot 3,
                usando o gabarito X, com a esteira Y e o banco Z."
```

A segunda envelhece em meses e não é o que o ADR precisa preservar. Detalhes de
implementação pertencem ao código ou a um documento de desenho.

A fronteira útil: se a informação muda sem que a decisão mude, ela é implementação.

### Uma decisão por ADR

Quando a seção de decisão tem vários parágrafos com "e também", geralmente há decisões
independentes acopladas:

```text
"Vamos adotar Kafka, migrar o banco para PostgreSQL e separar o
serviço de faturamento."
```

Três decisões, três contextos, três conjuntos de alternativas, três possibilidades de
superação independente. Registradas juntas, nenhuma pode ser revista sozinha.

O teste: **uma delas poderia ser revertida sem as outras?** Se sim, são ADRs separados.

### Registrar quem decidiu

```text
autores      quem escreveu
decisores    quem tinha autoridade e exerceu
consultados  quem opinou sem decidir
```

A distinção entre autor e decisor importa em organizações grandes, onde quem escreve
frequentemente não é quem decide. E o registro de consultados protege contra a leitura
posterior de que a decisão foi unilateral.

Ver [governança](/19-architecture-governance/index.md).

### Discordância registrada

Quando há desacordo relevante e a decisão é tomada mesmo assim, registrar isso é mais
valioso do que parece:

```text
"Duas pessoas do time defenderam a alternativa B, por preocupação com
o custo operacional. A decisão foi tomada aceitando esse risco, com
revisão prevista em 6 meses."
```

Isso preserva a informação de que a objeção existia — o que é exatamente o que se quer
saber se o risco se materializar. E torna o ADR honesto de um jeito que sustenta a prática
melhor que a aparência de consenso.

### Decisões de não fazer

Uma categoria subutilizada: registrar o que se decidiu **não** fazer.

```text
"Vamos manter o monólito e não adotar microsserviços neste ciclo."
"Não vamos construir uma camada de cache distribuído."
```

Essas decisões são invisíveis no código — não há nada para apontar — e são exatamente as
que serão revisitadas repetidamente sem registro.

### A decisão precisa ser acionável

Um teste final antes de fechar a seção: **alguém consegue agir com base nela sem perguntar
nada?**

```text
não acionável   "Vamos padronizar a comunicação entre serviços."
acionável       "Comunicação entre serviços do domínio de pedidos passa a
                ser HTTP com contrato declarado em OpenAPI, versionado no
                repositório do produtor. Chamadas novas seguem isto a
                partir de hoje; as existentes migram quando forem tocadas."
```

A diferença está em três elementos: **o quê**, **onde vale** e **a partir de quando**. O
terceiro é o mais esquecido — uma decisão sem marco temporal deixa em aberto se o código
existente precisa mudar, e essa ambiguidade costuma ser resolvida por cada time de um
jeito.

## Modelo Mental

**Uma frase, na voz ativa, com escopo.** Se não cabe em cinco linhas, são várias decisões
ou é implementação.

## Quando Usar

- Em todo ADR.
- Com escopo explícito sempre que a decisão puder ser lida de forma expansiva.
- Registrando discordância quando ela existiu.

## Quando Não Usar

**Com hedge.** "Provavelmente", "por ora", "sujeito a revisão" — a revisão é o mecanismo de
superação, não uma ressalva.

**Em voz passiva.**

**Descrevendo implementação.**

**Com várias decisões juntas.**

**Sem escopo**, quando o sistema tem mais de um domínio.

**Como proposta.** Uma proposta tem status `proposto`; a seção de decisão continua
afirmativa.

## Alternativas

- **Y-Statement** — comprime contexto, decisão e consequência numa frase estruturada.
- **Decisão implícita no título** — para casos triviais, o título já é a decisão, e a seção
  detalha o escopo.
- **Referência a um padrão** — quando a decisão é adotar algo já definido em outro lugar.
  Ver [padrões](/15-enterprise-architecture/standards.md).

## Trade-offs

| Escopo estreito | Amplo |
|---|---|
| Aplicação clara | Menos ADRs |
| Mais ADRs | Ambíguo na aplicação |
| Superável isoladamente | Superação em bloco |

| Discordância registrada | Consenso aparente |
|---|---|
| Honesto e útil depois | Menos atrito imediato |
| Preserva a objeção | Parece mais sólido |
| Exige maturidade do time | Fácil |

## Modos de Falha

**Hedge.** A decisão não pode ser seguida nem contestada.

**Voz passiva.** Ninguém decidiu.

**Sem escopo.** Aplicada onde não deveria, ou ignorada onde deveria.

**Implementação registrada.** O ADR envelhece com o código.

**Várias decisões juntas.** Nenhuma revisável sozinha.

**Discordância apagada.** Quando o risco se materializa, ninguém sabe que era previsto.

## Erros Comuns

**Escrever a decisão como conclusão de uma análise**, em vez de como compromisso.

**Omitir o que não muda** — o que abre espaço para interpretação expansiva.

**Não registrar decisores.**

**Não registrar decisões de não fazer.**

**Suavizar a decisão** para reduzir atrito na revisão — o que transfere o atrito para o
futuro.

## Exemplo Real

Uma empresa de serviços financeiros tinha um ADR de 2022 com a seguinte decisão:

```text
"Adotar arquitetura orientada a eventos para desacoplar os serviços."
```

Sem escopo, sem delimitação, sem dizer o que permanecia.

Dois anos depois, uma auditoria interna encontrou o efeito:

```text
serviços que adotaram eventos para tudo, inclusive consultas   4
serviços que ignoraram a decisão                                6
serviços com abordagem mista sem critério                       9
interpretações distintas do ADR encontradas em entrevistas      5
```

Os quatro primeiros eram os mais problemáticos: consultas síncronas simples tinham sido
convertidas em pares de eventos requisição-resposta, com correlação manual e tempo de
resposta de segundos. Ver
[integração orientada a eventos](/08-integration-architecture/event-driven-integration.md).

A investigação mostrou que o ADR original tinha sido escrito depois de uma discussão em que
o escopo **estava claro para os presentes**: eventos para propagação de mudança de estado
entre domínios, mantendo HTTP síncrono para consultas. Nada disso foi escrito.

O ADR foi superado por outro, com decisão delimitada:

```text
"Vamos usar eventos de domínio para propagar mudanças de estado entre
os domínios de pedidos, faturamento e estoque.

Não vamos usar eventos para consulta: leitura entre serviços continua
sendo HTTP síncrono.

Domínios fora dos três citados não são afetados por esta decisão.

Duas pessoas defenderam estender a decisão a todos os domínios; a
objeção foi de que os demais não têm volume que justifique o custo
operacional. Reavaliar quando algum deles passar de 50 eventos/s."
```

E uma regra de escrita foi adotada: **toda decisão precisa de uma frase começando com "não
vamos"**. A justificativa foi empírica — dos 12 ADRs que tinham gerado interpretação
divergente, 11 não delimitavam o que ficava de fora.

A correção dos quatro serviços levou sete meses. O tempo de resposta das consultas
convertidas caiu de 2,4 s para 90 ms.

Na retrospectiva: o ADR original não estava errado. Ele estava incompleto de uma
forma que só era visível para quem não participou da conversa — que é exatamente o público
do documento.

## Conceitos Relacionados

- [Estrutura do ADR](/18-architecture-decisions/adr-structure.md).
- [Contexto](/18-architecture-decisions/adr-context.md) — o que justifica.
- [Consequências](/18-architecture-decisions/adr-consequences.md) — o que se aceita.
- [Status](/18-architecture-decisions/adr-status.md) — proposto contra aceito.

## Exercício Prático

Pegue três ADRs do seu time e verifique se cada um diz explicitamente o que **não** muda.

Depois pergunte a duas pessoas que não participaram qual é o escopo de cada decisão. A
divergência entre as respostas mede o que faltou.

## Perguntas de Entrevista

- Por que voz passiva é um problema numa seção de decisão?
- Por que delimitar o que não muda evita interpretação expansiva?
- Quando registrar discordância vale mais que registrar consenso?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Keeling, Michael. *Design It!*. Pragmatic Bookshelf, 2017.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
